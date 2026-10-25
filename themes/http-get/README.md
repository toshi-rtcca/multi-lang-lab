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

<!-- Filled in once all four implementations are done. -->
