"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function CaptureForm({
  tripId,
  round,
}: {
  tripId: string;
  round: { id: string; closes_at: string } | null;
}) {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fallbackRef = useRef<HTMLInputElement>(null);

  const [now, setNow] = useState(Date.now());
  const [stage, setStage] = useState<"loading" | "ready" | "capturing" | "countdown" | "uploading" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(t);
  }, []);

  const closesAt = round ? new Date(round.closes_at).getTime() : null;
  const remaining = closesAt ? Math.max(0, Math.floor((closesAt - now) / 1000)) : null;
  const isLate = closesAt ? now > closesAt : false;

  async function startCamera(facing: "environment" | "user") {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: facing }, width: { ideal: 1280 }, height: { ideal: 1280 } },
      audio: false,
    });
    streamRef.current = stream;
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
      await new Promise<void>((res) => {
        const v = videoRef.current!;
        if (v.readyState >= 2) return res();
        v.onloadedmetadata = () => res();
      });
      await videoRef.current.play().catch(() => {});
    }
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await startCamera("environment");
        if (!cancelled) setStage("ready");
      } catch (e: any) {
        if (!cancelled) {
          setErrorMsg(e?.message ?? "Kamera ikke tilgjengelig");
          setStage("error");
        }
      }
    })();
    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
  }, []);

  function grabFrame() {
    const v = videoRef.current!;
    const w = v.videoWidth;
    const h = v.videoHeight;
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    c.getContext("2d")!.drawImage(v, 0, 0, w, h);
    return c;
  }

  function canvasToBlob(c: HTMLCanvasElement): Promise<Blob> {
    return new Promise((resolve, reject) =>
      c.toBlob((b) => (b ? resolve(b) : reject(new Error("blob failed"))), "image/jpeg", 0.9)
    );
  }

  async function upload(backBlob: Blob, frontBlob: Blob | null) {
    setStage("uploading");
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setStage("error"); return; }
    const backPath = `${tripId}/${user.id}/${crypto.randomUUID()}.jpg`;
    const { error: upErr } = await supabase.storage.from("trip-media").upload(backPath, backBlob, { contentType: "image/jpeg" });
    if (upErr) { alert(upErr.message); setStage("ready"); return; }

    let frontPath: string | null = null;
    if (frontBlob) {
      frontPath = `${tripId}/${user.id}/${crypto.randomUUID()}.jpg`;
      const { error: fErr } = await supabase.storage.from("trip-media").upload(frontPath, frontBlob, { contentType: "image/jpeg" });
      if (fErr) { console.error("front upload failed", fErr); frontPath = null; }
    }

    const { data: inserted, error: insErr } = await supabase
      .from("media")
      .insert({
        trip_id: tripId,
        user_id: user.id,
        storage_path: backPath,
        secondary_storage_path: frontPath,
        kind: "photo",
        is_moment: true,
        moment_round_id: round?.id ?? null,
        was_late: isLate,
        taken_at: new Date().toISOString(),
      })
      .select()
      .single();
    if (insErr || !inserted) {
      alert("Insert feilet: " + (insErr?.message ?? "ukjent"));
      setStage("ready");
      return;
    }
    streamRef.current?.getTracks().forEach((t) => t.stop());
    router.refresh();
    router.push(`/trips/${tripId}/moments`);
  }

  async function capture() {
    if (stage !== "ready") return;
    setStage("capturing");
    try {
      const back = grabFrame();
      await startCamera("user");
      // 3-sec countdown before grabbing front frame
      setStage("countdown");
      for (let n = 3; n >= 1; n--) {
        setCountdown(n);
        await new Promise((r) => setTimeout(r, 1000));
      }
      const front = grabFrame();
      const backBlob = await canvasToBlob(back);
      const frontBlob = await canvasToBlob(front);
      await upload(backBlob, frontBlob);
    } catch (e: any) {
      alert(e?.message ?? "Noe gikk galt");
      setStage("ready");
    }
  }

  async function onFallbackFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    await upload(file, null);
  }

  return (
    <div className="flex flex-col gap-5">
      {round ? (
        <div className={`rounded-chunk p-6 text-center shadow-soft ${isLate ? "bg-red-100" : "bg-card"}`}>
          {isLate ? (
            <>
              <p className="text-4xl">⏰</p>
              <p className="mt-2 font-display text-2xl italic">For sent</p>
              <p className="mt-1 text-xs text-muted">Markeres som "sent"</p>
            </>
          ) : (
            <>
              <p className="text-xs font-bold uppercase tracking-widest text-muted">Tid igjen</p>
              <p className="mt-1 font-display text-6xl italic tabular-nums leading-none">
                {String(Math.floor(remaining! / 60))}:{String(remaining! % 60).padStart(2, "0")}
              </p>
            </>
          )}
        </div>
      ) : (
        <div className="rounded-chunk bg-card p-4 text-center text-sm text-muted shadow-soft">
          Ingen aktiv runde — fritt moment 🌿
        </div>
      )}

      {stage === "error" ? (
        <div className="rounded-chunk bg-card p-6 text-center shadow-soft">
          <p className="text-sm text-muted">Kamera ikke tilgjengelig{errorMsg ? `: ${errorMsg}` : ""}</p>
          <button
            onClick={() => fallbackRef.current?.click()}
            className="mt-4 w-full rounded-chunk bg-accent py-5 text-lg font-bold text-white shadow-pop"
          >
            📷 Velg fra rull
          </button>
        </div>
      ) : (
        <div className="relative aspect-square overflow-hidden rounded-chunk bg-black shadow-pop">
          <video ref={videoRef} playsInline muted className="absolute inset-0 h-full w-full object-cover" />
          {stage === "loading" && (
            <div className="absolute inset-0 flex items-center justify-center text-white">Starter kamera…</div>
          )}
          {(stage === "capturing" || stage === "uploading") && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-white font-bold">
              {stage === "capturing" ? "Tar bilde…" : "Laster opp…"}
            </div>
          )}
          {stage === "countdown" && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
              <span className="font-display text-9xl italic text-white drop-shadow-lg">{countdown}</span>
            </div>
          )}
        </div>
      )}

      <button
        onClick={capture}
        disabled={stage !== "ready"}
        className="rounded-chunk bg-accent py-7 text-xl font-bold text-white shadow-pop transition active:scale-95 disabled:opacity-50"
      >
        {stage === "uploading" ? "Laster opp…" : stage === "capturing" ? "Snap…" : "📸 Ta moment"}
      </button>

      <input
        ref={fallbackRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={onFallbackFile}
      />
    </div>
  );
}
