import { describe, expect, test } from "bun:test";
import { accessDestination } from "./access-destination";

describe("first access", () => {
  test("the owner goes to Master without an academy", () => {
    expect(accessDestination({ isSuperAdmin: true, academyId: null })).toBe("/master/painel");
  });
  test("ordinary signup does not go to Master", () => {
    expect(accessDestination({ isSuperAdmin: false, academyId: null })).toBe("/app/onboarding");
  });
  test("academy members go to their tenant dashboard", () => {
    expect(accessDestination({ isSuperAdmin: false, academyId: "academy-a" })).toBe("/app/dashboard");
  });
});