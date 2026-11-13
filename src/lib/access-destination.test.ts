import { describe, test } from "node:test";
import { strict as assert } from "node:assert";
import { accessDestination, firstAccessDestination } from "./access-destination";

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

describe("login readiness", () => {
  const ready = { authenticated: true, authLoading: false, tenantLoading: false, tenantError: null, tenant: undefined };
  test("authenticated account with completed empty tenant load goes to onboarding", () => {
    assert.equal(firstAccessDestination(ready), "/app/onboarding");
  });
  test("auth and tenant loading never redirect", () => {
    assert.equal(firstAccessDestination({ ...ready, authLoading: true }), null);
    assert.equal(firstAccessDestination({ ...ready, tenantLoading: true }), null);
  });
  test("tenant errors block redirects even with cached tenant data", () => {
    assert.equal(firstAccessDestination({ ...ready, tenantError: new Error("failed") }), null);
    assert.equal(firstAccessDestination({ ...ready, tenantError: new Error("failed"), tenant: { isSuperAdmin: true, academyId: null } }), null);
  });
  test("signed-out accounts stay on login", () => {
    assert.equal(firstAccessDestination({ ...ready, authenticated: false }), null);
  });
  test("existing permissions preserve their destination", () => {
    assert.equal(firstAccessDestination({ ...ready, tenant: { isSuperAdmin: true, academyId: null } }), "/master/painel");
    assert.equal(firstAccessDestination({ ...ready, tenant: { isSuperAdmin: false, academyId: "academy-a" } }), "/app/dashboard");
  });
});