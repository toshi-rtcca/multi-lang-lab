"""Basic integer matrix operations on row-major nested lists (no NumPy)."""

type Matrix = list[list[int]]


# --- errors ------------------------------------------------------------------
# Subclasses of ValueError so callers can catch "bad input" broadly
# or one specific kind. Out-of-range indexing uses the builtin IndexError.


class InvalidDimsError(ValueError):
    """Requested dimensions are not positive."""


class EmptyMatrixError(ValueError):
    """The matrix has no rows or no columns."""


class RaggedMatrixError(ValueError):
    """Rows have different lengths."""


class DimensionMismatchError(ValueError):
    """Inner dimensions of a product do not match."""


# --- construction ------------------------------------------------------------


def zeros(rows: int, cols: int) -> Matrix:
    _check_dims(rows, cols)
    # Not `[[0] * cols] * rows`: that repeats ONE row object `rows` times.
    return [[0] * cols for _ in range(rows)]


def identity(n: int) -> Matrix:
    _check_dims(n, n)
    return [[1 if i == j else 0 for j in range(n)] for i in range(n)]


def from_rows(rows: list[list[int]]) -> Matrix:
    shape(rows)
    # Copy each row so the caller's lists are not shared with the result.
    return [list(r) for r in rows]


def _check_dims(rows: int, cols: int) -> None:
    if rows < 1 or cols < 1:
        raise InvalidDimsError(f"dimensions must be positive, got {rows}x{cols}")


# --- shape and indexing ------------------------------------------------------


def shape(m: Matrix) -> tuple[int, int]:
    """Return (rows, cols), validating that m is non-empty and rectangular.

    A nested list can become ragged at any time, so every operation calls this.
    """
    # `[]` cannot tell 0x0 from 0x3, so empty is rejected outright.
    if not m or not m[0]:
        raise EmptyMatrixError("empty matrix")
    cols = len(m[0])
    for i, row in enumerate(m):
        if len(row) != cols:
            raise RaggedMatrixError(f"row {i} has {len(row)} columns, expected {cols}")
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
    (_, inner_a), (inner_b, _) = shape(a), shape(b)
    if inner_a != inner_b:
        raise DimensionMismatchError(
            f"cannot multiply {shape(a)} by {shape(b)}: {inner_a} != {inner_b}"
        )
    b_cols = transpose(b)  # walk b column by column as rows
    return [
        [sum(x * y for x, y in zip(row, col, strict=True)) for col in b_cols]
        for row in a
    ]
