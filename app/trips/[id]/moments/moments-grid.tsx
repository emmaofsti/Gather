"use client";
import { useState } from "react";
import { Lightbox, type LightboxItem } from "@/components/lightbox";

export function MomentsGrid({ items }: { items: (LightboxItem & { was_late?: boolean })[] }) {
  const [open, setOpen] = useState<number | null>(null);
  if (items.length === 0) {
    return (
      <div className="rounded-chunk bg-card p-10 text-center shadow-soft">
        <p className="text-5xl">✨</p>
        <p className="mt-3 font-semibold">Ingen moments enda</p>
        <p className="mt-1 text-sm text-muted">Vent på neste runde — eller test fra album-siden</p>
      </div>
    );
  }
  return (
    <>
      <div className="grid grid-cols-3 gap-2">
        {items.map((m, i) => (
          <button
            key={m.id}
            onClick={() => setOpen(i)}
            className="relative aspect-square overflow-hidden rounded-2xl bg-card shadow-soft transition active:scale-95"
          >
            <img src={m.url} className="h-full w-full object-cover" alt="" />
            {m.was_late && (
              <span className="absolute bottom-1.5 left-1.5 rounded-full bg-black/70 px-2 py-0.5 text-[10px] font-bold text-white">sent</span>
            )}
          </button>
        ))}
      </div>
      {open !== null && <Lightbox items={items} index={open} onClose={() => setOpen(null)} />}
    </>
  );
}
