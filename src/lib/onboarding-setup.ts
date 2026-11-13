import { z } from "zod";
import { planFormSchema } from "./plan-form";

export function validateOnboarding(data: {
  name: string; email: string; equipe: string;
  planos: { name: string; price: number; duration_months: number }[];
}): string | null {
  if (!data.name.trim()) return "Informe o nome da academia.";
  if (data.email.trim() && !z.string().email().safeParse(data.email.trim()).success) return "Confira o email de contato.";
  const emails = data.equipe.split(/[\n,]/).map(email => email.trim()).filter(Boolean);
  if (emails.some(email => !z.string().email().safeParse(email).success)) return "Confira os emails da equipe.";
  if (data.planos.some(plan => !planFormSchema.safeParse({ ...plan, description: "", featured: false }).success)) return "Confira os planos: nome obrigatório, preço não negativo e duração inteira maior que zero.";
  return null;
}

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