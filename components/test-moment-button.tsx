"use client";
import { useState } from "react";

export function TestMomentButton({ tripId }: { tripId?: string }) {
  const [busy, setBusy] = useState(false);
  const [ok, setOk] = useState(false);
  async function trigger() {
    setBusy(true); setOk(false);
    const res = await fetch("/api/dev/trigger-moment", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ tripId }),
    });
    setOk(res.ok);
    setBusy(false);
    setTimeout(() => setOk(false), 2000);
  }
  return (
    <button
      onClick={trigger}
      disabled={busy}
      className="mb-3 w-full rounded-chunk border border-dashed border-border bg-bg2/50 p-3 text-center text-xs font-semibold text-muted transition active:scale-[0.99] disabled:opacity-50"
    >
      {busy ? "Sender…" : ok ? "Sendt ✓" : "🧪 Test moment for denne turen"}
    </button>
  );
}
