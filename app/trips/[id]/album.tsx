"use client";
import { useMemo, useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Lightbox, type LightboxItem } from "@/components/lightbox";
import { CropModal } from "@/components/crop-modal";
import { useT, useLang } from "@/lib/i18n-context";

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

function AlbumThumb({ src, cropped }: { src: string; cropped?: boolean }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className="relative aspect-[3/4] w-full">
      {!loaded && (
        <div className="absolute inset-0 animate-pulse rounded-2xl bg-bg2" />
      )}
      <img
        src={src}
        loading="lazy"
        decoding="async"
        onLoad={() => setLoaded(true)}
        className={`aspect-[3/4] w-full object-cover transition-opacity duration-300 ${loaded ? "opacity-100" : "opacity-0"}`}
        style={cropped ? { objectPosition: "center 28%" } : undefined}
        alt=""
      />
    </div>
  );
}

function resizeImage(file: File, maxPx = 1600): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const { naturalWidth: w, naturalHeight: h } = img;
      if (w <= maxPx && h <= maxPx) { resolve(file); return; }
      const scale = Math.min(maxPx / w, maxPx / h);
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(w * scale);
      canvas.height = Math.round(h * scale);
      canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("resize failed"))), "image/jpeg", 0.85);
    };
    img.onerror = () => resolve(file);
    img.src = URL.createObjectURL(file);
  });
}

export function Album({ tripId, initial, currentUserId, cropped }: { tripId: string; initial: Item[]; currentUserId?: string; cropped?: boolean }) {
  const [items, setItems] = useState(initial);
  const ordered = useMemo(
    () => [...items].sort((a, b) => Number(!!b.is_peak) - Number(!!a.is_peak)),
    [items]
  );
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");
  const t = useT();
  const lang = useLang();
  const [open, setOpen] = useState<number | null>(null);
  const [queue, setQueue] = useState<File[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  async function onFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    const MAX_FILES = 10;
    let arr = Array.from(files);
    if (arr.length > MAX_FILES) {
      alert(lang === "en" ? `Max ${MAX_FILES} files at a time` : `Maks ${MAX_FILES} filer om gangen`);
      arr = arr.slice(0, MAX_FILES);
    }
    // Single image → show crop modal
    if (arr.length === 1 && arr[0].type.startsWith("image")) {
      setQueue(arr);
      return;
    }
    // Multiple files → upload in parallel batches of 3
    setUploading(true);
    let done = 0;
    const total = arr.length;
    setUploadProgress(`${done}/${total}`);
    const batch = 3;
    for (let i = 0; i < arr.length; i += batch) {
      await Promise.all(
        arr.slice(i, i + batch).map(async (file) => {
          const isVideo = file.type.startsWith("video");
          const kind = isVideo ? "video" : "photo";
          const ext = isVideo ? (file.name.split(".").pop() ?? "mp4") : "jpg";
          const blob = isVideo ? file : await resizeImage(file);
          await uploadBlob(blob, kind as "photo" | "video", ext);
          done++;
          setUploadProgress(`${done}/${total}`);
        })
      );
    }
    setUploading(false);
    setUploadProgress("");
    router.refresh();
  }

  async function uploadBlob(blob: Blob, kind: "photo" | "video", ext: string) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const path = `${tripId}/${user.id}/${crypto.randomUUID()}.${ext}`;
    const { error: upErr } = await supabase.storage.from("trip-media").upload(path, blob, { contentType: blob.type });
    if (upErr) { alert(upErr.message); return; }
    const { error: insErr } = await supabase.from("media").insert({
      trip_id: tripId, user_id: user.id, storage_path: path, kind,
      taken_at: new Date().toISOString(),
    });
    if (insErr) { alert(insErr.message); return; }
  }

  async function handleCropDone(blob: Blob) {
    setUploading(true);
    await uploadBlob(blob, "photo", "jpg");
    setQueue((q) => q.slice(1));
    setUploading(false);
    router.refresh();
  }

  async function handleCropCancel() {
    setQueue((q) => q.slice(1));
  }

  // Auto-handle videos in queue (no crop)
  useEffect(() => {
    const first = queue[0];
    if (!first) return;
    if (first.type.startsWith("video")) {
      (async () => {
        setUploading(true);
        const ext = first.name.split(".").pop() ?? "mp4";
        await uploadBlob(first, "video", ext);
        setQueue((q) => q.slice(1));
        setUploading(false);
        router.refresh();
      })();
    }
  }, [queue]);

  async function handleDelete(item: LightboxItem) {
    const supabase = createClient();
    const { data: deleted, error } = await supabase.from("media").delete().eq("id", item.id).select();
    if (error) { alert(error.message); return; }
    if (!deleted || deleted.length === 0) {
      alert(t("album.rls_error"));
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

  const uploadBtn = (
    <button
      onClick={() => inputRef.current?.click()}
      disabled={uploading}
      className={`${cropped ? "mt-4" : "mb-4 mt-2"} w-full rounded-full bg-accent py-4 text-base font-bold text-white shadow-soft transition active:scale-[0.98] disabled:opacity-50`}
    >
      {uploading ? (uploadProgress ? `${t("album.uploading")} ${uploadProgress}` : t("album.uploading")) : t("album.upload")}
    </button>
  );

  return (
    <>
      {!cropped && uploadBtn}
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
          <p className="mt-3 font-semibold">{t("album.empty")}</p>
          <p className="mt-1 text-sm text-muted">{t("album.empty_sub")}</p>
        </div>
      ) : (
        <div className="columns-2 gap-1 sm:columns-3 [&>*]:mb-1">
          {ordered.map((m) => {
            const idx = ordered.findIndex((x) => x.id === m.id);
            return (
              <button
                key={m.id}
                onClick={() => setOpen(idx)}
                className="relative block w-full overflow-hidden rounded-2xl bg-card shadow-soft transition active:scale-95"
                style={{ breakInside: "avoid" }}
              >
                {m.kind === "video" ? (
                  <video src={m.url} preload="metadata" playsInline className="aspect-[3/4] w-full object-cover" style={cropped ? { objectPosition: "center 28%" } : undefined} />
                ) : (
                  <AlbumThumb src={m.url} cropped={cropped} />
                )}
                {m.is_peak && (
                  <span className="absolute right-1.5 top-1.5 rounded-full bg-black/70 px-1.5 text-xs text-yellow-300">★</span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {cropped && uploadBtn}

      {queue[0] && !queue[0].type.startsWith("video") && (
        <CropModal file={queue[0]} onCancel={handleCropCancel} onDone={handleCropDone} />
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
