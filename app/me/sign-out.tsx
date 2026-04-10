"use client";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useT } from "@/lib/i18n-context";

export function SignOutButton() {
  const router = useRouter();
  const t = useT();
  async function out() {
    await createClient().auth.signOut();
    router.push("/login");
    router.refresh();
  }
  return (
    <button
      onClick={out}
      className="mt-6 w-full rounded-chunk border border-border bg-card py-4 font-bold text-red-500 shadow-soft active:scale-[0.99]"
    >
      {t("me.signout")}
    </button>
  );
}
