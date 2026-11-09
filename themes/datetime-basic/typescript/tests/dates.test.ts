import { describe as group, expect, test } from "bun:test";
import cases from "../../cases.json";
import { describe, InvalidDateError, parseDate } from "../src/dates";

type Case = {
  name: string;
  input: string;
  now: string;
  expected?: {
    now_local: string;
    now_utc: string;
    unix: number;
    input: string;
    weekday: string;
    days_diff: number;
    plus_30d: string;
    is_leap: boolean;
  };
  expected_error?: string;
};

// Map language-neutral error names to TypeScript error classes.
const ERRORS: Record<string, new (...args: never[]) => Error> = {
  "invalid-date": InvalidDateError,
};

// ZonedDateTime.from needs a time zone annotation; an RFC 3339 string only has
// an offset. Reuse that offset ("+09:00") as a fixed-offset time zone.
function toZoned(iso: string): Temporal.ZonedDateTime {
  const offset = iso.slice(-6);
  return Temporal.ZonedDateTime.from(`${iso}[${offset}]`);
}

group("cases.json", () => {
  for (const c of cases as Case[]) {
    test(c.name, () => {
      const now = toZoned(c.now);
      if (c.expected_error !== undefined) {
        expect(() => describe(c.input, now)).toThrow(ERRORS[c.expected_error]);
        return;
      }
      const e = c.expected!;
      expect(describe(c.input, now)).toEqual({
        nowLocal: e.now_local,
        nowUtc: e.now_utc,
        unix: e.unix,
        input: e.input,
        weekday: e.weekday,
        daysDiff: e.days_diff,
        plus30d: e.plus_30d,
        isLeap: e.is_leap,
      });
    });
  }
});

test("PlainDate.from accepts more than YYYY-MM-DD", () => {
  for (const s of [
    "20240115",
    "+002024-01-15",
    "2024-01-15T10:00",
    "2024-01-15[u-ca=iso8601]",
  ]) {
    expect(Temporal.PlainDate.from(s).toString()).toBe("2024-01-15");
  }
});

test("overflow applies to property bags, not strings", () => {
  expect(() => Temporal.PlainDate.from("2024-02-30")).toThrow(RangeError);
  const bag = { year: 2024, month: 2, day: 30 };
  expect(Temporal.PlainDate.from(bag).toString()).toBe("2024-02-29");
  expect(() => Temporal.PlainDate.from(bag, { overflow: "reject" })).toThrow(
    RangeError,
  );
});

test("parseDate rejects a trailing newline", () => {
  expect(() => parseDate("2024-01-15\n")).toThrow(InvalidDateError);
});
