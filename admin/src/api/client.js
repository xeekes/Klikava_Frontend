import { ApiError } from "./errors";
import { getPanelToken } from "../utils/panelSession";

const BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

export const hasApiBaseUrl = () => Boolean(BASE_URL);

const getAuthToken = () => getPanelToken();

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

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError(
      response.status,
      data?.message || response.statusText || "Request failed",
      data,
    );
  }

  return data;
};
