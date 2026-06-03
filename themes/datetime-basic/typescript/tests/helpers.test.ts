/**
 * Tests for datetime_basic helpers module.
 */

import { describe, expect, test } from "bun:test";
import {
  formatDatetime,
  datetimeToTimestamp,
  parseDate,
  getDaysDiff,
  getWeekdayName,
  formatElapsedSeconds,
  generateSleepMs,
  SLEEP_MIN_MS,
  SLEEP_MAX_MS,
} from "../src/helpers";

describe("formatDatetime", () => {
  test("formats datetime with milliseconds", () => {
    const date = new Date(2024, 5, 1, 10, 30, 45, 123); // June 1, 2024
    const result = formatDatetime(date);
    expect(result).toBe("2024-06-01 10:30:45.123");
  });

  test("formats datetime with zero milliseconds", () => {
    const date = new Date(2024, 0, 1, 0, 0, 0, 0); // Jan 1, 2024
    const result = formatDatetime(date);
    expect(result).toBe("2024-01-01 00:00:00.000");
  });
});

describe("datetimeToTimestamp", () => {
  test("returns integer timestamp", () => {
    const date = new Date(2024, 5, 1, 10, 30, 45, 123);
    const result = datetimeToTimestamp(date);
    expect(Number.isInteger(result)).toBe(true);
  });

  test("timestamp is close to expected value", () => {
    // 1970-01-01 00:00:00 UTC should be around 0
    const date = new Date(Date.UTC(1970, 0, 1, 0, 0, 0));
    const result = datetimeToTimestamp(date);
    expect(result).toBe(0);
  });
});

describe("parseDate", () => {
  test("parses valid date", () => {
    const result = parseDate("2024-01-15");
    expect(result).not.toBeNull();
    expect(result!.getFullYear()).toBe(2024);
    expect(result!.getMonth()).toBe(0); // January
    expect(result!.getDate()).toBe(15);
  });

  test("returns null for invalid format", () => {
    expect(parseDate("invalid-date")).toBeNull();
  });

  test("returns null for wrong separator", () => {
    expect(parseDate("2024/01/15")).toBeNull();
  });

  test("returns null for invalid date", () => {
    expect(parseDate("2024-13-45")).toBeNull();
  });

  test("parses leap year date", () => {
    const result = parseDate("2024-02-29");
    expect(result).not.toBeNull();
    expect(result!.getMonth()).toBe(1); // February
    expect(result!.getDate()).toBe(29);
  });

  test("returns null for non-leap year Feb 29", () => {
    expect(parseDate("2023-02-29")).toBeNull();
  });
});

describe("getDaysDiff", () => {
  test("same day returns today", () => {
    const date = new Date(2024, 5, 1);
    const result = getDaysDiff(date, date);
    expect(result).toBe("It's today.");
  });

  test("past date returns days ago", () => {
    const start = new Date(2024, 5, 10);
    const target = new Date(2024, 5, 1);
    const result = getDaysDiff(start, target);
    expect(result).toBe("It's 9 days ago.");
  });

  test("future date returns days later", () => {
    const start = new Date(2024, 5, 1);
    const target = new Date(2024, 5, 10);
    const result = getDaysDiff(start, target);
    expect(result).toBe("It's 9 days later.");
  });

  test("one day ago", () => {
    const start = new Date(2024, 5, 2);
    const target = new Date(2024, 5, 1);
    const result = getDaysDiff(start, target);
    expect(result).toBe("It's 1 days ago.");
  });

  test("one day later", () => {
    const start = new Date(2024, 5, 1);
    const target = new Date(2024, 5, 2);
    const result = getDaysDiff(start, target);
    expect(result).toBe("It's 1 days later.");
  });
});

describe("getWeekdayName", () => {
  test("returns Monday", () => {
    const date = new Date(2024, 0, 15); // Monday
    const result = getWeekdayName(date);
    expect(result).toBe("Monday");
  });

  test("returns Friday", () => {
    const date = new Date(2024, 0, 19); // Friday
    const result = getWeekdayName(date);
    expect(result).toBe("Friday");
  });

  test("returns Sunday", () => {
    const date = new Date(2024, 0, 21); // Sunday
    const result = getWeekdayName(date);
    expect(result).toBe("Sunday");
  });
});

describe("formatElapsedSeconds", () => {
  test("formats basic elapsed time", () => {
    const start = new Date(2024, 0, 1, 10, 0, 0, 0);
    const end = new Date(2024, 0, 1, 10, 0, 2, 345);
    const result = formatElapsedSeconds(start, end);
    expect(result).toBe("02.345");
  });

  test("formats zero elapsed time", () => {
    const date = new Date(2024, 0, 1, 10, 0, 0, 0);
    const result = formatElapsedSeconds(date, date);
    expect(result).toBe("00.000");
  });

  test("formats elapsed time over a minute", () => {
    const start = new Date(2024, 0, 1, 10, 0, 0, 0);
    const end = new Date(2024, 0, 1, 10, 1, 5, 123);
    const result = formatElapsedSeconds(start, end);
    // 65 seconds total, but we only show seconds part (05)
    expect(result).toBe("05.123");
  });
});

describe("generateSleepMs", () => {
  test("sleep duration is within range", () => {
    const result = generateSleepMs();
    expect(result).toBeGreaterThanOrEqual(SLEEP_MIN_MS);
    expect(result).toBeLessThanOrEqual(SLEEP_MAX_MS);
  });

  test("sleep duration is reproducible with fixed seed", () => {
    const result1 = generateSleepMs();
    const result2 = generateSleepMs();
    expect(result1).toBe(result2);
  });
});
