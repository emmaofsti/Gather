"use client";
import { useEffect, useRef, useState } from "react";

export type LightboxItem = {
  id: string;
  url: string;
  kind: string;
  uploader?: string;
  created_at?: string;
};

export function Lightbox({
  items,
  index,
  onClose,
}: {
  items: LightboxItem[];
  index: number;
  onClose: () => void;
}) {
  const [i, setI] = useState(index);
  const touchStart = useRef<number | null>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") setI((v) => Math.min(v + 1, items.length - 1));
      if (e.key === "ArrowLeft") setI((v) => Math.max(v - 1, 0));
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [items.length, onClose]);

  function onTouchStart(e: React.TouchEvent) {
    touchStart.current = e.touches[0].clientX;
  }
  function onTouchEnd(e: React.TouchEvent) {
    if (touchStart.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStart.current;
    if (dx < -40) setI((v) => Math.min(v + 1, items.length - 1));
    if (dx > 40) setI((v) => Math.max(v - 1, 0));
    touchStart.current = null;
  }

  const item = items[i];
  if (!item) return null;

  const time = item.created_at
    ? new Date(item.created_at).toLocaleString("no", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-black/95"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div className="flex items-center justify-between p-4 text-white">
        <button onClick={onClose} className="rounded-full bg-white/10 px-3 py-1.5 text-sm font-semibold">
          ✕ Lukk
        </button>
        <span className="text-xs opacity-70">
          {i + 1} / {items.length}
        </span>
      </div>

      <div className="relative flex flex-1 items-center justify-center px-4">
        {item.kind === "video" ? (
          <video src={item.url} controls className="max-h-full max-w-full rounded-2xl" />
        ) : (
          <img src={item.url} className="max-h-full max-w-full rounded-2xl" alt="" />
        )}
        {i > 0 && (
          <button
            onClick={() => setI(i - 1)}
            className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/15 p-3 text-2xl text-white backdrop-blur"
            aria-label="Forrige"
          >
            ‹
          </button>
        )}
        {i < items.length - 1 && (
          <button
            onClick={() => setI(i + 1)}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/15 p-3 text-2xl text-white backdrop-blur"
            aria-label="Neste"
          >
            ›
          </button>
        )}
      </div>

      {(item.uploader || time) && (
        <div className="p-5 pb-8 text-center text-white">
          {item.uploader && <p className="font-bold">{item.uploader}</p>}
          {time && <p className="text-xs opacity-70">{time}</p>}
        </div>
      )}
    </div>
  );
}
