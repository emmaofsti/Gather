import { NextResponse } from "next/server";

export async function POST() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL ? "http://localhost:3000" : ""}/api/cron/moments?force=1`,
    { headers: { Authorization: `Bearer ${process.env.CRON_SECRET}` } }
  );
  const json = await res.json();
  return NextResponse.json(json);
}
