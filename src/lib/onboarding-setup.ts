export type OnboardingProgress = {
  academyId: string | null;
  plansSaved: boolean;
  teamSaved: boolean;
};

// Keep successful stages across retries; never repeat a confirmed academy creation.
export async function completeOnboarding(
  progress: OnboardingProgress,
  actions: {
    createAcademy: () => Promise<string>;
    savePlans: (academyId: string) => Promise<void>;
    saveTeam: (academyId: string) => Promise<void>;
  },
) {
  if (!progress.academyId) progress.academyId = await actions.createAcademy();
  if (!progress.plansSaved) {
    await actions.savePlans(progress.academyId);
    progress.plansSaved = true;
  }
  if (!progress.teamSaved) {
    await actions.saveTeam(progress.academyId);
    progress.teamSaved = true;
  }
}