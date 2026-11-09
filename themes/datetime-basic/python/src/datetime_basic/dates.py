"""Strict date parsing and a deterministic report relative to an injected `now`."""

import calendar
import math
import re
from dataclasses import dataclass
from datetime import UTC, date, datetime, timedelta

# date.fromisoformat() also accepts "20240115" and "2024-W03-1", and
# strptime("%Y-%m-%d") accepts "2024-1-5". Check the shape first, then let
# fromisoformat() check the calendar. re.ASCII keeps \d from matching
# non-ASCII digits such as "２".
_DATE_SHAPE = re.compile(r"\d{4}-\d{2}-\d{2}", re.ASCII)


@dataclass(frozen=True)
class Report:
    now_local: str
    now_utc: str
    unix: int
    input: str
    weekday: str
    days_diff: int
    plus_30d: str
    is_leap: bool


def parse_date(s: str) -> date:
    """Parse exactly `YYYY-MM-DD`; raise ValueError for anything else."""
    # fullmatch (not match) so trailing text such as "2024-01-15 " fails.
    if not _DATE_SHAPE.fullmatch(s):
        raise ValueError(f"invalid date: {s!r}")
    # Raises ValueError for dates that do not exist, e.g. 2023-02-29.
    return date.fromisoformat(s)


def is_leap_year(year: int) -> bool:
    return calendar.isleap(year)


def describe(input_date: str, now: datetime) -> Report:
    """Describe `input_date` relative to `now`, which must be timezone-aware."""
    if now.utcoffset() is None:
        raise ValueError("now must be timezone-aware")
    d = parse_date(input_date)
    return Report(
        # An aware datetime keeps its own offset: strftime shows its wall clock,
        # not the machine's local time.
        now_local=now.strftime("%Y-%m-%d %H:%M:%S.%f"),
        # isoformat() would print "+00:00" and drop ".000000", so format explicitly.
        now_utc=now.astimezone(UTC).strftime("%Y-%m-%dT%H:%M:%S.%fZ"),
        # timestamp() is a float; math.floor rounds toward -inf before 1970,
        # whereas int() would truncate toward zero.
        unix=math.floor(now.timestamp()),
        input=input_date,
        weekday=calendar.day_name[d.weekday()],
        # now.date() is the local date in now's offset (not the UTC date).
        days_diff=(d - now.date()).days,
        plus_30d=(d + timedelta(days=30)).isoformat(),
        is_leap=is_leap_year(d.year),
    )
