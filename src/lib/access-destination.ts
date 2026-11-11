export function accessDestination(access: { isSuperAdmin: boolean; academyId: string | null }) {
  if (access.isSuperAdmin) return "/master/painel" as const;
  return access.academyId ? "/app/dashboard" as const : "/app/onboarding" as const;
}