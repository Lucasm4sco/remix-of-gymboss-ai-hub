CREATE OR REPLACE FUNCTION public.claim_super_admin_if_empty()
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE v_uid uuid := auth.uid();
BEGIN
  IF v_uid IS NULL THEN RETURN false; END IF;
  IF NOT EXISTS (
    SELECT 1 FROM auth.users u JOIN auth.identities i ON i.user_id = u.id
    WHERE u.id = v_uid AND lower(u.email) = 'devtestes.junior@gmail.com'
      AND u.email_confirmed_at IS NOT NULL AND i.provider = 'google'
      AND lower(i.identity_data ->> 'email') = 'devtestes.junior@gmail.com'
      AND i.identity_data ->> 'email_verified' = 'true'
  ) THEN RETURN false; END IF;
  PERFORM pg_advisory_xact_lock(73921841);
  IF EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = v_uid AND role = 'super_admin') THEN RETURN true; END IF;
  IF EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'super_admin') THEN RETURN false; END IF;
  INSERT INTO public.user_roles(user_id, role) VALUES (v_uid, 'super_admin') ON CONFLICT DO NOTHING;
  RETURN true;
END;
$$;
REVOKE ALL ON FUNCTION public.claim_super_admin_if_empty() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.claim_super_admin_if_empty() TO authenticated;
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'super_admin'); $$;
DROP POLICY IF EXISTS "insert own non-privileged role" ON public.user_roles;
DROP POLICY IF EXISTS "insert academy_user" ON public.academy_user;
CREATE POLICY "insert academy_user" ON public.academy_user FOR INSERT TO authenticated
WITH CHECK (public.user_can_manage_academy(academy_id));
DROP POLICY IF EXISTS "insert academy (any auth)" ON public.academy;
CREATE POLICY "insert academy admin" ON public.academy FOR INSERT TO authenticated WITH CHECK (public.is_super_admin());
CREATE OR REPLACE FUNCTION public.current_academy_id()
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
SELECT r.academy_id FROM public.user_roles r
WHERE r.user_id = auth.uid() AND r.academy_id IS NOT NULL
AND EXISTS (SELECT 1 FROM public.academy_user a WHERE a.academy_id = r.academy_id AND lower(a.email) = public.current_user_email() AND a.ativo = true)
LIMIT 1;
$$;
CREATE OR REPLACE FUNCTION public.create_academy_with_owner(p_name text, p_telefone text, p_email text, p_cor_primaria text)
RETURNS public.academy LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE v_uid uuid := auth.uid(); v_email text := public.current_user_email(); v_academy public.academy;
BEGIN
  IF v_uid IS NULL OR v_email = '' THEN RAISE EXCEPTION 'Autenticação necessária para criar academia.'; END IF;
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = v_uid AND email_confirmed_at IS NOT NULL) THEN RAISE EXCEPTION 'Confirme seu email antes de criar academia.'; END IF;
  IF nullif(trim(p_name), '') IS NULL THEN RAISE EXCEPTION 'Informe o nome da academia.'; END IF;
  INSERT INTO public.academy(name, telefone, email, cor_primaria, owner_email, owner_nome, status)
  VALUES (trim(p_name), p_telefone, coalesce(nullif(p_email,''),v_email),coalesce(nullif(p_cor_primaria,''),'#F97316'),v_email,v_email,'trial') RETURNING * INTO v_academy;
  INSERT INTO public.academy_user(academy_id,email,nome,role,ativo) VALUES(v_academy.id,v_email,v_email,'owner',true);
  INSERT INTO public.user_roles(user_id,role,academy_id) VALUES(v_uid,'admin',v_academy.id) ON CONFLICT DO NOTHING;
  RETURN v_academy;
END;
$$;
REVOKE ALL ON FUNCTION public.create_academy_with_owner(text,text,text,text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.create_academy_with_owner(text,text,text,text) TO authenticated;