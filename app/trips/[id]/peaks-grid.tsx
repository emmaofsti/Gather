"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Lightbox, type LightboxItem } from "@/components/lightbox";

export function PeaksGrid({ all }: { all: LightboxItem[] }) {
  const router = useRouter();
  const [items, setItems] = useState(all);
  const [open, setOpen] = useState<number | null>(null);

  // Peaks first, then rest
  const ordered = useMemo(
    () => [...items].sort((a, b) => Number(!!b.is_peak) - Number(!!a.is_peak)),
    [items]
  );
  const peaks = ordered.filter((m) => m.is_peak).slice(0, 5);

  async function handleTogglePeak(item: LightboxItem) {
    const supabase = createClient();
    const next = !item.is_peak;
    const { error } = await supabase.from("media").update({ is_peak: next }).eq("id", item.id);
    if (error) { alert(error.message); return; }
    setItems((prev) => prev.map((x) => (x.id === item.id ? { ...x, is_peak: next } : x)));
    router.refresh();
  }

  if (peaks.length === 0) return null;
  return (
    <>
      <div className="grid grid-cols-5 gap-2">
        {peaks.map((m) => {
          const idx = ordered.findIndex((x) => x.id === m.id);
          return (
            <button
              key={m.id}
              onClick={() => setOpen(idx)}
              className="relative aspect-square overflow-hidden rounded-2xl bg-card shadow-soft transition active:scale-95"
            >
              {m.kind === "video" ? (
                <video src={m.url} className="h-full w-full object-cover" />
              ) : (
                <img src={m.url} className="h-full w-full object-cover" alt="" />
              )}
              <span className="absolute right-1 top-1 text-xs text-yellow-300 drop-shadow">★</span>
            </button>
          );
        })}
      </div>
      {open !== null && (
        <Lightbox
          items={ordered}
          index={open}
          onClose={() => setOpen(null)}
          onTogglePeak={handleTogglePeak}
        />
      )}
    </>
  );
}
