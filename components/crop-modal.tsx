"use client";
import { useEffect, useRef, useState } from "react";

const ASPECTS: { label: string; v: number }[] = [
  { label: "1:1", v: 1 },
  { label: "3:4", v: 3 / 4 },
  { label: "4:5", v: 4 / 5 },
  { label: "4:3", v: 4 / 3 },
];

export function CropModal({
  file,
  onCancel,
  onDone,
}: {
  file: File;
  onCancel: () => void;
  onDone: (blob: Blob) => void;
}) {
  const [src, setSrc] = useState<string>("");
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [aspect, setAspect] = useState<number>(3 / 4);
  const [scale, setScale] = useState(1);
  const [tx, setTx] = useState(0);
  const [ty, setTy] = useState(0);
  const drag = useRef<{ x: number; y: number; tx: number; ty: number } | null>(null);

  useEffect(() => {
    const url = URL.createObjectURL(file);
    setSrc(url);
    const i = new Image();
    i.onload = () => setImg(i);
    i.src = url;
    return () => URL.revokeObjectURL(url);
  }, [file]);

  useEffect(() => {
    setScale(1);
    setTx(0);
    setTy(0);
  }, [aspect, file]);

  const FRAME_MAX = 320;
  const frameW = aspect >= 1 ? FRAME_MAX : FRAME_MAX * aspect;
  const frameH = aspect >= 1 ? FRAME_MAX / aspect : FRAME_MAX;

  const baseFit = img ? Math.max(frameW / img.naturalWidth, frameH / img.naturalHeight) : 1;
  const imgW = img ? img.naturalWidth * baseFit : 0;
  const imgH = img ? img.naturalHeight * baseFit : 0;

  function clamp(nx: number, ny: number, s: number) {
    const w = imgW * s;
    const h = imgH * s;
    const maxX = Math.max(0, (w - frameW) / 2);
    const maxY = Math.max(0, (h - frameH) / 2);
    return {
      tx: Math.max(-maxX, Math.min(maxX, nx)),
      ty: Math.max(-maxY, Math.min(maxY, ny)),
    };
  }

  function onPointerDown(e: React.PointerEvent) {
    (e.target as Element).setPointerCapture(e.pointerId);
    drag.current = { x: e.clientX, y: e.clientY, tx, ty };
  }
  function onPointerMove(e: React.PointerEvent) {
    if (!drag.current) return;
    const nx = drag.current.tx + (e.clientX - drag.current.x);
    const ny = drag.current.ty + (e.clientY - drag.current.y);
    const c = clamp(nx, ny, scale);
    setTx(c.tx);
    setTy(c.ty);
  }
  function onPointerUp() {
    drag.current = null;
  }

  function onScaleChange(s: number) {
    setScale(s);
    const c = clamp(tx, ty, s);
    setTx(c.tx);
    setTy(c.ty);
  }

  async function confirm() {
    if (!img) return;
    const s = scale;
    const renderedW = imgW * s;
    const renderedH = imgH * s;
    // image top-left in frame coords (frame origin = top-left, image centered then translated)
    const left = frameW / 2 - renderedW / 2 + tx;
    const top = frameH / 2 - renderedH / 2 + ty;
    // frame (0,0,frameW,frameH) → image pixels
    const pxPerFrame = img.naturalWidth / renderedW; // = 1/(baseFit*s)
    const sx = (0 - left) * pxPerFrame;
    const sy = (0 - top) * pxPerFrame;
    const sw = frameW * pxPerFrame;
    const sh = frameH * pxPerFrame;
    const MAX = 1600;
    const longest = Math.max(sw, sh);
    const outScale = longest > MAX ? MAX / longest : 1;
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(sw * outScale);
    canvas.height = Math.round(sh * outScale);
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((blob) => {
      if (blob) onDone(blob);
    }, "image/jpeg", 0.88);
  }

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-black/95 text-white">
      <div className="flex items-center justify-between p-4">
        <button onClick={onCancel} className="rounded-full bg-white/10 px-3 py-1.5 text-sm font-semibold">
          Avbryt
        </button>
        <span className="text-xs opacity-70">Beskjær</span>
        <button onClick={confirm} className="rounded-full bg-accent px-4 py-1.5 text-sm font-bold">
          Ferdig
        </button>
      </div>
      <div className="flex flex-1 items-center justify-center p-4">
        <div
          className="relative overflow-hidden bg-black touch-none"
          style={{ width: frameW, height: frameH }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          {src && img && (
            <img
              src={src}
              alt=""
              draggable={false}
              className="pointer-events-none absolute left-1/2 top-1/2 max-w-none select-none"
              style={{
                width: imgW,
                height: imgH,
                transform: `translate(-50%,-50%) translate(${tx}px,${ty}px) scale(${scale})`,
                transformOrigin: "center",
              }}
            />
          )}
        </div>
      </div>
      <div className="flex flex-col gap-3 p-4 pb-8">
        <input
          type="range"
          min="1"
          max="3"
          step="0.01"
          value={scale}
          onChange={(e) => onScaleChange(Number(e.target.value))}
          className="w-full accent-accent"
        />
        <div className="flex justify-center gap-2">
          {ASPECTS.map((o) => (
            <button
              key={o.label}
              onClick={() => setAspect(o.v)}
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                Math.abs(aspect - o.v) < 0.001 ? "bg-white text-black" : "bg-white/10"
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
