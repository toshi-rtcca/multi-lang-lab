package main

import "testing"

func tokenTypes(tokens []Token) []TokenType {
	types := make([]TokenType, len(tokens))
	for i, t := range tokens {
		types[i] = t.Type
	}
	return types
}

func assertTypesEqual(t *testing.T, got, want []TokenType) {
	t.Helper()
	if len(got) != len(want) {
		t.Fatalf("expected %v, got %v", want, got)
	}
	for i := range want {
		if got[i] != want[i] {
			t.Fatalf("expected %v, got %v", want, got)
		}
	}
}

func TestTokenizeSingleNumber(t *testing.T) {
	tokens, err := tokenize("42")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	assertTypesEqual(t, tokenTypes(tokens), []TokenType{NUMBER, EOF})
	if tokens[0].Text != "42" {
		t.Fatalf("expected text %q, got %q", "42", tokens[0].Text)
	}
}

func TestTokenizeAllOperatorsAndParens(t *testing.T) {
	tokens, err := tokenize("1+2-3*4/5(6)")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	assertTypesEqual(t, tokenTypes(tokens), []TokenType{
		NUMBER, PLUS, NUMBER, MINUS, NUMBER, STAR, NUMBER, SLASH, NUMBER, LPAREN, NUMBER, RPAREN, EOF,
	})
}

func TestTokenizeIgnoresWhitespace(t *testing.T) {
	tokens, err := tokenize("  1 +  2\t*3\n")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	assertTypesEqual(t, tokenTypes(tokens), []TokenType{NUMBER, PLUS, NUMBER, STAR, NUMBER, EOF})
}

func TestTokenizeEmptyInputYieldsOnlyEOF(t *testing.T) {
	tokens, err := tokenize("   ")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	assertTypesEqual(t, tokenTypes(tokens), []TokenType{EOF})
}

func TestTokenizeRejectsUnrecognizedCharacter(t *testing.T) {
	if _, err := tokenize("1 + a"); err == nil {
		t.Fatal("expected an error for an unrecognized character")
	}
}
