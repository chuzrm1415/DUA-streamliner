import { appConfig } from "@/config/app.config";
import type { ApiError } from "@/types";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface RequestOptions<TBody = unknown> {
  method?: HttpMethod;
  body?: TBody;
  headers?: Record<string, string>;
  /** Auth token (JWT). If omitted the client tries to read it from the session. */
  token?: string;
}

/**
 * Generic HTTP client that wraps fetch.
 * All requests are sent to NEXT_PUBLIC_API_BASE_URL.
 */
export async function apiRequest<TResponse, TBody = unknown>(
  endpoint: string,
  options: RequestOptions<TBody> = {}
): Promise<TResponse> {
  const { method = "GET", body, headers = {}, token } = options;

  const url = `${appConfig.apiBaseUrl}${endpoint}`;

  const requestHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...headers,
  };

  if (token) {
    requestHeaders["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    method,
    headers: requestHeaders,
    body: body ? JSON.stringify(body) : undefined,
    // Include credentials for same-origin cookies
    credentials: "include",
  });

  if (!response.ok) {
    let errorPayload: ApiError;
    try {
      errorPayload = await response.json();
    } catch {
      errorPayload = {
        statusCode: response.status,
        message: response.statusText,
      };
    }
    throw errorPayload;
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return undefined as TResponse;
  }

  return response.json() as Promise<TResponse>;
}
