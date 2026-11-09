// Strict date parsing and a deterministic report relative to an injected `now`.
// Uses the TC39 Temporal API, which Bun 1.4.4 exposes as a global.

export class InvalidDateError extends Error {
  readonly kind = "invalid-date";
  constructor(input: string, options?: ErrorOptions) {
    super(`invalid date: ${JSON.stringify(input)}`, options);
    this.name = "InvalidDateError";
  }
}

export type Report = {
  nowLocal: string;
  nowUtc: string;
  unix: number;
  input: string;
  weekday: string;
  daysDiff: number;
  plus30d: string;
  isLeap: boolean;
};

// Temporal.PlainDate.from also accepts "20240115", "+002024-01-15",
// "2024-01-15T10:00" and "2024-01-15[u-ca=iso8601]", so check the shape first. In JS, \d is always ASCII [0-9], and `$` without the `m`
// flag matches only at the very end (no trailing newline allowed).
const DATE_SHAPE = /^\d{4}-\d{2}-\d{2}$/;

// Temporal numbers weekdays 1 (Monday) to 7 (Sunday).
const WEEKDAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

export function parseDate(s: string): Temporal.PlainDate {
  if (!DATE_SHAPE.test(s)) {
    throw new InvalidDateError(s);
  }
  try {
    // A string naming a nonexistent date (2024-02-30) always throws a
    // RangeError. The `overflow` option only applies to property bags:
    // from({ year: 2024, month: 2, day: 30 }) is clamped to 2024-02-29
    // unless { overflow: "reject" } is passed.
    return Temporal.PlainDate.from(s);
  } catch (e) {
    throw new InvalidDateError(s, { cause: e });
  }
}

export function describe(
  inputDate: string,
  now: Temporal.ZonedDateTime,
): Report {
  const d = parseDate(inputDate);
  return {
    // A ZonedDateTime carries its own time zone (here a fixed offset), so the
    // wall clock never depends on the machine's local time zone.
    nowLocal: now
      .toPlainDateTime()
      .toString({ fractionalSecondDigits: 6 })
      .replace("T", " "),
    // Instant#toString always prints UTC with a trailing "Z".
    nowUtc: now.toInstant().toString({ fractionalSecondDigits: 6 }),
    // epochMilliseconds is already floored, so Math.floor keeps floor semantics.
    unix: Math.floor(now.epochMilliseconds / 1000),
    input: inputDate,
    weekday: WEEKDAYS[d.dayOfWeek - 1],
    daysDiff: now.toPlainDate().until(d, { largestUnit: "day" }).days,
    plus30d: d.add({ days: 30 }).toString(),
    isLeap: d.inLeapYear,
  };
}
