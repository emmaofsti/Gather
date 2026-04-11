import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdmin } from "@/lib/supabase/admin";
import { translate, type Lang } from "@/lib/i18n";

export default async function JoinPage({ params }: { params: { code: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect(`/login?next=${encodeURIComponent(`/join/${params.code}`)}`);
  }

  const admin = createAdmin();
  const { data: trip } = await admin
    .from("trips")
    .select("id, name")
    .eq("invite_code", params.code)
    .maybeSingle();

  if (!trip) {
    const { data: profile } = await supabase.from("profiles").select("language").eq("id", user!.id).maybeSingle();
    const lang = (profile?.language as Lang) ?? "no";
    const t = (key: Parameters<typeof translate>[0]) => translate(key, lang);
    return (
      <main className="px-5 py-12 text-center">
        <h1 className="text-2xl font-bold">{t("join.invalid")}</h1>
        <p className="mt-2 text-muted">{t("join.not_found")}</p>
      </main>
    );
  }

  await admin.from("trip_members").upsert({ trip_id: trip.id, user_id: user!.id });
  redirect(`/trips/${trip.id}`);
}
