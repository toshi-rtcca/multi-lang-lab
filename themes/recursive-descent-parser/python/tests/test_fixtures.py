"""Run every shared fixture through the library and check the documented contract."""

from pathlib import Path

import pytest

from recursive_descent_parser.parser import EvalError, ParseError, parse_and_evaluate
from recursive_descent_parser.lexer import LexError

_THEME_DIR = Path(__file__).resolve().parents[2]
_REPO_ROOT = _THEME_DIR.parents[1]
_FIXTURES_DIR = _REPO_ROOT / "shared" / "fixtures" / "recursive-descent-parser"
_EXPECTED_DIR = _REPO_ROOT / "shared" / "expected" / "recursive-descent-parser"

_CASES = sorted(p.stem for p in _FIXTURES_DIR.glob("*.txt"))


@pytest.mark.parametrize("case", _CASES)
def test_fixture_matches_expected(case):
    """Each fixture either evaluates to the expected integer, or errors (sentinel `ERROR`)."""
    expression = (_FIXTURES_DIR / f"{case}.txt").read_text(encoding="utf-8")
    expected = (_EXPECTED_DIR / f"{case}.txt").read_text(encoding="utf-8").strip()

    if expected == "ERROR":
        with pytest.raises((LexError, ParseError, EvalError)):
            parse_and_evaluate(expression)
    else:
        assert parse_and_evaluate(expression) == int(expected)
