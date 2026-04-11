import { NextResponse } from "next/server";
import { createAdmin } from "@/lib/supabase/admin";
import { sendPush } from "@/lib/push";
import { isWakingHour, shouldCreateMoment, getOsloHour } from "@/lib/slots";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const auth = req.headers.get("authorization");
  const url = new URL(req.url);
  const force = url.searchParams.get("force") === "1";
  const tripFilter = url.searchParams.get("trip");
  const expected = `Bearer ${process.env.CRON_SECRET}`;
  if (auth !== expected) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!force && !isWakingHour()) {
    return NextResponse.json({ skipped: true, reason: "outside waking hours" });
  }

  const admin = createAdmin();
  const now = new Date();
  const todayStart = new Date(
    new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Oslo" }).format(now) + "T00:00:00+02:00"
  );

  let tripsQuery = admin.from("trips").select("id, name, start_date, end_date");
  const today = now.toISOString().slice(0, 10);
  if (tripFilter) {
    tripsQuery = tripsQuery.eq("id", tripFilter);
  } else {
    tripsQuery = tripsQuery
      .or(`start_date.is.null,start_date.lte.${today}`)
      .or(`end_date.is.null,end_date.gte.${today}`);
  }
  const { data: trips, error: tripsErr } = await tripsQuery;
  if (tripsErr) return NextResponse.json({ error: tripsErr.message }, { status: 500 });

  const results: any[] = [];
  for (const trip of trips ?? []) {
    // Count how many rounds already exist today for this trip
    const { count } = await admin
      .from("moment_rounds")
      .select("id", { count: "exact", head: true })
      .eq("trip_id", trip.id)
      .gte("created_at", todayStart.toISOString());

    const roundsToday = count ?? 0;

    if (!force && !shouldCreateMoment(roundsToday, now)) {
      results.push({ trip: trip.id, skipped: true, roundsToday });
      continue;
    }

    const { data: members } = await admin
      .from("trip_members")
      .select("user_id")
      .eq("trip_id", trip.id);
    if (!members || members.length === 0) continue;

    const chosen = members[Math.floor(Math.random() * members.length)];
    const closes_at = new Date(Date.now() + 2 * 60 * 1000).toISOString();

    const { data: round, error: roundErr } = await admin
      .from("moment_rounds")
      .insert({ trip_id: trip.id, user_id: chosen.user_id, closes_at })
      .select()
      .single();
    if (roundErr || !round) {
      results.push({ trip: trip.id, error: roundErr?.message });
      continue;
    }

    const [{ data: subs }, { data: chosenProfile }] = await Promise.all([
      admin.from("push_subscriptions").select("endpoint, p256dh, auth").eq("user_id", chosen.user_id),
      admin.from("profiles").select("language").eq("id", chosen.user_id).maybeSingle(),
    ]);
    const isEn = chosenProfile?.language === "en";

    let sent = 0;
    for (const sub of subs ?? []) {
      const r = await sendPush(sub as any, {
        title: "📸 Moment!",
        body: isEn
          ? `You have 2 minutes — what are you doing right now? (${trip.name})`
          : `Du har 2 minutter — hva gjør du akkurat nå? (${trip.name})`,
        url: `/trips/${trip.id}/capture?round=${round.id}`,
      });
      if (r.ok) sent++;
      else if (r.statusCode === 404 || r.statusCode === 410) {
        await admin.from("push_subscriptions").delete().eq("endpoint", (sub as any).endpoint);
      }
    }
    results.push({ trip: trip.id, user: chosen.user_id, round: round.id, roundsToday: roundsToday + 1, sent });
  }

  return NextResponse.json({ ok: true, hour: getOsloHour(), results });
}
