/**
 * Return the status code of a GET request.
 *
 * Non-2xx responses resolve normally. Transport failures reject with an
 * error whose `code` Bun sets (e.g. "ECONNREFUSED"); a timeout rejects
 * with a `DOMException` named "TimeoutError".
 */
export async function getStatus(url: string, timeoutMs = 5000): Promise<number> {
  const response = await fetch(url, {
    // fetch follows redirects by default; "manual" returns the 3xx as-is.
    redirect: "manual",
    signal: AbortSignal.timeout(timeoutMs),
  });
  return response.status;
}
