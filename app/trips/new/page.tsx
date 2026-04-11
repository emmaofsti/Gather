import Link from "next/link";
import { NewTripForm } from "./form";
import { requireUser } from "@/lib/auth";
import { translate, type Lang } from "@/lib/i18n";

export default async function NewTrip() {
  const { profile } = await requireUser();
  const lang = (profile.language as Lang) ?? "no";
  const t = (key: Parameters<typeof translate>[0]) => translate(key, lang);
  return (
    <main className="px-5 py-8">
      <Link href="/" className="text-sm text-muted">{t("new.back")}</Link>
      <h1 className="mb-6 mt-2 font-display text-5xl italic leading-none">{t("new.title")}</h1>
      <NewTripForm />
    </main>
  );
}
