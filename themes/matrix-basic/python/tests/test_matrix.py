import json
from pathlib import Path
from typing import Any

import pytest

from matrix_basic import (
    DimensionMismatchError,
    EmptyMatrixError,
    InvalidDimsError,
    RaggedMatrixError,
    from_rows,
    get,
    identity,
    matmul,
    shape,
    transpose,
    zeros,
)

CASES = json.loads((Path(__file__).parents[2] / "cases.json").read_text())

# Language-neutral error kinds in cases.json -> Python exception types.
ERRORS: dict[str, type[Exception]] = {
    "invalid-dims": InvalidDimsError,
    "empty": EmptyMatrixError,
    "ragged": RaggedMatrixError,
    "out-of-range": IndexError,
    "dim-mismatch": DimensionMismatchError,
}


def run(case: dict[str, Any]) -> Any:
    match case["op"]:
        case "zeros":
            return zeros(case["rows"], case["cols"])
        case "identity":
            return identity(case["n"])
        case "shape":
            return list(shape(case["m"]))  # JSON has no tuples
        case "get":
            return get(case["m"], case["i"], case["j"])
        case "transpose":
            return transpose(case["m"])
        case "matmul":
            return matmul(case["a"], case["b"])
    raise ValueError(f"unknown op {case['op']!r}")


@pytest.mark.parametrize("case", CASES, ids=[c["name"] for c in CASES])
def test_case(case: dict[str, Any]) -> None:
    if "expected_error" in case:
        with pytest.raises(ERRORS[case["expected_error"]]):
            run(case)
    else:
        assert run(case) == case["expected"]


# --- 2D initialization pitfall -----------------------------------------------


def test_zeros_rows_are_independent() -> None:
    m = zeros(2, 2)
    m[0][0] = 9
    assert m == [[9, 0], [0, 0]]


def test_naive_init_shares_rows() -> None:
    # Contrast: list repetition copies the reference, so every row is one object.
    m = [[0] * 2] * 2
    m[0][0] = 9
    assert m == [[9, 0], [9, 0]]
    assert m[0] is m[1]


def test_from_rows_copies_input() -> None:
    src = [[1, 2], [3, 4]]
    m = from_rows(src)
    src[0][0] = 99
    assert m == [[1, 2], [3, 4]]


def test_plain_indexing_accepts_negative() -> None:
    # Why get() checks bounds itself: Python indexing wraps around.
    m = [[1, 2, 3], [4, 5, 6]]
    assert m[-1][0] == 4


# --- properties --------------------------------------------------------------

A = [[1, 2, 3], [4, 5, 6]]
B = [[7, 8], [9, 10], [11, 12]]


def test_transpose_twice_is_identity() -> None:
    assert transpose(transpose(A)) == A


def test_identity_is_neutral() -> None:
    assert matmul(identity(2), A) == A
    assert matmul(A, identity(3)) == A


def test_transpose_of_product() -> None:
    assert transpose(matmul(A, B)) == matmul(transpose(B), transpose(A))


def test_errors_are_value_errors() -> None:
    for kind in ("invalid-dims", "empty", "ragged", "dim-mismatch"):
        assert issubclass(ERRORS[kind], ValueError)
