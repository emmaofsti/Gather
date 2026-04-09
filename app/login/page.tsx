"use client";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  return (
    <Suspense>
      <LoginInner />
    </Suspense>
  );
}

function LoginInner() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const sp = useSearchParams();
  const next = sp.get("next") ?? "/";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErr(null);
    const supabase = createClient();
    const { error } =
      mode === "login"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password });
    setLoading(false);
    if (error) { setErr(error.message); return; }
    router.push(next);
    router.refresh();
  }

  return (
    <main className="flex min-h-dvh flex-col justify-center px-6">
      <div className="mb-12">
        <p className="text-sm text-muted">★</p>
        <h1 className="font-display text-7xl italic leading-none">Gather</h1>
        <p className="mt-3 text-base text-muted">Én gathering. Ett sted. Samle minnene.</p>
      </div>

      <div className="mb-4 flex gap-2">
        <button
          type="button"
          onClick={() => { setMode("login"); setErr(null); }}
          className={`flex-1 rounded-full px-4 py-2 text-sm font-bold ${mode === "login" ? "bg-fg text-bg" : "bg-card text-muted"}`}
        >
          Logg inn
        </button>
        <button
          type="button"
          onClick={() => { setMode("signup"); setErr(null); }}
          className={`flex-1 rounded-full px-4 py-2 text-sm font-bold ${mode === "signup" ? "bg-fg text-bg" : "bg-card text-muted"}`}
        >
          Ny bruker
        </button>
      </div>

      <form onSubmit={submit} className="flex flex-col gap-3">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="din@epost.no"
          autoComplete="email"
          className="rounded-chunk border border-border bg-card px-5 py-4 text-lg shadow-soft outline-none focus:border-accent"
        />
        <input
          type="password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="passord"
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          className="rounded-chunk border border-border bg-card px-5 py-4 text-lg shadow-soft outline-none focus:border-accent"
        />
        <button
          disabled={loading}
          className="rounded-chunk bg-fg px-5 py-4 text-lg font-bold text-bg shadow-soft transition active:scale-[0.99] disabled:opacity-50"
        >
          {loading ? "…" : mode === "login" ? "Logg inn ✦" : "Opprett konto ✦"}
        </button>
        {err && <p className="text-sm text-red-500">{err}</p>}
      </form>
    </main>
  );
}
