# Access architecture
- Kiwify billing uses a signed public server route and service-only atomic RPCs; store normalized billing fields, never raw payloads, and quarantine unverified deliveries because Kiwify test webhooks are indistinguishable from real events.
- Keep privileges in protected `public.user_roles`; browser navigation never grants permissions, because server-side RLS is authoritative.
- Bootstrap the initial owner only from an explicitly selected, provider-verified identity; ordinary signup must never claim global administration.
- Resolve login destinations after session and tenant permissions load, using public OAuth return pages to avoid transient-session redirects.
- Onboarding tracks confirmed creation stages for retry and blocks fresh setup for already linked accounts, preventing duplicate academies after partial failures or refresh.
- Academy plan forms share an allowlisted validation schema with onboarding; edits keep tenant identity outside the payload and require both row and academy filters plus existing RLS.
- Public booking reads use a slug-scoped, fixed-field database function and a strict response contract; base-table public SELECT is forbidden to prevent bypassing field privacy through direct API queries.
# Presentation
- Use shared global semantic theme tokens and a common panel marker for dashboard presentation; access checks and tenant queries remain independent of styling.
