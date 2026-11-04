// Package matrixbasic implements basic integer matrix operations
// on a flat, row-major slice.
package matrixbasic

import (
	"errors"
	"fmt"
)

// Sentinel errors, matched with errors.Is. Messages are wrapped with %w.
var (
	ErrInvalidDims = errors.New("invalid dimensions")
	ErrEmpty       = errors.New("empty matrix")
	ErrRagged      = errors.New("ragged matrix")
	ErrOutOfRange  = errors.New("index out of range")
	ErrDimMismatch = errors.New("dimension mismatch")
)

// Matrix stores rows*cols elements in row-major order: element (i, j) is data[i*cols+j].
//
// Fields are unexported, so other packages can only obtain a Matrix through the
// constructors, which guarantee rows >= 1, cols >= 1 and len(data) == rows*cols.
// The one hole Go cannot close is the zero value Matrix{} (0x0).
type Matrix struct {
	rows, cols int
	data       []int
}

// --- construction ------------------------------------------------------------

func Zeros(rows, cols int) (Matrix, error) {
	if rows < 1 || cols < 1 {
		return Matrix{}, fmt.Errorf("%w: got %dx%d", ErrInvalidDims, rows, cols)
	}
	// make() zero-fills; one allocation, so rows cannot share storage by accident.
	return Matrix{rows: rows, cols: cols, data: make([]int, rows*cols)}, nil
}

func Identity(n int) (Matrix, error) {
	m, err := Zeros(n, n)
	if err != nil {
		return Matrix{}, err
	}
	for i := range n {
		m.data[i*n+i] = 1
	}
	return m, nil
}

// FromRows validates a nested slice once and copies it into flat storage.
func FromRows(rows [][]int) (Matrix, error) {
	if len(rows) == 0 || len(rows[0]) == 0 {
		return Matrix{}, ErrEmpty
	}
	cols := len(rows[0])
	data := make([]int, 0, len(rows)*cols)
	for i, row := range rows {
		if len(row) != cols {
			return Matrix{}, fmt.Errorf("%w: row %d has %d columns, expected %d", ErrRagged, i, len(row), cols)
		}
		data = append(data, row...) // copies; the caller's slices are not retained
	}
	return Matrix{rows: len(rows), cols: cols, data: data}, nil
}

// --- shape and indexing ------------------------------------------------------

// Shape needs no error: the constructors already validated it.
func (m Matrix) Shape() (int, int) { return m.rows, m.cols }

func (m Matrix) At(i, j int) (int, error) {
	// int is signed, so negative indices are representable and must be checked.
	if i < 0 || i >= m.rows || j < 0 || j >= m.cols {
		return 0, fmt.Errorf("%w: (%d, %d) for %dx%d matrix", ErrOutOfRange, i, j, m.rows, m.cols)
	}
	return m.data[i*m.cols+j], nil
}

// Rows returns a freshly allocated nested copy (for tests and printing).
func (m Matrix) Rows() [][]int {
	out := make([][]int, m.rows)
	for i := range m.rows {
		// Without the copy, out[i] would alias m.data and leak mutability.
		out[i] = append([]int(nil), m.data[i*m.cols:(i+1)*m.cols]...)
	}
	return out
}

// --- transpose and multiplication --------------------------------------------

// Transpose cannot fail: a valid Matrix always has a valid transpose.
func (m Matrix) Transpose() Matrix {
	t := Matrix{rows: m.cols, cols: m.rows, data: make([]int, len(m.data))}
	for i := range m.rows {
		for j := range m.cols {
			t.data[j*t.cols+i] = m.data[i*m.cols+j]
		}
	}
	return t
}

// Mul returns a*b. Go has no operator overloading, so this is a plain function.
func Mul(a, b Matrix) (Matrix, error) {
	if a.cols != b.rows {
		return Matrix{}, fmt.Errorf("%w: cannot multiply %dx%d by %dx%d", ErrDimMismatch, a.rows, a.cols, b.rows, b.cols)
	}
	c := Matrix{rows: a.rows, cols: b.cols, data: make([]int, a.rows*b.cols)}
	// i-k-j loop order walks both b and c row by row (contiguous in memory).
	for i := range a.rows {
		for k := range a.cols {
			aik := a.data[i*a.cols+k]
			for j := range b.cols {
				c.data[i*c.cols+j] += aik * b.data[k*b.cols+j]
			}
		}
	}
	return c, nil
}
