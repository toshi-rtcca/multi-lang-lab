"""CLI entry point for datetime_basic."""

import argparse
import sys
import time
from datetime import datetime

from .helpers import (
    format_datetime,
    datetime_to_timestamp,
    parse_date,
    get_days_diff,
    get_weekday_name,
    format_elapsed_seconds,
    generate_sleep_ms,
)


def main() -> None:
    """Main entry point for the datetime_basic CLI."""
    parser = argparse.ArgumentParser(description="Basic datetime operations")
    parser.add_argument(
        "--input-date", required=True, help="Date in yyyy-mm-dd format"
    )
    args = parser.parse_args()

    start_time = datetime.now()

    print("Hi, I'm Dr. Calendar.")
    print(f"It's {format_datetime(start_time)} now.")
    print(f"It has been {datetime_to_timestamp(start_time)} since UNIX started.")

    target_date = parse_date(args.input_date)

    if target_date is None:
        print(f"Sorry, I don't know about {args.input_date}.")
        print("Bye!")
        sys.exit(1)

    print(f"You'd like to know {args.input_date}.")
    print("Thinking...")

    sleep_ms = generate_sleep_ms()
    time.sleep(sleep_ms / 1000.0)

    print(get_days_diff(start_time.date(), target_date))
    print(f"It was {get_weekday_name(target_date)}.")

    end_time = datetime.now()
    print(f"We've been talking about for {format_elapsed_seconds(start_time, end_time)} seconds.")
    print("I'm going to leave.")
    print("It's nice talking.")
    print("See you, again.")


if __name__ == "__main__":
    main()
