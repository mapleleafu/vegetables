export async function sendRequest<T>(
  url: string,
  options: RequestInit = {},
): Promise<T> {
  const headers: Record<string, string> = {};

  // If we send FormData, we must let the browser set the Content-Type header
  // automatically so it includes the 'boundary' parameter.
  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(url, {
    ...options,
    headers: {
      ...headers,
      ...(options.headers as Record<string, string>),
    },
  });

  // Handle non-2xx responses
  if (!res.ok) {
    let errorMessage = "An unexpected error occurred";

    try {
      const json = await res.json();
      if (json.error) {
        errorMessage = json.error;
      }
    } catch (e) {
      errorMessage = res.statusText;
    }

    throw new Error(errorMessage);
  }

  if (res.status === 204) {
    return {} as T;
  }

  return res.json();
}
