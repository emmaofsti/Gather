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
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"email" | "code">("email");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const sp = useSearchParams();
  const next = sp.get("next") ?? "/";

  async function sendCode(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErr(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true },
    });
    setLoading(false);
    if (error) setErr(error.message);
    else setStep("code");
  }

  async function verify(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErr(null);
    const supabase = createClient();
    const { error } = await supabase.auth.verifyOtp({
      email,
      token: code.trim(),
      type: "email",
    });
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
        <p className="mt-3 text-base text-muted">Én tur. Ett sted. Samle minnene.</p>
      </div>
      {step === "email" ? (
        <form onSubmit={sendCode} className="flex flex-col gap-3">
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
            {loading ? "Sender…" : "Send kode ✦"}
          </button>
          {err && <p className="text-sm text-red-500">{err}</p>}
        </form>
      ) : (
        <form onSubmit={verify} className="flex flex-col gap-3">
          <p className="text-sm text-muted">Vi sendte en 6-sifret kode til {email}</p>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            autoComplete="one-time-code"
            required
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="123456"
            className="rounded-chunk border border-border bg-card px-5 py-4 text-center text-2xl tracking-widest shadow-soft outline-none focus:border-accent"
          />
          <button
            disabled={loading}
            className="rounded-chunk bg-fg px-5 py-4 text-lg font-bold text-bg shadow-soft transition active:scale-[0.99] disabled:opacity-50"
          >
            {loading ? "Sjekker…" : "Logg inn"}
          </button>
          <button
            type="button"
            onClick={() => { setStep("email"); setCode(""); setErr(null); }}
            className="text-sm text-muted underline"
          >
            Bruk en annen e-post
          </button>
          {err && <p className="text-sm text-red-500">{err}</p>}
        </form>
      )}
    </main>
  );
}
