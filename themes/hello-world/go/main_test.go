package main

import (
	"bytes"
	"os"
	"testing"
)

func TestMain_PrintsHelloWorld(t *testing.T) {
	// Capture stdout
	old := os.Stdout
	r, w, _ := os.Pipe()
	os.Stdout = w

	main()

	w.Close()
	os.Stdout = old

	var buf bytes.Buffer
	buf.ReadFrom(r)
	got := buf.String()

	want := "Hello, world!\n"
	if got != want {
		t.Errorf("got %q, want %q", got, want)
	}
}
