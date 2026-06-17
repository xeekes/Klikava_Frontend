/*
 * HTTP client for the marketplace backend on FastAPI.
 * Two modes: when VITE_API_BASE_URL is empty, the upper layers use mock/localStorage.
 */
import { ApiError } from "./errors";

/** Normalized origin API without trailing slash. */
export const getApiBaseUrl = () =>
  (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

/**
 * Converts a relative media path to an absolute API URL.
 * @param {string|null|undefined} url
 * @returns {string}
 */
export const resolveMediaUrl = (url) => {
  if (!url || typeof url !== "string") {
    return "";
  }
  if (/^(data:|blob:)/i.test(url)) {
    return url;
  }
  const baseUrl = getApiBaseUrl();
  if (/^https?:\/\//i.test(url)) {
    if (!baseUrl) {
      return url;
    }
    try {
      const parsed = new URL(url);
      if (parsed.pathname.startsWith("/static/")) {
        return `${baseUrl}${parsed.pathname}${parsed.search}${parsed.hash}`;
      }
    } catch {
      return url;
    }
    return url;
  }
  if (!baseUrl) {
    return url;
  }
  return `${baseUrl}${url.startsWith("/") ? url : `/${url}`}`;
};

/**
 * Reads the bearer token saved after a successful login.
 * @returns {string|null}
 */
const getAuthToken = () => localStorage.getItem("auth_token");

/**
 * Extracts a readable message from heterogeneous payload errors.
 * @param {unknown} payload
 * @param {string} fallback
 * @returns {string}
 */
const getErrorMessage = (payload, fallback) => {
  if (!payload || typeof payload !== "object") {
    return fallback;
  }
  /* FastAPI validation errors: detail[] with loc and msg fields. */
  if (Array.isArray(payload.detail) && payload.detail.length > 0) {
    const first = payload.detail[0];
    const field = Array.isArray(first?.loc)
      ? first.loc.filter((part) => part !== "body").join(".")
      : "";
    const message = first?.msg || fallback;
    return field ? `${field}: ${message}` : message;
  }
  return payload.meta?.message || payload.message || fallback;
};

/**
 * Returns internal data or throws an error if the marketplace envelope reports a failure.
 * @param {unknown} payload
 * @returns {unknown}
 */
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
        payload,
      );
    }
    return payload.data;
  }
  return payload;
};

/**
 * Performs an authorized JSON request to the configured origin API.
 * @param {string} path
 * @param {RequestInit & { body?: unknown }} [options]
 * @returns {Promise<unknown>}
 */
export const apiRequest = async (path, options = {}) => {
  const { body, headers: customHeaders, ...rest } = options;
  const headers = {
    ...(body !== undefined && !(body instanceof FormData)
      ? { "Content-Type": "application/json" }
      : {}),
    ...customHeaders,
  };
  const token = getAuthToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    ...rest,
    headers,
    body:
      body === undefined
        ? undefined
        : body instanceof FormData
          ? body
          : JSON.stringify(body),
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new ApiError(
      response.status,
      getErrorMessage(payload, response.statusText || "Request failed"),
      payload,
    );
  }
  return unwrapMarketplacePayload(payload);
};

/**
 * Executes a request with FormData or without a body (upload/delete).
 * @param {string} path
 * @param {FormData|null} [formData]
 * @param {RequestInit} [options]
 * @returns {Promise<unknown>}
 */
export const apiUpload = async (path, formData = null, options = {}) =>
  apiRequest(path, {
    ...options,
    body: formData ?? undefined,
  });

/**
 * Specifies whether to make real HTTP calls instead of mock adapters.
 * @returns {boolean}
 */
export const hasApiBaseUrl = () => Boolean(getApiBaseUrl());
