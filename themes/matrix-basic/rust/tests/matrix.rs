use std::fs;

use matrix_basic::{Matrix, MatrixError};
use serde::Deserialize;
use serde_json::Value;

#[derive(Deserialize)]
struct Case {
    name: String,
    op: String,
    rows: Option<i64>,
    cols: Option<i64>,
    n: Option<i64>,
    m: Option<Vec<Vec<i64>>>,
    i: Option<i64>,
    j: Option<i64>,
    a: Option<Vec<Vec<i64>>>,
    b: Option<Vec<Vec<i64>>>,
    expected: Option<Value>,
    expected_error: Option<String>,
}

/// Outcome of a case: a JSON value, or a language-neutral error kind.
type Outcome = Result<Value, &'static str>;

fn load_cases() -> Vec<Case> {
    let path = concat!(env!("CARGO_MANIFEST_DIR"), "/../cases.json");
    serde_json::from_str(&fs::read_to_string(path).unwrap()).unwrap()
}

/// Map `MatrixError` to the language-neutral kinds in cases.json.
fn kind(e: MatrixError) -> &'static str {
    match e {
        MatrixError::InvalidDims { .. } => "invalid-dims",
        MatrixError::Empty => "empty",
        MatrixError::Ragged { .. } => "ragged",
        MatrixError::DimMismatch { .. } => "dim-mismatch",
    }
}

/// JSON numbers are signed; `usize` is not. A negative value cannot be
/// passed to the API at all, so the test maps the failed conversion to `kind`.
fn to_usize(v: i64, kind: &'static str) -> Result<usize, &'static str> {
    usize::try_from(v).map_err(|_| kind)
}

fn rows_json(m: &Matrix) -> Value {
    serde_json::to_value(m.to_rows()).unwrap()
}

fn run(c: &Case) -> Outcome {
    // Ops that take a matrix build it with from_rows first, so empty/ragged
    // errors come from construction.
    let build =
        |rows: &Option<Vec<Vec<i64>>>| Matrix::from_rows(rows.as_ref().unwrap()).map_err(kind);
    match c.op.as_str() {
        "zeros" => {
            let r = to_usize(c.rows.unwrap(), "invalid-dims")?;
            let k = to_usize(c.cols.unwrap(), "invalid-dims")?;
            Matrix::zeros(r, k).map(|m| rows_json(&m)).map_err(kind)
        }
        "identity" => {
            let n = to_usize(c.n.unwrap(), "invalid-dims")?;
            Matrix::identity(n).map(|m| rows_json(&m)).map_err(kind)
        }
        "shape" => {
            let (r, k) = build(&c.m)?.shape();
            Ok(serde_json::json!([r, k]))
        }
        "get" => {
            let m = build(&c.m)?;
            let i = to_usize(c.i.unwrap(), "out-of-range")?;
            let j = to_usize(c.j.unwrap(), "out-of-range")?;
            m.get(i, j).map(Value::from).ok_or("out-of-range")
        }
        "transpose" => Ok(rows_json(&build(&c.m)?.transpose())),
        "matmul" => {
            let (a, b) = (build(&c.a)?, build(&c.b)?);
            a.matmul(&b).map(|p| rows_json(&p)).map_err(kind)
        }
        op => panic!("unknown op {op}"),
    }
}

#[test]
fn cases_json() {
    for c in load_cases() {
        let got = run(&c);
        match (&c.expected_error, &c.expected) {
            (Some(err), _) => assert_eq!(got, Err(err.as_str()), "case {}", c.name),
            (None, Some(want)) => assert_eq!(got, Ok(want.clone()), "case {}", c.name),
            (None, None) => panic!("case {} has no expectation", c.name),
        }
    }
}

// --- aliasing and indexing ---------------------------------------------------

#[test]
fn from_rows_copies_input() {
    let mut src = vec![vec![1, 2], vec![3, 4]];
    let m = Matrix::from_rows(&src).unwrap();
    src[0][0] = 99;
    assert_eq!(m.to_rows(), vec![vec![1, 2], vec![3, 4]]);
}

#[test]
fn vec_macro_clones_each_row() {
    // Contrast with Python/JS: vec![row; n] clones `row`, so rows never share storage.
    let mut m = vec![vec![0; 2]; 2];
    m[0][0] = 9;
    assert_eq!(m, vec![vec![9, 0], vec![0, 0]]);
}

#[test]
fn get_checks_column_bound() {
    // (0, 3) on a 2x3 matrix maps to flat index 3, which exists (row 1, col 0).
    let m = Matrix::from_rows(&[vec![1, 2, 3], vec![4, 5, 6]]).unwrap();
    assert_eq!(m.get(0, 3), None);
}

// --- properties --------------------------------------------------------------

#[test]
fn properties() {
    let a = Matrix::from_rows(&[vec![1, 2, 3], vec![4, 5, 6]]).unwrap();
    let b = Matrix::from_rows(&[vec![7, 8], vec![9, 10], vec![11, 12]]).unwrap();
    let (i2, i3) = (Matrix::identity(2).unwrap(), Matrix::identity(3).unwrap());

    assert_eq!(a.transpose().transpose(), a);
    assert_eq!(i2.matmul(&a).unwrap(), a);
    assert_eq!(a.matmul(&i3).unwrap(), a);
    assert_eq!(
        a.matmul(&b).unwrap().transpose(),
        b.transpose().matmul(&a.transpose()).unwrap()
    );
}

#[test]
fn errors_display() {
    let e = Matrix::from_rows(&[vec![1, 2], vec![3]]).unwrap_err();
    assert_eq!(e.to_string(), "row 1 has 1 columns, expected 2");
}
