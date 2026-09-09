/**
 * Recursive-descent parser and evaluator for arithmetic expressions.
 */

import { Token, TokenType, tokenize } from "./lexer";

export class ParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ParseError";
  }
}

export class EvalError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "EvalError";
  }
}

export type BinaryOperator = "+" | "-" | "*" | "/";

export interface NumberNode {
  kind: "Number";
  value: number;
}

export interface BinaryOpNode {
  kind: "BinaryOp";
  op: BinaryOperator;
  left: Expr;
  right: Expr;
}

export type Expr = NumberNode | BinaryOpNode;

const TERM_OPS: Partial<Record<TokenType, BinaryOperator>> = {
  PLUS: "+",
  MINUS: "-",
};

const FACTOR_OPS: Partial<Record<TokenType, BinaryOperator>> = {
  STAR: "*",
  SLASH: "/",
};

class TokenParser {
  private tokens: Token[];
  private pos = 0;

  constructor(tokens: Token[]) {
    this.tokens = tokens;
  }

  private peek(): Token {
    return this.tokens[this.pos];
  }

  private advance(): Token {
    return this.tokens[this.pos++];
  }

  /** expr = term, { ("+" | "-"), term } ; */
  parseExpr(): Expr {
    let node = this.parseTerm();
    let op = TERM_OPS[this.peek().type];
    while (op) {
      this.advance();
      node = { kind: "BinaryOp", op, left: node, right: this.parseTerm() };
      op = TERM_OPS[this.peek().type];
    }
    return node;
  }

  /** term = factor, { ("*" | "/"), factor } ; */
  parseTerm(): Expr {
    let node = this.parseFactor();
    let op = FACTOR_OPS[this.peek().type];
    while (op) {
      this.advance();
      node = { kind: "BinaryOp", op, left: node, right: this.parseFactor() };
      op = FACTOR_OPS[this.peek().type];
    }
    return node;
  }

  /** factor = number | "(", expr, ")" ; */
  parseFactor(): Expr {
    const token = this.peek();

    if (token.type === "NUMBER") {
      this.advance();
      return { kind: "Number", value: Number(token.text) };
    }

    if (token.type === "LPAREN") {
      this.advance();
      const node = this.parseExpr();
      if (this.peek().type !== "RPAREN") {
        throw new ParseError("expected closing ')'");
      }
      this.advance();
      return node;
    }

    throw new ParseError(`expected a number or '(', got '${token.text}'`);
  }

  parse(): Expr {
    const expr = this.parseExpr();
    const trailing = this.peek();
    if (trailing.type !== "EOF") {
      throw new ParseError(`unexpected trailing token '${trailing.text}'`);
    }
    return expr;
  }
}

export function parse(tokens: Token[]): Expr {
  return new TokenParser(tokens).parse();
}

function truncatingDivide(left: number, right: number): number {
  return Math.trunc(left / right);
}

export function evaluate(expr: Expr): number {
  if (expr.kind === "Number") {
    return expr.value;
  }

  const left = evaluate(expr.left);
  const right = evaluate(expr.right);

  switch (expr.op) {
    case "+":
      return left + right;
    case "-":
      return left - right;
    case "*":
      return left * right;
    case "/":
      if (right === 0) {
        throw new EvalError("division by zero");
      }
      return truncatingDivide(left, right);
  }
}

export function parseAndEvaluate(text: string): number {
  return evaluate(parse(tokenize(text)));
}
