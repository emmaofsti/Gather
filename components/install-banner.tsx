"use client";
import { useEffect, useState } from "react";
import { useT } from "@/lib/i18n-context";

export function InstallBanner() {
  const [standalone, setStandalone] = useState(true);
  const [open, setOpen] = useState(false);
  const [platform, setPlatform] = useState<"ios" | "android" | "desktop">("desktop");
  const [tab, setTab] = useState<"ios" | "android">("ios");
  const t = useT();

  useEffect(() => {
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;
    setStandalone(isStandalone);

    const ua = window.navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(ua)) { setPlatform("ios"); setTab("ios"); }
    else if (/android/.test(ua)) { setPlatform("android"); setTab("android"); }
    else setPlatform("desktop");
  }, []);

  if (standalone) return null;

  const shareIcon = (
    <InlineIcon>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
    </InlineIcon>
  );

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex w-full items-center justify-between rounded-chunk bg-card px-5 py-4 text-left shadow-soft active:scale-[0.99]"
      >
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-muted">{t("install.tip")}</p>
          <p className="mt-1 text-sm font-semibold">{t("install.title")}</p>
        </div>
        <span className="rounded-full bg-accent px-3 py-1.5 text-xs font-bold text-white">{t("install.show")}</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/60 p-4 sm:items-center" onClick={() => setOpen(false)}>
          <div className="w-full max-w-md rounded-chunk bg-card p-6 shadow-pop" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <p className="font-display text-2xl italic">{t("install.modal_title")}</p>
              <button onClick={() => setOpen(false)} className="text-muted">✕</button>
            </div>
            <p className="mt-2 text-sm text-muted">{t("install.modal_desc")}</p>

            {platform === "desktop" && (
              <div className="mt-4 flex gap-2">
                <button onClick={() => setTab("ios")} className={`flex-1 rounded-full px-3 py-1.5 text-xs font-bold ${tab === "ios" ? "bg-fg text-bg" : "bg-bg2 text-muted"}`}>
                  {t("install.iphone")}
                </button>
                <button onClick={() => setTab("android")} className={`flex-1 rounded-full px-3 py-1.5 text-xs font-bold ${tab === "android" ? "bg-fg text-bg" : "bg-bg2 text-muted"}`}>
                  {t("install.android")}
                </button>
              </div>
            )}

            {tab === "ios" && (
              <ol className="mt-5 flex flex-col gap-3 text-sm">
                <Step n={1} text={t("install.ios_1")} />
                <Step n={2}>{t("install.tap_on")} {shareIcon} {t("install.ios_2")}</Step>
                <Step n={3} text={t("install.ios_3")} />
                <Step n={4} text={t("install.ios_4")} />
              </ol>
            )}

            {tab === "android" && (
              <ol className="mt-5 flex flex-col gap-3 text-sm">
                <Step n={1} text={t("install.android_1")} />
                <Step n={2}>{t("install.tap_on")} {shareIcon} {t("install.android_2")}</Step>
                <Step n={3} text={t("install.android_3")} />
                <Step n={4} text={t("install.android_4")} />
              </ol>
            )}

            <button
              onClick={() => setOpen(false)}
              className="mt-6 w-full rounded-full bg-fg py-3 text-sm font-bold text-bg active:scale-[0.98]"
            >
              {t("install.got_it")}
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
