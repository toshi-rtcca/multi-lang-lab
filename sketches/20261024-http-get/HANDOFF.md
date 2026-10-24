# Handoff: http-get — choosing comparison points

This document is self-contained. It hands a finished Python sketch over to a chat
discussion whose job is to decide what the multi-language theme should compare.

## 1. Purpose

Narrow the candidate comparison points below down to **3–5**, and draft the
new-theme issue (Goal / Comparison points / API signature / Cases / Handoff prompt).

## 2. Project context

- **multi-lang-lab**: the same small task implemented in Python, TypeScript (Bun), Go, and Rust, then compared.
- Two tracks: **Sketch** (quick single-language experiment — this one) → **Theme** (multi-language comparison).
- Theme conventions:
  - Each language implements one function plus tests; a CLI is only a thin wrapper.
  - Test cases live in a shared `cases.json` that every language's tests read.
  - Tests must not use the external network (start a local server inside the test).
  - One theme = one PR, one commit per language (Python first as reference).
  - Implementations favor clarity of the learning point over production quality.

## 3. Sketch summary

Python 3.11+, [`httpx2`](https://github.com/pydantic/httpx2) (Pydantic's maintained continuation of `httpx`, same API).

```python
import httpx2

def get_status(url: str, timeout: float = 5.0) -> int:
    # Non-2xx responses are not errors here; only transport failures raise.
    return httpx2.get(url, timeout=timeout).status_code
```

Tests start `http.server.ThreadingHTTPServer` on `127.0.0.1`, port 0 (OS-assigned), in a
background thread. All 6 cases pass:

| name | request | expected |
|------|---------|----------|
| ok | `GET /ok` | 200 |
| not-found | `GET /missing` | 404 |
| server-error | `GET /error` | 500 |
| redirect-not-followed | `GET /redirect` (302 → `/ok`) | 302 |
| unknown-path | `GET /nope` | 404 |
| connection-refused | closed port | raises `httpx2.ConnectError` |

## 4. Findings so far

- 4xx/5xx are plain values; they become errors only via `raise_for_status()`.
- Redirects are **not** followed by default (unlike `requests`); opt in with `follow_redirects=True`.
- Exception hierarchy: `ConnectError` < `NetworkError` < `TransportError` < `RequestError` < `HTTPError`.
- httpx2 offers both sync (`httpx2.get`) and async (`httpx2.AsyncClient`) APIs.

## 5. Candidate comparison points

Behavior marked *(to verify)* is from memory and must be checked before it becomes a test case.

| # | Point | Hypothesis per language | Decision needed |
|---|-------|-------------------------|-----------------|
| A | Library choice: stdlib vs third-party | Py: `httpx2` (third-party; stdlib `urllib` is awkward). TS: built-in `fetch`. Go: stdlib `net/http`. Rust: no stdlib client — `reqwest` or `ureq` | Allow third-party where the stdlib has no client? |
| B | Sync vs async | Py: both. TS: Promise only. Go: blocking calls, concurrency via goroutines. Rust: `reqwest` is async-first (needs `tokio`; has a `blocking` feature), `ureq` is sync | Is async itself a learning target, or keep everything sync? |
| C | How a non-2xx is represented | Py/TS/Go: status is a value. Rust `ureq` 2.x returns `Err(Status)` for 4xx/5xx *(to verify)*; `reqwest` returns `Ok` | Normalize to "status is a value" in the API? |
| D | Default redirect behavior | httpx2: not followed. Go `http.Client`: followed (up to 10) *(to verify)*. `fetch`: followed by default *(to verify)*. `reqwest`: followed *(to verify)* | Make redirect behavior explicit in the API, or a case showing the defaults differ? |
| E | Error model for transport failures | Py: exception hierarchy. TS: `TypeError` from `fetch` *(to verify)*. Go: `error` value (`*url.Error`). Rust: `Result<_, reqwest::Error>` | How should `cases.json` express an expected error (e.g. `"error": "connect"`)? |
| F | Timeouts | Py: `timeout=` arg. TS: `AbortSignal.timeout()`. Go: `http.Client{Timeout}` / `context`. Rust: builder `.timeout()` | Include a timeout case (needs a slow test server)? |
| G | In-test HTTP server | Py: `http.server` + thread. Go: `httptest.NewServer`. Bun: `Bun.serve({ port: 0 })`. Rust: hand-written `TcpListener`, or `wiremock` / `axum` | Hand-written server (more learning, more code) vs a test crate? |

## 6. Open questions

1. Scope: GET + status code only, or also headers / JSON body?
2. Rust: `reqwest` (async + tokio) or `ureq` (sync) — which teaches more for this theme?
3. Should the API take options (`timeout`, `follow_redirects`) so all languages behave the same, or keep each language's defaults as the point of comparison?
4. `cases.json` shape for success vs error, e.g.
   `{ "name": "ok", "path": "/ok", "expected_status": 200 }` and
   `{ "name": "connection-refused", "target": "closed-port", "expected_error": "connect" }`.
5. Is a CLI wrapper worth keeping, or function + tests only?

## 7. Expected output

A Markdown draft that fills in the new-theme issue template:

```markdown
### Goal
<!-- What this theme is meant to teach. Link the sketch: sketches/20261024-http-get/ -->

### Comparison points
<!-- 3–5 points chosen from section 5 -->

### API signature
<!-- e.g. get_status(url: str, timeout: float) -> int -->

### Cases
| name | input | expected |
|------|-------|----------|

### Handoff prompt
<!-- Prompt for the coding agent (Japanese is fine) -->
```
