import { test } from "node:test";
import { strict as assert } from "node:assert";
import { planFormSchema } from "./plan-form";

const valid = { name: "Mensal", description: "", price: 97, duration_months: 1, featured: false };

test("plan edits reject empty names", () => {
  assert.equal(planFormSchema.safeParse({ ...valid, name: "  " }).success, false);
});
test("plan edits reject negative and nonfinite prices", () => {
  for (const price of [-1, Infinity, NaN]) assert.equal(planFormSchema.safeParse({ ...valid, price }).success, false);
  assert.equal(planFormSchema.parse({ ...valid, price: 0 }).price, 0);
});
test("plan edits require positive integer durations", () => {
  for (const duration_months of [0, -1, 1.5]) assert.equal(planFormSchema.safeParse({ ...valid, duration_months }).success, false);
});
test("plan edits cannot include tenant identity or undisplayed fields", () => {
  assert.equal(planFormSchema.safeParse({ ...valid, academy_id: "other-tenant" }).success, false);
  assert.deepEqual(planFormSchema.parse(valid), valid);
});