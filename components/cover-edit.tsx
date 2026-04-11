"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useT } from "@/lib/i18n-context";

function resizeCover(file: File, maxWidth = 1200): Promise<Blob> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      if (img.naturalWidth <= maxWidth) { resolve(file); return; }
      const scale = maxWidth / img.naturalWidth;
      const canvas = document.createElement("canvas");
      canvas.width = maxWidth;
      canvas.height = Math.round(img.naturalHeight * scale);
      canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((b) => resolve(b ?? file), "image/jpeg", 0.85);
    };
    img.onerror = () => resolve(file);
    img.src = URL.createObjectURL(file);
  });
}

export function CoverEdit({ tripId, hasCover }: { tripId: string; hasCover: boolean }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const t = useT();

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const resized = await resizeCover(file);
    const path = `${tripId}/${user.id}/cover-${Date.now()}.jpg`;
    const { error: upErr } = await supabase.storage.from("trip-media").upload(path, resized, { contentType: "image/jpeg" });
    if (upErr) { alert(upErr.message); setBusy(false); return; }
    const { data: signed } = await supabase.storage.from("trip-media").createSignedUrl(path, 60 * 60 * 24 * 365);
    if (signed?.signedUrl) {
      await supabase.from("trips").update({ cover_url: signed.signedUrl }).eq("id", tripId);
    }
    setBusy(false);
    router.refresh();
  }

  return (
    <>
      <button
        onClick={() => fileRef.current?.click()}
        disabled={busy}
        className={
          hasCover
            ? "absolute right-4 top-16 rounded-full border border-white/30 bg-black/40 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur disabled:opacity-50"
            : "rounded-full border border-border bg-card px-4 py-2 text-xs font-bold shadow-soft disabled:opacity-50"
        }
      >
        {busy ? t("cover.loading") : hasCover ? t("cover.change") : t("cover.add")}
      </button>
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFile} />
    </>
  );
}
