import { apiRequest, hasApiBaseUrl } from "./client";
import { ApiError } from "./errors";
import { getPasswordError, isEmailOrPhone } from "../utils/validation";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

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

const mapAuthResponse = (payload) => ({
  token: payload.access_token,
  user: mapMarketplaceUser(payload.user),
});

const sanitizeLogin = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "")
    .slice(0, 32);

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

  return `${fromEmail || "user"}${Date.now().toString(36).slice(-4)}`.slice(0, 32);
};

const unsupportedApiFlow = (feature) => {
  throw new ApiError(
    501,
    `${feature} is not available on the current backend yet`
  );
};

const mockUser = (emailOrPhone) => ({
  id: "mock-user-1",
  emailOrPhone,
  displayName: emailOrPhone.includes("@") ? emailOrPhone.split("@")[0] : "User",
});

const mockAuthResponse = (emailOrPhone) => ({
  token: `mock-token-${Date.now()}`,
  user: mockUser(emailOrPhone),
});

/** @type {typeof realAuthApi} */
const mockAuthApi = {
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

  async sendVerificationCode({ emailOrPhone, flow }) {
    await delay(500);
    return { verificationId: `mock-verification-${flow}-${Date.now()}` };
  },

  async verifyCode({ verificationId, code }) {
    await delay(500);
    if (!code || code.length < 4) {
      throw new Error("Invalid verification code");
    }
    return { verified: true, verificationId };
  },

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

  async loginWithGoogle() {
    await delay(600);
    return mockAuthResponse("google.user@example.com");
  },

  async logout() {
    await delay(200);
    return { success: true };
  },

  async getCurrentUser() {
    await delay(300);
    const token = localStorage.getItem("auth_token");
    if (!token) return null;
    const raw = sessionStorage.getItem("mock_current_user");
    return raw ? JSON.parse(raw) : null;
  },
};

const realAuthApi = {
  async login({ emailOrPhone, password }) {
    const payload = await apiRequest("/users/login", {
      method: "POST",
      body: {
        login: emailOrPhone.trim(),
        password,
      },
    });

    return mapAuthResponse(payload);
  },

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
        login: resolvedLogin,
        password,
      },
    });

    return mapAuthResponse(loginPayload);
  },

  sendVerificationCode() {
    return unsupportedApiFlow("Email verification");
  },

  verifyCode() {
    return unsupportedApiFlow("Email verification");
  },

  createPassword() {
    return unsupportedApiFlow("Password setup");
  },

  resetPassword() {
    return unsupportedApiFlow("Password reset");
  },

  loginWithGoogle() {
    return unsupportedApiFlow("Google login");
  },

  async logout() {
    return { success: true };
  },

  async getCurrentUser() {
    const user = await apiRequest("/users/me", { method: "GET" });
    return mapMarketplaceUser(user);
  },
};

export const authApi = hasApiBaseUrl() ? realAuthApi : mockAuthApi;
