import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";

export default async function MomentsPage({ params }: { params: { id: string } }) {
  const { supabase } = await requireUser();
  const { data: trip } = await supabase.from("trips").select("*").eq("id", params.id).maybeSingle();
  if (!trip) notFound();

  const { data: moments } = await supabase
    .from("media")
    .select("id, storage_path, kind, user_id, was_late, created_at")
    .eq("trip_id", trip.id)
    .eq("is_moment", true)
    .order("created_at", { ascending: false });

  const items = await Promise.all(
    (moments ?? []).map(async (m) => {
      const { data } = await supabase.storage.from("trip-media").createSignedUrl(m.storage_path, 60 * 60);
      return { ...m, url: data?.signedUrl ?? "" };
    })
  );

  const now = new Date();
  const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startYesterday = new Date(startToday.getTime() - 24 * 60 * 60 * 1000);
  const yesterdays = items.filter((m) => {
    const t = new Date(m.created_at).getTime();
    return t >= startYesterday.getTime() && t < startToday.getTime();
  });

  return (
    <main className="px-5 py-8">
      <Link href={`/trips/${trip.id}`} className="text-sm text-muted">← {trip.name}</Link>
      <h1 className="my-3 font-display text-5xl italic leading-none">Moments</h1>

      <div className="mb-6 mt-6 flex gap-2">
        <Link href={`/trips/${trip.id}`} className="rounded-full border border-border bg-card px-5 py-2 text-sm font-semibold">
          Album
        </Link>
        <span className="rounded-full bg-fg px-5 py-2 text-sm font-bold text-bg">Moments</span>
        <Link href={`/trips/${trip.id}/capture`} className="ml-auto rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold">
          📷
        </Link>
      </div>

      {yesterdays.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-muted">Gårsdagens moments</h2>
          <div className="-mx-5 flex gap-3 overflow-x-auto px-5 pb-2">
            {yesterdays.map((m, i) => (
              <div
                key={m.id}
                className="relative h-44 w-36 flex-none overflow-hidden rounded-2xl bg-card p-2 shadow-soft"
                style={{ transform: `rotate(${(i % 2 === 0 ? 1 : -1) * (Math.random() * 2 + 1)}deg)` }}
              >
                <img src={m.url} className="h-full w-full rounded-xl object-cover" alt="" />
                {m.was_late && (
                  <span className="absolute bottom-3 left-3 rounded-full bg-black/70 px-2 py-0.5 text-[10px] font-bold text-white">sent</span>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-muted">Alle moments</h2>
      {items.length === 0 ? (
        <div className="rounded-chunk bg-card p-10 text-center shadow-soft">
          <p className="text-5xl">✨</p>
          <p className="mt-3 font-semibold">Ingen moments enda</p>
          <p className="mt-1 text-sm text-muted">Vent på neste runde — eller test fra album-siden</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {items.map((m) => (
            <div key={m.id} className="relative aspect-square overflow-hidden rounded-2xl bg-card shadow-soft">
              <img src={m.url} className="h-full w-full object-cover" alt="" />
              {m.was_late && (
                <span className="absolute bottom-1.5 left-1.5 rounded-full bg-black/70 px-2 py-0.5 text-[10px] font-bold text-white">sent</span>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
