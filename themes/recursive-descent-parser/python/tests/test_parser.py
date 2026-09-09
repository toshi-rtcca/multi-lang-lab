"""Tests for recursive_descent_parser.parser."""

import pytest

from recursive_descent_parser.parser import (
    BinaryOp,
    EvalError,
    Number,
    ParseError,
    parse_and_evaluate,
)


def test_single_number():
    """A bare number evaluates to itself."""
    assert parse_and_evaluate("42") == 42


def test_multiplication_binds_tighter_than_addition():
    """1 + 2 * 3 == 1 + (2 * 3), not (1 + 2) * 3."""
    assert parse_and_evaluate("1 + 2 * 3") == 7


def test_subtraction_is_left_associative():
    """10 - 2 - 3 == (10 - 2) - 3 == 5, not 10 - (2 - 3) == 11."""
    assert parse_and_evaluate("10 - 2 - 3") == 5


def test_division_is_left_associative():
    """20 / 2 / 5 == (20 / 2) / 5 == 2, not 20 / (2 / 5)."""
    assert parse_and_evaluate("20 / 2 / 5") == 2


def test_nested_parentheses():
    """Parentheses override default precedence at any nesting depth."""
    assert parse_and_evaluate("(1 + (2 + 3) * (4 - 1))") == 16


def test_whitespace_insensitive():
    """Uneven or extra whitespace between tokens does not change the result."""
    assert parse_and_evaluate("  1 +2*3") == 7


def test_readme_example():
    """The example expression from the theme's README/spec."""
    assert parse_and_evaluate("1 + 2 * (3 - 4)") == -1


def test_division_truncates_toward_zero_not_floor():
    """(1 - 4) / 2 == -3 / 2 == -1 (truncated), not -2 (floored)."""
    assert parse_and_evaluate("(1 - 4) / 2") == -1


def test_division_by_zero_raises_eval_error():
    """Division by zero is an evaluation-time error, not a parse-time one."""
    with pytest.raises(EvalError):
        parse_and_evaluate("1 / 0")


@pytest.mark.parametrize(
    "expression",
    ["(1 + 2", "1 + 2)", "", "1 + * 2"],
)
def test_malformed_input_raises_parse_error(expression):
    """Unbalanced parens, trailing tokens, empty input, and missing operands all fail."""
    with pytest.raises(ParseError):
        parse_and_evaluate(expression)


def test_ast_shape_for_binary_expression():
    """1 + 2 parses to a BinaryOp of two Number leaves, not direct evaluation."""
    from recursive_descent_parser.lexer import tokenize
    from recursive_descent_parser.parser import parse

    ast = parse(tokenize("1 + 2"))
    assert ast == BinaryOp("+", Number(1), Number(2))
