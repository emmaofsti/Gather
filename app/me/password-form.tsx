"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useT } from "@/lib/i18n-context";

export function PasswordForm() {
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const t = useT();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    setMsg(null);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) { setErr(error.message); return; }
    setMsg(t("me.password_done"));
    setPassword("");
  }

  return (
    <form onSubmit={submit} className="mt-4 flex flex-col gap-3 rounded-chunk bg-card p-5 shadow-soft">
      <p className="text-xs font-bold uppercase tracking-widest text-muted">{t("me.password_title")}</p>
      <input
        type="password"
        minLength={6}
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder={t("me.password_placeholder")}
        autoComplete="new-password"
        className="rounded-chunk border border-border bg-bg px-4 py-3 outline-none focus:border-accent"
      />
      <button
        disabled={busy}
        className="rounded-chunk bg-fg px-4 py-3 font-bold text-bg disabled:opacity-50"
      >
        {busy ? t("me.password_saving") : t("me.password_save")}
      </button>
      {msg && <p className="text-sm text-accent2">{msg}</p>}
      {err && <p className="text-sm text-red-500">{err}</p>}
    </form>
  );
}
