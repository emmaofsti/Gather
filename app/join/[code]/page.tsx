import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function JoinPage({ params }: { params: { code: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect(`/login?next=${encodeURIComponent(`/join/${params.code}`)}`);
  }

  const { data: trip } = await supabase
    .from("trips")
    .select("id, name")
    .eq("invite_code", params.code)
    .maybeSingle();

  if (!trip) {
    return (
      <main className="px-5 py-12 text-center">
        <h1 className="text-2xl font-bold">Ugyldig invite</h1>
        <p className="mt-2 text-muted">Koden finnes ikke.</p>
      </main>
    );
  }

  await supabase.from("trip_members").upsert({ trip_id: trip.id, user_id: user!.id });
  redirect(`/trips/${trip.id}`);
}
