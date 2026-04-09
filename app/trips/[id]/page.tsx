import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { Board } from "./board";
import { PeaksGrid } from "./peaks-grid";
import { PushOptIn } from "@/components/push-optin";
import { ShareTrip } from "@/components/share-trip";
import { CoverEdit } from "@/components/cover-edit";
import { Album } from "./album";

export const dynamic = "force-dynamic";

export default async function TripPage({ params }: { params: { id: string } }) {
  const { supabase, user } = await requireUser();
  const { data: trip } = await supabase.from("trips").select("*").eq("id", params.id).maybeSingle();
  if (!trip) notFound();

  const isOwner = trip.created_by === user.id;

  const { data: board } = await supabase
    .from("trip_boards")
    .select("notes")
    .eq("trip_id", trip.id)
    .maybeSingle();

  const { data: links } = await supabase
    .from("trip_links")
    .select("id, title, url")
    .eq("trip_id", trip.id)
    .order("created_at", { ascending: false });

  const { data: allMedia } = await supabase
    .from("media")
    .select("id, storage_path, kind, is_peak, created_at")
    .eq("trip_id", trip.id)
    .eq("is_moment", false)
    .order("created_at", { ascending: false });

  const allItems = await Promise.all(
    (allMedia ?? []).map(async (m: any) => {
      const { data } = await supabase.storage.from("trip-media").createSignedUrl(m.storage_path, 60 * 60);
      return { id: m.id, url: data?.signedUrl ?? "", kind: m.kind, is_peak: m.is_peak, created_at: m.created_at };
    })
  );
  const peakItems = allItems.filter((m: any) => m.is_peak).slice(0, 5);

  const { data: members } = await supabase
    .from("trip_members")
    .select("user_id, profiles(display_name)")
    .eq("trip_id", trip.id);

  return (
    <main className="pb-10">
      {trip.cover_url ? (
        <>
          <div className="relative h-72 w-full overflow-hidden">
            <img src={trip.cover_url} className="h-full w-full object-cover" alt="" />
            <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/10 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-transparent" />
            <Link href="/" className="absolute left-4 top-4 rounded-full border border-white/30 bg-black/40 px-3 py-1.5 text-sm font-semibold text-white backdrop-blur">
              ← Gatherings
            </Link>
            <div className="absolute right-4 top-4">
              <ShareTrip code={trip.invite_code} name={trip.name} />
            </div>
            {isOwner && <CoverEdit tripId={trip.id} hasCover />}
          </div>
          <div className="mt-5 px-5">
            <TitleCard trip={trip} members={members ?? []} isOwner={isOwner} />
          </div>
        </>
      ) : (
        <div className="px-5 pt-6">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-sm text-muted">← Mine Gatherings</Link>
            <ShareTrip code={trip.invite_code} name={trip.name} dark />
          </div>
          <div className="mt-4">
            <TitleCard trip={trip} members={members ?? []} isOwner={isOwner} />
          </div>
        </div>
      )}

      <div className="mt-5 flex gap-2 px-5">
        <Link
          href={`/trips/${trip.id}/album`}
          className="flex flex-1 items-center justify-center gap-2 rounded-full bg-card px-4 py-2.5 text-sm font-semibold shadow-soft active:scale-95"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="9" cy="9" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>
          Album
        </Link>
        <Link
          href={`/trips/${trip.id}/moments`}
          className="flex flex-1 items-center justify-center gap-2 rounded-full bg-card px-4 py-2.5 text-sm font-semibold shadow-soft active:scale-95"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l2.39 7.36H22l-6.18 4.49L18.21 21 12 16.5 5.79 21l2.39-7.15L2 9.36h7.61L12 2z"/></svg>
          Moments
        </Link>
        <Link
          href={`/trips/${trip.id}/capture`}
          className="flex items-center justify-center rounded-full bg-accent px-4 py-2.5 text-white shadow-soft active:scale-95"
          aria-label="Ta moment"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
        </Link>
      </div>

      <div className="mt-4 px-5">
        <PushOptIn />
      </div>

      <div className="mt-5 px-5">
        <Board
          tripId={trip.id}
          initialNotes={board?.notes ?? ""}
          initialLinks={(links ?? []) as any}
        />
      </div>

      <div className="mt-5 px-5">
        <p className="mb-2 text-xs font-bold uppercase tracking-widest text-muted">Album</p>
        <Album tripId={trip.id} initial={allItems as any} currentUserId={user.id} cropped />
      </div>
    </main>
  );
}

function TitleCard({ trip, members, isOwner }: { trip: any; members: any[]; isOwner: boolean }) {
  return (
    <div className="rounded-chunk bg-card px-6 pb-6 pt-7 shadow-pop">
      <h1 className="font-display text-4xl italic leading-none">{trip.name}</h1>
      {trip.start_date && (
        <p className="mt-2 text-sm text-muted">{formatRange(trip.start_date, trip.end_date)}</p>
      )}
      <div className="mt-4 flex items-center justify-between gap-3">
        <MemberAvatars members={members} />
        {isOwner && !trip.cover_url && <CoverEdit tripId={trip.id} hasCover={false} />}
      </div>
    </div>
  );
}

function MemberAvatars({ members }: { members: any[] }) {
  if (members.length === 0) return <span />;
  return (
    <div className="flex items-center gap-2">
      <div className="flex -space-x-2">
        {members.slice(0, 5).map((m, i) => {
          const name = m.profiles?.display_name ?? "?";
          const colors = ["bg-accent", "bg-accent2", "bg-lavender", "bg-fg", "bg-bg2"];
          return (
            <div
              key={m.user_id + i}
              className={`flex h-9 w-9 items-center justify-center rounded-full border-2 border-card text-sm font-bold text-white ${colors[i % colors.length]}`}
            >
              {name[0]?.toUpperCase()}
            </div>
          );
        })}
      </div>
      <p className="text-xs text-muted">
        {members.length} {members.length === 1 ? "person" : "personer"}
      </p>
    </div>
  );
}

function formatRange(start: string, end?: string | null) {
  const s = new Date(start).toLocaleDateString("no", { day: "numeric", month: "long" });
  if (!end) return s;
  const e = new Date(end).toLocaleDateString("no", { day: "numeric", month: "long", year: "numeric" });
  return `${s} – ${e}`;
}
