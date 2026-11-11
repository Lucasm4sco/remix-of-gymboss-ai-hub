import { describe, test } from "node:test";
import { strict as assert } from "node:assert";
import { accessDestination } from "./access-destination";

describe("first access", () => {
  test("the owner goes to Master without an academy", () => {
    assert.equal(accessDestination({ isSuperAdmin: true, academyId: null }), "/master/painel");
  });
  test("ordinary signup does not go to Master", () => {
    assert.equal(accessDestination({ isSuperAdmin: false, academyId: null }), "/app/onboarding");
  });
  test("academy members go to their tenant dashboard", () => {
    assert.equal(accessDestination({ isSuperAdmin: false, academyId: "academy-a" }), "/app/dashboard");
  });
});