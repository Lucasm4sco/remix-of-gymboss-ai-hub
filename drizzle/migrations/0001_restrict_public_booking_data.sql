DROP POLICY "public read academy" ON public.academy;
DROP POLICY "public read plans" ON public.plan;
DROP POLICY "public read schedule" ON public.schedule;
REVOKE SELECT ON public.academy, public.plan, public.schedule FROM anon;

CREATE FUNCTION public.get_public_booking(p_slug text)
RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT jsonb_build_object(
    'academy', jsonb_build_object('id', a.id, 'name', a.name, 'slug', a.slug, 'cor_primaria', a.cor_primaria, 'telefone', a.telefone),
    'plans', COALESCE((SELECT jsonb_agg(jsonb_build_object('id', p.id, 'name', p.name, 'description', p.description, 'price', p.price, 'featured', p.featured) ORDER BY p.price) FROM public.plan p WHERE p.academy_id = a.id AND p.active), '[]'::jsonb),
    'schedule', COALESCE((SELECT jsonb_agg(jsonb_build_object('id', s.id, 'name', s.name, 'modality', s.modality, 'day_of_week', s.day_of_week, 'start_time', s.start_time, 'end_time', s.end_time) ORDER BY s.day_of_week, s.start_time) FROM public.schedule s WHERE s.academy_id = a.id AND s.active), '[]'::jsonb)
  ) FROM public.academy a WHERE a.slug = p_slug AND a.status IN ('active', 'trial') LIMIT 1;
$$;
REVOKE ALL ON FUNCTION public.get_public_booking(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_public_booking(text) TO anon, authenticated, service_role;
COMMENT ON FUNCTION public.get_public_booking(text) IS 'Public booking projection only: no owner contacts, staff identities, subscriptions, student records or internal academy fields.';

CREATE FUNCTION public.is_public_booking_target(p_academy uuid, p_schedule uuid, p_plan uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
 SELECT EXISTS (SELECT 1 FROM public.academy a WHERE a.id = p_academy AND a.slug IS NOT NULL AND a.status IN ('active','trial'))
 AND (p_schedule IS NULL OR EXISTS (SELECT 1 FROM public.schedule s WHERE s.id = p_schedule AND s.academy_id = p_academy AND s.active))
 AND (p_plan IS NULL OR EXISTS (SELECT 1 FROM public.plan p WHERE p.id = p_plan AND p.academy_id = p_academy AND p.active));
$$;
REVOKE ALL ON FUNCTION public.is_public_booking_target(uuid,uuid,uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_public_booking_target(uuid,uuid,uuid) TO anon, authenticated, service_role;
DROP POLICY "anon insert lead" ON public.lead;
CREATE POLICY "anon insert public booking lead" ON public.lead FOR INSERT TO anon WITH CHECK (
 public.is_public_booking_target(academy_id, schedule_id, plan_id)
 AND status = 'novo' AND length(btrim(name)) BETWEEN 1 AND 200 AND length(btrim(phone)) BETWEEN 1 AND 40
 AND ((type = 'aula_experimental' AND schedule_id IS NOT NULL AND plan_id IS NULL)
 OR (type = 'trial_7dias' AND schedule_id IS NULL AND plan_id IS NULL)
 OR (type = 'interesse_plano' AND plan_id IS NOT NULL AND schedule_id IS NULL))
);
REVOKE INSERT ON public.lead FROM anon;
GRANT INSERT (academy_id, type, name, phone, email, modality, schedule_id, plan_id, objetivo) ON public.lead TO anon;