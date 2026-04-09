import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { Album } from "./album";
import { PushOptIn } from "@/components/push-optin";
import { TestMomentButton } from "@/components/test-moment-button";
import { ShareTrip } from "@/components/share-trip";
import { CoverEdit } from "@/components/cover-edit";

export default async function TripPage({ params }: { params: { id: string } }) {
  const { supabase, user } = await requireUser();
  const { data: trip } = await supabase.from("trips").select("*").eq("id", params.id).maybeSingle();
  if (!trip) notFound();

  const isOwner = trip.created_by === user.id;

  const { data: media } = await supabase
    .from("media")
    .select("id, storage_path, kind, user_id, created_at, profiles(display_name)")
    .eq("trip_id", trip.id)
    .order("created_at", { ascending: false });

  const items = await Promise.all(
    (media ?? []).map(async (m: any) => {
      const { data } = await supabase.storage.from("trip-media").createSignedUrl(m.storage_path, 60 * 60);
      return {
        id: m.id,
        storage_path: m.storage_path,
        kind: m.kind,
        url: data?.signedUrl ?? "",
        created_at: m.created_at,
        uploader: m.profiles?.display_name ?? "Ukjent",
      };
    })
  );

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
              ← Turer
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
            <Link href="/" className="text-sm text-muted">← Mine turer</Link>
            <ShareTrip code={trip.invite_code} name={trip.name} dark />
          </div>
          <div className="mt-4">
            <TitleCard trip={trip} members={members ?? []} isOwner={isOwner} />
          </div>
        </div>
      )}

      <div className="mt-6 flex gap-2 px-5">
        <span className="rounded-full bg-fg px-5 py-2 text-sm font-bold text-bg">Album</span>
        <Link href={`/trips/${trip.id}/moments`} className="rounded-full border border-border bg-card px-5 py-2 text-sm font-semibold">
          Moments
        </Link>
        <Link href={`/trips/${trip.id}/capture`} className="ml-auto rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold">
          📷
        </Link>
      </div>

      <div className="mt-4 px-5">
        <PushOptIn />
        <TestMomentButton />
      </div>

      <div className="mt-2 px-5">
        <Album tripId={trip.id} initial={items} />
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
