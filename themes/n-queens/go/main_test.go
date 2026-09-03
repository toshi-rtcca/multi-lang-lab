package main

import (
	"fmt"
	"testing"
)

func isValidSolution(columns []int) bool {
	for rowA := 0; rowA < len(columns); rowA++ {
		for rowB := rowA + 1; rowB < len(columns); rowB++ {
			colA, colB := columns[rowA], columns[rowB]
			if colA == colB || abs(colA-colB) == abs(rowA-rowB) {
				return false
			}
		}
	}
	return true
}

func TestSolveReturns92SolutionsForN8(t *testing.T) {
	solutions, err := solve(8)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if len(solutions) != 92 {
		t.Fatalf("expected 92 solutions, got %d", len(solutions))
	}
}

func TestSolveSolutionsAreValid(t *testing.T) {
	solutions, _ := solve(8)
	for _, solution := range solutions {
		if !isValidSolution(solution) {
			t.Fatalf("invalid solution: %v", solution)
		}
	}
}

func TestSolveSolutionsAreDistinct(t *testing.T) {
	solutions, _ := solve(8)
	seen := map[string]bool{}
	for _, solution := range solutions {
		key := fmt.Sprint(solution)
		if seen[key] {
			t.Fatalf("duplicate solution: %v", solution)
		}
		seen[key] = true
	}
}

func TestSolveN1ReturnsSingleSolution(t *testing.T) {
	solutions, err := solve(1)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if len(solutions) != 1 || solutions[0][0] != 0 {
		t.Fatalf("expected [[0]], got %v", solutions)
	}
}

func TestSolveReturnsNoSolutionsForN2AndN3(t *testing.T) {
	for _, n := range []int{2, 3} {
		solutions, err := solve(n)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if len(solutions) != 0 {
			t.Fatalf("expected no solutions for n=%d, got %d", n, len(solutions))
		}
	}
}

func TestSolveRejectsInvalidN(t *testing.T) {
	for _, n := range []int{0, -1} {
		if _, err := solve(n); err == nil {
			t.Fatalf("expected error for n=%d", n)
		}
	}
}

func TestIsSafeDetectsColumnConflict(t *testing.T) {
	if isSafe([]int{0}, 1, 0) {
		t.Fatal("expected column conflict to be unsafe")
	}
}

func TestIsSafeDetectsDiagonalConflict(t *testing.T) {
	if isSafe([]int{0}, 1, 1) {
		t.Fatal("expected diagonal conflict to be unsafe")
	}
}

func TestIsSafeAllowsNonConflictingPlacement(t *testing.T) {
	if !isSafe([]int{0}, 1, 2) {
		t.Fatal("expected non-conflicting placement to be safe")
	}
}

func TestFormatSolutionsIncludesTotalCountAndTrailingNewline(t *testing.T) {
	got := formatSolutions([][]int{{0}})
	want := "0\nTotal solutions: 1\n"
	if got != want {
		t.Fatalf("expected %q, got %q", want, got)
	}
}

func TestFormatSolutionsForNoSolutions(t *testing.T) {
	got := formatSolutions([][]int{})
	want := "Total solutions: 0\n"
	if got != want {
		t.Fatalf("expected %q, got %q", want, got)
	}
}
