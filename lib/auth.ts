import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export function supabaseConfigured() {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

export async function requireUser() {
  if (!supabaseConfigured()) redirect("/setup");
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
  if (!profile?.display_name) redirect("/onboarding");
  return { user, profile, supabase };
}
