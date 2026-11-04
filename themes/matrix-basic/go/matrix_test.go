package matrixbasic

import (
	"encoding/json"
	"errors"
	"os"
	"reflect"
	"testing"
)

type testCase struct {
	Name          string          `json:"name"`
	Op            string          `json:"op"`
	Rows          int             `json:"rows"`
	Cols          int             `json:"cols"`
	N             int             `json:"n"`
	M             [][]int         `json:"m"`
	I             int             `json:"i"`
	J             int             `json:"j"`
	A             [][]int         `json:"a"`
	B             [][]int         `json:"b"`
	Expected      json.RawMessage `json:"expected"` // shape depends on op
	ExpectedError string          `json:"expected_error"`
}

// errorKinds maps language-neutral error kinds in cases.json to sentinel errors.
var errorKinds = map[string]error{
	"invalid-dims": ErrInvalidDims,
	"empty":        ErrEmpty,
	"ragged":       ErrRagged,
	"out-of-range": ErrOutOfRange,
	"dim-mismatch": ErrDimMismatch,
}

func loadCases(t *testing.T) []testCase {
	t.Helper()
	data, err := os.ReadFile("../cases.json")
	if err != nil {
		t.Fatal(err)
	}
	var cases []testCase
	if err := json.Unmarshal(data, &cases); err != nil {
		t.Fatal(err)
	}
	return cases
}

// run executes one case. Ops that take a matrix build it with FromRows first,
// so empty/ragged errors come from construction.
func run(c testCase) (any, error) {
	switch c.Op {
	case "zeros":
		m, err := Zeros(c.Rows, c.Cols)
		return m.Rows(), err
	case "identity":
		m, err := Identity(c.N)
		return m.Rows(), err
	case "shape":
		m, err := FromRows(c.M)
		r, k := m.Shape()
		return []int{r, k}, err
	case "get":
		m, err := FromRows(c.M)
		if err != nil {
			return nil, err
		}
		return m.At(c.I, c.J)
	case "transpose":
		m, err := FromRows(c.M)
		return m.Transpose().Rows(), err
	case "matmul":
		a, err := FromRows(c.A)
		if err != nil {
			return nil, err
		}
		b, err := FromRows(c.B)
		if err != nil {
			return nil, err
		}
		p, err := Mul(a, b)
		return p.Rows(), err
	}
	panic("unknown op " + c.Op)
}

func TestCases(t *testing.T) {
	for _, c := range loadCases(t) {
		t.Run(c.Name, func(t *testing.T) {
			got, err := run(c)
			if c.ExpectedError != "" {
				if want := errorKinds[c.ExpectedError]; !errors.Is(err, want) {
					t.Fatalf("got error %v, want %v", err, want)
				}
				return
			}
			if err != nil {
				t.Fatalf("unexpected error: %v", err)
			}
			// Decode expected into the same Go type as got, then compare.
			want := reflect.New(reflect.TypeOf(got))
			if err := json.Unmarshal(c.Expected, want.Interface()); err != nil {
				t.Fatal(err)
			}
			if !reflect.DeepEqual(got, want.Elem().Interface()) {
				t.Fatalf("got %v, want %v", got, want.Elem().Interface())
			}
		})
	}
}

// --- aliasing ----------------------------------------------------------------

func TestFromRowsCopiesInput(t *testing.T) {
	src := [][]int{{1, 2}, {3, 4}}
	m, _ := FromRows(src)
	src[0][0] = 99
	if got := m.Rows(); !reflect.DeepEqual(got, [][]int{{1, 2}, {3, 4}}) {
		t.Fatalf("matrix changed with its input: %v", got)
	}
}

func TestRowsReturnsCopy(t *testing.T) {
	m, _ := FromRows([][]int{{1, 2}, {3, 4}})
	m.Rows()[0][0] = 99
	if v, _ := m.At(0, 0); v != 1 {
		t.Fatalf("Rows() exposed internal storage: At(0,0) = %d", v)
	}
}

func TestSubsliceAliasesBackingArray(t *testing.T) {
	// Contrast: a sub-slice of the flat data shares its backing array,
	// which is why Rows() copies.
	m, _ := Zeros(2, 2)
	row0 := m.data[0:m.cols]
	row0[0] = 9
	if v, _ := m.At(0, 0); v != 9 {
		t.Fatalf("expected aliasing, got %d", v)
	}
}

func TestZeroValueIsNotValid(t *testing.T) {
	// The zero value bypasses the constructors: a 0x0 matrix exists anyway.
	var m Matrix
	if r, c := m.Shape(); r != 0 || c != 0 {
		t.Fatalf("got %dx%d", r, c)
	}
	if _, err := m.At(0, 0); !errors.Is(err, ErrOutOfRange) {
		t.Fatalf("got %v", err)
	}
}

// --- properties --------------------------------------------------------------

func mustFromRows(t *testing.T, rows [][]int) Matrix {
	t.Helper()
	m, err := FromRows(rows)
	if err != nil {
		t.Fatal(err)
	}
	return m
}

func mustMul(t *testing.T, a, b Matrix) Matrix {
	t.Helper()
	p, err := Mul(a, b)
	if err != nil {
		t.Fatal(err)
	}
	return p
}

func TestProperties(t *testing.T) {
	a := mustFromRows(t, [][]int{{1, 2, 3}, {4, 5, 6}})
	b := mustFromRows(t, [][]int{{7, 8}, {9, 10}, {11, 12}})
	i2, _ := Identity(2)
	i3, _ := Identity(3)

	if !reflect.DeepEqual(a.Transpose().Transpose(), a) {
		t.Error("transpose twice changed the matrix")
	}
	if !reflect.DeepEqual(mustMul(t, i2, a), a) || !reflect.DeepEqual(mustMul(t, a, i3), a) {
		t.Error("identity is not neutral")
	}
	if !reflect.DeepEqual(mustMul(t, a, b).Transpose(), mustMul(t, b.Transpose(), a.Transpose())) {
		t.Error("(AB)^T != B^T A^T")
	}
}

func TestZerosRowsAreIndependent(t *testing.T) {
	m, _ := Zeros(2, 2)
	m.data[0] = 9
	if !reflect.DeepEqual(m.Rows(), [][]int{{9, 0}, {0, 0}}) {
		t.Fatalf("got %v", m.Rows())
	}
}
