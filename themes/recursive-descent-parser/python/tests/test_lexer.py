"""Tests for recursive_descent_parser.lexer."""

import pytest

from recursive_descent_parser.lexer import LexError, TokenType, tokenize


def test_tokenize_single_number():
    """A bare number tokenizes to NUMBER then EOF."""
    tokens = tokenize("42")
    assert [t.type for t in tokens] == [TokenType.NUMBER, TokenType.EOF]
    assert tokens[0].text == "42"


def test_tokenize_all_operators_and_parens():
    """Every operator and parenthesis maps to its own token type."""
    tokens = tokenize("1+2-3*4/5(6)")
    assert [t.type for t in tokens] == [
        TokenType.NUMBER,
        TokenType.PLUS,
        TokenType.NUMBER,
        TokenType.MINUS,
        TokenType.NUMBER,
        TokenType.STAR,
        TokenType.NUMBER,
        TokenType.SLASH,
        TokenType.NUMBER,
        TokenType.LPAREN,
        TokenType.NUMBER,
        TokenType.RPAREN,
        TokenType.EOF,
    ]


def test_tokenize_ignores_whitespace():
    """Whitespace between tokens is discarded, not turned into tokens."""
    tokens = tokenize("  1 +  2\t*3\n")
    assert [t.type for t in tokens] == [
        TokenType.NUMBER,
        TokenType.PLUS,
        TokenType.NUMBER,
        TokenType.STAR,
        TokenType.NUMBER,
        TokenType.EOF,
    ]


def test_tokenize_empty_input_yields_only_eof():
    """An empty (or all-whitespace) string tokenizes to just EOF."""
    assert [t.type for t in tokenize("   ")] == [TokenType.EOF]


def test_tokenize_rejects_unrecognized_character():
    """A character outside digits/operators/parens/whitespace is a lex error."""
    with pytest.raises(LexError):
        tokenize("1 + a")
