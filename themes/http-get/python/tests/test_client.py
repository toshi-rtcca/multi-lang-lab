import json
import threading
from collections.abc import Iterator
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

import httpx2
import pytest

from http_get import get_status

CASES = json.loads((Path(__file__).parents[2] / "cases.json").read_text())

# Language-neutral error kinds in cases.json -> Python exception types.
ERRORS: dict[str, type[Exception]] = {"connect": httpx2.ConnectError}

ROUTES = {"/ok": 200, "/missing": 404, "/error": 500, "/redirect": 302}


class Handler(BaseHTTPRequestHandler):
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
    server = ThreadingHTTPServer(("127.0.0.1", 0), Handler)
    threading.Thread(target=server.serve_forever, daemon=True).start()
    yield f"http://127.0.0.1:{server.server_port}"
    server.shutdown()
    server.server_close()


@pytest.fixture
def closed_port_url() -> str:
    # Bind then close to obtain a port that nothing listens on.
    server = ThreadingHTTPServer(("127.0.0.1", 0), Handler)
    port = server.server_port
    server.server_close()
    return f"http://127.0.0.1:{port}/"


@pytest.mark.parametrize("case", CASES, ids=[c["name"] for c in CASES])
def test_get_status(case: dict, base_url: str, closed_port_url: str) -> None:
    if "expected_error" in case:
        with pytest.raises(ERRORS[case["expected_error"]]):
            get_status(closed_port_url, timeout=1.0)
    else:
        assert get_status(base_url + case["path"]) == case["expected_status"]
