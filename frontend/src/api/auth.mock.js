/*
 * Mock authorization implementation for local development without VITE_API_BASE_URL.
 * Loaded via dynamic import so that prod bundles can exclude this module.
 */
import { getPasswordError, isEmailOrPhone } from "../utils/validation";

/**
 * Waits the specified number of milliseconds (simulating network latency).
 * @param {number} ms
 * @returns {Promise<void>}
 */
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Creates a minimal mock user record by email or phone.
 * @param {string} emailOrPhone
 * @returns {{ id: string, emailOrPhone: string, displayName: string }}
 */
const mockUser = (emailOrPhone) => ({
  id: "mock-user-1",
  emailOrPhone,
  displayName: emailOrPhone.includes("@") ? emailOrPhone.split("@")[0] : "User",
});

/**
 * Generates a mock authorization response with a time token and user profile.
 * @param {string} emailOrPhone
 * @returns {{ token: string, user: object }}
 */
const mockAuthResponse = (emailOrPhone) => ({
  token: `mock-token-${Date.now()}`,
  user: mockUser(emailOrPhone),
});

/** Mock Auth API with the same set of methods as realAuthApi. */
export const mockAuthApi = {
  /**
   * Validates credentials locally and returns a simulated session.
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
   * Launches a mock registration: issues a verification id without creating a session.
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
   * Simulates sending a confirmation code to the register or reset stream.
   * @param {{ emailOrPhone: string, flow: string }} params
   * @returns {Promise<{ verificationId: string }>}
   */
  async sendVerificationCode({ emailOrPhone, flow }) {
    await delay(500);
    return { verificationId: `mock-verification-${flow}-${Date.now()}` };
  },

  /**
   * Checks confirmation code against minimum length rules in mock mode.
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
   * Sets a new password after verification and completes the mock login.
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
   * Applies the new password after reset without issuing a new token.
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
   * Simulates OAuth login with a fixed Google user profile.
   * @returns {Promise<{ token: string, user: object }>}
   */
  async loginWithGoogle() {
    await delay(600);
    return mockAuthResponse("google.user@example.com");
  },

  /**
   * Empty logout in mock mode; the client separately clears the stored credentials.
   * @returns {Promise<{ success: boolean }>}
   */
  async logout() {
    await delay(200);
    return { success: true };
  },

  /**
   * Restores a mock session user from sessionStorage if a token is available.
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
