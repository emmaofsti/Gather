import { NextResponse } from "next/server";
import { createAdmin } from "@/lib/supabase/admin";
import { sendPush } from "@/lib/push";
import { isMomentHour } from "@/lib/slots";

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
  if (!force && !isMomentHour()) {
    return NextResponse.json({ skipped: true, reason: "not a moment hour" });
  }

  const admin = createAdmin();
  const today = new Date().toISOString().slice(0, 10);

  let tripsQuery = admin.from("trips").select("id, name, start_date, end_date");
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

    const { data: subs } = await admin
      .from("push_subscriptions")
      .select("endpoint, p256dh, auth")
      .eq("user_id", chosen.user_id);

    let sent = 0;
    for (const sub of subs ?? []) {
      const r = await sendPush(sub as any, {
        title: "📸 Moment!",
        body: `Du har 2 minutter — hva gjør du akkurat nå? (${trip.name})`,
        url: `/trips/${trip.id}/capture?round=${round.id}`,
      });
      if (r.ok) sent++;
      else if (r.statusCode === 404 || r.statusCode === 410) {
        await admin.from("push_subscriptions").delete().eq("endpoint", (sub as any).endpoint);
      }
    }
    results.push({ trip: trip.id, user: chosen.user_id, round: round.id, sent });
  }

  return NextResponse.json({ ok: true, results });
}
