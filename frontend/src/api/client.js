import { ApiError } from "./errors";

const BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

const getAuthToken = () => localStorage.getItem("auth_token");

const getErrorMessage = (payload, fallback) => {
  if (!payload || typeof payload !== "object") {
    return fallback;
  }

  return (
    payload.meta?.message ||
    payload.message ||
    payload.detail?.[0]?.msg ||
    fallback
  );
};

const unwrapMarketplacePayload = (payload) => {
  if (
    payload &&
    typeof payload === "object" &&
    "status" in payload &&
    "data" in payload
  ) {
    if (payload.status?.is_ok === false) {
      throw new ApiError(
        payload.status?.code || 400,
        getErrorMessage(payload, "Request failed"),
        payload
      );
    }

    return payload.data;
  }

  return payload;
};

export const apiRequest = async (path, options = {}) => {
  const { body, headers: customHeaders, ...rest } = options;

  const headers = {
    "Content-Type": "application/json",
    ...customHeaders,
  };

  const token = getAuthToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    ...rest,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError(
      response.status,
      getErrorMessage(payload, response.statusText || "Request failed"),
      payload
    );
  }

  return unwrapMarketplacePayload(payload);
};

export const hasApiBaseUrl = () => Boolean(BASE_URL);
