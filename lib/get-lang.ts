import { requireUser } from "./auth";
import type { Lang } from "./i18n";

export async function getLang(): Promise<Lang> {
  try {
    const { profile } = await requireUser();
    return (profile?.language as Lang) ?? "no";
  } catch {
    return "no";
  }
}
