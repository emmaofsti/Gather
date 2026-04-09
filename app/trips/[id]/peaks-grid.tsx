"use client";
import { useState } from "react";
import { Lightbox, type LightboxItem } from "@/components/lightbox";

export function PeaksGrid({
  peaks,
  all,
}: {
  peaks: LightboxItem[];
  all: LightboxItem[];
}) {
  const [open, setOpen] = useState<number | null>(null);
  if (peaks.length === 0) return null;
  return (
    <>
      <div className="grid grid-cols-5 gap-2">
        {peaks.map((m) => {
          const idxInAll = all.findIndex((x) => x.id === m.id);
          return (
            <button
              key={m.id}
              onClick={() => setOpen(idxInAll >= 0 ? idxInAll : 0)}
              className="aspect-square overflow-hidden rounded-2xl bg-card shadow-soft transition active:scale-95"
            >
              {m.kind === "video" ? (
                <video src={m.url} className="h-full w-full object-cover" />
              ) : (
                <img src={m.url} className="h-full w-full object-cover" alt="" />
              )}
            </button>
          );
        })}
      </div>
      {open !== null && (
        <Lightbox items={all} index={open} onClose={() => setOpen(null)} />
      )}
    </>
  );
}
