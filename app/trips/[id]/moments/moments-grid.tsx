"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Lightbox, type LightboxItem } from "@/components/lightbox";
import { DualPhoto } from "@/components/dual-photo";

type Item = LightboxItem & { was_late?: boolean };

export function MomentsGrid({ items: initial, currentUserId }: { items: Item[]; currentUserId?: string }) {
  const [items, setItems] = useState(initial);
  const [open, setOpen] = useState<number | null>(null);
  const router = useRouter();

  async function handleDelete(item: LightboxItem) {
    const supabase = createClient();
    const { error } = await supabase.from("media").delete().eq("id", item.id);
    if (error) { alert(error.message); return; }
    const paths = [item.storage_path, item.secondary_storage_path].filter(Boolean) as string[];
    if (paths.length) {
      await supabase.storage.from("trip-media").remove(paths);
    }
    setItems((prev) => prev.filter((x) => x.id !== item.id));
    router.refresh();
  }

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
            <DualPhoto main={m.url} secondary={m.secondaryUrl} />
            {m.was_late && (
              <span className="absolute bottom-1.5 left-1.5 rounded-full bg-black/70 px-2 py-0.5 text-[10px] font-bold text-white">sent</span>
            )}
          </button>
        ))}
      </div>
      {open !== null && (
        <Lightbox
          items={items}
          index={open}
          onClose={() => setOpen(null)}
          currentUserId={currentUserId}
          onDelete={handleDelete}
        />
      )}
    </>
  );
}
