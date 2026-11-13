-- Remove platform default privileges: the browser can only SELECT through super-admin RLS, never write billing rows.
REVOKE ALL ON public.kiwify_event,public.kiwify_subscription FROM anon,authenticated;
GRANT SELECT ON public.kiwify_event,public.kiwify_subscription TO authenticated;
GRANT ALL ON public.kiwify_event,public.kiwify_subscription TO service_role;
REVOKE ALL ON FUNCTION public.kiwify_protect_billing() FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.kiwify_protect_billing() TO service_role;