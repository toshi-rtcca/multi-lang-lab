# Notes: http-get (Python / httpx2)

- `httpx2` is Pydantic's maintained continuation of `httpx`; the API is the same (`httpx2.get(url).status_code`).
- Non-2xx responses are values, not errors. Only `raise_for_status()` turns them into `HTTPStatusError`.
- Redirects are **not** followed by default (unlike `requests`): `/redirect` returns 302. Opt in with `follow_redirects=True`.
- Transport failures form a hierarchy: `ConnectError` < `NetworkError` < `TransportError` < `RequestError` < `HTTPError`. Catching `HTTPError` covers both transport and status errors.
- Tests run against `http.server.ThreadingHTTPServer` on port 0 in a background thread — no external network.

## Comparison points if promoted to a theme

- Standard library vs third-party client (Go `net/http`, Bun `fetch`, Rust `reqwest`/`ureq`)
- Sync vs async API (Python offers both; Rust `reqwest` is async-first)
- Default redirect behavior and how a "4xx/5xx" is represented (value vs error)
- In-test HTTP servers (`httptest.NewServer`, `Bun.serve`, etc.)
