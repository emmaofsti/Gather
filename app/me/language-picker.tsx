"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useT } from "@/lib/i18n-context";
import type { Lang } from "@/lib/i18n";

export function LanguagePicker({ userId, initial }: { userId: string; initial: Lang }) {
  const [lang, setLang] = useState<Lang>(initial);
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const t = useT();

  async function pick(next: Lang) {
    if (next === lang) return;
    setSaving(true);
    const supabase = createClient();
    await supabase.from("profiles").update({ language: next }).eq("id", userId);
    setLang(next);
    setSaving(false);
    router.refresh();
  }

  return (
    <div className="mt-4 rounded-chunk bg-card p-5 shadow-soft">
      <p className="mb-3 text-xs font-bold uppercase tracking-widest text-muted">{t("me.language")}</p>
      <div className="flex gap-2">
        <button
          onClick={() => pick("no")}
          disabled={saving}
          className={`flex-1 rounded-full px-4 py-2.5 text-sm font-bold transition ${
            lang === "no" ? "bg-fg text-bg" : "bg-bg2 text-muted"
          }`}
        >
          🇳🇴 {t("me.lang_no")}
        </button>
        <button
          onClick={() => pick("en")}
          disabled={saving}
          className={`flex-1 rounded-full px-4 py-2.5 text-sm font-bold transition ${
            lang === "en" ? "bg-fg text-bg" : "bg-bg2 text-muted"
          }`}
        >
          🇬🇧 {t("me.lang_en")}
        </button>
      </div>
    </div>
  );
}
