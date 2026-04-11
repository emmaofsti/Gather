"use client";
import { useEffect, useState } from "react";
import { useT } from "@/lib/i18n-context";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const arr = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
  return arr;
}

export function PushOptIn() {
  const [state, setState] = useState<"loading" | "default" | "denied" | "unsupported" | "subscribed">("loading");
  const [busy, setBusy] = useState(false);
  const t = useT();

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("Notification" in window) || !("serviceWorker" in navigator) || !("PushManager" in window)) {
      setState("unsupported");
      return;
    }
    (async () => {
      if (Notification.permission !== "granted") {
        setState(Notification.permission as any);
        return;
      }
      try {
        const reg = await navigator.serviceWorker.ready;
        const sub = await reg.pushManager.getSubscription();
        if (sub) {
          const json = sub.toJSON() as any;
          await fetch("/api/push/subscribe", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ endpoint: sub.endpoint, p256dh: json.keys?.p256dh, auth: json.keys?.auth }),
          });
          setState("subscribed");
        } else setState("default");
      } catch { setState("default"); }
    })();
  }, []);

  async function enable() {
    setBusy(true);
    try {
      const perm = await Notification.requestPermission();
      if (perm !== "granted") { setState(perm as any); return; }
      const reg = await navigator.serviceWorker.ready;
      let sub = await reg.pushManager.getSubscription();
      if (!sub) {
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!),
        });
      }
      const json = sub.toJSON() as any;
      const res = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ endpoint: sub.endpoint, p256dh: json.keys?.p256dh, auth: json.keys?.auth }),
      });
      if (res.ok) setState("subscribed");
    } finally { setBusy(false); }
  }

  if (state === "loading" || state === "subscribed") return null;
  if (state === "unsupported") {
    return (
      <div className="mb-3 rounded-chunk border border-border bg-card p-4 text-sm shadow-soft">
        {t("push.ios_hint")}
      </div>
    );
  }
  return (
    <button
      onClick={enable}
      disabled={busy}
      className="mb-3 w-full rounded-chunk border border-border bg-card p-4 text-left shadow-soft transition active:scale-[0.99] disabled:opacity-50"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/15 text-lg">🔔</div>
        <div>
          <p className="font-bold">{t("push.enable")}</p>
          <p className="text-xs text-muted">{t("push.enable_sub")}</p>
        </div>
      </div>
    </button>
  );
}
