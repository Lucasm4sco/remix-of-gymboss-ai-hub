import { test } from "node:test";
import { strict as assert } from "node:assert";
import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";

// Opt-in, disposable local PostgreSQL only. Never use managed credentials or a live database.
test("atomic Kiwify processing, deduplication, review and tenant isolation", { skip: process.env.KIWIFY_LOCAL_DB_TEST !== "1" }, () => {
  const bootstrap = `
    CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role BYPASSRLS;
    CREATE SCHEMA auth;
    CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql AS $$ SELECT nullif(current_setting('test.uid',true),'')::uuid $$;
    CREATE TYPE public.academy_plan AS ENUM ('starter','pro','premium');
    CREATE TYPE public.academy_status AS ENUM ('active','trial','blocked');
    CREATE TABLE public.academy(id uuid PRIMARY KEY,name text,owner_email text,plano academy_plan DEFAULT 'starter',status academy_status DEFAULT 'trial',updated_at timestamptz DEFAULT now());
    CREATE TABLE public.academy_user(academy_id uuid,email text,role text,ativo boolean DEFAULT true);
    CREATE TABLE public.user_roles(user_id uuid,role text);
    CREATE FUNCTION public.is_super_admin() RETURNS boolean LANGUAGE sql SECURITY DEFINER AS $$ SELECT EXISTS(SELECT 1 FROM public.user_roles WHERE user_id=auth.uid() AND role='super_admin') $$;
    DO $$ DECLARE t text; BEGIN FOREACH t IN ARRAY ARRAY['student','plan','schedule','team_member','checkin','financial','lead'] LOOP
      EXECUTE format('CREATE TABLE public.%I(academy_id uuid)',t);
      EXECUTE format('GRANT ALL ON public.%I TO authenticated',t);
      EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY',t);
      EXECUTE format('CREATE POLICY tenant ON public.%I TO authenticated USING (academy_id=auth.uid()) WITH CHECK (academy_id=auth.uid())',t);
    END LOOP; END $$;
  `;
  const migration = readFileSync(new URL("../../drizzle/migrations/0003_kiwify_atomic_billing.sql", import.meta.url), "utf8");
  const triggerFix = readFileSync(new URL("../../drizzle/migrations/0004_kiwify_billing_trigger_authorization.sql", import.meta.url), "utf8");
  const assertions = `
    INSERT INTO public.academy(id,name,owner_email) VALUES ('00000000-0000-4000-8000-000000000001','A','owner@example.invalid'),('00000000-0000-4000-8000-000000000002','B','b@example.invalid');
    INSERT INTO public.academy_user VALUES ('00000000-0000-4000-8000-000000000001','owner@example.invalid','owner',true),('00000000-0000-4000-8000-000000000001','shared@example.invalid','admin',true),('00000000-0000-4000-8000-000000000002','shared@example.invalid','owner',true);
    INSERT INTO public.user_roles VALUES ('00000000-0000-4000-8000-000000000099','super_admin');
    DO $$ DECLARE ev jsonb:=jsonb_build_object('identity','order:o1','event_type','order_approved','order_id','o1','subscription_id','s1','customer_email','owner@example.invalid','checkout_code','HHpoAGt','plan','pro','access_until','2099-01-01T00:00:00Z','order_status','paid'); BEGIN
      IF (SELECT count(*) FROM public.kiwify_candidates('owner@example.invalid'))<>1 THEN RAISE EXCEPTION 'Distinct tenant matching failed'; END IF;
      IF (SELECT count(*) FROM public.kiwify_candidates('shared@example.invalid'))<>2 THEN RAISE EXCEPTION 'Ambiguity failed'; END IF;
      PERFORM public.kiwify_process_event(ev); PERFORM public.kiwify_process_event(ev);
      IF (SELECT count(*) FROM public.kiwify_event)<>1 THEN RAISE EXCEPTION 'Dedup failed'; END IF;
      IF (SELECT status FROM public.academy WHERE name='A')<>'trial' THEN RAISE EXCEPTION 'Test-like new delivery granted access'; END IF;
      BEGIN PERFORM public.kiwify_resolve('s1','00000000-0000-4000-8000-000000000001','00000000-0000-4000-8000-000000000001'); RAISE EXCEPTION 'Unauthorized resolution'; EXCEPTION WHEN OTHERS THEN IF SQLERRM='Unauthorized resolution' THEN RAISE; END IF; END;
      PERFORM public.kiwify_resolve('s1','00000000-0000-4000-8000-000000000001','00000000-0000-4000-8000-000000000099');
      IF (SELECT plano FROM public.academy WHERE name='A')<>'pro' OR (SELECT status FROM public.academy WHERE name='A')<>'active' THEN RAISE EXCEPTION 'Verified paid period failed'; END IF;
      IF (SELECT status FROM public.academy WHERE name='B')<>'trial' THEN RAISE EXCEPTION 'Other tenant mutated'; END IF;
      PERFORM public.kiwify_process_event(ev || jsonb_build_object('identity','order:amb','order_id','amb','subscription_id','amb','customer_email','shared@example.invalid'));
      IF (SELECT reason FROM public.kiwify_event WHERE order_id='amb')<>'ambiguous_tenant' THEN RAISE EXCEPTION 'Ambiguity not quarantined'; END IF;
      PERFORM public.kiwify_process_event(ev || jsonb_build_object('identity','order:none','order_id','none','subscription_id','none','customer_email','none@example.invalid'));
      IF (SELECT reason FROM public.kiwify_event WHERE order_id='none')<>'no_tenant' THEN RAISE EXCEPTION 'No match not quarantined'; END IF;
      PERFORM public.kiwify_process_event(ev || jsonb_build_object('identity','order:late','order_id','late','event_type','subscription_late','access_until','2000-01-01T00:00:00Z','order_status','refused'));
      IF (SELECT access_until FROM public.kiwify_subscription WHERE id='s1')<>'2099-01-01T00:00:00Z'::timestamptz THEN RAISE EXCEPTION 'Late shortened paid-through'; END IF;
      PERFORM public.kiwify_process_event(ev || jsonb_build_object('identity','order:cancel','order_id','cancel','event_type','subscription_canceled'));
      IF (SELECT status FROM public.academy WHERE name='A')<>'active' THEN RAISE EXCEPTION 'Cancel removed paid access'; END IF;
      PERFORM public.kiwify_process_event(ev || jsonb_build_object('identity','order:chargeback','order_id','chargeback','event_type','chargeback','order_status','chargedback'));
      PERFORM public.kiwify_process_event(ev || jsonb_build_object('identity','order:replay','order_id','replay','event_type','subscription_renewed','access_until','2100-01-01T00:00:00Z'));
      IF (SELECT status FROM public.academy WHERE name='A')<>'blocked' THEN RAISE EXCEPTION 'Replay undid chargeback'; END IF;
    END $$;
    INSERT INTO public.student VALUES ('00000000-0000-4000-8000-000000000001'),('00000000-0000-4000-8000-000000000002');
    SET ROLE authenticated; SELECT set_config('test.uid','00000000-0000-4000-8000-000000000002',false);
    DO $$ BEGIN
      IF (SELECT count(*) FROM public.kiwify_event)<>0 OR (SELECT count(*) FROM public.kiwify_subscription)<>0 THEN RAISE EXCEPTION 'Review queue exposed'; END IF;
      IF (SELECT count(*) FROM public.student)<>1 THEN RAISE EXCEPTION 'Tenant isolation broken'; END IF;
      IF has_function_privilege(current_user,'public.kiwify_process_event(jsonb)','execute') THEN RAISE EXCEPTION 'Privileged RPC exposed'; END IF;
    END $$;
    SELECT set_config('test.uid','00000000-0000-4000-8000-000000000001',false);
    DO $$ BEGIN IF (SELECT count(*) FROM public.student)<>0 THEN RAISE EXCEPTION 'Revoked billing access not blocked'; END IF; END $$;
    RESET ROLE;
    UPDATE public.kiwify_subscription SET state='canceled',access_until=now()-interval '1 second' WHERE id='s1';
    SET ROLE authenticated;
    DO $$ BEGIN IF public.kiwify_access_allowed('00000000-0000-4000-8000-000000000001') THEN RAISE EXCEPTION 'Expired canceled period permitted'; END IF; END $$;
    RESET ROLE;
    DO $$ BEGIN
      BEGIN PERFORM public.kiwify_process_event(jsonb_build_object('identity','order:rollback','event_type','order_approved','subscription_id','rollback','customer_email','owner@example.invalid','checkout_code','HHpoAGt','plan','pro','access_until','invalid')); EXCEPTION WHEN OTHERS THEN NULL; END;
      IF EXISTS(SELECT 1 FROM public.kiwify_subscription WHERE id='rollback') THEN RAISE EXCEPTION 'Transaction partially committed'; END IF;
    END $$;
  `;
  const result = spawnSync("psql", ["-X", "-h", "/tmp/kiwify/socket", "-p", "55439", "-U", "lovable", "-d", "postgres", "-v", "ON_ERROR_STOP=1"], { input: "BEGIN;" + bootstrap + migration + triggerFix + assertions + "ROLLBACK;", encoding: "utf8", env: { PATH: process.env.PATH } });
  assert.equal(result.status, 0, result.stderr);
});