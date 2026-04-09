import Link from "next/link";
import { NewTripForm } from "./form";
import { requireUser } from "@/lib/auth";

export default async function NewTrip() {
  await requireUser();
  return (
    <main className="px-5 py-8">
      <Link href="/" className="text-sm text-muted">← Tilbake</Link>
      <h1 className="mb-6 mt-2 font-display text-5xl italic leading-none">Ny tur</h1>
      <NewTripForm />
    </main>
  );
}
