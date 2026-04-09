import webpush from "web-push";

let configured = false;
function configure() {
  if (configured) return;
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT || "mailto:you@example.com",
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
  );
  configured = true;
}

export type Sub = { endpoint: string; p256dh: string; auth: string };
export type Payload = { title: string; body: string; url?: string };

export async function sendPush(sub: Sub, payload: Payload) {
  configure();
  try {
    await webpush.sendNotification(
      { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
      JSON.stringify(payload)
    );
    return { ok: true as const };
  } catch (e: any) {
    return { ok: false as const, statusCode: e?.statusCode, body: e?.body };
  }
}
