"""Tests for datetime_basic.helpers module."""

from datetime import datetime, date, timedelta

from datetime_basic.helpers import (
    format_datetime,
    datetime_to_timestamp,
    parse_date,
    get_days_diff,
    get_weekday_name,
    format_elapsed_seconds,
    generate_sleep_ms,
    SLEEP_MIN_MS,
    SLEEP_MAX_MS,
)


class TestFormatDatetime:
    def test_format_datetime_basic(self):
        dt = datetime(2024, 6, 1, 10, 30, 45, 123456)
        result = format_datetime(dt)
        assert result == "2024-06-01 10:30:45.123456"

    def test_format_datetime_zero_microseconds(self):
        dt = datetime(2024, 1, 1, 0, 0, 0, 0)
        result = format_datetime(dt)
        assert result == "2024-01-01 00:00:00.000000"


class TestDatetimeToTimestamp:
    def test_timestamp_is_integer(self):
        dt = datetime(2024, 6, 1, 10, 30, 45, 123456)
        result = datetime_to_timestamp(dt)
        assert isinstance(result, int)

    def test_timestamp_unix_epoch(self):
        dt = datetime(1970, 1, 1, 0, 0, 0)
        result = datetime_to_timestamp(dt)
        # Result depends on timezone, but should be close to 0
        assert abs(result) < 86400 * 2  # Within 2 days of epoch


class TestParseDate:
    def test_parse_valid_date(self):
        result = parse_date("2024-01-15")
        assert result == date(2024, 1, 15)

    def test_parse_invalid_format(self):
        result = parse_date("invalid-date")
        assert result is None

    def test_parse_wrong_separator(self):
        result = parse_date("2024/01/15")
        assert result is None

    def test_parse_invalid_date(self):
        result = parse_date("2024-13-45")
        assert result is None

    def test_parse_leap_year(self):
        result = parse_date("2024-02-29")
        assert result == date(2024, 2, 29)

    def test_parse_non_leap_year(self):
        result = parse_date("2023-02-29")
        assert result is None


class TestGetDaysDiff:
    def test_same_day(self):
        d = date(2024, 6, 1)
        result = get_days_diff(d, d)
        assert result == "It's today."

    def test_past_date(self):
        start = date(2024, 6, 10)
        target = date(2024, 6, 1)
        result = get_days_diff(start, target)
        assert result == "It's 9 days ago."

    def test_future_date(self):
        start = date(2024, 6, 1)
        target = date(2024, 6, 10)
        result = get_days_diff(start, target)
        assert result == "It's 9 days later."

    def test_one_day_ago(self):
        start = date(2024, 6, 2)
        target = date(2024, 6, 1)
        result = get_days_diff(start, target)
        assert result == "It's 1 days ago."

    def test_one_day_later(self):
        start = date(2024, 6, 1)
        target = date(2024, 6, 2)
        result = get_days_diff(start, target)
        assert result == "It's 1 days later."


class TestGetWeekdayName:
    def test_monday(self):
        d = date(2024, 1, 15)  # Monday
        result = get_weekday_name(d)
        assert result == "Monday"

    def test_friday(self):
        d = date(2024, 1, 19)  # Friday
        result = get_weekday_name(d)
        assert result == "Friday"

    def test_sunday(self):
        d = date(2024, 1, 21)  # Sunday
        result = get_weekday_name(d)
        assert result == "Sunday"


class TestFormatElapsedSeconds:
    def test_format_basic(self):
        start = datetime(2024, 1, 1, 10, 0, 0, 0)
        end = datetime(2024, 1, 1, 10, 0, 2, 345678)
        result = format_elapsed_seconds(start, end)
        assert result == "02.345678"

    def test_format_zero(self):
        start = datetime(2024, 1, 1, 10, 0, 0, 0)
        end = datetime(2024, 1, 1, 10, 0, 0, 0)
        result = format_elapsed_seconds(start, end)
        assert result == "00.000000"

    def test_format_over_minute(self):
        start = datetime(2024, 1, 1, 10, 0, 0, 0)
        end = datetime(2024, 1, 1, 10, 1, 5, 123456)
        result = format_elapsed_seconds(start, end)
        # 65 seconds total, but we only show seconds part (05)
        assert result == "05.123456"


class TestGenerateSleepMs:
    def test_sleep_within_range(self):
        result = generate_sleep_ms()
        assert SLEEP_MIN_MS <= result <= SLEEP_MAX_MS

    def test_sleep_reproducible(self):
        result1 = generate_sleep_ms()
        result2 = generate_sleep_ms()
        assert result1 == result2  # Fixed seed should produce same result
