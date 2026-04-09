"use client";
import { useEffect, useState } from "react";

export function InstallBanner() {
  const [standalone, setStandalone] = useState(true);
  const [open, setOpen] = useState(false);
  const [platform, setPlatform] = useState<"ios" | "android" | "desktop">("desktop");

  useEffect(() => {
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      // iOS Safari
      (window.navigator as any).standalone === true;
    setStandalone(isStandalone);

    const ua = window.navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(ua)) setPlatform("ios");
    else if (/android/.test(ua)) setPlatform("android");
    else setPlatform("desktop");
  }, []);

  if (standalone) return null;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex w-full items-center justify-between rounded-chunk bg-card px-5 py-4 text-left shadow-soft active:scale-[0.99]"
      >
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-muted">Tips</p>
          <p className="mt-1 text-sm font-semibold">Legg til Gather på hjemskjermen</p>
        </div>
        <span className="rounded-full bg-accent px-3 py-1.5 text-xs font-bold text-white">Vis hvordan</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/60 p-4 sm:items-center" onClick={() => setOpen(false)}>
          <div
            className="w-full max-w-md rounded-chunk bg-card p-6 shadow-pop"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <p className="font-display text-2xl italic">Legg til på hjemskjermen</p>
              <button onClick={() => setOpen(false)} className="text-muted">✕</button>
            </div>
            <p className="mt-2 text-sm text-muted">
              Da får du Gather som en app — raskere, fullskjerm og med varsler for moments.
            </p>

            {platform === "ios" && (
              <ol className="mt-5 flex flex-col gap-3 text-sm">
                <Step n={1} text="Åpne denne siden i Safari (Chrome på iPhone støtter dessverre ikke dette)" />
                <Step n={2}>
                  Trykk på <InlineIcon>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
                  </InlineIcon> Del-knappen
                </Step>
                <Step n={3} text="Scroll ned og trykk «Legg til på Hjem-skjerm»" />
                <Step n={4} text="Trykk «Legg til» oppe i høyre hjørne" />
              </ol>
            )}

            {platform === "android" && (
              <ol className="mt-5 flex flex-col gap-3 text-sm">
                <Step n={1} text="Åpne denne siden i Chrome (eller Samsung Internet)" />
                <Step n={2}>
                  Trykk på <InlineIcon>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
                  </InlineIcon> Del-knappen (eller menyen ⋮)
                </Step>
                <Step n={3} text="Velg «Legg til på startskjerm»" />
                <Step n={4} text="Bekreft" />
              </ol>
            )}

            {platform === "desktop" && (
              <ol className="mt-5 flex flex-col gap-3 text-sm">
                <Step n={1} text="Gather er laget for mobil ✿" />
                <Step n={2} text="Åpne lenken på telefonen din og legg den til på hjemskjermen derfra" />
              </ol>
            )}

            <button
              onClick={() => setOpen(false)}
              className="mt-6 w-full rounded-full bg-fg py-3 text-sm font-bold text-bg active:scale-[0.98]"
            >
              Skjønner
            </button>
          </div>
        </div>
      )}
    </>
  );
}

function Step({ n, text, children }: { n: number; text?: string; children?: React.ReactNode }) {
  return (
    <li className="flex gap-3">
      <span className="flex h-6 w-6 flex-none items-center justify-center rounded-full bg-accent text-xs font-bold text-white">{n}</span>
      <span className="flex flex-wrap items-center gap-1">{text ?? children}</span>
    </li>
  );
}

function InlineIcon({ children }: { children: React.ReactNode }) {
  return <span className="inline-flex items-center rounded-md bg-bg2 px-1.5 py-0.5">{children}</span>;
}
