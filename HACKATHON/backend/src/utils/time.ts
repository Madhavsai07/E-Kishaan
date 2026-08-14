/** Parses simple duration strings ('15m', '30d', '1h', '45s') into milliseconds. Mirrors the subset of formats JWT_*_EXPIRY already uses for jsonwebtoken's `expiresIn`. */
export function parseDurationToMs(duration: string): number {
  const match = /^(\d+)(s|m|h|d)$/.exec(duration.trim());
  if (!match) {
    throw new Error(`Invalid duration string: "${duration}" (expected e.g. "15m", "30d")`);
  }
  const value = Number(match[1]);
  const unitMs: Record<string, number> = { s: 1_000, m: 60_000, h: 3_600_000, d: 86_400_000 };
  return value * unitMs[match[2]];
}
