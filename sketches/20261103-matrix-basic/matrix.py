# /// script
# requires-python = ">=3.12"
# dependencies = ["pytest"]
# ///
"""Sketch: basic matrix operations with plain nested lists (no NumPy).

Stage 1: construction, shape validation, indexing, transpose.
Stage 2: matrix multiplication.

Test: uv run --with pytest pytest matrix.py
"""

import pytest

# Row-major nested lists. Elements are ints so tests can compare exactly.
type Matrix = list[list[int]]


# --- construction ------------------------------------------------------------


def zeros(rows: int, cols: int) -> Matrix:
    _check_dims(rows, cols)
    # Not `[[0] * cols] * rows`: that repeats ONE row object `rows` times.
    return [[0] * cols for _ in range(rows)]


def identity(n: int) -> Matrix:
    _check_dims(n, n)
    return [[1 if i == j else 0 for j in range(n)] for i in range(n)]


def from_rows(rows: list[list[int]]) -> Matrix:
    shape(rows)  # validate before copying
    # Copy each row so the caller's lists are not shared with the result.
    return [list(r) for r in rows]


def _check_dims(rows: int, cols: int) -> None:
    if rows < 1 or cols < 1:
        raise ValueError(f"dimensions must be positive, got {rows}x{cols}")


# --- shape and indexing ------------------------------------------------------


def shape(m: Matrix) -> tuple[int, int]:
    # With nested lists, `[]` cannot tell 0x0 from 0x3, so empty is rejected.
    if not m or not m[0]:
        raise ValueError("empty matrix")
    cols = len(m[0])
    for i, row in enumerate(m):
        if len(row) != cols:
            raise ValueError(f"ragged matrix: row {i} has {len(row)} columns, expected {cols}")
    return len(m), cols


def get(m: Matrix, i: int, j: int) -> int:
    rows, cols = shape(m)
    # Explicit check: plain m[i][j] would silently accept negative indices.
    if not (0 <= i < rows and 0 <= j < cols):
        raise IndexError(f"index ({i}, {j}) out of range for {rows}x{cols} matrix")
    return m[i][j]


# --- transpose and multiplication --------------------------------------------


def transpose(m: Matrix) -> Matrix:
    shape(m)  # zip() would silently truncate a ragged matrix
    return [list(col) for col in zip(*m)]


def matmul(a: Matrix, b: Matrix) -> Matrix:
    (_, n), (bn, _) = shape(a), shape(b)
    if n != bn:
        raise ValueError(f"cannot multiply {shape(a)} by {shape(b)}: inner dims {n} != {bn}")
    b_cols = transpose(b)  # iterate b column-by-column as rows
    return [[sum(x * y for x, y in zip(row, col, strict=True)) for col in b_cols] for row in a]


# --- tests -------------------------------------------------------------------

A_2x3 = [[1, 2, 3], [4, 5, 6]]
B_3x2 = [[7, 8], [9, 10], [11, 12]]
SQ_A = [[1, 2], [3, 4]]
SQ_B = [[0, 1], [1, 0]]


def test_zeros():
    assert zeros(2, 3) == [[0, 0, 0], [0, 0, 0]]


def test_zeros_rows_are_independent():
    m = zeros(2, 2)
    m[0][0] = 9
    assert m == [[9, 0], [0, 0]]


def test_aliasing_pitfall_for_contrast():
    # The naive form shares one row object: writing m[0][0] changes every row.
    m = [[0] * 2] * 2
    m[0][0] = 9
    assert m == [[9, 0], [9, 0]]


def test_identity():
    assert identity(3) == [[1, 0, 0], [0, 1, 0], [0, 0, 1]]


@pytest.mark.parametrize("rows,cols", [(0, 3), (3, 0), (-1, 2)])
def test_zeros_rejects_non_positive(rows, cols):
    with pytest.raises(ValueError):
        zeros(rows, cols)


def test_from_rows_copies():
    src = [[1, 2], [3, 4]]
    m = from_rows(src)
    src[0][0] = 99
    assert m == [[1, 2], [3, 4]]


SHAPE_CASES = [
    ("2x3", A_2x3, (2, 3)),
    ("1xN", [[1, 2, 3, 4]], (1, 4)),
    ("Nx1", [[1], [2], [3]], (3, 1)),
]


@pytest.mark.parametrize("name,m,expected", SHAPE_CASES, ids=[c[0] for c in SHAPE_CASES])
def test_shape(name, m, expected):
    assert shape(m) == expected


@pytest.mark.parametrize("m", [[], [[]], [[1, 2], [3]]], ids=["empty", "empty-row", "ragged"])
def test_shape_rejects_invalid(m):
    with pytest.raises(ValueError):
        shape(m)


def test_get():
    assert get(A_2x3, 0, 0) == 1
    assert get(A_2x3, 1, 2) == 6


@pytest.mark.parametrize("i,j", [(2, 0), (0, 3), (-1, 0), (0, -1)])
def test_get_out_of_range(i, j):
    with pytest.raises(IndexError):
        get(A_2x3, i, j)


TRANSPOSE_CASES = [
    ("2x3", A_2x3, [[1, 4], [2, 5], [3, 6]]),
    ("square", SQ_A, [[1, 3], [2, 4]]),
    ("1xN", [[1, 2, 3]], [[1], [2], [3]]),
    ("1x1", [[5]], [[5]]),
]


@pytest.mark.parametrize("name,m,expected", TRANSPOSE_CASES, ids=[c[0] for c in TRANSPOSE_CASES])
def test_transpose(name, m, expected):
    assert transpose(m) == expected


def test_transpose_twice_is_identity():
    assert transpose(transpose(A_2x3)) == A_2x3


def test_transpose_rejects_ragged():
    with pytest.raises(ValueError):
        transpose([[1, 2], [3]])


MATMUL_CASES = [
    ("2x3*3x2", A_2x3, B_3x2, [[58, 64], [139, 154]]),
    ("identity-right", SQ_A, identity(2), SQ_A),
    ("identity-left", identity(2), SQ_A, SQ_A),
    ("AB", SQ_A, SQ_B, [[2, 1], [4, 3]]),
    ("BA", SQ_B, SQ_A, [[3, 4], [1, 2]]),  # differs from AB: not commutative
    ("row*col", [[1, 2, 3]], [[4], [5], [6]], [[32]]),
    ("col*row", [[1], [2]], [[3, 4]], [[3, 4], [6, 8]]),
]


@pytest.mark.parametrize("name,a,b,expected", MATMUL_CASES, ids=[c[0] for c in MATMUL_CASES])
def test_matmul(name, a, b, expected):
    assert matmul(a, b) == expected


def test_matmul_dim_mismatch():
    with pytest.raises(ValueError):
        matmul(A_2x3, A_2x3)


def test_matmul_transpose_identity():
    # (AB)^T == B^T A^T
    assert transpose(matmul(A_2x3, B_3x2)) == matmul(transpose(B_3x2), transpose(A_2x3))
