/*
 * Authorization API with mock/real backend switching.
 * The mock is loaded dynamically so that prod builds can exclude auth.mock.js.
 */
import { apiRequest } from "./client";
import { createLazyMockApi } from "./createLazyMockApi";
import { ApiError } from "./errors";
import { pickUserAvatar } from "./mapUserData";

/**
 * Converts a FastAPI user's payload into a flat structure for the AuthContext.
 * @param {object|null|undefined} user
 * @returns {object|null}
 */
const mapMarketplaceUser = (user) => {
  if (!user) {
    return null;
  }
  const emailOrPhone = user.email || user.phone_number || user.login || "";
  return {
    id: String(user.id),
    emailOrPhone,
    displayName: user.name || emailOrPhone.split("@")[0] || "User",
    roles: user.roles || [],
    name: user.name || "",
    email: user.email || "",
    phone_number: user.phone_number || "",
    avatar_url: user.avatar_url || "",
    avatar: pickUserAvatar(user),
  };
};

/**
 * Normalizes the authorization backend response to token and user fields.
 * @param {{ access_token: string, user: object }} payload
 * @returns {{ token: string, user: object|null }}
 */
const mapAuthResponse = (payload) => ({
  token: payload.access_token,
  user: mapMarketplaceUser(payload.user),
});

/**
 * Clears the string and results in a backend-safe login-slug (lower case, letters, numbers, _).
 * @param {string} value
 * @returns {string}
 */
const sanitizeLogin = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "")
    .slice(0, 32);

/**
 * Forms a unique login from an explicit login, email prefix, name, or timestamp.
 * @param {{ emailOrPhone: string, name?: string, login?: string }} params
 * @returns {string}
 */
const resolveLogin = ({ emailOrPhone, name, login }) => {
  if (login?.trim().length >= 2) {
    return login.trim().slice(0, 32);
  }
  const fromEmail = emailOrPhone.includes("@")
    ? emailOrPhone.split("@")[0].trim()
    : emailOrPhone.trim();
  if (fromEmail.length >= 2) {
    return fromEmail.slice(0, 32);
  }
  const fromName = sanitizeLogin(name);
  if (fromName.length >= 2) {
    return fromName;
  }
  return `${fromEmail || "user"}${Date.now().toString(36).slice(-4)}`.slice(
    0,
    32,
  );
};

/**
 * Throws ApiError 501 - the function is not available on the current backend.
 * @param {string} feature
 * @returns {never}
 */
const unsupportedApiFlow = (feature) => {
  throw new ApiError(
    501,
    `${feature} is not available on the current backend yet`,
  );
};

const realAuthApi = {
  /**
   * Authentication on the backend and response mapping for the application session.
   * @param {{ emailOrPhone: string, password: string }} params
   * @returns {Promise<{ token: string, user: object|null }>}
   */
  async login({ emailOrPhone, password }) {
    const payload = await apiRequest("/users/login", {
      method: "POST",
      body: {
        login_email: emailOrPhone.trim(),
        password,
      },
    });
    return mapAuthResponse(payload);
  },

  /**
   * Register a new user with immediate login to return the session.
   * @param {{ emailOrPhone: string, password: string, name?: string, login?: string }} params
   * @returns {Promise<{ token: string, user: object|null }>}
   */
  async register({ emailOrPhone, password, name, login }) {
    const email = emailOrPhone?.includes("@")
      ? emailOrPhone.trim()
      : `${emailOrPhone.trim()}@klikava.local`;
    const resolvedLogin = resolveLogin({ emailOrPhone, name, login });
    await apiRequest("/users/register", {
      method: "POST",
      body: {
        login: resolvedLogin,
        email,
        password,
        name: name?.trim() || resolvedLogin,
      },
    });
    const loginPayload = await apiRequest("/users/login", {
      method: "POST",
      body: {
        login_email: resolvedLogin,
        password,
      },
    });
    return mapAuthResponse(loginPayload);
  },

  /**
   * @returns {never}
   */
  sendVerificationCode() {
    return unsupportedApiFlow("Email verification");
  },

  /**
   * @returns {never}
   */
  verifyCode() {
    return unsupportedApiFlow("Email verification");
  },

  /**
   * @returns {never}
   */
  createPassword() {
    return unsupportedApiFlow("Password setup");
  },

  /**
   * @returns {never}
   */
  resetPassword() {
    return unsupportedApiFlow("Password reset");
  },

  /**
   * @returns {never}
   */
  loginWithGoogle() {
    return unsupportedApiFlow("Google login");
  },

  /**
   * Exit on the client; JWT does not require session invalidation on the backend.
   * @returns {Promise<{ success: boolean }>}
   */
  async logout() {
    return { success: true };
  },

  /**
   * Loading an authorized user profile from the backend.
   * @returns {Promise<object|null>}
   */
  async getCurrentUser() {
    const user = await apiRequest("/users/me", { method: "GET" });
    return mapMarketplaceUser(user);
  },
};

const AUTH_METHODS = [
  "login",
  "register",
  "sendVerificationCode",
  "verifyCode",
  "createPassword",
  "resetPassword",
  "loginWithGoogle",
  "logout",
  "getCurrentUser",
];

/**
 * Auth API facade: real backend with VITE_API_BASE_URL at build stage;
 * otherwise - a lazy mock proxy in a separate chunk.
 */
export const authApi = import.meta.env.VITE_API_BASE_URL
  ? realAuthApi
  : createLazyMockApi(AUTH_METHODS, () =>
      import("./auth.mock.js").then((module) => module.mockAuthApi),
    );
