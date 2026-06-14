/*
 * Загрузка и удаление аватара пользователя.
 */
import {
  apiRequest,
  getApiBaseUrl,
  apiUpload,
  hasApiBaseUrl,
  resolveMediaUrl,
} from "./client";
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
   * Загружает аватар пользователя.
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
   * Удаляет аватар пользователя.
   * @param {string|number} userId
   * @returns {Promise<unknown>}
   */
  deleteUserAvatar(userId) {
    return apiUpload(`/pictures/users/${userId}`, null, { method: "DELETE" });
  },

  /**
   * Загружает медиа с JWT и возвращает blob:-URL для <img>.
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
   * Читает avatar_url через GET /pictures/users/{id} (JSON, не файл).
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
   * Подбирает рабочий src аватара: blob для API-медиа или внешний URL.
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
   * Загружает аватар с JWT и возвращает blob:-URL для <img>.
   * @param {string|number} userId
   * @returns {Promise<string>}
   */
  async fetchUserAvatarObjectUrl(userId) {
    return this.resolveUserAvatarObjectUrl({ userId });
  },
};

const mockPicturesApi = {
  uploadUserAvatar: async () => ({ avatar_url: "" }),
  deleteUserAvatar: async () => ({ success: true }),
  fetchUserAvatarUrl: async () => "",
  fetchAuthenticatedMediaObjectUrl: async () => "",
  resolveUserAvatarObjectUrl: async () => "",
  fetchUserAvatarObjectUrl: async () => "",
};

export const picturesApi = hasApiBaseUrl() ? realPicturesApi : mockPicturesApi;
