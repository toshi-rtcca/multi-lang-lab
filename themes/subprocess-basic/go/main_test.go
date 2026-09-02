package main

import (
	"os"
	"path/filepath"
	"reflect"
	"strings"
	"testing"
)

func TestParseLsOutputExtractsRegularFilesOnly(t *testing.T) {
	output := `total 16
drwxr-xr-x  2 user  group  64 Jan  1 00:00 nested
-rw-r--r--  1 user  group  20 Jan  1 00:00 bravo.txt
lrwxr-xr-x  1 user  group   9 Jan  1 00:00 link.txt -> bravo.txt
-rw-r--r--@ 1 user  group  10 Jan  1 00:00 alpha name.txt
`

	got := parseLsOutput(output)
	want := []fileEntry{
		{size: 20, filename: "bravo.txt"},
		{size: 10, filename: "alpha name.txt"},
	}

	if !reflect.DeepEqual(got, want) {
		t.Fatalf("expected %+v, got %+v", want, got)
	}
}

func TestSortEntriesUsesSizeDescendingThenFilenameAscending(t *testing.T) {
	entries := []fileEntry{
		{size: 10, filename: "charlie.txt"},
		{size: 20, filename: "bravo.txt"},
		{size: 20, filename: "alpha.txt"},
	}

	got := sortEntries(entries)
	want := []fileEntry{
		{size: 20, filename: "alpha.txt"},
		{size: 20, filename: "bravo.txt"},
		{size: 10, filename: "charlie.txt"},
	}

	if !reflect.DeepEqual(got, want) {
		t.Fatalf("expected %+v, got %+v", want, got)
	}
}

func TestFormatEntriesIncludesHeaderAndTrailingNewline(t *testing.T) {
	got := formatEntries([]fileEntry{{size: 20, filename: "bravo.txt"}})
	want := "size   filename\n20   bravo.txt\n"

	if got != want {
		t.Fatalf("expected %q, got %q", want, got)
	}
}

func TestFormatEntriesForEmptyDirectoryOutput(t *testing.T) {
	got := formatEntries([]fileEntry{})
	want := "size   filename\n"

	if got != want {
		t.Fatalf("expected %q, got %q", want, got)
	}
}

func TestSortLsLRejectsMissingPath(t *testing.T) {
	_, err := sortLsL(filepath.Join(t.TempDir(), "missing"), runLs)
	if err == nil || !strings.Contains(err.Error(), "Path does not exist") {
		t.Fatalf("expected missing path error, got %v", err)
	}
}

func TestSortLsLRejectsNonDirectory(t *testing.T) {
	tmpDir := t.TempDir()
	filePath := filepath.Join(tmpDir, "file.txt")
	if err := os.WriteFile(filePath, []byte("content"), 0644); err != nil {
		t.Fatal(err)
	}

	_, err := sortLsL(filePath, runLs)
	if err == nil || !strings.Contains(err.Error(), "Path is not a directory") {
		t.Fatalf("expected non-directory error, got %v", err)
	}
}

func TestSortLsLUsesMockedRunnerForEmptyDirectory(t *testing.T) {
	output, err := sortLsL(t.TempDir(), func(path string) processResult {
		return processResult{exitCode: 0, stdout: "total 0\n", stderr: ""}
	})

	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if output != "size   filename\n" {
		t.Fatalf("expected header-only output, got %q", output)
	}
}

func TestSortLsLRaisesErrorWhenSubprocessFails(t *testing.T) {
	_, err := sortLsL(t.TempDir(), func(path string) processResult {
		return processResult{exitCode: 1, stdout: "", stderr: "ls failed"}
	})

	if err == nil || !strings.Contains(err.Error(), "ls failed") {
		t.Fatalf("expected subprocess error, got %v", err)
	}
}
