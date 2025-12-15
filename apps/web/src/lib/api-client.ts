import { authClient } from "./auth-client"

export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public data?: unknown
  ) {
    super(message)
    this.name = "ApiError"
  }
}

interface ApiClientOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH"
  body?: unknown
  headers?: Record<string, string>
  requireAuth?: boolean
}

/**
 * Centralized API client with error handling and authentication
 */
export async function apiClient<T = unknown>(
  endpoint: string,
  options: ApiClientOptions = {}
): Promise<T> {
  const {
    method = "GET",
    body,
    headers = {},
    requireAuth = true,
  } = options

  const baseUrl = import.meta.env.VITE_RESOURCE_API_URL

  if (!baseUrl) {
    throw new ApiError("API base URL is not configured")
  }

  // Get auth token if required
  let authHeaders: Record<string, string> = {}
  if (requireAuth) {
    const { data: tokenData, error } = await authClient.token()

    if (error || !tokenData?.token) {
      // Redirect to login if no token, preserving the original URL for post‑login redirect
      const redirect = encodeURIComponent(window.location.pathname + window.location.search)
      window.location.href = `/auth/login?redirect=${redirect}`
      throw new ApiError("Authentication required", 401)
    }

    authHeaders = {
      Authorization: `Bearer ${tokenData.token}`,
    }
  }

  // Build request
  const url = `${baseUrl}${endpoint}`
  const requestHeaders: Record<string, string> = {
    ...headers,
    ...authHeaders,
  }

  if (body && !headers["Content-Type"]) {
    requestHeaders["Content-Type"] = "application/json"
  }

  const requestInit: RequestInit = {
    method,
    headers: requestHeaders,
  }

  if (body) {
    requestInit.body = JSON.stringify(body)
  }

  try {
    const response = await fetch(url, requestInit)

    // Handle non-OK responses
    if (!response.ok) {
      let errorMessage = `Request failed with status ${response.status}`
      let errorData: unknown

      try {
        errorData = await response.json()
        if (errorData && typeof errorData === "object" && "message" in errorData) {
          errorMessage = String(errorData.message)
        }
      } catch {
        // If JSON parsing fails, use status text
        errorMessage = response.statusText || errorMessage
      }

      // Handle specific status codes
      if (response.status === 401) {
        await authClient.signOut()
        const redirect = encodeURIComponent(window.location.pathname + window.location.search)
        window.location.href = `/auth/login?redirect=${redirect}`
      }
      throw new ApiError(errorMessage, response.status, errorData)
    }

    // Parse response
    const contentType = response.headers.get("content-type")
    if (contentType?.includes("application/json")) {
      return await response.json()
    }

    // Return empty object for no content
    if (response.status === 204) {
      return {} as T
    }

    return await response.text() as T
  } catch (error) {
    // Network errors or other fetch errors
    if (error instanceof ApiError) {
      throw error
    }

    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new ApiError(
        "Network error: Unable to connect to the server. Please check your connection.",
        0
      )
    }

    throw new ApiError(
      error instanceof Error ? error.message : "An unexpected error occurred"
    )
  }
}

/**
 * Convenience methods for common HTTP verbs
 */
export const api = {
  get: <T = unknown>(endpoint: string, options?: Omit<ApiClientOptions, "method">) =>
    apiClient<T>(endpoint, { ...options, method: "GET" }),

  post: <T = unknown>(endpoint: string, body?: unknown, options?: Omit<ApiClientOptions, "method" | "body">) =>
    apiClient<T>(endpoint, { ...options, method: "POST", body }),

  put: <T = unknown>(endpoint: string, body?: unknown, options?: Omit<ApiClientOptions, "method" | "body">) =>
    apiClient<T>(endpoint, { ...options, method: "PUT", body }),

  patch: <T = unknown>(endpoint: string, body?: unknown, options?: Omit<ApiClientOptions, "method" | "body">) =>
    apiClient<T>(endpoint, { ...options, method: "PATCH", body }),

  delete: <T = unknown>(endpoint: string, options?: Omit<ApiClientOptions, "method">) =>
    apiClient<T>(endpoint, { ...options, method: "DELETE" }),
}
