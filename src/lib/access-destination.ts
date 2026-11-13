export function accessDestination(access: { isSuperAdmin: boolean; academyId: string | null }) {
  if (access.isSuperAdmin) return "/master/painel" as const;
  return access.academyId ? "/app/dashboard" as const : "/app/onboarding" as const;
}

export function firstAccessDestination(state: {
  authenticated: boolean;
  authLoading: boolean;
  tenantLoading: boolean;
  tenantError: unknown;
  tenant: { isSuperAdmin: boolean; academyId: string | null } | null | undefined;
}) {
  if (!state.authenticated || state.authLoading || state.tenantLoading || state.tenantError) return null;
  return state.tenant ? accessDestination(state.tenant) : "/app/onboarding" as const;
}