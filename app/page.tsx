import Link from "next/link";
import { requireUser } from "@/lib/auth";

export default async function Home() {
  const { supabase, profile } = await requireUser();
  const today = new Date().toISOString().slice(0, 10);

  const { data: trips } = await supabase
    .from("trips")
    .select("id, name, start_date, end_date, cover_url")
    .order("start_date", { ascending: false });

  const active = (trips ?? []).filter((t) => !t.end_date || t.end_date >= today);
  const past = (trips ?? []).filter((t) => t.end_date && t.end_date < today);

  return (
    <main className="px-5 py-8">
      <header className="mb-8">
        <p className="text-sm text-muted">hei {profile.display_name?.toLowerCase()} ✿</p>
        <h1 className="font-display text-5xl italic leading-none">Mine turer</h1>
      </header>

      {trips?.length === 0 && (
        <div className="rounded-chunk bg-card p-10 text-center shadow-soft">
          <p className="text-5xl">🌅</p>
          <p className="mt-3 font-semibold">Ingen turer enda</p>
          <p className="mt-1 text-sm text-muted">Lag din første og inviter gjengen</p>
          <Link href="/trips/new" className="mt-5 inline-block rounded-full bg-fg px-6 py-3 text-sm font-bold text-bg">
            Lag tur
          </Link>
        </div>
      )}

      {active.length > 0 && <Section title="Pågående" trips={active} accent />}
      {past.length > 0 && <Section title="Tidligere" trips={past} />}
    </main>
  );
}

function Section({ title, trips, accent }: { title: string; trips: any[]; accent?: boolean }) {
  return (
    <section className="mb-10">
      <div className="mb-4 flex items-center gap-2">
        <h2 className="text-xs font-bold uppercase tracking-widest text-muted">{title}</h2>
        {accent && <span className="h-2 w-2 animate-pulse rounded-full bg-accent" />}
      </div>
      <div className="flex flex-col gap-4">
        {trips.map((t) => <TripCard key={t.id} trip={t} />)}
      </div>
    </section>
  );
}

function TripCard({ trip }: { trip: any }) {
  return (
    <Link
      href={`/trips/${trip.id}`}
      className="group block overflow-hidden rounded-chunk bg-card shadow-soft transition active:scale-[0.98]"
    >
      {trip.cover_url ? (
        <div className="relative h-44 w-full overflow-hidden">
          <img src={trip.cover_url} className="h-full w-full object-cover transition group-hover:scale-105" alt="" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-4 text-white">
            <h3 className="font-display text-2xl italic leading-tight">{trip.name}</h3>
            {trip.start_date && (
              <p className="text-xs opacity-90">{formatRange(trip.start_date, trip.end_date)}</p>
            )}
          </div>
        </div>
      ) : (
        <div className="p-5">
          <div className="mb-3 flex h-32 items-center justify-center rounded-2xl bg-bg2 text-4xl">🏕️</div>
          <h3 className="font-display text-2xl italic leading-tight">{trip.name}</h3>
          {trip.start_date && (
            <p className="mt-1 text-xs text-muted">{formatRange(trip.start_date, trip.end_date)}</p>
          )}
        </div>
      )}
    </Link>
  );
}

function formatRange(start: string, end?: string | null) {
  const s = new Date(start).toLocaleDateString("no", { day: "numeric", month: "short" });
  if (!end) return s;
  const e = new Date(end).toLocaleDateString("no", { day: "numeric", month: "short", year: "numeric" });
  return `${s} – ${e}`;
}
