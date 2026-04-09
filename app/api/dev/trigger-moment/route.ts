import { NextResponse } from "next/server";
import { headers } from "next/headers";

export async function POST() {
  const h = headers();
  const host = h.get("host");
  const proto = h.get("x-forwarded-proto") ?? (host?.startsWith("localhost") ? "http" : "https");
  const base = `${proto}://${host}`;
  const res = await fetch(`${base}/api/cron/moments?force=1`, {
    headers: { Authorization: `Bearer ${process.env.CRON_SECRET}` },
  });
  const json = await res.json().catch(() => ({}));
  return NextResponse.json({ status: res.status, ...json });
}
