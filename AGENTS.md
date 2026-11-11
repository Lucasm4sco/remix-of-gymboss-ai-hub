# Access architecture
- Keep privileges in protected `public.user_roles`; browser navigation never grants permissions, because server-side RLS is authoritative.
- Bootstrap the initial owner only from an explicitly selected, provider-verified identity; ordinary signup must never claim global administration.
- Resolve login destinations after session and tenant permissions load, using public OAuth return pages to avoid transient-session redirects.