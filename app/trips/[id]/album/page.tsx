import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { Album } from "../album";

export const dynamic = "force-dynamic";

export default async function AlbumPage({ params }: { params: { id: string } }) {
  const { supabase, user } = await requireUser();
  const { data: trip } = await supabase.from("trips").select("id, name").eq("id", params.id).maybeSingle();
  if (!trip) notFound();

  const { data: media } = await supabase
    .from("media")
    .select("id, storage_path, kind, user_id, is_peak, created_at")
    .eq("trip_id", trip.id)
    .eq("is_moment", false)
    .order("created_at", { ascending: false });

  const userIds = Array.from(new Set((media ?? []).map((m: any) => m.user_id)));
  const { data: profs } = userIds.length
    ? await supabase.from("profiles").select("id, display_name").in("id", userIds)
    : { data: [] as any[] };
  const nameById = new Map((profs ?? []).map((p: any) => [p.id, p.display_name]));

  const paths = (media ?? []).map((m: any) => m.storage_path);
  const { data: signed } = paths.length
    ? await supabase.storage.from("trip-media").createSignedUrls(paths, 60 * 60)
    : { data: [] as any[] };
  const urlByPath = new Map((signed ?? []).map((s: any) => [s.path, s.signedUrl]));
  const items = (media ?? []).map((m: any) => ({
    id: m.id,
    storage_path: m.storage_path,
    kind: m.kind,
    url: urlByPath.get(m.storage_path) ?? "",
    created_at: m.created_at,
    user_id: m.user_id,
    is_peak: m.is_peak,
    uploader: nameById.get(m.user_id) ?? "Ukjent",
  }));

  return (
    <main className="px-5 py-6">
      <Link href={`/trips/${trip.id}`} className="text-sm text-muted">← {trip.name}</Link>
      <h1 className="my-3 font-display text-5xl italic leading-none">Album</h1>
      <Album tripId={trip.id} initial={items} currentUserId={user.id} />
    </main>
  );
}
