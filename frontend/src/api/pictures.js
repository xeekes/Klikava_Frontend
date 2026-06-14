/*
 * Загрузка и удаление аватара пользователя.
 */
import { apiUpload, hasApiBaseUrl } from "./client";

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
};

const mockPicturesApi = {
  uploadUserAvatar: async () => ({ avatar_url: "" }),
  deleteUserAvatar: async () => ({ success: true }),
};

export const picturesApi = hasApiBaseUrl() ? realPicturesApi : mockPicturesApi;
