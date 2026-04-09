"use client";
import { useEffect, useRef, useState } from "react";
import { DualPhoto } from "./dual-photo";

export type LightboxItem = {
  id: string;
  url: string;
  kind: string;
  uploader?: string;
  created_at?: string;
  user_id?: string;
  storage_path?: string;
  secondaryUrl?: string | null;
  secondary_storage_path?: string | null;
  was_late?: boolean;
  is_peak?: boolean;
};

export function Lightbox({
  items,
  index,
  onClose,
  currentUserId,
  onDelete,
  onTogglePeak,
}: {
  items: LightboxItem[];
  index: number;
  onClose: () => void;
  currentUserId?: string;
  onDelete?: (item: LightboxItem) => Promise<void> | void;
  onTogglePeak?: (item: LightboxItem) => Promise<void> | void;
}) {
  const [i, setI] = useState(index);
  const [deleting, setDeleting] = useState(false);
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

  const canDelete = !!onDelete && !!currentUserId && item.user_id === currentUserId;

  async function handleDelete() {
    if (!onDelete || !item) return;
    if (!confirm("Slette dette bildet?")) return;
    setDeleting(true);
    try {
      await onDelete(item);
      if (items.length <= 1) {
        onClose();
      } else {
        setI((v) => Math.min(v, items.length - 2));
      }
    } finally {
      setDeleting(false);
    }
  }

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
        <div className="flex items-center gap-2">
          {onTogglePeak && (
            <button
              onClick={() => onTogglePeak(item)}
              className="rounded-full bg-white/10 px-3 py-1.5 text-sm font-semibold"
            >
              {item.is_peak ? "★ Peak" : "☆ Pin"}
            </button>
          )}
          {canDelete && (
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="rounded-full bg-red-500/80 px-3 py-1.5 text-sm font-semibold disabled:opacity-50"
            >
              {deleting ? "Sletter…" : "Slett"}
            </button>
          )}
        </div>
      </div>

      <div className="relative flex flex-1 items-center justify-center px-4">
        {item.kind === "video" ? (
          <video src={item.url} controls className="max-h-full max-w-full rounded-2xl" />
        ) : item.secondaryUrl ? (
          <div className="relative aspect-square max-h-full max-w-full overflow-hidden rounded-2xl">
            <DualPhoto main={item.url} secondary={item.secondaryUrl} swappable size="large" />
          </div>
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

      {(item.uploader || time || item.was_late) && (
        <div className="p-5 pb-8 text-center text-white">
          {item.uploader && <p className="font-bold">{item.uploader}</p>}
          {time && <p className="text-xs opacity-70">{time}</p>}
          {item.was_late && (
            <p className="mt-1 text-xs font-bold text-red-400">Bildet ble tatt for sent</p>
          )}
        </div>
      )}
    </div>
  );
}
