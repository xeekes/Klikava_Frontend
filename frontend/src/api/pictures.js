/*
 * Uploading and deleting a user's avatar.
 */
import {
  apiRequest,
  getApiBaseUrl,
  apiUpload,
  hasApiBaseUrl,
  resolveMediaUrl,
} from "./client";
import { createLazyMockApi } from "./createLazyMockApi";
import { pickUserAvatar } from "./mapUserData";

const getAuthToken = () => localStorage.getItem("auth_token");

/**
 * @param {string} url
 * @returns {boolean}
 */
export const isApiMediaUrl = (url) => {
  if (!url || /^(blob:|data:)/i.test(url)) {
    return false;
  }
  const baseUrl = getApiBaseUrl();
  if (!baseUrl) {
    return false;
  }
  return resolveMediaUrl(url).startsWith(baseUrl);
};

/**
 * @param {Response} response
 * @returns {Promise<object|null>}
 */
const readJsonPayload = async (response) => {
  try {
    return await response.json();
  } catch {
    return null;
  }
};

/**
 * @param {unknown} payload
 * @returns {unknown}
 */
const unwrapPayload = (payload) => {
  if (
    payload &&
    typeof payload === "object" &&
    "data" in payload &&
    payload.data !== null &&
    payload.data !== undefined
  ) {
    return payload.data;
  }
  return payload;
};

const realPicturesApi = {
  /**
   * Loads the user's avatar.
   * @param {string|number} userId
   * @param {File} file
   * @returns {Promise<unknown>}
   */
  uploadUserAvatar(userId, file) {
    const formData = new FormData();
    formData.append("file", file);
    return apiUpload(`/pictures/users/${userId}`, formData, { method: "POST" });
  },

  /**
   * Deletes a user's avatar.
   * @param {string|number} userId
   * @returns {Promise<unknown>}
   */
  deleteUserAvatar(userId) {
    return apiUpload(`/pictures/users/${userId}`, null, { method: "DELETE" });
  },

  /**
   * Loads media from a JWT and returns a blob:-URL for an <img>.
   * @param {string} url
   * @returns {Promise<string>}
   */
  async fetchAuthenticatedMediaObjectUrl(url) {
    const token = getAuthToken();
    const resolvedUrl = resolveMediaUrl(url);
    if (!resolvedUrl || !token) {
      return "";
    }

    const response = await fetch(resolvedUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      return "";
    }

    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const payload = unwrapPayload(await readJsonPayload(response));
      const nestedUrl = pickUserAvatar(payload);
      if (nestedUrl && nestedUrl !== resolvedUrl) {
        return this.fetchAuthenticatedMediaObjectUrl(nestedUrl);
      }
      return "";
    }

    const blob = await response.blob();
    if (!blob.size || !blob.type.startsWith("image/")) {
      return "";
    }
    return URL.createObjectURL(blob);
  },

  /**
   * Reads avatar_url via GET /pictures/users/{id} (JSON, not a file).
   * @param {string|number} userId
   * @returns {Promise<string>}
   */
  async fetchUserAvatarUrl(userId) {
    try {
      const data = await apiRequest(`/pictures/users/${userId}`, {
        method: "GET",
      });
      return pickUserAvatar(data);
    } catch {
      return "";
    }
  },

  /**
   * Selects a working avatar src: blob for API media or external URL.
   * @param {{ userId: string|number, avatarUrl?: string }} params
   * @returns {Promise<string>}
   */
  async resolveUserAvatarObjectUrl({ userId, avatarUrl = "" }) {
    if (!hasApiBaseUrl() || !userId) {
      return "";
    }

    let resolvedAvatarUrl = avatarUrl;
    if (!resolvedAvatarUrl || resolvedAvatarUrl.startsWith("avatar:")) {
      resolvedAvatarUrl = await this.fetchUserAvatarUrl(userId);
    }

    if (!resolvedAvatarUrl) {
      return "";
    }

    if (!isApiMediaUrl(resolvedAvatarUrl)) {
      return resolvedAvatarUrl;
    }

    return this.fetchAuthenticatedMediaObjectUrl(resolvedAvatarUrl);
  },

  /**
   * Loads an avatar from a JWT and returns a blob:-URL for an <img>.
   * @param {string|number} userId
   * @returns {Promise<string>}
   */
  async fetchUserAvatarObjectUrl(userId) {
    return this.resolveUserAvatarObjectUrl({ userId });
  },
};

const PICTURES_METHODS = [
  "uploadUserAvatar",
  "deleteUserAvatar",
  "fetchUserAvatarUrl",
  "fetchAuthenticatedMediaObjectUrl",
  "resolveUserAvatarObjectUrl",
  "fetchUserAvatarObjectUrl",
];

/**
 * Pictures API facade: real backend with VITE_API_BASE_URL at build stage;
 * otherwise - a lazy mock proxy in a separate chunk.
 */
export const picturesApi = import.meta.env.VITE_API_BASE_URL
  ? realPicturesApi
  : createLazyMockApi(PICTURES_METHODS, () =>
      import("./pictures.mock.js").then((module) => module.mockPicturesApi),
    );
