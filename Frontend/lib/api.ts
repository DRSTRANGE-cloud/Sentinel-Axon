const configuredBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
const defaultBaseUrl = process.env.NODE_ENV === "production"
  ? "https://sentinel-axon.onrender.com"
  : "http://127.0.0.1:8000";

const apiBaseUrl = (configuredBaseUrl || defaultBaseUrl)
  .replace(/\/+$/, "")
  .replace(/\/v1$/i, "");

export function apiUrl(path: string): string {
  return `${apiBaseUrl}/${path.replace(/^\/+/, "")}`;
}

export async function apiJson<T>(path: string, init: RequestInit = {}): Promise<T> {
  const method = init.method?.toUpperCase() ?? "GET";
  let response: Response;

  try {
    response = await fetch(apiUrl(path), { cache: "no-store", ...init });
  } catch {
    throw new Error(`${method} /${path.replace(/^\/+/, "")} could not reach the Sentinel API.`);
  }

  if (!response.ok) {
    throw new Error(`${method} /${path.replace(/^\/+/, "")} failed with ${response.status}`);
  }

  try {
    return await response.json() as T;
  } catch {
    throw new Error(`${method} /${path.replace(/^\/+/, "")} returned invalid JSON.`);
  }
}

export async function apiBlob(path: string, init: RequestInit = {}): Promise<Blob> {
  const method = init.method?.toUpperCase() ?? "GET";
  let response: Response;

  try {
    response = await fetch(apiUrl(path), { cache: "no-store", ...init });
  } catch {
    throw new Error(`${method} /${path.replace(/^\/+/, "")} could not reach the Sentinel API.`);
  }

  if (!response.ok) {
    throw new Error(`${method} /${path.replace(/^\/+/, "")} failed with ${response.status}`);
  }

  return response.blob();
}
