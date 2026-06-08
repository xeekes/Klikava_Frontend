import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { authApi } from "../api/auth";
import { hasApiBaseUrl } from "../api/client";
import { AUTH_STORAGE_KEYS } from "../constants/auth";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const persistSession = useCallback((token, nextUser) => {
    localStorage.setItem(AUTH_STORAGE_KEYS.TOKEN, token);
    if (!hasApiBaseUrl()) {
      sessionStorage.setItem("mock_current_user", JSON.stringify(nextUser));
    }
    setUser(nextUser);
  }, []);

  const clearSession = useCallback(() => {
    localStorage.removeItem(AUTH_STORAGE_KEYS.TOKEN);
    localStorage.removeItem(AUTH_STORAGE_KEYS.VERIFICATION_ID);
    localStorage.removeItem(AUTH_STORAGE_KEYS.EMAIL_OR_PHONE);
    sessionStorage.removeItem("mock_current_user");
    setUser(null);
  }, []);

  const clearError = useCallback(() => setError(null), []);

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

  useEffect(() => {
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

  const login = useCallback(
    (credentials) =>
      runAuthAction(async () => {
        const data = await authApi.login(credentials);
        persistSession(data.token, data.user);
        return data;
      }),
    [persistSession, runAuthAction]
  );

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
    [persistSession, runAuthAction]
  );

  const sendVerificationCode = useCallback(
    ({ emailOrPhone, flow }) =>
      runAuthAction(async () => {
        const data = await authApi.sendVerificationCode({ emailOrPhone, flow });
        localStorage.setItem(AUTH_STORAGE_KEYS.EMAIL_OR_PHONE, emailOrPhone);
        if (data.verificationId) {
          localStorage.setItem(AUTH_STORAGE_KEYS.VERIFICATION_ID, data.verificationId);
        }
        return data;
      }),
    [runAuthAction]
  );

  const verifyCode = useCallback(
    (code) =>
      runAuthAction(async () => {
        const verificationId = localStorage.getItem(AUTH_STORAGE_KEYS.VERIFICATION_ID);
        return authApi.verifyCode({ verificationId, code });
      }),
    [runAuthAction]
  );

  const createPassword = useCallback(
    ({ password, confirmPassword }) =>
      runAuthAction(async () => {
        const verificationId = localStorage.getItem(AUTH_STORAGE_KEYS.VERIFICATION_ID);
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
    [persistSession, runAuthAction]
  );

  const resetPassword = useCallback(
    ({ password, confirmPassword }) =>
      runAuthAction(async () => {
        const verificationId = localStorage.getItem(AUTH_STORAGE_KEYS.VERIFICATION_ID);
        return authApi.resetPassword({ verificationId, password, confirmPassword });
      }),
    [runAuthAction]
  );

  const loginWithGoogle = useCallback(
    () =>
      runAuthAction(async () => {
        const data = await authApi.loginWithGoogle();
        persistSession(data.token, data.user);
        return data;
      }),
    [persistSession, runAuthAction]
  );

  const logout = useCallback(async () => {
    setIsSubmitting(true);
    try {
      await authApi.logout();
    } catch {
      // logout locally even if API fails
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
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
