export async function requestJson<T>(url: string, options: RequestInit = {}, message = "Request failed. Please retry."): Promise<T> {
  const response = await fetch(url, { ...options, signal: options.signal ?? AbortSignal.timeout(20_000) });
  const data = await response.json().catch(() => null);
  if (!response.ok || data === null) throw new Error(typeof data?.error === "string" ? data.error : message);
  return data as T;
}
