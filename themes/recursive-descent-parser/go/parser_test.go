package main

import "testing"

// Mirrors shared/fixtures(/expected)/recursive-descent-parser/*.txt: Go tests
// run in a Docker container without access to the repo's shared/ directory,
// so the same cases are inlined here instead of read from disk.
func TestParseAndEvaluateSharedFixtures(t *testing.T) {
	cases := []struct {
		name       string
		expression string
		want       int
		wantErr    bool
	}{
		{"single-number", "42", 42, false},
		{"basic-precedence", "1 + 2 * 3", 7, false},
		{"left-assoc-subtraction", "10 - 2 - 3", 5, false},
		{"left-assoc-division", "20 / 2 / 5", 2, false},
		{"nested-parens", "(1 + (2 + 3) * (4 - 1))", 16, false},
		{"whitespace-insensitive", "  1 +2*3", 7, false},
		{"readme-example", "1 + 2 * (3 - 4)", -1, false},
		{"truncating-division", "(1 - 4) / 2", -1, false},
		{"division-by-zero", "1 / 0", 0, true},
		{"unbalanced-paren", "(1 + 2", 0, true},
		{"trailing-tokens", "1 + 2)", 0, true},
		{"empty-input", "", 0, true},
		{"consecutive-operators", "1 + * 2", 0, true},
	}

	for _, c := range cases {
		t.Run(c.name, func(t *testing.T) {
			got, err := parseAndEvaluate(c.expression)
			if c.wantErr {
				if err == nil {
					t.Fatalf("expected an error for %q, got result %d", c.expression, got)
				}
				return
			}
			if err != nil {
				t.Fatalf("unexpected error for %q: %v", c.expression, err)
			}
			if got != c.want {
				t.Fatalf("expected %d, got %d", c.want, got)
			}
		})
	}
}

func TestParseBuildsBinaryOpOfTwoNumberLeaves(t *testing.T) {
	tokens, err := tokenize("1 + 2")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	expr, err := parse(tokens)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	binOp, ok := expr.(BinaryOp)
	if !ok {
		t.Fatalf("expected BinaryOp, got %T", expr)
	}
	if binOp.Op != "+" {
		t.Fatalf("expected op %q, got %q", "+", binOp.Op)
	}
	if binOp.Left != (Number{Value: 1}) || binOp.Right != (Number{Value: 2}) {
		t.Fatalf("expected Number(1) and Number(2) leaves, got %+v and %+v", binOp.Left, binOp.Right)
	}
}
