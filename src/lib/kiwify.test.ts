import { test } from "node:test";
import { strict as assert } from "node:assert";
import { createHmac } from "node:crypto";
import { normalizeKiwify, checkoutPlans } from "./kiwify";
import { handleKiwifyWebhook, validKiwifySignature } from "./kiwify-webhook.server";

const token = "kiwify-token-de-teste";
const officialBody = '{"order_id":"9b1c2d3e-0000-4000-8000-000000000001","order_status":"paid","webhook_event_type":"order_approved"}';
const officialSignature = "bf18f352a4f981b91dfa3f6d8742a81080ab8c86";
const fixture = { order_id: "order-1", subscription_id: "sub-1", order_status: "paid", webhook_event_type: "order_approved", checkout_link: "HHpoAGt", Customer: { email: "owner@example.invalid" }, Subscription: { id: "sub-1", status: "active", customer_access: { has_access: true, access_until: "2027-01-01T00:00:00Z" } } };
test("official HMAC-SHA1 vector validates exact bytes", () => {
  assert.equal(validKiwifySignature(new TextEncoder().encode(officialBody), officialSignature, token), true);
  assert.equal(validKiwifySignature(new TextEncoder().encode(officialBody + " "), officialSignature, token), false);
  assert.equal(validKiwifySignature(new TextEncoder().encode(officialBody), "0".repeat(40), token), false);
});
test("Start, Pro and Elite map only by exact checkout codes", () => {
  assert.deepEqual(checkoutPlans, { gNqK4eC: "starter", HHpoAGt: "pro", zbICqSC: "premium" });
  for (const [checkout_link, plan] of Object.entries(checkoutPlans)) assert.equal(normalizeKiwify({ ...fixture, checkout_link }).plan, plan);
  assert.equal(normalizeKiwify({ ...fixture, checkout_link: "unknown" }).reason, "unknown_checkout");
});
test("unknown events, explicit tests and invalid paid statuses never grant", () => {
  assert.equal(normalizeKiwify({ ...fixture, webhook_event_type: "subscription_trial_started" }).reason, "unsupported_event");
  assert.equal(normalizeKiwify({ ...fixture, test: true }).reason, "test_event");
  assert.equal(normalizeKiwify({ ...fixture, order_status: "refused" }).reason, "invalid_status");
});
test("cancel keeps provider access_until and late does not infer new paid time", () => {
  const canceled = normalizeKiwify({ ...fixture, webhook_event_type: "subscription_canceled", Subscription: { ...fixture.Subscription, status: "canceled" } });
  assert.equal(canceled.access_until, "2027-01-01T00:00:00Z");
  assert.equal(canceled.reason, null);
  const late = normalizeKiwify({ ...fixture, webhook_event_type: "subscription_late", order_status: "refused", Subscription: { ...fixture.Subscription, status: "waiting_payment" } });
  assert.equal(late.reason, null);
});
test("identity uses order plus event, falling back to subscription", () => {
  assert.equal(normalizeKiwify(fixture).identity, "order:order-1");
  assert.equal(normalizeKiwify({ ...fixture, order_id: null }).identity, "subscription:sub-1");
  assert.throws(() => normalizeKiwify({ ...fixture, subscription_id: "other-sub" }));
});
test("normalized event excludes other contact and card fields", () => {
  const event = normalizeKiwify({ ...fixture, phone: "private", Customer: { ...fixture.Customer, mobile: "private", cpf: "private" }, card: "private" });
  assert.equal(JSON.stringify(event).includes("private"), false);
});
test("missing token fails closed and invalid signature never reaches processing", async () => {
  let calls = 0;
  const process = async () => { calls++; };
  const request = () => new Request("https://example.invalid/api/public/kiwify/webhook?signature=" + "0".repeat(40), { method: "POST", headers: { "content-type": "application/json" }, body: "not json" });
  assert.equal((await handleKiwifyWebhook(request(), undefined, process)).status, 503);
  assert.equal((await handleKiwifyWebhook(request(), token, process)).status, 401);
  assert.equal(calls, 0);
});
test("valid signed delivery returns directly; processor failures permit retry", async () => {
  const body = JSON.stringify(fixture);
  const signature = createHmac("sha1", token).update(body).digest("hex");
  const request = () => new Request("https://example.invalid/api/public/kiwify/webhook?signature=" + signature, { method: "POST", headers: { "content-type": "application/json" }, body });
  let calls = 0;
  const result = await handleKiwifyWebhook(request(), token, async event => { assert.equal(event.customer_email, "owner@example.invalid"); calls++; });
  assert.equal(result.status, 204); assert.equal(result.headers.get("location"), null); assert.equal(calls, 1);
  assert.equal((await handleKiwifyWebhook(request(), token, async () => { throw new Error("private"); })).status, 503);
});