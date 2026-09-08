"""Recursive-descent parser and evaluator for arithmetic expressions."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Union

from .lexer import Token, TokenType, tokenize


class ParseError(Exception):
    """Raised when the token stream does not match the grammar."""


class EvalError(Exception):
    """Raised when a well-formed AST cannot be evaluated (e.g. division by zero)."""


@dataclass(frozen=True)
class Number:
    """A literal integer."""

    value: int


@dataclass(frozen=True)
class BinaryOp:
    """A binary operation between two sub-expressions."""

    op: str
    left: "Expr"
    right: "Expr"


Expr = Union[Number, BinaryOp]

_TERM_OPS = {TokenType.PLUS: "+", TokenType.MINUS: "-"}
_FACTOR_OPS = {TokenType.STAR: "*", TokenType.SLASH: "/"}


class _Parser:
    """One method per grammar production, mirroring the EBNF in spec.md."""

    def __init__(self, tokens: list[Token]) -> None:
        self._tokens = tokens
        self._pos = 0

    def _peek(self) -> Token:
        return self._tokens[self._pos]

    def _advance(self) -> Token:
        token = self._tokens[self._pos]
        self._pos += 1
        return token

    def parse_expr(self) -> Expr:
        """expr = term, { ("+" | "-"), term } ;"""
        node = self.parse_term()
        while self._peek().type in _TERM_OPS:
            op = _TERM_OPS[self._advance().type]
            node = BinaryOp(op, node, self.parse_term())
        return node

    def parse_term(self) -> Expr:
        """term = factor, { ("*" | "/"), factor } ;"""
        node = self.parse_factor()
        while self._peek().type in _FACTOR_OPS:
            op = _FACTOR_OPS[self._advance().type]
            node = BinaryOp(op, node, self.parse_factor())
        return node

    def parse_factor(self) -> Expr:
        """factor = number | "(", expr, ")" ;"""
        token = self._peek()

        if token.type == TokenType.NUMBER:
            self._advance()
            return Number(int(token.text))

        if token.type == TokenType.LPAREN:
            self._advance()
            node = self.parse_expr()
            if self._peek().type != TokenType.RPAREN:
                raise ParseError("expected closing ')'")
            self._advance()
            return node

        raise ParseError(f"expected a number or '(', got {token.text!r}")

    def parse(self) -> Expr:
        """Parse a full token stream into an AST, rejecting any trailing tokens."""
        expr = self.parse_expr()
        trailing = self._peek()
        if trailing.type != TokenType.EOF:
            raise ParseError(f"unexpected trailing token {trailing.text!r}")
        return expr


def parse(tokens: list[Token]) -> Expr:
    """Parse a full token stream into an AST, rejecting any trailing tokens."""
    return _Parser(tokens).parse()


def _truncating_divide(left: int, right: int) -> int:
    """Integer division that truncates toward zero, unlike Python's floor `//`."""
    quotient = abs(left) // abs(right)
    return -quotient if (left < 0) != (right < 0) else quotient


def evaluate(expr: Expr) -> int:
    """Evaluate an AST node to an integer result."""
    if isinstance(expr, Number):
        return expr.value

    left = evaluate(expr.left)
    right = evaluate(expr.right)

    if expr.op == "+":
        return left + right
    if expr.op == "-":
        return left - right
    if expr.op == "*":
        return left * right

    if right == 0:
        raise EvalError("division by zero")
    return _truncating_divide(left, right)


def parse_and_evaluate(text: str) -> int:
    """Tokenize, parse, and evaluate an expression string in one call."""
    return evaluate(parse(tokenize(text)))
