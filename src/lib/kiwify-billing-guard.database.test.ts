import { test } from "node:test";
import { strict as assert } from "node:assert";
import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";

// Explicit opt-in; fixed Unix socket, sanitized environment, synthetic data only.
const enabled = process.env.KIWIFY_LOCAL_DB_TEST === "1";
const existing = ["0003_kiwify_atomic_billing", "0004_kiwify_billing_trigger_authorization", "0005_kiwify_explicit_private_grants"]
  .map((name) => readFileSync(new URL(`../../drizzle/migrations/${name}.sql`, import.meta.url), "utf8")).join("\n");
const setup = `
CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role BYPASSRLS;
CREATE SCHEMA auth;
CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql AS $$ SELECT nullif(current_setting('test.uid',true),'')::uuid $$;
GRANT USAGE ON SCHEMA auth TO authenticated,service_role;
CREATE TYPE public.academy_plan AS ENUM ('starter','pro','premium');
CREATE TYPE public.academy_status AS ENUM ('active','trial','blocked');
CREATE TABLE public.academy(id uuid PRIMARY KEY,name text,owner_email text,plano academy_plan DEFAULT 'starter',status academy_status DEFAULT 'trial',updated_at timestamptz DEFAULT now());
CREATE TABLE public.academy_user(academy_id uuid,email text,role text,ativo boolean DEFAULT true);
CREATE TABLE public.user_roles(user_id uuid,role text);
CREATE FUNCTION public.is_super_admin() RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path='' AS $$ SELECT EXISTS(SELECT 1 FROM public.user_roles WHERE user_id=auth.uid() AND role='super_admin') $$;
DO $$ DECLARE t text; BEGIN FOREACH t IN ARRAY ARRAY['student','plan','schedule','team_member','checkin','financial','lead'] LOOP EXECUTE format('CREATE TABLE public.%I(academy_id uuid)',t); ALTER TABLE public.academy ENABLE ROW LEVEL SECURITY; END LOOP; END $$;
GRANT SELECT,UPDATE ON public.academy TO authenticated;
GRANT ALL ON public.academy TO service_role;
CREATE POLICY tenant_read ON public.academy FOR SELECT TO authenticated USING (id=auth.uid() OR public.is_super_admin());
CREATE POLICY tenant_update ON public.academy FOR UPDATE TO authenticated USING (id=auth.uid() OR public.is_super_admin()) WITH CHECK (id=auth.uid() OR public.is_super_admin());
`;
const fixtures = `
INSERT INTO public.academy(id,name,owner_email) VALUES
 ('00000000-0000-4000-8000-000000000001','A','a@example.invalid'),
 ('00000000-0000-4000-8000-000000000002','B','b@example.invalid');
INSERT INTO public.user_roles VALUES ('00000000-0000-4000-8000-000000000099','super_admin');
INSERT INTO public.kiwify_subscription(id,academy_id,customer_email,checkout_code,plan,verified) VALUES ('s1','00000000-0000-4000-8000-000000000001','a@example.invalid','HHpoAGt','pro',true);
`;
const ownAdmin = `SET ROLE authenticated; SELECT set_config('test.uid','00000000-0000-4000-8000-000000000001',false);`;
const assertUnchanged = `RESET ROLE; DO $$ BEGIN IF (SELECT plano<>'starter' OR status<>'trial' FROM public.academy WHERE name='A') THEN RAISE EXCEPTION 'Protected billing changed'; END IF; END $$;`;

function runSql(sql: string) {
  const result = spawnSync("psql", ["-X", "-h", "/tmp/kiwify/socket", "-p", "55439", "-U", "lovable", "-d", "postgres", "-v", "ON_ERROR_STOP=1"], {
    input: `BEGIN;${setup}${existing}${fixtures}${sql}ROLLBACK;`, encoding: "utf8", env: { PATH: process.env.PATH },
  });
  assert.equal(result.status, 0, result.stderr);
}

test("reproduces existing same-academy billing bypass with RLS-hidden subscription", { skip: !enabled }, () => {
  runSql(`${ownAdmin} DO $$ BEGIN IF (SELECT count(*) FROM public.kiwify_subscription)<>0 THEN RAISE EXCEPTION 'Subscription not hidden'; END IF; END $$;
    UPDATE public.academy SET plano='premium',status='active' WHERE id=auth.uid();
    RESET ROLE; DO $$ BEGIN IF (SELECT plano FROM public.academy WHERE name='A')<>'premium' THEN RAISE EXCEPTION 'Baseline bypass not reproduced'; END IF; END $$;`);
});

const cases: Array<[string, string]> = [
  ["same-academy admin cannot change plan", `${ownAdmin} DO $$ BEGIN BEGIN UPDATE public.academy SET plano='premium' WHERE id=auth.uid(); RAISE EXCEPTION 'Plan bypass'; EXCEPTION WHEN insufficient_privilege THEN NULL; END; END $$;${assertUnchanged}`],
  ["same-academy admin cannot change status", `${ownAdmin} DO $$ BEGIN BEGIN UPDATE public.academy SET status='active' WHERE id=auth.uid(); RAISE EXCEPTION 'Status bypass'; EXCEPTION WHEN insufficient_privilege THEN NULL; END; END $$;${assertUnchanged}`],
  ["other-academy admin cannot update protected academy", `SET ROLE authenticated; SELECT set_config('test.uid','00000000-0000-4000-8000-000000000002',false); DO $$ DECLARE n integer; BEGIN UPDATE public.academy SET plano='premium',status='active' WHERE id='00000000-0000-4000-8000-000000000001'; GET DIAGNOSTICS n=ROW_COUNT; IF n<>0 THEN RAISE EXCEPTION 'Cross-tenant update'; END IF; END $$;${assertUnchanged}`],
  ["ordinary non-billing edits remain allowed", `${ownAdmin} UPDATE public.academy SET name='Edited',plano=plano,status=status WHERE id=auth.uid(); DO $$ BEGIN IF (SELECT name FROM public.academy WHERE id=auth.uid())<>'Edited' THEN RAISE EXCEPTION 'Non-billing edit blocked'; END IF; END $$;`],
  ["unverified academy keeps existing billing behavior", `UPDATE public.kiwify_subscription SET verified=false;${ownAdmin} UPDATE public.academy SET plano='premium' WHERE id=auth.uid(); DO $$ BEGIN IF (SELECT plano FROM public.academy WHERE id=auth.uid())<>'premium' THEN RAISE EXCEPTION 'Unverified behavior changed'; END IF; END $$;`],
  ["authenticated super_admin remains authorized", `SET ROLE authenticated; SELECT set_config('test.uid','00000000-0000-4000-8000-000000000099',false); UPDATE public.academy SET plano='premium',status='active' WHERE name='A'; DO $$ BEGIN IF (SELECT plano FROM public.academy WHERE name='A')<>'premium' THEN RAISE EXCEPTION 'Super admin blocked'; END IF; END $$;`],
  ["service_role remains authorized without user session", `SET ROLE service_role; UPDATE public.academy SET plano='premium',status='active' WHERE name='A'; DO $$ BEGIN IF (SELECT status FROM public.academy WHERE name='A')<>'active' THEN RAISE EXCEPTION 'Service blocked'; END IF; END $$;`],
  ["forged JWT role does not grant service authorization", `${ownAdmin} SELECT set_config('request.jwt.claim.role','service_role',false); SELECT set_config('request.jwt.claims','{"role":"service_role"}',false); DO $$ BEGIN BEGIN UPDATE public.academy SET plano='premium' WHERE id=auth.uid(); RAISE EXCEPTION 'Spoofed service bypass'; EXCEPTION WHEN insufficient_privilege THEN NULL; END; END $$;${assertUnchanged}`],
  ["authenticated caller cannot assume service role", `SET SESSION AUTHORIZATION authenticated;${ownAdmin} DO $$ BEGIN BEGIN EXECUTE 'SET ROLE service_role'; RAISE EXCEPTION 'Service role escalation'; EXCEPTION WHEN insufficient_privilege THEN NULL; END; END $$; RESET SESSION AUTHORIZATION;${assertUnchanged}`],
  ["service-only atomic RPC works through nested definer functions", `SET ROLE service_role; DO $$ DECLARE ev jsonb:=jsonb_build_object('identity','order:service-paid','event_type','order_approved','subscription_id','s1','customer_email','a@example.invalid','checkout_code','HHpoAGt','plan','pro','access_until','2099-01-01T00:00:00Z','order_status','paid'); BEGIN PERFORM public.kiwify_process_event(ev); IF (SELECT plano FROM public.academy WHERE name='A')<>'pro' OR (SELECT status FROM public.academy WHERE name='A')<>'active' THEN RAISE EXCEPTION 'Atomic service processing blocked'; END IF; END $$;`],
  ["changing row identity cannot evade OLD academy check", `${ownAdmin} DO $$ BEGIN BEGIN UPDATE public.academy SET id='00000000-0000-4000-8000-000000000003',plano='premium' WHERE id=auth.uid(); RAISE EXCEPTION 'Identity bypass'; EXCEPTION WHEN insufficient_privilege THEN NULL; END; END $$;${assertUnchanged}`],
  ["guard is fixed-path trigger-only and not a public RPC", `DO $$ BEGIN IF NOT (SELECT prosecdef AND proconfig=ARRAY['search_path=""'] FROM pg_proc WHERE oid='public.kiwify_protect_billing()'::regprocedure) THEN RAISE EXCEPTION 'Unsafe guard configuration'; END IF; IF has_function_privilege('authenticated','public.kiwify_protect_billing()','execute') OR has_function_privilege('anon','public.kiwify_protect_billing()','execute') THEN RAISE EXCEPTION 'Public guard execute'; END IF; END $$;`],
];

for (const [name, sql] of cases) {
  test(name, { skip: !enabled }, () => {
    const fix = readFileSync(new URL("../../database/staged/0006_kiwify_billing_guard.sql", import.meta.url), "utf8");
    runSql(fix + sql);
  });
}