"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function PasswordForm() {
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    setMsg(null);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) { setErr(error.message); return; }
    setMsg("Passord oppdatert ✓");
    setPassword("");
  }

  return (
    <form onSubmit={submit} className="mt-4 flex flex-col gap-3 rounded-chunk bg-card p-5 shadow-soft">
      <p className="text-xs font-bold uppercase tracking-widest text-muted">Sett / bytt passord</p>
      <input
        type="password"
        minLength={6}
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="nytt passord"
        autoComplete="new-password"
        className="rounded-chunk border border-border bg-bg px-4 py-3 outline-none focus:border-accent"
      />
      <button
        disabled={busy}
        className="rounded-chunk bg-fg px-4 py-3 font-bold text-bg disabled:opacity-50"
      >
        {busy ? "Lagrer…" : "Lagre passord"}
      </button>
      {msg && <p className="text-sm text-accent2">{msg}</p>}
      {err && <p className="text-sm text-red-500">{err}</p>}
    </form>
  );
}
