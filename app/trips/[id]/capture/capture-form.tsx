"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function CaptureForm({
  tripId,
  round,
}: {
  tripId: string;
  round: { id: string; closes_at: string } | null;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [now, setNow] = useState(Date.now());
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(t);
  }, []);

  const closesAt = round ? new Date(round.closes_at).getTime() : null;
  const remaining = closesAt ? Math.max(0, Math.floor((closesAt - now) / 1000)) : null;
  const isLate = closesAt ? now > closesAt : false;

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `${tripId}/${user.id}/${crypto.randomUUID()}.${ext}`;
    const { error: upErr } = await supabase.storage.from("trip-media").upload(path, file, { contentType: file.type });
    if (upErr) { alert(upErr.message); setUploading(false); return; }
    await supabase.from("media").insert({
      trip_id: tripId,
      user_id: user.id,
      storage_path: path,
      kind: file.type.startsWith("video") ? "video" : "photo",
      is_moment: true,
      moment_round_id: round?.id ?? null,
      was_late: isLate,
      taken_at: new Date().toISOString(),
    });
    router.push(`/trips/${tripId}/moments`);
  }

  return (
    <div className="flex flex-col gap-6">
      {round ? (
        <div
          className={`rounded-chunk p-8 text-center shadow-soft ${
            isLate ? "bg-red-100" : "bg-card"
          }`}
        >
          {isLate ? (
            <>
              <p className="text-5xl">⏰</p>
              <p className="mt-3 font-display text-3xl italic">For sent</p>
              <p className="mt-2 text-sm text-muted">Du kan fortsatt ta bildet — det blir markert som "sent".</p>
            </>
          ) : (
            <>
              <p className="text-xs font-bold uppercase tracking-widest text-muted">Tid igjen</p>
              <p className="mt-1 font-display text-7xl italic tabular-nums leading-none">
                {String(Math.floor(remaining! / 60))}:{String(remaining! % 60).padStart(2, "0")}
              </p>
              <p className="mt-3 text-sm">Hva gjør du akkurat nå?</p>
            </>
          )}
        </div>
      ) : (
        <div className="rounded-chunk bg-card p-6 text-center shadow-soft">
          <p className="text-sm text-muted">Ingen aktiv runde — du tar et fritt moment-bilde 🌿</p>
        </div>
      )}

      <button
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="rounded-chunk bg-accent py-8 text-2xl font-bold text-white shadow-pop transition active:scale-95 disabled:opacity-50"
      >
        {uploading ? "Laster opp…" : "📷 Ta bilde"}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={onFile}
      />
    </div>
  );
}
