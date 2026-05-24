package main

import (
	"fmt"
	"os"

	"github.com/rivo/uniseg"
)

func reverseGraphemes(s string) string {
	var graphemes []string
	gr := uniseg.NewGraphemes(s)
	for gr.Next() {
		graphemes = append(graphemes, gr.Str())
	}

	// Reverse the slice
	for i, j := 0, len(graphemes)-1; i < j; i, j = i+1, j-1 {
		graphemes[i], graphemes[j] = graphemes[j], graphemes[i]
	}

	result := ""
	for _, g := range graphemes {
		result += g
	}
	return result
}

func main() {
	if len(os.Args) < 2 {
		fmt.Fprintln(os.Stderr, "Usage: reverse-string <input-string>")
		os.Exit(1)
	}

	fmt.Println(reverseGraphemes(os.Args[1]))
}
