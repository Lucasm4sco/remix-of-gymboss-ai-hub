import { z } from "zod";

export const checkoutPlans = { gNqK4eC: "starter", HHpoAGt: "pro", zbICqSC: "premium" } as const;
export const eventTypes = ["order_approved", "order_refunded", "chargeback", "subscription_renewed", "subscription_late", "subscription_canceled"] as const;
const identifier = z.string().min(1).max(100).regex(/^[a-zA-Z0-9_-]+$/);
const utcDate = z.string().max(40).regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/).refine(value => Number.isFinite(Date.parse(value)));
// Strip unused provider fields instead of persisting contacts, card data or payloads.
export const kiwifySchema = z.object({
  webhook_event_type: z.string().min(1).max(80),
  order_id: identifier.nullish(),
  subscription_id: identifier.nullish(),
  order_status: z.enum(["paid", "refunded", "chargedback", "refused", "waiting_payment", "trial", "canceled"]).optional(),
  checkout_link: z.string().max(200).optional(),
  Customer: z.object({ email: z.string().trim().email().max(254).transform(value => value.toLowerCase()) }).optional(),
  Subscription: z.object({
    id: identifier,
    status: z.enum(["active", "waiting_payment", "canceled", "ended"]),
    customer_access: z.object({ has_access: z.boolean(), active_period: z.boolean().optional(), access_until: utcDate }),
  }).optional(),
  test: z.boolean().optional(),
  is_test: z.boolean().optional(),
}).refine(value => Boolean(value.order_id || value.subscription_id), "Missing event identity")
  .refine(value => !value.Subscription || value.Subscription.id === value.subscription_id, "Subscription identity mismatch");

export function normalizeKiwify(input: unknown) {
  const data = kiwifySchema.parse(input);
  const code = data.checkout_link ?? "";
  const plan = Object.prototype.hasOwnProperty.call(checkoutPlans, code) ? checkoutPlans[code as keyof typeof checkoutPlans] : null;
  const supported = (eventTypes as readonly string[]).includes(data.webhook_event_type);
  const expected: Record<string, string> = { order_approved: "paid", order_refunded: "refunded", chargeback: "chargedback", subscription_renewed: "paid", subscription_late: "refused" };
  const statusValid = data.webhook_event_type === "subscription_canceled"
    ? ["paid", "refunded", "chargedback", "refused"].includes(data.order_status ?? "") && ["canceled", "ended"].includes(data.Subscription?.status ?? "")
    : data.order_status === expected[data.webhook_event_type];
  const subscriptionValid = data.webhook_event_type === "order_refunded" || data.webhook_event_type === "chargeback" ||
    (data.webhook_event_type === "subscription_late" ? data.Subscription?.status === "waiting_payment" :
      data.webhook_event_type === "subscription_canceled" || data.Subscription?.status === "active" && data.Subscription.customer_access.has_access);
  return {
    event_type: data.webhook_event_type,
    identity: `${data.order_id ? "order" : "subscription"}:${data.order_id ?? data.subscription_id}`,
    order_id: data.order_id ?? null,
    subscription_id: data.subscription_id ?? null,
    customer_email: data.Customer?.email ?? null,
    checkout_code: code,
    plan,
    access_until: data.Subscription?.customer_access.access_until ?? null,
    order_status: data.order_status ?? null,
    reason: !supported ? "unsupported_event" : data.test || data.is_test ? "test_event" : !plan ? "unknown_checkout" : !statusValid || !subscriptionValid ? "invalid_status" : !data.subscription_id || !data.Customer?.email || !data.Subscription ? "incomplete_subscription" : null,
  };
}

export type KiwifyEvent = ReturnType<typeof normalizeKiwify>;