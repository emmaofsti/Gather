"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { generateInviteCode } from "@/lib/invite";

export function NewTripForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [cover, setCover] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    setCover(f);
    setPreview(f ? URL.createObjectURL(f) : null);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }

    const { data: trip, error } = await supabase
      .from("trips")
      .insert({
        name: name.trim(),
        start_date: start || null,
        end_date: end || null,
        created_by: user.id,
        invite_code: generateInviteCode(),
      })
      .select()
      .single();
    if (error || !trip) { setErr(error?.message ?? "Feil"); setBusy(false); return; }

    await supabase.from("trip_members").insert({ trip_id: trip.id, user_id: user.id });

    if (cover) {
      const ext = cover.name.split(".").pop() ?? "jpg";
      const path = `${trip.id}/${user.id}/cover-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("trip-media").upload(path, cover, { contentType: cover.type });
      if (!upErr) {
        const { data: signed } = await supabase.storage.from("trip-media").createSignedUrl(path, 60 * 60 * 24 * 365);
        if (signed?.signedUrl) {
          await supabase.from("trips").update({ cover_url: signed.signedUrl }).eq("id", trip.id);
        }
      }
    }

    router.push(`/trips/${trip.id}`);
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-5">
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        className="relative aspect-[4/3] w-full overflow-hidden rounded-chunk border-2 border-dashed border-border bg-card shadow-soft"
      >
        {preview ? (
          <img src={preview} className="h-full w-full object-cover" alt="" />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-muted">
            <span className="text-5xl">🖼️</span>
            <span className="text-sm font-semibold">Velg cover-bilde</span>
            <span className="text-xs">(valgfritt)</span>
          </div>
        )}
      </button>
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFile} />

      <div>
        <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-muted">Navn</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="Lofoten 2026"
          className="w-full rounded-chunk border border-border bg-card px-5 py-4 text-lg shadow-soft outline-none focus:border-accent"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-muted">Start</label>
          <input type="date" value={start} onChange={(e) => setStart(e.target.value)} className="w-full rounded-chunk border border-border bg-card px-4 py-4 shadow-soft" />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-muted">Slutt</label>
          <input type="date" value={end} onChange={(e) => setEnd(e.target.value)} className="w-full rounded-chunk border border-border bg-card px-4 py-4 shadow-soft" />
        </div>
      </div>
      {err && <p className="text-sm text-red-500">{err}</p>}
      <button disabled={busy} className="mt-2 rounded-chunk bg-fg py-5 text-lg font-bold text-bg shadow-soft disabled:opacity-50">
        {busy ? "Oppretter…" : "Opprett tur ✦"}
      </button>
    </form>
  );
}
