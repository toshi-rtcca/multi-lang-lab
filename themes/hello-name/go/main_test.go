package main

import (
	"os/exec"
	"strings"
	"testing"
)

func TestWithName(t *testing.T) {
	cmd := exec.Command("go", "run", ".", "--name=World")
	output, err := cmd.Output()
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	got := strings.TrimSpace(string(output))
	want := "Hello, World!"
	if got != want {
		t.Errorf("got %q, want %q", got, want)
	}
}

func TestWithoutName(t *testing.T) {
	cmd := exec.Command("go", "run", ".")
	output, err := cmd.CombinedOutput()
	if err == nil {
		t.Fatal("expected error, got nil")
	}
	got := string(output)
	want := "Sorry, may I have your name?"
	if !strings.Contains(got, want) {
		t.Errorf("output %q does not contain %q", got, want)
	}
}
