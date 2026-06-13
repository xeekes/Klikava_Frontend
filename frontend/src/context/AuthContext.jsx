/*
 * Глобальное состояние авторизации: bootstrap сессии, вход/регистрация, обработка ошибок.
 * Токен хранится в localStorage; форма user нормализуется через api/auth.
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

/** React-контекст для авторизованного пользователя и обработчиков auth-действий. */
const AuthContext = createContext(null);

/**
 * Предоставляет состояние авторизации и сценарии входа дереву компонентов.
 * @param {{ children: import("react").ReactNode }} props
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Записывает bearer-токен в хранилище и синхронизирует пользователя в React-состоянии.
   * @param {string} token
   * @param {object} nextUser
   */
  const persistSession = useCallback((token, nextUser) => {
    localStorage.setItem(AUTH_STORAGE_KEYS.TOKEN, token);
    setUser(nextUser);
  }, []);

  /**
   * Удаляет токен, временные данные верификации и снимок пользователя в памяти.
   */
  const clearSession = useCallback(() => {
    localStorage.removeItem(AUTH_STORAGE_KEYS.TOKEN);
    localStorage.removeItem(AUTH_STORAGE_KEYS.VERIFICATION_ID);
    localStorage.removeItem(AUTH_STORAGE_KEYS.EMAIL_OR_PHONE);
    sessionStorage.removeItem("mock_current_user");
    setUser(null);
  }, []);

  /** Сбрасывает последнюю ошибку формы auth без изменения данных сессии. */
  const clearError = useCallback(() => setError(null), []);

  /**
   * Оборачивает async auth-вызов общей обработкой загрузки и ошибок.
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
   * При монтировании восстанавливает сессию, если сохранённый токен ещё действителен.
   */
  useEffect(() => {
    /**
     * Загружает текущего пользователя из API и завершает начальное состояние bootstrap.
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
   * Вход по email/телефону и паролю.
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
   * Создаёт аккаунт или запускает ветку mock-верификации email.
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
   * Отправляет OTP для сценариев регистрации или восстановления пароля.
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
   * Подтверждает OTP, введённый пользователем, по сохранённому verification id.
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
   * Устанавливает начальный пароль после успешной верификации.
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
   * Применяет новый пароль в сценарии восстановления.
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
   * Выполняет заглушку социального входа и сохраняет возвращённую сессию.
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
   * Завершает удалённую сессию при возможности и всегда очищает локальные учётные данные.
   */
  const logout = useCallback(async () => {
    setIsSubmitting(true);
    try {
      await authApi.logout();
    } catch {
      /* Локальный выход должен пройти даже при сбое удалённого вызова. */
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
 * Читает состояние авторизации и действия из ближайшего провайдера.
 * @returns {object}
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
