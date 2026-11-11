import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./auth-context";

export type AppRole = "super_admin" | "admin" | "professor" | "recepcao" | "personal" | "demo";

export type TenantInfo = {
  role: AppRole | null;
  academyId: string | null;
  academy: {
    id: string;
    name: string;
    cor_primaria: string | null;
    status: string;
    trial_ate: string | null;
    plano: string;
    valor_mensal: number | null;
  } | null;
  isSuperAdmin: boolean;
};

export function useTenant() {
  const { user, loading } = useAuth();

  const q = useQuery({
    queryKey: ["tenant-info", user?.id],
    enabled: !!user,
    queryFn: async (): Promise<TenantInfo> => {
      if (!user) throw new Error("Autenticação necessária");
      // The database permits bootstrap only for the selected Google-verified owner.
      const { error: claimError } = await supabase.rpc("claim_super_admin_if_empty");
      if (claimError) throw claimError;

      const { data: roles, error: rolesError } = await supabase
        .from("user_roles")
        .select("role, academy_id")
        .eq("user_id", user.id);
      if (rolesError) throw rolesError;

      const isSuper = (roles ?? []).some((r) => r.role === "super_admin");
      const tenantRole = (roles ?? []).find((r) => r.academy_id) ?? null;

      let academy = null;
      if (tenantRole?.academy_id) {
        const { data, error } = await supabase
          .from("academy")
          .select("id, name, cor_primaria, status, trial_ate, plano, valor_mensal")
          .eq("id", tenantRole.academy_id)
          .maybeSingle();
        if (error) throw error;
        academy = data as TenantInfo["academy"];
      }

      return {
        role: (tenantRole?.role as AppRole) ?? (isSuper ? "super_admin" : null),
        academyId: tenantRole?.academy_id ?? null,
        academy,
        isSuperAdmin: isSuper,
      };
    },
  });

  return {
    tenant: q.data,
    loading: loading || q.isLoading,
    refetch: q.refetch,
    error: q.error,
  };
}