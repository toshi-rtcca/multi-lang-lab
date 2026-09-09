/**
 * Tokenizer for arithmetic expressions.
 */

export type TokenType =
  | "NUMBER"
  | "PLUS"
  | "MINUS"
  | "STAR"
  | "SLASH"
  | "LPAREN"
  | "RPAREN"
  | "EOF";

export interface Token {
  type: TokenType;
  text: string;
}

export class LexError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "LexError";
  }
}

const SINGLE_CHAR_TOKENS: Record<string, TokenType> = {
  "+": "PLUS",
  "-": "MINUS",
  "*": "STAR",
  "/": "SLASH",
  "(": "LPAREN",
  ")": "RPAREN",
};

export function tokenize(text: string): Token[] {
  const tokens: Token[] = [];
  let pos = 0;

  while (pos < text.length) {
    const ch = text[pos];

    if (/\s/.test(ch)) {
      pos++;
      continue;
    }

    if (/[0-9]/.test(ch)) {
      const start = pos;
      while (pos < text.length && /[0-9]/.test(text[pos])) {
        pos++;
      }
      tokens.push({ type: "NUMBER", text: text.slice(start, pos) });
      continue;
    }

    const tokenType = SINGLE_CHAR_TOKENS[ch];
    if (tokenType) {
      tokens.push({ type: tokenType, text: ch });
      pos++;
      continue;
    }

    throw new LexError(`unexpected character '${ch}' at position ${pos}`);
  }

  tokens.push({ type: "EOF", text: "" });
  return tokens;
}
