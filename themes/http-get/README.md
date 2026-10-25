# HTTP GET

## Task

Send an HTTP GET request with each language's de facto **synchronous** HTTP client and return the response status code.

| Language | API | Client |
|----------|-----|--------|
| Python | `get_status(url: str, timeout: float = 5.0) -> int` (raises on failure) | `httpx2` |
| TypeScript | `getStatus(url: string, timeoutMs = 5000): Promise<number>` | built-in `fetch` |
| Go | `GetStatus(url string, timeout time.Duration) (int, error)` | `net/http` |
| Rust | `get_status(url: &str, timeout: Duration) -> Result<u16, Error>` | `ureq` |

Rules:

- Non-2xx responses are **values**, not errors.
- Redirects are always disabled inside the implementation (a 302 is returned as 302).
- Only transport failures are errors. `cases.json` names them with a language-neutral kind (`"connect"`); each language's tests map it to its own error type.
- Tests start a local HTTP server on `127.0.0.1`, port 0. No external network.

Out of scope: async clients, following redirects, concurrent requests (future themes).

Spec: [issue #36](https://github.com/toshi-rtcca/multi-lang-lab/issues/36). Sketch: [`sketches/20261024-http-get/`](../../sketches/20261024-http-get/).

## Test cases

See [`cases.json`](cases.json). Test servers serve `/ok` (200), `/missing` (404), `/error` (500), and `/redirect` (302 → `/ok`).

```sh
make py-test   # or ts-test / go-test / rs-test, or `make test` for all
```

## Language Comparison

| Aspect | Python | TypeScript | Go | Rust |
|--------|--------|------------|-----|------|
| Client | `httpx2` (third-party) | `fetch` (built-in) | `net/http` (stdlib) | `ureq` 3 (third-party; no stdlib client) |
| Sync / async | Sync function | `async` / `Promise` (fetch has no sync form) | Blocking call | Blocking call |
| 4xx / 5xx by default | Value | Value | Value | **`Err(Error::StatusCode)`** — disabled with `.http_status_as_error(false)` |
| Redirects by default | Not followed | Followed | Followed (up to 10) | Followed (up to 10) |
| Disabling redirects | `follow_redirects=False` | `redirect: "manual"` | `CheckRedirect` returning `http.ErrUseLastResponse` | `.max_redirects(0)` |
| Timeout | `timeout=` argument | `signal: AbortSignal.timeout(ms)` | `http.Client{Timeout}` | `.timeout_global(Some(d))` |
| Connection refused | Raises `httpx2.ConnectError` | Rejects with `TypeError`, `code: "ConnectionRefused"` (Bun) | `error` wrapping `*net.OpError` (`Op == "dial"`) | Own `Error::Connect`, mapped from `ureq::Error::Io` (`ConnectionRefused`) |
| Error model | Exception hierarchy (`ConnectError` < … < `HTTPError`) | Rejected promise, untyped (`catch (e: unknown)`) | `error` value + `errors.As` | `Result` + own `enum`, `From<ureq::Error>` for `?` |
| Test server | `http.server.ThreadingHTTPServer` in a thread | `Bun.serve({ port: 0 })` | `httptest.NewServer` | Hand-written `std::net::TcpListener` |
| Reading `cases.json` | `json` + `pathlib` | `import cases from "../../cases.json"` | `encoding/json` into a tagged struct | `serde` + `serde_json` (dev-dependencies) |

### Version notes

Checked during implementation (2026-10):

- **ureq 3.5.0**: `http_status_as_error` defaults to `true`, so 4xx/5xx are `Err(Error::StatusCode(u16))` unless disabled. `max_redirects(0)` returns the 3xx response as-is (no `TooManyRedirects` error). Connection refused surfaces as `ureq::Error::Io` with `ErrorKind::ConnectionRefused`, not `Error::ConnectionFailed`.
- **Bun 1.4.2**: `fetch` with `redirect: "manual"` returns the 302 response. Connection refused rejects with a `TypeError` whose `code` is `"ConnectionRefused"` (Node.js instead sets `cause.code === "ECONNREFUSED"`).
- **httpx2 2.13**: same API as `httpx`; redirects are not followed by default, but the implementation passes `follow_redirects=False` explicitly.
