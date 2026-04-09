# Gather

Én tur. Ett sted. Samle minnene.

Mobile-first PWA for å samle bilder og spontane "moments" fra venneturer.

## Stack

- Next.js 14 (App Router) + TypeScript
- Supabase (auth, Postgres, Storage, RLS)
- Tailwind CSS
- Web Push API + Service Worker
- Vercel (deploy)
- Ekstern cron via [cron-job.org](https://cron-job.org) (gratis)

## Lokal kjøring

1. **Installer Node.js** (v20+) hvis du ikke har: https://nodejs.org
2. **Installer dependencies**: `npm install`
3. **Sett opp Supabase** (se under).
4. **Lag `.env.local`** ved å kopiere `.env.local.example` og fyll inn verdiene.
5. **Start dev-server**: `npm run dev` → http://localhost:3000

## Sett opp Supabase

1. Lag prosjekt på https://supabase.com (gratis).
2. **SQL Editor → New query** → lim inn innholdet fra `supabase/migrations/0001_init.sql` → Run. Dette lager tabeller, RLS-policies og storage-bucket.
3. **Project Settings → Data API**: kopier:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` / `publishable` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key (under "API Keys") → `SUPABASE_SERVICE_ROLE_KEY` (KUN brukt på serveren av cron — del aldri denne)
4. **Authentication → URL Configuration**:
   - Site URL: `http://localhost:3000` (lokalt) eller din Vercel-URL i prod
   - Redirect URLs: legg til `http://localhost:3000/**` og `https://din-app.vercel.app/**`

## Generer VAPID-nøkler (web push)

Kjør én gang:

```bash
node -e "console.log(require('web-push').generateVAPIDKeys())"
```

Lim de to nøklene inn i `.env.local`:
- `publicKey` → `NEXT_PUBLIC_VAPID_PUBLIC_KEY`
- `privateKey` → `VAPID_PRIVATE_KEY`
- `VAPID_SUBJECT=mailto:din@epost.no`

## Cron-secret

Velg en lang tilfeldig streng:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Sett som `CRON_SECRET` i `.env.local`.

## Deploy til Vercel

1. Push prosjektet til GitHub.
2. Gå til https://vercel.com → **New Project** → importer repoet.
3. **Environment Variables**: legg inn alle 7 verdiene fra `.env.local`. Husk å oppdatere VAPID_SUBJECT og bytte CRON_SECRET til en ny prod-verdi.
4. Deploy.
5. **Etter deploy**: oppdater Supabase Auth → URL Configuration med Vercel-URL (Site URL + Redirect URLs).

## Sett opp ekstern cron (cron-job.org)

Vercel gratis-plan har bare daglig cron, så vi bruker en ekstern tjeneste i stedet.

1. Lag konto på https://cron-job.org (gratis).
2. **Create cronjob**:
   - **Title**: Gather moments
   - **URL**: `https://din-app.vercel.app/api/cron/moments`
   - **Schedule**: hver time, hele dagen (cron expression: `0 * * * *`)
   - **Advanced → Request method**: GET
   - **Advanced → Request headers**: legg til `Authorization` med verdi `Bearer DIN_CRON_SECRET`
3. Save.

Endpointet sjekker selv om aktuell time er en av de 10 moment-slottene (Europe/Oslo: 09, 10, 11, 13, 14, 15, 17, 18, 20, 21). Hvis ja, plukker den én tilfeldig medlem fra hver aktive tur og sender push-varsel til den.

For å teste manuelt: `curl -H "Authorization: Bearer DIN_CRON_SECRET" "https://din-app.vercel.app/api/cron/moments?force=1"`

## iOS push

Apple krever at appen er **lagt til hjem-skjermen** for at web push skal funke på iPhone.

1. Åpne appen i Safari.
2. Trykk Share-knappen → **Add to Home Screen**.
3. Åpne appen fra hjem-skjermen.
4. Gå inn på en tur → trykk "Skru på moment-varsler".

På Android/desktop funker push direkte i browser.

## Datamodell

- `profiles` — bruker-info (display_name)
- `trips` — turer (med invite_code)
- `trip_members` — hvem er med på hva
- `media` — bilder/video, med `is_moment` flag og `was_late`
- `moment_rounds` — én rad per moment-trigger, peker på user_id som ble tagget
- `push_subscriptions` — web push subs

Alt beskyttet av RLS: kun medlemmer ser turdataene sine.
