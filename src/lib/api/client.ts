import axios, { type AxiosError } from "axios";
import type { ApiError } from "@/types";

/**
 * Pre-configured Axios instance for all client-side API calls.
 * - Base URL defaults to the app origin (Next.js API routes).
 * - JSON content type by default.
 * - Response interceptor extracts a clean error message from API responses.
 */
const apiClient = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15_000,
});

// Response interceptor: normalize error messages
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiError>) => {
    const message =
      error.response?.data?.error ??
      error.message ??
      "An unexpected error occurred";

    return Promise.reject(new Error(message));
  },
);

export default apiClient;
