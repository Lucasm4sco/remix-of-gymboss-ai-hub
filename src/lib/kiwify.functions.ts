import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const resolveKiwifySubscription = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ subscriptionId: z.string().min(1).max(100), academyId: z.string().uuid(), confirmedRealPurchase: z.literal(true) }).strict().parse(input))
  .handler(async ({ data, context }) => {
    const { data: allowed, error: roleError } = await context.supabase.rpc("is_super_admin");
    if (roleError || !allowed) throw new Error("Acesso exclusivo do super administrador.");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.rpc("kiwify_resolve", { p_subscription: data.subscriptionId, p_academy: data.academyId, p_actor: context.userId });
    if (error) throw new Error("Não foi possível associar. Confira a assinatura e se a academia já possui assinatura confirmada.");
    return { success: true };
  });