import { NextResponse } from "next/server";
import { headers } from "next/headers";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const tripId = body?.tripId as string | undefined;

  const h = headers();
  const host = h.get("host");
  const proto = h.get("x-forwarded-proto") ?? (host?.startsWith("localhost") ? "http" : "https");
  const base = `${proto}://${host}`;
  const qs = new URLSearchParams({ force: "1" });
  if (tripId) qs.set("trip", tripId);

  const res = await fetch(`${base}/api/cron/moments?${qs}`, {
    headers: { Authorization: `Bearer ${process.env.CRON_SECRET}` },
  });
  const json = await res.json().catch(() => ({}));
  return NextResponse.json({ status: res.status, ...json });
}
