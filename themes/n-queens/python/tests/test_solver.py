"""Tests for n_queens.solver."""

from pathlib import Path

import pytest

from n_queens.solver import NQueensError, format_solutions, is_safe, solve


def is_valid_solution(columns: list[int]) -> bool:
    """Check that no two queens in a solution share a column or diagonal."""
    for row_a in range(len(columns)):
        for row_b in range(row_a + 1, len(columns)):
            col_a, col_b = columns[row_a], columns[row_b]
            if col_a == col_b or abs(col_a - col_b) == abs(row_a - row_b):
                return False
    return True


def test_solve_returns_92_solutions_for_n_8():
    """N=8 has exactly 92 distinct solutions."""
    assert len(solve(8)) == 92


def test_solve_solutions_are_all_valid():
    """Every returned solution has no row, column, or diagonal conflicts."""
    solutions = solve(8)
    assert all(is_valid_solution(solution) for solution in solutions)


def test_solve_solutions_are_distinct():
    """No duplicate solutions are returned."""
    solutions = solve(8)
    assert len(solutions) == len({tuple(solution) for solution in solutions})


def test_solve_matches_shared_expected_fixture():
    """Solving N=8 matches the shared canonical expected output byte-for-byte."""
    theme_dir = Path(__file__).resolve().parents[2]
    repo_root = theme_dir.parents[1]
    expected = (repo_root / "shared" / "expected" / "n-queens.txt").read_text(
        encoding="utf-8"
    )

    assert format_solutions(solve(8)) == expected


def test_solve_n_1_returns_single_solution():
    """A 1x1 board has exactly one trivial solution."""
    assert solve(1) == [[0]]


@pytest.mark.parametrize("n", [2, 3])
def test_solve_returns_no_solutions_for_n_2_and_n_3(n):
    """N=2 and N=3 have no valid placements."""
    assert solve(n) == []


@pytest.mark.parametrize("n", [0, -1])
def test_solve_rejects_invalid_n(n):
    """N below 1 is rejected as invalid input."""
    with pytest.raises(NQueensError):
        solve(n)


def test_is_safe_detects_column_conflict():
    """Same column at any prior row is unsafe."""
    assert is_safe([0], 1, 0) is False


def test_is_safe_detects_diagonal_conflict():
    """Same diagonal at any prior row is unsafe."""
    assert is_safe([0], 1, 1) is False


def test_is_safe_allows_non_conflicting_placement():
    """A placement with no shared column or diagonal is safe."""
    assert is_safe([0], 1, 2) is True


def test_format_solutions_includes_total_count_and_trailing_newline():
    """Formatted output ends with the total-count line and a trailing newline."""
    assert format_solutions([[0]]) == "0\nTotal solutions: 1\n"


def test_format_solutions_for_no_solutions():
    """Formatting zero solutions prints only the total-count line."""
    assert format_solutions([]) == "Total solutions: 0\n"
