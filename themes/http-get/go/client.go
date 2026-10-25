// Package httpget returns HTTP status codes with net/http.
package httpget

import (
	"net/http"
	"time"
)

// GetStatus returns the status code of a GET request.
//
// Non-2xx responses are returned with a nil error. Transport failures are
// returned as an error (a *url.Error wrapping, e.g., a *net.OpError).
func GetStatus(url string, timeout time.Duration) (int, error) {
	client := &http.Client{
		Timeout: timeout,
		// http.Client follows up to 10 redirects by default.
		// ErrUseLastResponse returns the 3xx response itself instead.
		CheckRedirect: func(*http.Request, []*http.Request) error {
			return http.ErrUseLastResponse
		},
	}
	resp, err := client.Get(url)
	if err != nil {
		return 0, err
	}
	defer resp.Body.Close()
	return resp.StatusCode, nil
}
