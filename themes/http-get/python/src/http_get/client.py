import httpx2


def get_status(url: str, timeout: float = 5.0) -> int:
    """Return the status code of a GET request.

    Non-2xx responses are returned as values. Transport failures raise
    subclasses of `httpx2.TransportError` (e.g. `httpx2.ConnectError`).
    """
    # httpx2 already defaults to not following redirects; say it explicitly.
    response = httpx2.get(url, timeout=timeout, follow_redirects=False)
    return response.status_code
