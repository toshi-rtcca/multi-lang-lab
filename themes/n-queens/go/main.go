package main

import (
	"flag"
	"fmt"
	"os"
	"strconv"
	"strings"
)

func main() {
	nFlag := flag.String("n", "8", "Board size (number of queens)")
	flag.Parse()

	n, err := strconv.Atoi(*nFlag)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Invalid value for --n: %s\n", *nFlag)
		os.Exit(1)
	}

	solutions, err := solve(n)
	if err != nil {
		fmt.Fprintln(os.Stderr, err)
		os.Exit(1)
	}

	fmt.Print(formatSolutions(solutions))
}

func isSafe(columns []int, row, col int) bool {
	for placedRow := 0; placedRow < row; placedRow++ {
		placedCol := columns[placedRow]
		if placedCol == col || abs(placedCol-col) == abs(placedRow-row) {
			return false
		}
	}
	return true
}

func abs(x int) int {
	if x < 0 {
		return -x
	}
	return x
}

func solve(n int) ([][]int, error) {
	if n < 1 {
		return nil, fmt.Errorf("n must be >= 1, got %d", n)
	}

	results := [][]int{}
	columns := make([]int, n)

	var backtrack func(row int)
	backtrack = func(row int) {
		if row == n {
			results = append(results, append([]int(nil), columns...))
			return
		}
		for col := 0; col < n; col++ {
			if isSafe(columns, row, col) {
				columns[row] = col
				backtrack(row + 1)
			}
		}
	}
	backtrack(0)

	return results, nil
}

func formatSolutions(solutions [][]int) string {
	lines := make([]string, 0, len(solutions)+1)
	for _, solution := range solutions {
		columnStrings := make([]string, len(solution))
		for i, col := range solution {
			columnStrings[i] = strconv.Itoa(col)
		}
		lines = append(lines, strings.Join(columnStrings, " "))
	}
	lines = append(lines, fmt.Sprintf("Total solutions: %d", len(solutions)))
	return strings.Join(lines, "\n") + "\n"
}
