export async function sendRequest<T>(url: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      // NextAuth automatically handles cookies
    },
    ...options,
  });

  // Handle non-2xx responses
  if (!res.ok) {
    let errorMessage = "An unexpected error occurred";

    try {
      const json = await res.json();
      // The backend now guarantees { error: "Message" } format on failure
      if (json.error) {
        errorMessage = json.error;
      }
    } catch (e) {
      // If parsing JSON fails, fallback to status text
      errorMessage = res.statusText;
    }

    throw new Error(errorMessage);
  }

  if (res.status === 204) {
    return {} as T;
  }

  return res.json();
}
