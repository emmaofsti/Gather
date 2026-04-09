"use client";
import { useMemo, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Lightbox, type LightboxItem } from "@/components/lightbox";

type Item = {
  id: string;
  storage_path: string;
  kind: string;
  url: string;
  created_at?: string;
  uploader?: string;
  user_id?: string;
  is_peak?: boolean;
};

export function Album({ tripId, initial, currentUserId, cropped }: { tripId: string; initial: Item[]; currentUserId?: string; cropped?: boolean }) {
  const [items, setItems] = useState(initial);
  const ordered = useMemo(
    () => [...items].sort((a, b) => Number(!!b.is_peak) - Number(!!a.is_peak)),
    [items]
  );
  const [uploading, setUploading] = useState(false);
  const [open, setOpen] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  async function onFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    for (const file of Array.from(files)) {
      const ext = file.name.split(".").pop() ?? "jpg";
      const path = `${tripId}/${user.id}/${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("trip-media").upload(path, file, { contentType: file.type });
      if (upErr) { alert(upErr.message); continue; }
      const kind = file.type.startsWith("video") ? "video" : "photo";
      await supabase.from("media").insert({
        trip_id: tripId, user_id: user.id, storage_path: path, kind,
        taken_at: new Date().toISOString(),
      });
    }
    setUploading(false);
    router.refresh();
  }

  async function handleDelete(item: LightboxItem) {
    const supabase = createClient();
    const { data: deleted, error } = await supabase.from("media").delete().eq("id", item.id).select();
    if (error) { alert(error.message); return; }
    if (!deleted || deleted.length === 0) {
      alert("Sletting blokkert (RLS). Kjør migration 0002 i Supabase.");
      return;
    }
    if (item.storage_path) {
      await supabase.storage.from("trip-media").remove([item.storage_path]);
    }
    setItems((prev) => prev.filter((x) => x.id !== item.id));
    router.refresh();
  }

  async function handleTogglePeak(item: LightboxItem) {
    const supabase = createClient();
    const next = !item.is_peak;
    const { error } = await supabase.from("media").update({ is_peak: next }).eq("id", item.id);
    if (error) { alert(error.message); return; }
    setItems((prev) => prev.map((x) => (x.id === item.id ? { ...x, is_peak: next } : x)));
    router.refresh();
  }

  return (
    <>
      <button
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="mb-4 mt-2 w-full rounded-full bg-accent py-4 text-base font-bold text-white shadow-soft transition active:scale-[0.98] disabled:opacity-50"
      >
        {uploading ? "Laster opp…" : "+ Last opp bilder"}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*,video/*"
        multiple
        className="hidden"
        onChange={(e) => onFiles(e.target.files)}
      />

      {items.length === 0 ? (
        <div className="rounded-chunk bg-card p-10 text-center shadow-soft">
          <p className="text-5xl">📷</p>
          <p className="mt-3 font-semibold">Ingen bilder enda</p>
          <p className="mt-1 text-sm text-muted">Last opp det første for å starte minnealbumet</p>
        </div>
      ) : (
        <div className="columns-2 gap-2 sm:columns-3 [&>*]:mb-2">
          {ordered.map((m) => {
            const idx = ordered.findIndex((x) => x.id === m.id);
            return (
              <button
                key={m.id}
                onClick={() => setOpen(idx)}
                className="relative block w-full overflow-hidden rounded-2xl bg-card shadow-soft transition active:scale-95"
                style={{ breakInside: "avoid" }}
              >
                {cropped ? (
                  m.kind === "video" ? (
                    <video src={m.url} className="aspect-[3/4] w-full object-cover" style={{ objectPosition: "center 28%" }} />
                  ) : (
                    <img src={m.url} className="aspect-[3/4] w-full object-cover" style={{ objectPosition: "center 28%" }} alt="" />
                  )
                ) : m.kind === "video" ? (
                  <video src={m.url} className="h-auto w-full" />
                ) : (
                  <img src={m.url} className="h-auto w-full" alt="" />
                )}
                {m.is_peak && (
                  <span className="absolute right-1.5 top-1.5 rounded-full bg-black/70 px-1.5 text-xs text-yellow-300">★</span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {open !== null && (
        <Lightbox
          items={ordered}
          index={open}
          onClose={() => setOpen(null)}
          currentUserId={currentUserId}
          onDelete={handleDelete}
          onTogglePeak={handleTogglePeak}
        />
      )}
    </>
  );
}
