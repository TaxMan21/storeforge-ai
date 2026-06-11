export async function apiFetch<T = any>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  const data = await res.json();

  if (!res.ok || data.success === false) {
    throw new Error(data.error || `Request failed with status ${res.status}`);
  }

  return data.data ?? data;
}

export async function apiGet<T = any>(url: string): Promise<T> {
  return apiFetch<T>(url, { method: "GET" });
}

export async function apiPost<T = any>(url: string, body?: any): Promise<T> {
  return apiFetch<T>(url, {
    method: "POST",
    body: body ? JSON.stringify(body) : undefined,
  });
}

export async function apiPatch<T = any>(url: string, body?: any): Promise<T> {
  return apiFetch<T>(url, {
    method: "PATCH",
    body: body ? JSON.stringify(body) : undefined,
  });
}

export async function apiDelete<T = any>(url: string): Promise<T> {
  return apiFetch<T>(url, { method: "DELETE" });
}
