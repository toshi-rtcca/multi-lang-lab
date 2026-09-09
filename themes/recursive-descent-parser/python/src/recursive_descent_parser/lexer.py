"""Tokenizer for arithmetic expressions."""

from __future__ import annotations

from dataclasses import dataclass
from enum import Enum, auto


class TokenType(Enum):
    """Kinds of token this lexer produces."""

    NUMBER = auto()
    PLUS = auto()
    MINUS = auto()
    STAR = auto()
    SLASH = auto()
    LPAREN = auto()
    RPAREN = auto()
    EOF = auto()


@dataclass(frozen=True)
class Token:
    """A single lexical token."""

    type: TokenType
    text: str


class LexError(Exception):
    """Raised when the input contains an unrecognized character."""


_SINGLE_CHAR_TOKENS = {
    "+": TokenType.PLUS,
    "-": TokenType.MINUS,
    "*": TokenType.STAR,
    "/": TokenType.SLASH,
    "(": TokenType.LPAREN,
    ")": TokenType.RPAREN,
}


def tokenize(text: str) -> list[Token]:
    """Convert an expression string into tokens, terminated by a single EOF token."""
    tokens: list[Token] = []
    length = len(text)
    pos = 0

    while pos < length:
        ch = text[pos]

        if ch.isspace():
            pos += 1
            continue

        if ch.isdigit():
            start = pos
            while pos < length and text[pos].isdigit():
                pos += 1
            tokens.append(Token(TokenType.NUMBER, text[start:pos]))
            continue

        if ch in _SINGLE_CHAR_TOKENS:
            tokens.append(Token(_SINGLE_CHAR_TOKENS[ch], ch))
            pos += 1
            continue

        raise LexError(f"unexpected character {ch!r} at position {pos}")

    tokens.append(Token(TokenType.EOF, ""))
    return tokens
