"use client";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const sp = useSearchParams();
  const next = sp.get("next") ?? "/";

  async function send(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErr(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${location.origin}/auth/callback?next=${encodeURIComponent(next)}` },
    });
    setLoading(false);
    if (error) setErr(error.message);
    else setSent(true);
  }

  return (
    <main className="flex min-h-dvh flex-col justify-center px-6">
      <div className="mb-12">
        <p className="text-sm text-muted">★</p>
        <h1 className="font-display text-7xl italic leading-none">Gather</h1>
        <p className="mt-3 text-base text-muted">Én tur. Ett sted. Samle minnene.</p>
      </div>
      {sent ? (
        <div className="rounded-chunk bg-card p-6 shadow-soft">
          <p className="text-3xl">📬</p>
          <p className="mt-2 font-bold">Sjekk e-posten din</p>
          <p className="mt-1 text-sm text-muted">Trykk på lenken for å logge inn.</p>
        </div>
      ) : (
        <form onSubmit={send} className="flex flex-col gap-3">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="din@epost.no"
            className="rounded-chunk border border-border bg-card px-5 py-4 text-lg shadow-soft outline-none focus:border-accent"
          />
          <button
            disabled={loading}
            className="rounded-chunk bg-fg px-5 py-4 text-lg font-bold text-bg shadow-soft transition active:scale-[0.99] disabled:opacity-50"
          >
            {loading ? "Sender…" : "Send magisk lenke ✦"}
          </button>
          {err && <p className="text-sm text-red-500">{err}</p>}
        </form>
      )}
    </main>
  );
}
