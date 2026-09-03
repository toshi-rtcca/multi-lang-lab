"""Backtracking solver for the N-Queens problem."""

from __future__ import annotations


class NQueensError(Exception):
    """Raised when n-queens cannot complete successfully."""


def is_safe(columns: list[int], row: int, col: int) -> bool:
    """Check whether placing a queen at (row, col) conflicts with rows above it."""
    for placed_row in range(row):
        placed_col = columns[placed_row]
        if placed_col == col or abs(placed_col - col) == abs(placed_row - row):
            return False
    return True


def solve(n: int) -> list[list[int]]:
    """Return all N-Queens solutions as column-index arrays, in discovery order."""
    if n < 1:
        raise NQueensError(f"n must be >= 1, got {n}")

    results: list[list[int]] = []
    columns = [0] * n

    def backtrack(row: int) -> None:
        if row == n:
            results.append(columns.copy())
            return
        for col in range(n):
            if is_safe(columns, row, col):
                columns[row] = col
                backtrack(row + 1)

    backtrack(0)
    return results


def format_solutions(solutions: list[list[int]]) -> str:
    """Format solutions as one line per solution plus a total-count line."""
    lines = [" ".join(map(str, solution)) for solution in solutions]
    lines.append(f"Total solutions: {len(solutions)}")
    return "\n".join(lines) + "\n"
