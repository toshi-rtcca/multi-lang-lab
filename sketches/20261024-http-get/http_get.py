# /// script
# requires-python = ">=3.11"
# dependencies = ["httpx2", "pytest"]
# ///
"""Sketch: HTTP GET -> status code with httpx2.

Run:  uv run http_get.py <url>
Test: uv run --with httpx2 --with pytest pytest http_get.py
"""

import sys
import threading
from collections.abc import Iterator
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

import httpx2
import pytest


def get_status(url: str, timeout: float = 5.0) -> int:
    # Non-2xx responses are not errors here; only transport failures raise.
    return httpx2.get(url, timeout=timeout).status_code


def main() -> int:
    if len(sys.argv) != 2:
        print("usage: http_get.py <url>", file=sys.stderr)
        return 1
    try:
        print(get_status(sys.argv[1]))
    except httpx2.HTTPError as e:
        print(f"error: {e}", file=sys.stderr)
        return 1
    return 0


# --- tests -------------------------------------------------------------------

# path -> status returned by the local test server
ROUTES = {"/ok": 200, "/missing": 404, "/error": 500, "/redirect": 302}

CASES = [
    ("ok", "/ok", 200),
    ("not-found", "/missing", 404),
    ("server-error", "/error", 500),
    # httpx2 does not follow redirects by default (unlike requests)
    ("redirect-not-followed", "/redirect", 302),
    ("unknown-path", "/nope", 404),
]


class _Handler(BaseHTTPRequestHandler):
    def do_GET(self) -> None:
        status = ROUTES.get(self.path, 404)
        self.send_response(status)
        if status == 302:
            self.send_header("Location", "/ok")
        self.send_header("Content-Length", "0")
        self.end_headers()

    def log_message(self, format: str, *args: object) -> None:
        pass  # keep test output quiet


@pytest.fixture(scope="module")
def base_url() -> Iterator[str]:
    # Port 0 lets the OS pick a free port.
    server = ThreadingHTTPServer(("127.0.0.1", 0), _Handler)
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    yield f"http://127.0.0.1:{server.server_port}"
    server.shutdown()
    server.server_close()


@pytest.mark.parametrize(("name", "path", "expected"), CASES, ids=[c[0] for c in CASES])
def test_get_status(base_url: str, name: str, path: str, expected: int) -> None:
    assert get_status(base_url + path) == expected


def test_connection_refused() -> None:
    # Bind then close to obtain a port that nothing listens on.
    server = ThreadingHTTPServer(("127.0.0.1", 0), _Handler)
    port = server.server_port
    server.server_close()
    with pytest.raises(httpx2.ConnectError):
        get_status(f"http://127.0.0.1:{port}/", timeout=1.0)


if __name__ == "__main__":
    sys.exit(main())
