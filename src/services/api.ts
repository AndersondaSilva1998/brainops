// Thin HTTP client for the local AI/RAG API (e.g. Node/Python + Ollama).
// Base URL is configurable via VITE_API_URL so nothing is locked to any host.

const BASE_URL =
  (import.meta.env.VITE_API_URL as string | undefined) ?? "http://localhost:8000";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });
  if (!res.ok) {
    throw new ApiError(await res.text().catch(() => res.statusText), res.status);
  }
  // /health may return plain text; guard accordingly.
  const ct = res.headers.get("content-type") ?? "";
  return (ct.includes("application/json") ? await res.json() : ((await res.text()) as unknown)) as T;
}

export const api = {
  baseUrl: BASE_URL,
  get: <T>(path: string) => request<T>(path, { method: "GET" }),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "POST", body: JSON.stringify(body) }),
};
