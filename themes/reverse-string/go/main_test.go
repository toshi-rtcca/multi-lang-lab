package main

import "testing"

func TestReverseGraphemes(t *testing.T) {
	tests := []struct {
		name     string
		input    string
		expected string
	}{
		{"ASCII", "asdf", "fdsa"},
		{"combining characters", "as⃝df̅", "f̅ds⃝a"},
		{"Japanese", "ようこそ,世界に!", "!に界世,そこうよ"},
		{"ZWJ emoji", "👨‍👩‍👧‍👦", "👨‍👩‍👧‍👦"},
		{"empty string", "", ""},
		{"single character", "a", "a"},
		{"emoji sequence", "🍎🍊🍋", "🍋🍊🍎"},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := reverseGraphemes(tt.input)
			if got != tt.expected {
				t.Errorf("reverseGraphemes(%q) = %q, want %q", tt.input, got, tt.expected)
			}
		})
	}
}
