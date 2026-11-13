import { test } from "node:test";
import { strict as assert } from "node:assert";
import { completeOnboarding, type OnboardingProgress } from "./onboarding-setup";

test("plan failure is surfaced; retry uses the confirmed academy only once", async () => {
  const progress: OnboardingProgress = { academyId: null, plansSaved: false, teamSaved: false };
  let creations = 0, plans = 0, team = 0;
  const actions = {
    createAcademy: async () => { creations++; return "academy-a"; },
    savePlans: async (id: string) => { assert.equal(id, "academy-a"); if (++plans === 1) throw new Error("plans failed"); },
    saveTeam: async (id: string) => { assert.equal(id, "academy-a"); team++; },
  };
  await assert.rejects(completeOnboarding(progress, actions), /plans failed/);
  assert.equal(team, 0);
  await completeOnboarding(progress, actions);
  assert.equal(creations, 1);
  assert.equal(plans, 2);
  assert.equal(team, 1);
});

test("team failure is surfaced; retry never repeats saved plans or academy", async () => {
  const progress: OnboardingProgress = { academyId: null, plansSaved: false, teamSaved: false };
  let creations = 0, plans = 0, team = 0;
  const actions = {
    createAcademy: async () => { creations++; return "academy-a"; },
    savePlans: async () => { plans++; },
    saveTeam: async () => { if (++team === 1) throw new Error("team failed"); },
  };
  await assert.rejects(completeOnboarding(progress, actions), /team failed/);
  await completeOnboarding(progress, actions);
  assert.equal(creations, 1);
  assert.equal(plans, 1);
  assert.equal(team, 2);
  await completeOnboarding(progress, actions);
  assert.equal(team, 2);
});