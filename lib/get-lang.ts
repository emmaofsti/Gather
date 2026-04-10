import { createClient } from "@/lib/supabase/server";
import type { Lang } from "./i18n";

export async function getLang(): Promise<Lang> {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return "no";
    const { data } = await supabase.from("profiles").select("language").eq("id", user.id).maybeSingle();
    return (data?.language as Lang) ?? "no";
  } catch {
    return "no";
  }
}
