package main

import (
	"os"
	"path/filepath"
	"strings"
	"testing"
)

func TestProcessCsvBasic(t *testing.T) {
	tmpDir := t.TempDir()
	inputPath := filepath.Join(tmpDir, "input.csv")
	outputPath := filepath.Join(tmpDir, "output.csv")

	os.WriteFile(inputPath, []byte("name,a,b,c\nAlice,10,20,30\n"), 0644)
	err := processCsv(inputPath, outputPath)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	data, _ := os.ReadFile(outputPath)
	lines := strings.Split(strings.TrimSpace(string(data)), "\n")

	if lines[0] != "name,a,b,c,SUM,AVG" {
		t.Errorf("expected header 'name,a,b,c,SUM,AVG', got '%s'", lines[0])
	}
	if lines[1] != "Alice,10,20,30,60,20.00" {
		t.Errorf("expected 'Alice,10,20,30,60,20.00', got '%s'", lines[1])
	}
}

func TestProcessCsvEmptyFile(t *testing.T) {
	tmpDir := t.TempDir()
	inputPath := filepath.Join(tmpDir, "input.csv")
	outputPath := filepath.Join(tmpDir, "output.csv")

	os.WriteFile(inputPath, []byte(""), 0644)
	err := processCsv(inputPath, outputPath)
	if err == nil {
		t.Fatal("expected error for empty file")
	}
	if !strings.Contains(err.Error(), "empty") {
		t.Errorf("expected error message to contain 'empty', got '%s'", err.Error())
	}
}

func TestProcessCsvHeaderOnly(t *testing.T) {
	tmpDir := t.TempDir()
	inputPath := filepath.Join(tmpDir, "input.csv")
	outputPath := filepath.Join(tmpDir, "output.csv")

	os.WriteFile(inputPath, []byte("name,a,b,c\n"), 0644)
	err := processCsv(inputPath, outputPath)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	data, _ := os.ReadFile(outputPath)
	lines := strings.Split(strings.TrimSpace(string(data)), "\n")

	if len(lines) != 1 {
		t.Errorf("expected 1 line, got %d", len(lines))
	}
	if lines[0] != "name,a,b,c,SUM,AVG" {
		t.Errorf("expected header 'name,a,b,c,SUM,AVG', got '%s'", lines[0])
	}
}

func TestProcessCsvNonNumeric(t *testing.T) {
	tmpDir := t.TempDir()
	inputPath := filepath.Join(tmpDir, "input.csv")
	outputPath := filepath.Join(tmpDir, "output.csv")

	os.WriteFile(inputPath, []byte("name,a,b\nAlice,10,abc\n"), 0644)
	err := processCsv(inputPath, outputPath)
	if err == nil {
		t.Fatal("expected error for non-numeric value")
	}
	if !strings.Contains(err.Error(), "non-numeric") {
		t.Errorf("expected error message to contain 'non-numeric', got '%s'", err.Error())
	}
}

func TestProcessCsvAvgRounding(t *testing.T) {
	tmpDir := t.TempDir()
	inputPath := filepath.Join(tmpDir, "input.csv")
	outputPath := filepath.Join(tmpDir, "output.csv")

	// 85 + 90 + 78 = 253, AVG = 84.333... -> 84.33
	os.WriteFile(inputPath, []byte("name,a,b,c\nAlice,85,90,78\n"), 0644)
	err := processCsv(inputPath, outputPath)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	data, _ := os.ReadFile(outputPath)
	if !strings.Contains(string(data), "84.33") {
		t.Errorf("expected output to contain '84.33', got '%s'", string(data))
	}
}

func TestProcessCsvMultipleRows(t *testing.T) {
	tmpDir := t.TempDir()
	inputPath := filepath.Join(tmpDir, "input.csv")
	outputPath := filepath.Join(tmpDir, "output.csv")

	os.WriteFile(inputPath, []byte("name,math,science,english\nAlice,85,90,78\nBob,72,88,95\n"), 0644)
	err := processCsv(inputPath, outputPath)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	data, _ := os.ReadFile(outputPath)
	lines := strings.Split(strings.TrimSpace(string(data)), "\n")

	if len(lines) != 3 {
		t.Errorf("expected 3 lines, got %d", len(lines))
	}
	if !strings.Contains(lines[1], "253") {
		t.Errorf("expected line 2 to contain '253' (85+90+78)")
	}
	if !strings.Contains(lines[2], "255") {
		t.Errorf("expected line 3 to contain '255' (72+88+95)")
	}
}
