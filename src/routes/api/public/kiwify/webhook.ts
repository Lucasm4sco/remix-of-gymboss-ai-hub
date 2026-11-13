import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/kiwify/webhook")({
  server: { handlers: { POST: async ({ request }) => {
    const { handleKiwifyWebhook } = await import("@/lib/kiwify-webhook.server");
    return handleKiwifyWebhook(request, process.env["KIWIFY_WEBHOOK_TOKEN"], async event => {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { error } = await supabaseAdmin.rpc("kiwify_process_event", { p_event: event });
      if (error) throw new Error("Billing processing failed");
    });
  } } },
});