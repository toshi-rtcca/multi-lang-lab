/**
 * Helper functions for datetime operations.
 */

import dayjs from "dayjs";

export const RANDOM_SEED = 42;
export const SLEEP_MIN_MS = 1000;
export const SLEEP_MAX_MS = 3000;

/**
 * Format datetime with milliseconds.
 * Note: dayjs only supports milliseconds (3 digits), not microseconds.
 */
export function formatDatetime(date: Date): string {
  return dayjs(date).format("YYYY-MM-DD HH:mm:ss.SSS");
}

/**
 * Convert datetime to UNIX timestamp as integer.
 */
export function datetimeToTimestamp(date: Date): number {
  return Math.floor(date.getTime() / 1000);
}

/**
 * Parse date string in yyyy-mm-dd format.
 * Returns null if invalid.
 */
export function parseDate(dateStr: string): Date | null {
  const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) {
    return null;
  }

  const [, yearStr, monthStr, dayStr] = match;
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  const day = parseInt(dayStr, 10);

  // Validate month and day ranges
  if (month < 1 || month > 12 || day < 1 || day > 31) {
    return null;
  }

  // Create date and validate it's correct (handles invalid dates like Feb 30)
  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
}

/**
 * Calculate days difference and return formatted string.
 */
export function getDaysDiff(startDate: Date, targetDate: Date): string {
  // Normalize both dates to midnight for accurate day comparison
  const start = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
  const target = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());

  const diffMs = start.getTime() - target.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return "It's today.";
  } else if (diffDays > 0) {
    return `It's ${diffDays} days ago.`;
  } else {
    return `It's ${-diffDays} days later.`;
  }
}

/**
 * Get weekday name in English.
 */
export function getWeekdayName(date: Date): string {
  return dayjs(date).format("dddd");
}

/**
 * Format elapsed time in seconds with milliseconds.
 * Note: Uses 3 digits (milliseconds) instead of 6 (microseconds).
 */
export function formatElapsedSeconds(start: Date, end: Date): string {
  const elapsedMs = end.getTime() - start.getTime();
  const seconds = Math.floor(elapsedMs / 1000) % 60;
  const milliseconds = elapsedMs % 1000;
  return `${seconds.toString().padStart(2, "0")}.${milliseconds.toString().padStart(3, "0")}`;
}

/**
 * Simple seeded random number generator (Linear Congruential Generator).
 */
class SeededRandom {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed;
  }

  next(): number {
    // LCG parameters (same as glibc)
    this.seed = (this.seed * 1103515245 + 12345) & 0x7fffffff;
    return this.seed / 0x7fffffff;
  }
}

/**
 * Generate random sleep duration in milliseconds.
 * Uses a fixed seed for reproducibility.
 */
export function generateSleepMs(): number {
  const rng = new SeededRandom(RANDOM_SEED);
  return Math.floor(rng.next() * (SLEEP_MAX_MS - SLEEP_MIN_MS + 1)) + SLEEP_MIN_MS;
}
