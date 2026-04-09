import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const round = url.searchParams.get("round");
  const trip = url.searchParams.get("trip");
  if (round) {
    const jar = cookies();
    const existing = jar.get("skipped_rounds")?.value ?? "";
    const set = new Set(existing.split(",").filter(Boolean));
    set.add(round);
    // keep last 50 to avoid unbounded growth
    const next = Array.from(set).slice(-50).join(",");
    jar.set("skipped_rounds", next, {
      path: "/",
      httpOnly: false,
      sameSite: "lax",
      maxAge: 60 * 60 * 24,
    });
  }
  return NextResponse.redirect(new URL(trip ? `/trips/${trip}` : "/", url.origin));
}
