/*
 * API авторизации с переключением mock / реальный бэкенд.
 * Mock подгружается динамически, чтобы prod-сборки могли исключить auth.mock.js.
 */
import { apiRequest } from "./client";
import { ApiError } from "./errors";

/**
 * Преобразует payload пользователя FastAPI в плоскую структуру для AuthContext.
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
  };
};

/**
 * Нормализует ответ бэкенда авторизации в token и поля пользователя.
 * @param {{ access_token: string, user: object }} payload
 * @returns {{ token: string, user: object|null }}
 */
const mapAuthResponse = (payload) => ({
  token: payload.access_token,
  user: mapMarketplaceUser(payload.user),
});

/**
 * Очищает строку и приводит к безопасному для бэкенда login-slug (нижний регистр, буквы, цифры, _).
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
 * Формирует уникальный login из явного login, префикса email, имени или метки времени.
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
 * Бросает ApiError 501 — функция недоступна на текущем бэкенде.
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
   * Аутентификация на бэкенде и маппинг ответа для сессии приложения.
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
   * Регистрация нового пользователя с немедленным входом для возврата сессии.
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
   * Выход на клиенте; для JWT не требуется инвалидация сессии на бэкенде.
   * @returns {Promise<{ success: boolean }>}
   */
  async logout() {
    return { success: true };
  },

  /**
   * Загрузка профиля авторизованного пользователя с бэкенда.
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
 * Прокси с ленивой загрузкой auth.mock.js при первом вызове (dev без API URL).
 * @returns {typeof realAuthApi}
 */
const createLazyMockAuthApi = () => {
  /** @type {Promise<typeof realAuthApi>|null} */
  let mockImplPromise = null;

  /**
   * Однократно резолвит динамически импортированную mock-реализацию за сессию.
   * @returns {Promise<typeof realAuthApi>}
   */
  const resolveMockImpl = async () => {
    if (!mockImplPromise) {
      mockImplPromise = import("./auth.mock.js").then(
        (module) => module.mockAuthApi,
      );
    }
    return mockImplPromise;
  };

  return Object.fromEntries(
    AUTH_METHODS.map((methodName) => [
      methodName,
      async (...args) => (await resolveMockImpl())[methodName](...args),
    ]),
  );
};

/**
 * Фасад Auth API: реальный бэкенд при VITE_API_BASE_URL на этапе сборки;
 * иначе — ленивый mock-прокси в отдельном чанке.
 */
export const authApi = import.meta.env.VITE_API_BASE_URL
  ? realAuthApi
  : createLazyMockAuthApi();
