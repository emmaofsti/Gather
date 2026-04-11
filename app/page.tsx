import Link from "next/link";
import { cookies } from "next/headers";
import { requireUser } from "@/lib/auth";
import { InstallBanner } from "@/components/install-banner";
import { translate, type Lang } from "@/lib/i18n";
import { CoverImage } from "@/components/cover-image";

export const dynamic = "force-dynamic";

export default async function Home() {
  const { supabase, user, profile } = await requireUser();
  const lang = (profile.language as Lang) ?? "no";
  const t = (key: Parameters<typeof translate>[0]) => translate(key, lang);
  const today = new Date().toISOString().slice(0, 10);

  const skipped = new Set(
    (cookies().get("skipped_rounds")?.value ?? "").split(",").filter(Boolean)
  );
  const { data: activeRound } = await supabase
    .from("moment_rounds")
    .select("id, trip_id, closes_at")
    .eq("user_id", user.id)
    .gt("closes_at", new Date().toISOString())
    .order("triggered_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  const showMomentBanner = activeRound && !skipped.has(activeRound.id);

  const { data: trips } = await supabase
    .from("trips")
    .select("id, name, start_date, end_date, cover_url")
    .order("start_date", { ascending: false });

  const upcoming = (trips ?? []).filter((tr) => tr.start_date && tr.start_date > today);
  const active = (trips ?? []).filter((tr) =>
    (!tr.start_date || tr.start_date <= today) && (!tr.end_date || tr.end_date >= today)
  );
  const past = (trips ?? []).filter((tr) => tr.end_date && tr.end_date < today);
  const locale = lang === "en" ? "en" : "no";

  return (
    <main className="px-5 py-8">
      <header className="mb-8">
        <p className="text-sm text-muted">{t("home.hi")} {profile.display_name?.toLowerCase()} ✿</p>
        <h1 className="font-display text-5xl italic leading-none">{t("home.title")}</h1>
      </header>

      <div className="mb-6">
        <InstallBanner />
      </div>

      {showMomentBanner && (
        <Link
          href={`/trips/${activeRound!.trip_id}/capture?round=${activeRound!.id}`}
          className="mb-6 flex items-center gap-3 rounded-chunk bg-accent p-4 text-white shadow-pop"
        >
          <span className="text-2xl">✦</span>
          <div className="flex-1">
            <p className="font-bold">{t("home.moment_now")}</p>
            <p className="text-xs opacity-90">{t("home.moment_tap")}</p>
          </div>
          <span className="text-xl">→</span>
        </Link>
      )}

      {trips?.length === 0 && (
        <div className="rounded-chunk bg-card p-10 text-center shadow-soft">
          <p className="text-5xl">🌅</p>
          <p className="mt-3 font-semibold">{t("home.no_gatherings")}</p>
          <p className="mt-1 text-sm text-muted">{t("home.no_gatherings_sub")}</p>
          <Link href="/trips/new" className="mt-5 inline-block rounded-full bg-fg px-6 py-3 text-sm font-bold text-bg">
            {t("home.create")}
          </Link>
        </div>
      )}

      {active.length > 0 && <Section title={t("home.active")} trips={active} accent locale={locale} />}
      {upcoming.length > 0 && <Section title={t("home.upcoming")} trips={upcoming} locale={locale} />}
      {past.length > 0 && <Section title={t("home.past")} trips={past} locale={locale} />}
    </main>
  );
}

function Section({ title, trips, accent, locale }: { title: string; trips: any[]; accent?: boolean; locale: string }) {
  return (
    <section className="mb-10">
      <div className="mb-4 flex items-center gap-2">
        <h2 className="text-xs font-bold uppercase tracking-widest text-muted">{title}</h2>
        {accent && <span className="h-2 w-2 animate-pulse rounded-full bg-accent" />}
      </div>
      <div className="flex flex-col gap-4">
        {trips.map((tr) => <TripCard key={tr.id} trip={tr} locale={locale} />)}
      </div>
    </section>
  );
}

function TripCard({ trip, locale }: { trip: any; locale: string }) {
  return (
    <Link
      href={`/trips/${trip.id}`}
      className="group block overflow-hidden rounded-chunk bg-card shadow-soft transition active:scale-[0.98]"
    >
      {trip.cover_url ? (
        <div className="relative h-44 w-full overflow-hidden">
          <CoverImage src={trip.cover_url} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-4 text-white">
            <h3 className="font-display text-2xl italic leading-tight">{trip.name}</h3>
            {trip.start_date && (
              <p className="text-xs opacity-90">{formatRange(trip.start_date, trip.end_date, locale)}</p>
            )}
          </div>
        </div>
      ) : (
        <div className="p-5">
          <div className="mb-3 flex h-32 items-center justify-center rounded-2xl bg-bg2 text-4xl">🏕️</div>
          <h3 className="font-display text-2xl italic leading-tight">{trip.name}</h3>
          {trip.start_date && (
            <p className="mt-1 text-xs text-muted">{formatRange(trip.start_date, trip.end_date, locale)}</p>
          )}
        </div>
      )}
    </Link>
  );
}

function formatRange(start: string, end?: string | null, locale = "no") {
  const s = new Date(start).toLocaleDateString(locale, { day: "numeric", month: "short" });
  if (!end) return s;
  const e = new Date(end).toLocaleDateString(locale, { day: "numeric", month: "short", year: "numeric" });
  return `${s} – ${e}`;
}
