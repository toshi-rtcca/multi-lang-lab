"""Helper functions for datetime operations."""

import random
from datetime import datetime, date


RANDOM_SEED = 42
SLEEP_MIN_MS = 1000
SLEEP_MAX_MS = 3000


def format_datetime(dt: datetime) -> str:
    """Format datetime with microseconds.

    Args:
        dt: datetime object to format

    Returns:
        Formatted string in '%Y-%m-%d %H:%M:%S.%f' format
    """
    return dt.strftime("%Y-%m-%d %H:%M:%S.%f")


def datetime_to_timestamp(dt: datetime) -> int:
    """Convert datetime to UNIX timestamp as integer.

    Args:
        dt: datetime object to convert

    Returns:
        UNIX timestamp as integer
    """
    return int(dt.timestamp())


def parse_date(date_str: str) -> date | None:
    """Parse date string in yyyy-mm-dd format.

    Args:
        date_str: Date string to parse

    Returns:
        date object if valid, None if invalid
    """
    try:
        return datetime.strptime(date_str, "%Y-%m-%d").date()
    except ValueError:
        return None


def get_days_diff(start_date: date, target_date: date) -> str:
    """Calculate days difference and return formatted string.

    Args:
        start_date: Reference date (typically today)
        target_date: Target date to compare

    Returns:
        Formatted string like "It's N days ago.", "It's today.", or "It's N days later."
    """
    diff = (start_date - target_date).days

    if diff == 0:
        return "It's today."
    elif diff > 0:
        return f"It's {diff} days ago."
    else:
        return f"It's {-diff} days later."


def get_weekday_name(d: date) -> str:
    """Get weekday name in English.

    Args:
        d: date object

    Returns:
        Weekday name (e.g., "Monday", "Tuesday")
    """
    return d.strftime("%A")


def format_elapsed_seconds(start: datetime, end: datetime) -> str:
    """Format elapsed time in seconds with microseconds.

    Args:
        start: Start datetime
        end: End datetime

    Returns:
        Formatted string in '%S.%f' format (e.g., "02.345678")
    """
    elapsed = end - start
    total_seconds = elapsed.days * 86400 + elapsed.seconds
    seconds = total_seconds % 60
    return f"{seconds:02d}.{elapsed.microseconds:06d}"


def generate_sleep_ms() -> int:
    """Generate random sleep duration in milliseconds.

    Uses a fixed seed for reproducibility.

    Returns:
        Sleep duration in milliseconds (1000-3000)
    """
    random.seed(RANDOM_SEED)
    return random.randint(SLEEP_MIN_MS, SLEEP_MAX_MS)
