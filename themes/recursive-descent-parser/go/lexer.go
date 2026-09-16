package main

import (
	"fmt"
	"unicode"
)

type TokenType int

const (
	NUMBER TokenType = iota
	PLUS
	MINUS
	STAR
	SLASH
	LPAREN
	RPAREN
	EOF
)

type Token struct {
	Type TokenType
	Text string
}

var singleCharTokens = map[rune]TokenType{
	'+': PLUS,
	'-': MINUS,
	'*': STAR,
	'/': SLASH,
	'(': LPAREN,
	')': RPAREN,
}

// tokenize converts an expression string into tokens, terminated by a single EOF token.
func tokenize(input string) ([]Token, error) {
	var tokens []Token
	runes := []rune(input)
	pos := 0

	for pos < len(runes) {
		ch := runes[pos]

		if unicode.IsSpace(ch) {
			pos++
			continue
		}

		if unicode.IsDigit(ch) {
			start := pos
			for pos < len(runes) && unicode.IsDigit(runes[pos]) {
				pos++
			}
			tokens = append(tokens, Token{Type: NUMBER, Text: string(runes[start:pos])})
			continue
		}

		if tokenType, ok := singleCharTokens[ch]; ok {
			tokens = append(tokens, Token{Type: tokenType, Text: string(ch)})
			pos++
			continue
		}

		return nil, fmt.Errorf("unexpected character %q at position %d", ch, pos)
	}

	tokens = append(tokens, Token{Type: EOF, Text: ""})
	return tokens, nil
}
