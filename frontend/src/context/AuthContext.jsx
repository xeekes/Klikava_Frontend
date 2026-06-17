/*
 * Global authorization state: bootstrap sessions, login/registration, error handling.
 * The token is stored in localStorage; The user form is normalized via api/auth.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { authApi } from "../api/auth";
import { hasApiBaseUrl } from "../api/client";
import { AUTH_STORAGE_KEYS } from "../constants/auth";

/** React context for the authorized user and auth action handlers. */
const AuthContext = createContext(null);

/**
 * Provides authorization state and login scripts to the component tree.
 * @param {{ children: import("react").ReactNode }} props
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Writes the bearer token to the storage and synchronizes the user in the React state.
   * @param {string} token
   * @param {object} nextUser
   */
  const persistSession = useCallback((token, nextUser) => {
    localStorage.setItem(AUTH_STORAGE_KEYS.TOKEN, token);
    setUser(nextUser);
  }, []);

  /**
   * Deletes the token, temporary verification data, and user snapshot in memory.
   */
  const clearSession = useCallback(() => {
    localStorage.removeItem(AUTH_STORAGE_KEYS.TOKEN);
    localStorage.removeItem(AUTH_STORAGE_KEYS.VERIFICATION_ID);
    localStorage.removeItem(AUTH_STORAGE_KEYS.EMAIL_OR_PHONE);
    sessionStorage.removeItem("mock_current_user");
    setUser(null);
  }, []);

  /** Resets the last auth form error without changing the session data. */
  const clearError = useCallback(() => setError(null), []);

  /**
   * Wraps an async auth call with general loading and error handling.
   * @param {() => Promise<unknown>} action
   */
  const runAuthAction = useCallback(async (action) => {
    setIsSubmitting(true);
    setError(null);
    try {
      return await action();
    } catch (err) {
      setError(err.message || "Something went wrong");
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  /**
   * When mounted, restores the session if the saved token is still valid.
   */
  useEffect(() => {
    /**
     * Loads the current user from the API and completes the bootstrap initial state.
     */
    const bootstrap = async () => {
      const token = localStorage.getItem(AUTH_STORAGE_KEYS.TOKEN);
      if (!token) {
        setIsLoading(false);
        return;
      }
      try {
        const currentUser = await authApi.getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
        } else if (!hasApiBaseUrl()) {
          clearSession();
        }
      } catch {
        clearSession();
      } finally {
        setIsLoading(false);
      }
    };
    bootstrap();
  }, [clearSession]);

  /**
   * Login by email/phone and password.
   * @param {{ emailOrPhone: string, password: string }} credentials
   */
  const login = useCallback(
    (credentials) =>
      runAuthAction(async () => {
        const data = await authApi.login(credentials);
        persistSession(data.token, data.user);
        return data;
      }),
    [persistSession, runAuthAction],
  );

  /**
   * Creates an account or starts a mock email verification branch.
   * @param {object} credentials
   */
  const register = useCallback(
    (credentials) =>
      runAuthAction(async () => {
        const data = await authApi.register(credentials);
        localStorage.setItem(
          AUTH_STORAGE_KEYS.EMAIL_OR_PHONE,
          credentials.emailOrPhone,
        );
        if (data.token && data.user) {
          persistSession(data.token, data.user);
          return data;
        }
        if (data.verificationId) {
          localStorage.setItem(
            AUTH_STORAGE_KEYS.VERIFICATION_ID,
            data.verificationId,
          );
        }
        return data;
      }),
    [persistSession, runAuthAction],
  );

  /**
   * Sends OTP for registration or password recovery scenarios.
   * @param {{ emailOrPhone: string, flow: string }} payload
   */
  const sendVerificationCode = useCallback(
    ({ emailOrPhone, flow }) =>
      runAuthAction(async () => {
        const data = await authApi.sendVerificationCode({ emailOrPhone, flow });
        localStorage.setItem(AUTH_STORAGE_KEYS.EMAIL_OR_PHONE, emailOrPhone);
        if (data.verificationId) {
          localStorage.setItem(
            AUTH_STORAGE_KEYS.VERIFICATION_ID,
            data.verificationId,
          );
        }
        return data;
      }),
    [runAuthAction],
  );

  /**
   * Confirms the OTP entered by the user using the saved verification id.
   * @param {string} code
   */
  const verifyCode = useCallback(
    (code) =>
      runAuthAction(async () => {
        const verificationId = localStorage.getItem(
          AUTH_STORAGE_KEYS.VERIFICATION_ID,
        );
        return authApi.verifyCode({ verificationId, code });
      }),
    [runAuthAction],
  );

  /**
   * Sets the initial password after successful verification.
   * @param {{ password: string, confirmPassword: string }} payload
   */
  const createPassword = useCallback(
    ({ password, confirmPassword }) =>
      runAuthAction(async () => {
        const verificationId = localStorage.getItem(
          AUTH_STORAGE_KEYS.VERIFICATION_ID,
        );
        const data = await authApi.createPassword({
          verificationId,
          password,
          confirmPassword,
        });
        if (data.token && data.user) {
          persistSession(data.token, data.user);
        }
        return data;
      }),
    [persistSession, runAuthAction],
  );

  /**
   * Applies the new password in the recovery script.
   * @param {{ password: string, confirmPassword: string }} payload
   */
  const resetPassword = useCallback(
    ({ password, confirmPassword }) =>
      runAuthAction(async () => {
        const verificationId = localStorage.getItem(
          AUTH_STORAGE_KEYS.VERIFICATION_ID,
        );
        return authApi.resetPassword({
          verificationId,
          password,
          confirmPassword,
        });
      }),
    [runAuthAction],
  );

  /**
   * Stubs the social login and stores the returned session.
   */
  const loginWithGoogle = useCallback(
    () =>
      runAuthAction(async () => {
        const data = await authApi.loginWithGoogle();
        persistSession(data.token, data.user);
        return data;
      }),
    [persistSession, runAuthAction],
  );

  /**
   * Terminates the remote session when possible and always clears local credentials.
   */
  const logout = useCallback(async () => {
    setIsSubmitting(true);
    try {
      await authApi.logout();
    } catch {
      /* The local exit must proceed even if the remote call fails. */
    } finally {
      clearSession();
      setIsSubmitting(false);
    }
  }, [clearSession]);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isLoading,
      isSubmitting,
      error,
      clearError,
      login,
      register,
      sendVerificationCode,
      verifyCode,
      createPassword,
      resetPassword,
      loginWithGoogle,
      logout,
    }),
    [
      user,
      isLoading,
      isSubmitting,
      error,
      clearError,
      login,
      register,
      sendVerificationCode,
      verifyCode,
      createPassword,
      resetPassword,
      loginWithGoogle,
      logout,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Reads authorization status and actions from the nearest provider.
 * @returns {object}
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
