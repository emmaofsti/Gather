import { requireUser } from "@/lib/auth";
import { SignOutButton } from "./sign-out";
import { PasswordForm } from "./password-form";

export default async function MePage() {
  const { user, profile } = await requireUser();
  return (
    <main className="px-5 py-8">
      <p className="text-sm text-muted">profil</p>
      <h1 className="mb-8 font-display text-5xl italic leading-none">Meg</h1>
      <div className="rounded-chunk bg-card p-6 shadow-soft">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent text-2xl font-bold text-white">
            {profile.display_name?.[0]?.toUpperCase() ?? "?"}
          </div>
          <div className="min-w-0">
            <p className="truncate text-xl font-bold">{profile.display_name}</p>
            <p className="truncate text-xs text-muted">{user.email}</p>
          </div>
        </div>
      </div>
      <PasswordForm />
      <SignOutButton />
    </main>
  );
}
