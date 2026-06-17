/*
 * Mock pictures API for local development without VITE_API_BASE_URL.
 * Loaded via dynamic import so production bundles can exclude this module.
 */

/** Mock pictures API with the same method surface as realPicturesApi. */
export const mockPicturesApi = {
  uploadUserAvatar: async () => ({ avatar_url: "" }),
  deleteUserAvatar: async () => ({ success: true }),
  fetchUserAvatarUrl: async () => "",
  fetchAuthenticatedMediaObjectUrl: async () => "",
  resolveUserAvatarObjectUrl: async () => "",
  fetchUserAvatarObjectUrl: async () => "",
};
