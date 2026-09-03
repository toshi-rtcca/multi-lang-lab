# n-queens

## CLI Interface
```sh
n-queens [--n <N>]
```

## Input
- `--n`: Board size (number of queens / board dimension). Optional, defaults to `8`.

## Task
Solve the N-Queens problem via backtracking: place N queens on an NxN
chessboard so that no two queens share a row, column, or diagonal. Print
every distinct solution and the total solution count. For N=8 there are
exactly 92 solutions — this is the hard correctness requirement of the
theme.

The algorithm must place queens row by row using backtracking (trying a
column, recursing, undoing on conflict), not brute-force permutation
enumeration.

## Board Representation
A solution is represented as an array `columns` of length N, where
`columns[row]` is the 0-indexed column of the queen placed in that row.
Because exactly one queen is placed per row, row conflicts cannot occur
by construction; only column and diagonal conflicts need to be checked.

## Algorithm Outline
```
solve(row, columns, results):
    if row == N:
        results.append(copy of columns)
        return
    for col in 0..N-1:
        if is_safe(columns, row, col):
            columns[row] = col
            solve(row + 1, columns, results)
            # columns[row] is overwritten by the next candidate,
            # or left stale once this row's loop ends — safe because
            # no shallower row ever reads a deeper row's entry.

is_safe(columns, row, col):
    for r in 0..row-1:
        if columns[r] == col:
            return false                          # same column
        if abs(columns[r] - col) == abs(r - row):
            return false                          # same diagonal
    return true
```

## Output Format
Print one line per solution: N space-separated 0-indexed column values,
in the order `solve` discovers them. After all solutions, print a final
line with the total count.

- Each solution row is formatted as: `<col_0> <col_1> ... <col_{N-1}>`
- The final line is formatted as: `Total solutions: <count>`
- Output ends with a trailing newline.

### Determinism Requirement
To keep output byte-identical across all language implementations (and
thus verifiable against a single shared expected-output fixture), rows
must be processed in order `0..N-1` and, within each row, candidate
columns must be tried in ascending order `0..N-1`, depth-first. This
produces the canonical solution ordering for N=8 used as this theme's
expected output.

### Example Output (N=8, truncated)
```text
0 4 7 5 2 6 1 3
0 5 7 2 6 3 1 4
1 3 5 7 2 0 6 4
...
Total solutions: 92
```

## Processing Rules
1. Parse `--n` as a positive integer; default to `8` when omitted.
2. Run the backtracking algorithm described above to enumerate all
   solutions for the NxN board.
3. Print each solution as a line of N space-separated column indices, in
   discovery order (see Determinism Requirement).
4. Print `Total solutions: <count>` as the final line.

## Edge Cases
- `N < 1`: invalid input. Exit `1`, error message to stderr. No solution
  lines are printed.
- `N` is not a valid integer: invalid input. Exit `1`, error message to
  stderr.
- `N = 1`: exactly 1 solution (a single queen on a 1x1 board). Print that
  one line, then `Total solutions: 1`.
- `N = 2` or `N = 3`: 0 solutions exist. No solution lines are printed;
  only `Total solutions: 0` is printed. Exit `0` (this is not an error).

## Exit Codes
- `0`: Success (including the N=2/N=3 zero-solution case).
- `1`: Error, such as a missing/invalid `--n` value.
