// 10 daglige moment-slots (Europe/Oslo, lokal tid)
export const MOMENT_SLOTS = [9, 10, 11, 13, 14, 15, 17, 18, 20, 21];

export function isMomentHour(date = new Date()) {
  const hour = Number(
    new Intl.DateTimeFormat("en-GB", { hour: "2-digit", hour12: false, timeZone: "Europe/Oslo" })
      .format(date)
  );
  return MOMENT_SLOTS.includes(hour);
}
