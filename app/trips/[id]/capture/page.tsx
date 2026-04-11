import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { CaptureForm } from "./capture-form";
import { translate, type Lang } from "@/lib/i18n";

export default async function CapturePage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { round?: string };
}) {
  const { supabase, profile } = await requireUser();
  const lang = (profile.language as Lang) ?? "no";
  const tt = (key: Parameters<typeof translate>[0]) => translate(key, lang);
  const { data: trip } = await supabase.from("trips").select("id, name").eq("id", params.id).maybeSingle();
  if (!trip) notFound();

  let round: { id: string; closes_at: string } | null = null;
  if (searchParams.round) {
    const { data } = await supabase
      .from("moment_rounds")
      .select("id, closes_at")
      .eq("id", searchParams.round)
      .maybeSingle();
    round = data ?? null;
  }

  return (
    <main className="px-5 py-8">
      <div className="flex items-center justify-between">
        <Link href={`/trips/${trip.id}`} className="text-sm text-muted">← {trip.name}</Link>
        {round ? (
          <Link
            href={`/api/skip-round?round=${round.id}&trip=${trip.id}`}
            className="rounded-full border border-border bg-card px-3 py-1.5 text-sm font-semibold text-muted"
          >
            {tt("capture.skip")}
          </Link>
        ) : null}
      </div>
      <h1 className="my-3 font-display text-5xl italic leading-none">{tt("capture.moment")}</h1>
      <div className="mt-6">
        <CaptureForm tripId={trip.id} round={round} />
      </div>
    </main>
  );
}
