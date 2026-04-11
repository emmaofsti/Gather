// Waking hours in Europe/Oslo where moments can fire
export const WAKING_HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21];
export const TARGET_MOMENTS_PER_DAY = 10;

export function getOsloHour(date = new Date()) {
  return Number(
    new Intl.DateTimeFormat("en-GB", { hour: "2-digit", hour12: false, timeZone: "Europe/Oslo" })
      .format(date)
  );
}

/** Is this a waking hour in Oslo? */
export function isWakingHour(date = new Date()) {
  return WAKING_HOURS.includes(getOsloHour(date));
}

/**
 * Should we create a moment this hour?
 * Uses probability: remaining_moments / remaining_hours
 * so missed crons naturally catch up later in the day.
 */
export function shouldCreateMoment(roundsToday: number, date = new Date()): boolean {
  const hour = getOsloHour(date);
  if (!WAKING_HOURS.includes(hour)) return false;

  const remaining = TARGET_MOMENTS_PER_DAY - roundsToday;
  if (remaining <= 0) return false;

  const hoursLeft = WAKING_HOURS.filter((h) => h >= hour).length;
  if (hoursLeft <= 0) return false;

  // Last possible hour(s) and still need moments? Force it.
  if (remaining >= hoursLeft) return true;

  const probability = remaining / hoursLeft;
  return Math.random() < probability;
}
