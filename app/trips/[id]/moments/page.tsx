import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { MomentsGrid } from "./moments-grid";
import { translate, type Lang } from "@/lib/i18n";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function MomentsPage({ params }: { params: { id: string } }) {
  const { supabase, user, profile } = await requireUser();
  const lang = (profile.language as Lang) ?? "no";
  const tt = (key: Parameters<typeof translate>[0]) => translate(key, lang);
  const { data: trip } = await supabase.from("trips").select("*").eq("id", params.id).maybeSingle();
  if (!trip) notFound();

  const { data: moments, error: momErr } = await supabase
    .from("media")
    .select("id, storage_path, secondary_storage_path, kind, user_id, was_late, created_at")
    .eq("trip_id", trip.id)
    .eq("is_moment", true)
    .order("created_at", { ascending: false });
  if (momErr) console.error("moments query error", momErr);

  const userIds = Array.from(new Set((moments ?? []).map((m: any) => m.user_id)));
  const { data: profs } = userIds.length
    ? await supabase.from("profiles").select("id, display_name").in("id", userIds)
    : { data: [] as any[] };
  const nameById = new Map((profs ?? []).map((p: any) => [p.id, p.display_name]));

  const allPaths = (moments ?? []).flatMap((m: any) =>
    [m.storage_path, m.secondary_storage_path].filter(Boolean) as string[]
  );
  const { data: signed } = allPaths.length
    ? await supabase.storage.from("trip-media").createSignedUrls(allPaths, 60 * 60)
    : { data: [] as any[] };
  const urlByPath = new Map((signed ?? []).map((s: any) => [s.path, s.signedUrl]));

  const items = (moments ?? []).map((m: any) => ({
    id: m.id,
    url: urlByPath.get(m.storage_path) ?? "",
    secondaryUrl: m.secondary_storage_path ? (urlByPath.get(m.secondary_storage_path) ?? null) : null,
    kind: m.kind,
    was_late: m.was_late,
    created_at: m.created_at,
    user_id: m.user_id,
    storage_path: m.storage_path,
    secondary_storage_path: m.secondary_storage_path,
    uploader: nameById.get(m.user_id) ?? tt("album.unknown"),
  }));

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

      {yesterdays.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-muted">{tt("moments.yesterday")}</h2>
          <div className="-mx-5 flex gap-3 overflow-x-auto px-5 pb-2">
            {yesterdays.map((m, i) => (
              <div
                key={m.id}
                className="relative h-44 w-36 flex-none overflow-hidden rounded-2xl bg-card p-2 shadow-soft"
                style={{ transform: `rotate(${(i % 2 === 0 ? 1 : -1) * 1.5}deg)` }}
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

      <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-muted">{tt("moments.all")}</h2>
      <MomentsGrid items={items} currentUserId={user.id} />
    </main>
  );
}
