"use client";
import { useState } from "react";

export function ShareTrip({ code, name, dark }: { code: string; name: string; dark?: boolean }) {
  const [copied, setCopied] = useState(false);
  async function share() {
    const url = `${location.origin}/join/${code}`;
    if (navigator.share) {
      try { await navigator.share({ title: `Bli med på ${name}`, url }); return; } catch {}
    }
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  return (
    <button
      onClick={share}
      className={
        dark
          ? "rounded-full border border-border bg-card px-4 py-1.5 text-sm font-semibold shadow-soft"
          : "rounded-full border border-white/30 bg-black/30 px-4 py-1.5 text-sm font-semibold text-white backdrop-blur"
      }
    >
      {copied ? "Kopiert ✓" : "Del"}
    </button>
  );
}
