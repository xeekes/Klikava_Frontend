/* Точка входа восстановления пароля (только mock-поток верификации). */
import { useState } from "react";
import { hasApiBaseUrl } from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import { AUTH_FLOW } from "../../constants/auth";
import { useAuthModal } from "../../hooks/useAuthModal";
import { useFormValidation } from "../../hooks/useFormValidation";
import { schemas } from "../../utils/validation";
import AuthFormField from "../AuthFormField/AuthFormField";
import AuthCard from "./AuthCard";
import AuthFormMessage from "./AuthFormMessage";
import "./AuthForms.scss";

/**
 * Точка входа восстановления пароля, запускающая только mock-поток верификации.
 */
const RecoverPasswordForm = () => {
  const { openAuth } = useAuthModal();
  const usesApi = hasApiBaseUrl();
  const { sendVerificationCode, isSubmitting, error, clearError } = useAuth();
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const { getError, validateAll, handleBlur } = useFormValidation(
    schemas.emailOrPhone,
  );
  /**
   * Отправляет код верификации для восстановления и открывает шаг OTP.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    if (!validateAll({ emailOrPhone })) {
      return;
    }
    try {
      await sendVerificationCode({
        emailOrPhone,
        flow: AUTH_FLOW.RECOVER,
      });
      openAuth("/auth/verify", {
        state: { flow: AUTH_FLOW.RECOVER, emailOrPhone },
      });
    } catch {
      // ошибка отображается через контекст
    }
  };
  if (usesApi) {
    return (
      <AuthCard title="Recover password">
        <AuthFormMessage error="Password recovery is not available on the server yet." />
        <div className="auth-form__links auth-form__links--center">
          <button
            type="button"
            className="auth-form__link"
            onClick={() => openAuth("/login")}
          >
            Back to login
          </button>
        </div>
      </AuthCard>
    );
  }
  return (
    <AuthCard title="Recover password">
      <AuthFormMessage error={error} />
      <form className="auth-form__body" onSubmit={handleSubmit} noValidate>
        <AuthFormField label="Email or phone" error={getError("emailOrPhone")}>
          <input
            type="text"
            className="auth-form__input"
            placeholder="Email or phone"
            value={emailOrPhone}
            onChange={(e) => setEmailOrPhone(e.target.value)}
            onBlur={() => handleBlur({ emailOrPhone }, "emailOrPhone")}
            autoComplete="username"
            disabled={isSubmitting}
          />
        </AuthFormField>
        <button
          type="submit"
          className="auth-form__submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Sending..." : "Continue"}
        </button>
      </form>
    </AuthCard>
  );
};

export default RecoverPasswordForm;
