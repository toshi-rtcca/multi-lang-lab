package main

import (
	"fmt"
	"strconv"
)

// Expr is implemented by Number and BinaryOp only; exprNode is unexported so
// no other type outside this package can satisfy the interface.
type Expr interface {
	exprNode()
}

type Number struct {
	Value int
}

func (Number) exprNode() {}

type BinaryOp struct {
	Op    string
	Left  Expr
	Right Expr
}

func (BinaryOp) exprNode() {}

var termOps = map[TokenType]string{PLUS: "+", MINUS: "-"}
var factorOps = map[TokenType]string{STAR: "*", SLASH: "/"}

type parser struct {
	tokens []Token
	pos    int
}

func (p *parser) peek() Token {
	return p.tokens[p.pos]
}

func (p *parser) advance() Token {
	token := p.tokens[p.pos]
	p.pos++
	return token
}

// parseExpr = term, { ("+" | "-"), term } ;
func (p *parser) parseExpr() (Expr, error) {
	node, err := p.parseTerm()
	if err != nil {
		return nil, err
	}
	for {
		op, ok := termOps[p.peek().Type]
		if !ok {
			return node, nil
		}
		p.advance()
		right, err := p.parseTerm()
		if err != nil {
			return nil, err
		}
		node = BinaryOp{Op: op, Left: node, Right: right}
	}
}

// parseTerm = factor, { ("*" | "/"), factor } ;
func (p *parser) parseTerm() (Expr, error) {
	node, err := p.parseFactor()
	if err != nil {
		return nil, err
	}
	for {
		op, ok := factorOps[p.peek().Type]
		if !ok {
			return node, nil
		}
		p.advance()
		right, err := p.parseFactor()
		if err != nil {
			return nil, err
		}
		node = BinaryOp{Op: op, Left: node, Right: right}
	}
}

// parseFactor = number | "(", expr, ")" ;
func (p *parser) parseFactor() (Expr, error) {
	token := p.peek()

	switch token.Type {
	case NUMBER:
		p.advance()
		value, err := strconv.Atoi(token.Text)
		if err != nil {
			return nil, fmt.Errorf("invalid number %q", token.Text)
		}
		return Number{Value: value}, nil

	case LPAREN:
		p.advance()
		node, err := p.parseExpr()
		if err != nil {
			return nil, err
		}
		if p.peek().Type != RPAREN {
			return nil, fmt.Errorf("expected closing ')'")
		}
		p.advance()
		return node, nil

	default:
		return nil, fmt.Errorf("expected a number or '(', got %q", token.Text)
	}
}

// parse parses a full token stream into an AST, rejecting any trailing tokens.
func parse(tokens []Token) (Expr, error) {
	p := &parser{tokens: tokens}
	expr, err := p.parseExpr()
	if err != nil {
		return nil, err
	}
	if trailing := p.peek(); trailing.Type != EOF {
		return nil, fmt.Errorf("unexpected trailing token %q", trailing.Text)
	}
	return expr, nil
}

func evaluate(expr Expr) (int, error) {
	switch e := expr.(type) {
	case Number:
		return e.Value, nil

	case BinaryOp:
		left, err := evaluate(e.Left)
		if err != nil {
			return 0, err
		}
		right, err := evaluate(e.Right)
		if err != nil {
			return 0, err
		}
		switch e.Op {
		case "+":
			return left + right, nil
		case "-":
			return left - right, nil
		case "*":
			return left * right, nil
		case "/":
			if right == 0 {
				return 0, fmt.Errorf("division by zero")
			}
			// Go's integer division already truncates toward zero.
			return left / right, nil
		}
	}

	return 0, fmt.Errorf("unreachable: unknown expr type %T", expr)
}

func parseAndEvaluate(text string) (int, error) {
	tokens, err := tokenize(text)
	if err != nil {
		return 0, err
	}
	expr, err := parse(tokens)
	if err != nil {
		return 0, err
	}
	return evaluate(expr)
}
