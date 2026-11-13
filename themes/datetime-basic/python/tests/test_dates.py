import json
from dataclasses import asdict
from datetime import datetime
from pathlib import Path

import pytest

from datetime_basic import describe, is_leap_year, parse_date

CASES = json.loads((Path(__file__).parents[2] / "cases.json").read_text())

# Map language-neutral error names to Python exceptions.
ERRORS = {"invalid-date": ValueError}


@pytest.mark.parametrize("case", CASES, ids=[c["name"] for c in CASES])
def test_case(case):
    now = datetime.fromisoformat(case["now"])
    if "expected_error" in case:
        with pytest.raises(ERRORS[case["expected_error"]]):
            describe(case["input"], now)
    else:
        assert asdict(describe(case["input"], now)) == case["expected"]


def test_parse_date_rejects_non_ascii_digits():
    with pytest.raises(ValueError):
        parse_date("２０２４-01-15")


def test_naive_now_is_rejected():
    with pytest.raises(ValueError):
        describe("2024-01-15", datetime(2026, 11, 6))


@pytest.mark.parametrize(
    ("year", "expected"), [(1900, False), (2000, True), (2023, False), (2024, True)]
)
def test_is_leap_year(year, expected):
    assert is_leap_year(year) is expected
