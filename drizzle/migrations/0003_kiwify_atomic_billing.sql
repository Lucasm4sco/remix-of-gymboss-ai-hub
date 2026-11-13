CREATE TABLE public.kiwify_subscription (
 id text PRIMARY KEY, academy_id uuid REFERENCES public.academy(id), customer_email text NOT NULL,
 checkout_code text NOT NULL, plan public.academy_plan,
 state text NOT NULL DEFAULT 'pending' CHECK (state IN ('pending','active','late','canceled','revoked')),
 access_until timestamptz, verified boolean NOT NULL DEFAULT false,
 manual_binding boolean NOT NULL DEFAULT false, reviewed_by uuid, reviewed_at timestamptz,
 last_paid_until timestamptz, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
 CHECK (NOT verified OR (academy_id IS NOT NULL AND plan IS NOT NULL)),
 CHECK (length(id) BETWEEN 1 AND 100), CHECK (length(customer_email) BETWEEN 3 AND 254)
);
GRANT SELECT ON public.kiwify_subscription TO authenticated;
GRANT ALL ON public.kiwify_subscription TO service_role;
ALTER TABLE public.kiwify_subscription ENABLE ROW LEVEL SECURITY;
CREATE POLICY kiwify_master_read ON public.kiwify_subscription FOR SELECT TO authenticated USING (public.is_super_admin());
CREATE UNIQUE INDEX kiwify_one_verified_subscription ON public.kiwify_subscription(academy_id) WHERE verified;
CREATE TABLE public.kiwify_event (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), identity text NOT NULL, event_type text NOT NULL,
 order_id text, subscription_id text REFERENCES public.kiwify_subscription(id), customer_email text,
 checkout_code text NOT NULL DEFAULT '', plan public.academy_plan, access_until timestamptz,
 order_status text, reason text, state text NOT NULL DEFAULT 'pending' CHECK (state IN ('pending','applied','ignored')),
 received_at timestamptz NOT NULL DEFAULT now(), applied_at timestamptz,
 UNIQUE(identity,event_type), CHECK (length(identity) BETWEEN 1 AND 120), CHECK (length(event_type) BETWEEN 1 AND 80),
 CHECK (length(checkout_code)<=200)
);
GRANT SELECT ON public.kiwify_event TO authenticated;
GRANT ALL ON public.kiwify_event TO service_role;
ALTER TABLE public.kiwify_event ENABLE ROW LEVEL SECURITY;
CREATE POLICY kiwify_master_events ON public.kiwify_event FOR SELECT TO authenticated USING (public.is_super_admin());
CREATE FUNCTION public.kiwify_candidates(p_email text) RETURNS SETOF uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path='' AS $$
 SELECT a.id FROM public.academy a WHERE lower(btrim(a.owner_email))=lower(btrim(p_email))
 UNION SELECT u.academy_id FROM public.academy_user u WHERE lower(btrim(u.email))=lower(btrim(p_email)) AND u.role IN ('owner','admin') AND u.ativo;
$$;
REVOKE ALL ON FUNCTION public.kiwify_candidates(text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.kiwify_candidates(text) TO service_role;
CREATE FUNCTION public.kiwify_apply_event(p_id uuid) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE e public.kiwify_event; s public.kiwify_subscription; deadline timestamptz; next_state text;
BEGIN
 SELECT * INTO e FROM public.kiwify_event WHERE id=p_id FOR UPDATE;
 IF NOT FOUND OR e.state<>'pending' OR e.reason IS NOT NULL THEN RETURN; END IF;
 SELECT * INTO s FROM public.kiwify_subscription WHERE id=e.subscription_id FOR UPDATE;
 IF NOT FOUND OR NOT s.verified OR e.customer_email<>s.customer_email OR e.plan IS NULL THEN RETURN; END IF;
 IF s.state='revoked' THEN
   UPDATE public.kiwify_event SET state='ignored',reason='terminal_revocation' WHERE id=e.id; RETURN;
 END IF;
 IF e.event_type IN ('order_refunded','chargeback') OR (e.event_type='subscription_canceled' AND e.order_status IN ('refunded','chargedback')) THEN
   deadline:=now(); next_state:='revoked';
 ELSIF e.event_type IN ('order_approved','subscription_renewed') THEN
   IF e.access_until IS NULL THEN RETURN; END IF;
   IF s.last_paid_until IS NOT NULL AND e.access_until<=s.last_paid_until THEN
     UPDATE public.kiwify_event SET state='ignored',reason='stale_period' WHERE id=e.id; RETURN;
   END IF;
   IF s.state='canceled' THEN
     UPDATE public.kiwify_event SET state='pending',reason='renewal_after_cancel' WHERE id=e.id; RETURN;
   END IF;
   deadline:=greatest(s.access_until,e.access_until); next_state:='active';
 ELSIF e.event_type='subscription_late' THEN
   deadline:=s.access_until; next_state:=CASE WHEN s.state='canceled' THEN 'canceled' ELSE 'late' END;
 ELSIF e.event_type='subscription_canceled' THEN
   deadline:=e.access_until; next_state:='canceled';
 ELSE RETURN;
 END IF;
 UPDATE public.kiwify_subscription SET state=next_state,access_until=deadline,
   last_paid_until=CASE WHEN e.event_type IN ('order_approved','subscription_renewed') THEN e.access_until ELSE last_paid_until END,
   plan=CASE WHEN e.event_type IN ('order_approved','subscription_renewed') THEN e.plan ELSE plan END,
   checkout_code=CASE WHEN e.event_type IN ('order_approved','subscription_renewed') THEN e.checkout_code ELSE checkout_code END,
   updated_at=now() WHERE id=s.id;
 UPDATE public.academy SET plano=CASE WHEN next_state='active' THEN e.plan ELSE s.plan END,
   status=CASE WHEN deadline>now() AND next_state<>'revoked' THEN 'active'::public.academy_status ELSE 'blocked'::public.academy_status END,
   updated_at=now() WHERE id=s.academy_id;
 UPDATE public.kiwify_event SET state='applied',applied_at=now() WHERE id=e.id;
END;
$$;
REVOKE ALL ON FUNCTION public.kiwify_apply_event(uuid) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.kiwify_apply_event(uuid) TO service_role;
CREATE FUNCTION public.kiwify_process_event(p_event jsonb) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE sid text:=p_event->>'subscription_id'; mail text:=p_event->>'customer_email'; eid uuid; candidates uuid[]; target uuid; s public.kiwify_subscription; reason text:=p_event->>'reason';
BEGIN
 -- Serialize all mutations of the same subscription, including concurrent first deliveries.
 PERFORM pg_advisory_xact_lock(hashtextextended(coalesce(sid,p_event->>'identity'),0));
 IF EXISTS(SELECT 1 FROM public.kiwify_event WHERE identity=p_event->>'identity' AND event_type=p_event->>'event_type') THEN RETURN jsonb_build_object('duplicate',true); END IF;
 IF sid IS NOT NULL AND mail IS NOT NULL THEN
   SELECT array_agg(c) INTO candidates FROM public.kiwify_candidates(mail) c;
   target:=CASE WHEN cardinality(candidates)=1 THEN candidates[1] ELSE NULL END;
   INSERT INTO public.kiwify_subscription(id,academy_id,customer_email,checkout_code,plan)
   VALUES(sid,target,mail,p_event->>'checkout_code',(p_event->>'plan')::public.academy_plan) ON CONFLICT(id) DO NOTHING;
   SELECT * INTO s FROM public.kiwify_subscription WHERE id=sid FOR UPDATE;
   IF s.customer_email<>mail THEN reason:='customer_mismatch';
   ELSIF s.verified AND NOT s.manual_binding AND (target IS NULL OR target<>s.academy_id) THEN reason:='tenant_changed';
   ELSIF NOT s.verified AND reason IS NULL THEN
     reason:=CASE WHEN coalesce(cardinality(candidates),0)=0 THEN 'no_tenant' WHEN cardinality(candidates)>1 THEN 'ambiguous_tenant' ELSE 'verification_required' END;
   END IF;
 ELSE sid:=NULL; reason:=coalesce(reason,'incomplete_subscription'); END IF;
 INSERT INTO public.kiwify_event(identity,event_type,order_id,subscription_id,customer_email,checkout_code,plan,access_until,order_status,reason)
 VALUES(p_event->>'identity',p_event->>'event_type',p_event->>'order_id',sid,mail,coalesce(p_event->>'checkout_code',''),(p_event->>'plan')::public.academy_plan,(p_event->>'access_until')::timestamptz,p_event->>'order_status',reason) RETURNING id INTO eid;
 PERFORM public.kiwify_apply_event(eid);
 RETURN jsonb_build_object('accepted',true);
END;
$$;
REVOKE ALL ON FUNCTION public.kiwify_process_event(jsonb) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.kiwify_process_event(jsonb) TO service_role;
CREATE FUNCTION public.kiwify_resolve(p_subscription text,p_academy uuid,p_actor uuid) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE s public.kiwify_subscription; e record; candidates uuid[]; target uuid;
BEGIN
 IF NOT EXISTS(SELECT 1 FROM public.user_roles WHERE user_id=p_actor AND role='super_admin') THEN RAISE EXCEPTION 'Forbidden'; END IF;
 PERFORM pg_advisory_xact_lock(hashtextextended(p_subscription,0));
 SELECT * INTO s FROM public.kiwify_subscription WHERE id=p_subscription FOR UPDATE;
 IF NOT FOUND OR s.verified OR s.plan IS NULL THEN RAISE EXCEPTION 'Subscription unavailable'; END IF;
 PERFORM 1 FROM public.academy WHERE id=p_academy FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Academy unavailable'; END IF;
 IF EXISTS(SELECT 1 FROM public.kiwify_subscription WHERE academy_id=p_academy AND verified) THEN RAISE EXCEPTION 'Academy already associated'; END IF;
 IF NOT EXISTS(SELECT 1 FROM public.kiwify_event WHERE subscription_id=s.id AND reason IN ('verification_required','no_tenant','ambiguous_tenant')) THEN RAISE EXCEPTION 'No eligible event'; END IF;
 SELECT array_agg(c) INTO candidates FROM public.kiwify_candidates(s.customer_email) c;
 target:=CASE WHEN cardinality(candidates)=1 THEN candidates[1] ELSE NULL END;
 UPDATE public.kiwify_subscription SET academy_id=p_academy,verified=true,manual_binding=(target IS NULL OR target<>p_academy),reviewed_by=p_actor,reviewed_at=now() WHERE id=s.id;
 UPDATE public.kiwify_event SET reason=NULL WHERE subscription_id=s.id AND reason IN ('verification_required','no_tenant','ambiguous_tenant');
 -- Paid periods first, terminal refund/chargeback last: replays cannot undo revocation.
 FOR e IN SELECT id FROM public.kiwify_event WHERE subscription_id=s.id AND state='pending' AND reason IS NULL ORDER BY CASE WHEN event_type IN ('order_approved','subscription_renewed') THEN 0 WHEN event_type='subscription_late' THEN 1 WHEN event_type='subscription_canceled' THEN 2 ELSE 3 END,access_until NULLS LAST,received_at LOOP
   PERFORM public.kiwify_apply_event(e.id);
 END LOOP;
END;
$$;
REVOKE ALL ON FUNCTION public.kiwify_resolve(text,uuid,uuid) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.kiwify_resolve(text,uuid,uuid) TO service_role;
CREATE FUNCTION public.kiwify_access_allowed(p_academy uuid) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path='' AS $$
 SELECT public.is_super_admin() OR NOT EXISTS(SELECT 1 FROM public.kiwify_subscription s WHERE s.academy_id=p_academy AND s.verified)
 OR EXISTS(SELECT 1 FROM public.kiwify_subscription s WHERE s.academy_id=p_academy AND s.verified AND s.state<>'revoked' AND s.access_until>now());
$$;
REVOKE ALL ON FUNCTION public.kiwify_access_allowed(uuid) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.kiwify_access_allowed(uuid) TO authenticated,service_role;
-- Existing tenant policies remain authoritative. This additional restrictive gate only affects verified billing subscriptions after paid-through expiry.
DO $$ DECLARE t text; BEGIN
 FOREACH t IN ARRAY ARRAY['student','plan','schedule','team_member','checkin','financial','lead'] LOOP
 EXECUTE format('CREATE POLICY kiwify_paid_access ON public.%I AS RESTRICTIVE FOR ALL TO authenticated USING (public.kiwify_access_allowed(academy_id)) WITH CHECK (public.kiwify_access_allowed(academy_id))',t);
 END LOOP;
END $$;
CREATE FUNCTION public.kiwify_protect_billing() RETURNS trigger LANGUAGE plpgsql SET search_path='' AS $$
BEGIN
 IF current_user<>'service_role' AND NOT public.is_super_admin() AND
 EXISTS(SELECT 1 FROM public.kiwify_subscription WHERE academy_id=OLD.id AND verified) AND
 (NEW.plano IS DISTINCT FROM OLD.plano OR NEW.status IS DISTINCT FROM OLD.status) THEN RAISE EXCEPTION 'Billing fields are managed by subscriptions'; END IF;
 RETURN NEW;
END;
$$;
CREATE TRIGGER kiwify_billing_fields BEFORE UPDATE ON public.academy FOR EACH ROW EXECUTE FUNCTION public.kiwify_protect_billing();
COMMENT ON TABLE public.kiwify_event IS 'Normalized signed webhook fields only. No raw payload, signatures, card data or contact fields except customer email. New subscriptions require Master verification because provider test deliveries have no reliable test marker.';