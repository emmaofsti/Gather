export default function Setup() {
  return (
    <main className="px-6 py-10">
      <h1 className="mb-4 text-3xl font-bold">Sett opp Supabase</h1>
      <p className="mb-6 text-muted">
        Appen trenger Supabase for å fungere. Følg disse stegene:
      </p>
      <ol className="list-decimal space-y-3 pl-5 text-sm">
        <li>Lag prosjekt på <a className="text-accent underline" href="https://supabase.com">supabase.com</a>.</li>
        <li>I SQL Editor: kjør innholdet av <code className="rounded bg-card px-1">supabase/migrations/0001_init.sql</code>.</li>
        <li>Gå til Project Settings → API. Kopier <em>Project URL</em> og <em>anon public key</em>.</li>
        <li>
          Kopier <code className="rounded bg-card px-1">.env.local.example</code> til
          <code className="rounded bg-card px-1"> .env.local</code> og lim inn verdiene.
        </li>
        <li>Restart dev-serveren.</li>
      </ol>
      <p className="mt-6 text-sm text-muted">
        Når env-vars er på plass forsvinner denne siden automatisk.
      </p>
    </main>
  );
}
