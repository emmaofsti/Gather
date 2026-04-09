"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function Onboarding() {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return router.push("/login");
    await supabase.from("profiles").upsert({ id: user.id, display_name: name });
    router.push("/");
    router.refresh();
  }

  return (
    <main className="flex min-h-dvh flex-col justify-center px-6">
      <p className="text-sm text-muted">first things first ✿</p>
      <h1 className="mb-2 mt-1 font-display text-5xl italic leading-tight">Hva heter du?</h1>
      <p className="mb-8 text-muted">Vises i turene dine.</p>
      <form onSubmit={save} className="flex flex-col gap-3">
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Fornavn"
          className="rounded-chunk border border-border bg-card px-5 py-4 text-lg shadow-soft outline-none focus:border-accent"
        />
        <button
          disabled={loading}
          className="rounded-chunk bg-fg px-5 py-4 text-lg font-bold text-bg shadow-soft disabled:opacity-50"
        >
          {loading ? "Lagrer…" : "Fortsett →"}
        </button>
      </form>
    </main>
  );
}
