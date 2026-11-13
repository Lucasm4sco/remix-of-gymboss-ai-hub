-- SOURCE-ONLY: not registered in Drizzle's journal and NOT applied to the shared backend.
-- Apply through the managed migration tool only after separate deployment authorization.
CREATE OR REPLACE FUNCTION public.kiwify_protect_billing()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
 caller_role text := pg_catalog.current_setting('role', true);
 subscription_owner text;
BEGIN
 IF NEW.plano IS NOT DISTINCT FROM OLD.plano AND NEW.status IS NOT DISTINCT FROM OLD.status THEN
   RETURN NEW;
 END IF;

 -- current_user is the definer here, NOT the caller. SET ROLE is database-enforced;
 -- never authorize from request.jwt.claims or another user-controlled JWT setting.
 IF caller_role IS NULL OR caller_role = 'none' THEN
   caller_role := session_user;
 END IF;
 SELECT pg_catalog.pg_get_userbyid(c.relowner) INTO subscription_owner
 FROM pg_catalog.pg_class AS c WHERE c.oid = 'public.kiwify_subscription'::regclass;

 -- Preserve trusted service processors and direct owner maintenance, not their
 -- authenticated SET ROLE sessions. Super-admin authorization remains UID-based.
 IF caller_role = 'service_role' OR caller_role = subscription_owner
    OR (caller_role = 'authenticated' AND auth.uid() IS NOT NULL AND public.is_super_admin()) THEN
   RETURN NEW;
 END IF;

 -- Privileged read is bound to this trigger's rows, not a caller-supplied ID.
 IF EXISTS (
   SELECT 1 FROM public.kiwify_subscription AS s
   WHERE s.verified AND (s.academy_id = OLD.id OR s.academy_id = NEW.id)
 ) THEN
   RAISE EXCEPTION 'Billing fields are managed by subscriptions' USING ERRCODE = '42501';
 END IF;
 RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.kiwify_protect_billing() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.kiwify_protect_billing() TO service_role;