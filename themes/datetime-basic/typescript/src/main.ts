#!/usr/bin/env bun
/**
 * CLI entry point for datetime_basic.
 */

import {
  formatDatetime,
  datetimeToTimestamp,
  parseDate,
  getDaysDiff,
  getWeekdayName,
  formatElapsedSeconds,
  generateSleepMs,
} from "./helpers";

/**
 * Parse CLI arguments.
 */
function parseArgs(args: string[]): { inputDate: string | null } {
  let inputDate: string | null = null;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg.startsWith("--input-date=")) {
      inputDate = arg.slice(13);
    } else if (arg === "--input-date" && i + 1 < args.length) {
      inputDate = args[++i];
    }
  }

  return { inputDate };
}

async function main(): Promise<void> {
  const { inputDate } = parseArgs(Bun.argv.slice(2));

  if (!inputDate) {
    console.error("Usage: datetime_basic --input-date <date>");
    process.exit(1);
  }

  const startTime = new Date();

  console.log("Hi, I'm Dr. Calendar.");
  console.log(`It's ${formatDatetime(startTime)} now.`);
  console.log(`It has been ${datetimeToTimestamp(startTime)} since UNIX started.`);

  const targetDate = parseDate(inputDate);

  if (targetDate === null) {
    console.log(`Sorry, I don't know about ${inputDate}.`);
    console.log("Bye!");
    process.exit(1);
  }

  console.log(`You'd like to know ${inputDate}.`);
  console.log("Thinking...");

  const sleepMs = generateSleepMs();
  await Bun.sleep(sleepMs);

  console.log(getDaysDiff(startTime, targetDate));
  console.log(`It was ${getWeekdayName(targetDate)}.`);

  const endTime = new Date();
  console.log(`We've been talking about for ${formatElapsedSeconds(startTime, endTime)} seconds.`);
  console.log("I'm going to leave.");
  console.log("It's nice talking.");
  console.log("See you, again.");
}

if (import.meta.main) {
  main();
}

export { parseArgs };
