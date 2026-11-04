//! Basic integer matrix operations on a flat, row-major `Vec`.

use std::fmt;

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum MatrixError {
    InvalidDims {
        rows: usize,
        cols: usize,
    },
    Empty,
    Ragged {
        row: usize,
        len: usize,
        expected: usize,
    },
    DimMismatch {
        left: (usize, usize),
        right: (usize, usize),
    },
}

impl fmt::Display for MatrixError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::InvalidDims { rows, cols } => {
                write!(f, "dimensions must be positive, got {rows}x{cols}")
            }
            Self::Empty => write!(f, "empty matrix"),
            Self::Ragged { row, len, expected } => {
                write!(f, "row {row} has {len} columns, expected {expected}")
            }
            Self::DimMismatch { left, right } => {
                write!(
                    f,
                    "cannot multiply {}x{} by {}x{}",
                    left.0, left.1, right.0, right.1
                )
            }
        }
    }
}

impl std::error::Error for MatrixError {}

/// Element (i, j) is `data[i * cols + j]`.
///
/// Fields are private and every constructor validates, so a `Matrix` value
/// always has `rows >= 1`, `cols >= 1` and `data.len() == rows * cols`.
/// Unlike Go, there is no zero value that bypasses the constructors.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Matrix {
    rows: usize,
    cols: usize,
    data: Vec<i64>,
}

impl Matrix {
    // --- construction --------------------------------------------------------

    pub fn zeros(rows: usize, cols: usize) -> Result<Self, MatrixError> {
        // usize cannot be negative, so only zero needs rejecting.
        if rows == 0 || cols == 0 {
            return Err(MatrixError::InvalidDims { rows, cols });
        }
        Ok(Self {
            rows,
            cols,
            data: vec![0; rows * cols],
        })
    }

    pub fn identity(n: usize) -> Result<Self, MatrixError> {
        let mut m = Self::zeros(n, n)?;
        for i in 0..n {
            m.data[i * n + i] = 1;
        }
        Ok(m)
    }

    /// Validate a nested slice once and copy it into flat storage.
    pub fn from_rows(rows: &[Vec<i64>]) -> Result<Self, MatrixError> {
        let cols = rows.first().map_or(0, Vec::len);
        if cols == 0 {
            return Err(MatrixError::Empty);
        }
        if let Some((row, r)) = rows.iter().enumerate().find(|(_, r)| r.len() != cols) {
            return Err(MatrixError::Ragged {
                row,
                len: r.len(),
                expected: cols,
            });
        }
        Ok(Self {
            rows: rows.len(),
            cols,
            data: rows.concat(),
        })
    }

    // --- shape and indexing --------------------------------------------------

    /// Infallible: the shape was validated at construction.
    pub fn shape(&self) -> (usize, usize) {
        (self.rows, self.cols)
    }

    /// `None` when out of range. Negative indices cannot even be passed: `usize`.
    pub fn get(&self, i: usize, j: usize) -> Option<i64> {
        // Check both bounds: data.get(i * cols + j) alone would accept (0, cols)
        // and silently return the first element of the next row.
        (i < self.rows && j < self.cols).then(|| self.data[i * self.cols + j])
    }

    /// Nested copy, for tests and printing.
    pub fn to_rows(&self) -> Vec<Vec<i64>> {
        self.data.chunks(self.cols).map(<[i64]>::to_vec).collect()
    }

    // --- transpose and multiplication ----------------------------------------

    pub fn transpose(&self) -> Self {
        let data = (0..self.cols)
            .flat_map(|j| (0..self.rows).map(move |i| self.data[i * self.cols + j]))
            .collect();
        Self {
            rows: self.cols,
            cols: self.rows,
            data,
        }
    }

    pub fn matmul(&self, other: &Self) -> Result<Self, MatrixError> {
        if self.cols != other.rows {
            return Err(MatrixError::DimMismatch {
                left: self.shape(),
                right: other.shape(),
            });
        }
        let t = other.transpose(); // columns of `other` become contiguous rows
        let data = self
            .data
            .chunks(self.cols)
            .flat_map(|row| {
                t.data
                    .chunks(t.cols)
                    .map(move |col| row.iter().zip(col).map(|(x, y)| x * y).sum::<i64>())
            })
            .collect();
        Ok(Self {
            rows: self.rows,
            cols: other.cols,
            data,
        })
    }
}
