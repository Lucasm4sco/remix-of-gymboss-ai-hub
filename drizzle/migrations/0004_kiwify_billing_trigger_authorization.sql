CREATE OR REPLACE FUNCTION public.kiwify_protect_billing() RETURNS trigger LANGUAGE plpgsql SET search_path='' AS $$
BEGIN
 -- Atomic SECURITY DEFINER processors run as this table's owner; browser users cannot assume that role.
 IF current_user NOT IN ('service_role',pg_get_userbyid((SELECT relowner FROM pg_class WHERE oid='public.kiwify_subscription'::regclass))) AND NOT public.is_super_admin() AND
 EXISTS(SELECT 1 FROM public.kiwify_subscription WHERE academy_id=OLD.id AND verified) AND
 (NEW.plano IS DISTINCT FROM OLD.plano OR NEW.status IS DISTINCT FROM OLD.status) THEN RAISE EXCEPTION 'Billing fields are managed by subscriptions'; END IF;
 RETURN NEW;
END;
$$;