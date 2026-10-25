package httpget

import (
	"encoding/json"
	"errors"
	"net"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"
	"time"
)

type testCase struct {
	Name           string `json:"name"`
	Path           string `json:"path"`
	Target         string `json:"target"`
	ExpectedStatus int    `json:"expected_status"`
	ExpectedError  string `json:"expected_error"`
}

// isErrorKind maps language-neutral error kinds in cases.json to Go errors.
func isErrorKind(err error, kind string) bool {
	var opErr *net.OpError
	switch kind {
	case "connect":
		return errors.As(err, &opErr) && opErr.Op == "dial"
	}
	return false
}

var routes = map[string]int{"/ok": 200, "/missing": 404, "/error": 500, "/redirect": 302}

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

func closedPortURL(t *testing.T) string {
	t.Helper()
	// Bind then close to obtain a port that nothing listens on.
	ln, err := net.Listen("tcp", "127.0.0.1:0")
	if err != nil {
		t.Fatal(err)
	}
	addr := ln.Addr().String()
	ln.Close()
	return "http://" + addr + "/"
}

func TestGetStatus(t *testing.T) {
	// httptest.NewServer listens on 127.0.0.1 with an OS-assigned port.
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		status, ok := routes[r.URL.Path]
		if !ok {
			status = http.StatusNotFound
		}
		if status == http.StatusFound {
			w.Header().Set("Location", "/ok")
		}
		w.WriteHeader(status)
	}))
	defer server.Close()

	for _, c := range loadCases(t) {
		t.Run(c.Name, func(t *testing.T) {
			if c.ExpectedError != "" {
				_, err := GetStatus(closedPortURL(t), time.Second)
				if !isErrorKind(err, c.ExpectedError) {
					t.Fatalf("want %q error, got %v", c.ExpectedError, err)
				}
				return
			}
			got, err := GetStatus(server.URL+c.Path, 5*time.Second)
			if err != nil {
				t.Fatal(err)
			}
			if got != c.ExpectedStatus {
				t.Errorf("got %d, want %d", got, c.ExpectedStatus)
			}
		})
	}
}
