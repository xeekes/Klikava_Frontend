/*
 * Mock-реализация авторизации для локальной разработки без VITE_API_BASE_URL.
 * Подгружается через dynamic import, чтобы prod-бандлы могли исключить этот модуль.
 */
import { getPasswordError, isEmailOrPhone } from "../utils/validation";

/**
 * Ждёт указанное число миллисекунд (имитация сетевой задержки).
 * @param {number} ms
 * @returns {Promise<void>}
 */
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Создаёт минимальную mock-запись пользователя по email или телефону.
 * @param {string} emailOrPhone
 * @returns {{ id: string, emailOrPhone: string, displayName: string }}
 */
const mockUser = (emailOrPhone) => ({
  id: "mock-user-1",
  emailOrPhone,
  displayName: emailOrPhone.includes("@") ? emailOrPhone.split("@")[0] : "User",
});

/**
 * Формирует mock-ответ авторизации с токеном по времени и профилем пользователя.
 * @param {string} emailOrPhone
 * @returns {{ token: string, user: object }}
 */
const mockAuthResponse = (emailOrPhone) => ({
  token: `mock-token-${Date.now()}`,
  user: mockUser(emailOrPhone),
});

/** Mock Auth API с тем же набором методов, что и realAuthApi. */
export const mockAuthApi = {
  /**
   * Проверяет учётные данные локально и возвращает имитированную сессию.
   * @param {{ emailOrPhone: string, password: string }} params
   * @returns {Promise<{ token: string, user: object }>}
   */
  async login({ emailOrPhone, password }) {
    await delay(600);
    if (!emailOrPhone || !password) {
      throw new Error("Email/phone and password are required");
    }
    if (!isEmailOrPhone(emailOrPhone)) {
      throw new Error("Enter a valid email or phone number");
    }
    return mockAuthResponse(emailOrPhone);
  },

  /**
   * Запускает mock-регистрацию: выдаёт verification id без создания сессии.
   * @param {{ emailOrPhone: string }} params
   * @returns {Promise<{ verificationId: string }>}
   */
  async register({ emailOrPhone }) {
    await delay(600);
    if (!emailOrPhone) {
      throw new Error("Email or phone is required");
    }
    if (!isEmailOrPhone(emailOrPhone)) {
      throw new Error("Enter a valid email or phone number");
    }
    return { verificationId: `mock-verification-${Date.now()}` };
  },

  /**
   * Имитирует отправку кода подтверждения для потока register или reset.
   * @param {{ emailOrPhone: string, flow: string }} params
   * @returns {Promise<{ verificationId: string }>}
   */
  async sendVerificationCode({ emailOrPhone, flow }) {
    await delay(500);
    return { verificationId: `mock-verification-${flow}-${Date.now()}` };
  },

  /**
   * Проверяет код подтверждения по минимальным правилам длины в mock-режиме.
   * @param {{ verificationId: string, code: string }} params
   * @returns {Promise<{ verified: boolean, verificationId: string }>}
   */
  async verifyCode({ verificationId, code }) {
    await delay(500);
    if (!code || code.length < 4) {
      throw new Error("Invalid verification code");
    }
    return { verified: true, verificationId };
  },

  /**
   * Устанавливает новый пароль после верификации и завершает mock-вход.
   * @param {{ verificationId: string, password: string, confirmPassword: string }} params
   * @returns {Promise<{ token: string, user: object }>}
   */
  async createPassword({ verificationId, password, confirmPassword }) {
    await delay(600);
    const passwordError = getPasswordError(password);
    if (passwordError) {
      throw new Error(passwordError);
    }
    if (password !== confirmPassword) {
      throw new Error("Passwords do not match");
    }
    const emailOrPhone =
      localStorage.getItem("auth_email_or_phone") || "user@example.com";
    return mockAuthResponse(emailOrPhone);
  },

  /**
   * Применяет новый пароль после сброса без выдачи нового токена.
   * @param {{ verificationId: string, password: string, confirmPassword: string }} params
   * @returns {Promise<{ success: boolean }>}
   */
  async resetPassword({ verificationId, password, confirmPassword }) {
    await delay(600);
    const passwordError = getPasswordError(password);
    if (passwordError) {
      throw new Error(passwordError);
    }
    if (password !== confirmPassword) {
      throw new Error("Passwords do not match");
    }
    return { success: true };
  },

  /**
   * Имитирует OAuth-вход с фиксированным профилем Google-пользователя.
   * @returns {Promise<{ token: string, user: object }>}
   */
  async loginWithGoogle() {
    await delay(600);
    return mockAuthResponse("google.user@example.com");
  },

  /**
   * Пустой logout в mock-режиме; клиент отдельно очищает сохранённые учётные данные.
   * @returns {Promise<{ success: boolean }>}
   */
  async logout() {
    await delay(200);
    return { success: true };
  },

  /**
   * Восстанавливает mock-пользователя сессии из sessionStorage при наличии токена.
   * @returns {Promise<object|null>}
   */
  async getCurrentUser() {
    await delay(300);
    const token = localStorage.getItem("auth_token");
    if (!token) return null;
    const raw = sessionStorage.getItem("mock_current_user");
    return raw ? JSON.parse(raw) : null;
  },
};
