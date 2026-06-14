/* Форма входа; отправка через AuthContext.login. */
import { useState } from "react";
import { useLocation } from "react-router-dom";
import { hasApiBaseUrl } from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import { useAuthModal } from "../../hooks/useAuthModal";
import { useFormValidation } from "../../hooks/useFormValidation";
import { schemas } from "../../utils/validation";
import AuthFormField from "../AuthFormField/AuthFormField";
import AuthCard from "./AuthCard";
import AuthFormMessage from "./AuthFormMessage";
import { Google } from "../../iconComponents";
import "./AuthForms.scss";

/**
 * Форма учётных данных с отправкой через AuthContext login и Google OAuth.
 */
const LoginForm = () => {
  const location = useLocation();
  const { openAuth, closeAuth } = useAuthModal();
  const { login, loginWithGoogle, isSubmitting, error, clearError } = useAuth();
  const usesApi = hasApiBaseUrl();
  const successMessage = location.state?.message || "";
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const { getError, validateAll, handleBlur } = useFormValidation(
    schemas.login,
  );
  /**
   * Проверяет поля, вызывает login и закрывает модальное окно при успехе.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    if (!validateAll({ emailOrPhone, password })) {
      return;
    }
    try {
      await login({ emailOrPhone, password });
      closeAuth();
    } catch {
      // ошибка отображается через контекст
    }
  };
  /**
   * Запускает поток Google OAuth и закрывает модальное окно при успехе.
   */
  const handleGoogleLogin = async () => {
    clearError();
    try {
      await loginWithGoogle();
      closeAuth();
    } catch {
      // ошибка отображается через контекст
    }
  };
  return (
    <AuthCard title="LOG IN" titleUppercase>
      <AuthFormMessage error={error} success={successMessage} />
      <form className="auth-form__body" onSubmit={handleSubmit} noValidate>
        <AuthFormField
          label="Username, email or phone"
          error={getError("emailOrPhone")}
        >
          <input
            type="text"
            className="auth-form__input"
            placeholder="Username, email or phone"
            value={emailOrPhone}
            onChange={(e) => setEmailOrPhone(e.target.value)}
            onBlur={() =>
              handleBlur({ emailOrPhone, password }, "emailOrPhone")
            }
            autoComplete="username"
            disabled={isSubmitting}
          />
        </AuthFormField>
        <AuthFormField label="Password" error={getError("password")}>
          <input
            type="password"
            className="auth-form__input"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onBlur={() => handleBlur({ emailOrPhone, password }, "password")}
            autoComplete="current-password"
            disabled={isSubmitting}
          />
        </AuthFormField>
        <button
          type="submit"
          className="auth-form__submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Logging in..." : "Log In"}
        </button>
        <div className="auth-form__links">
          <button
            type="button"
            className="auth-form__link"
            onClick={() => openAuth("/register")}
          >
            Create an account
          </button>
          {!usesApi ? (
            <button
              type="button"
              className="auth-form__link"
              onClick={() => openAuth("/forgot-password")}
            >
              Forgot password?
            </button>
          ) : null}
        </div>
        {!usesApi ? (
          <button
            type="button"
            className="auth-form__google"
            onClick={handleGoogleLogin}
            disabled={isSubmitting}
          >
            <Google className="auth-form__google-icon" />
            Continue with Google
          </button>
        ) : null}
      </form>
    </AuthCard>
  );
};

export default LoginForm;
