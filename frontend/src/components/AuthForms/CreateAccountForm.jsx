/* Регистрация: прямая регистрация через API или mock-поток верификации. */
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
 * Форма регистрации с поддержкой прямой регистрации через API или mock-потока верификации.
 */
const CreateAccountForm = () => {
  const { openAuth, closeAuth } = useAuthModal();
  const { register, isSubmitting, error, clearError } = useAuth();
  const usesApi = hasApiBaseUrl();
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const { getError, validateAll, handleBlur } = useFormValidation(
    usesApi ? schemas.registerApi : schemas.emailOrPhone,
  );
  /**
   * Регистрирует пользователя и направляет на верификацию или закрывает форму при входе через API.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    const payload = usesApi
      ? { emailOrPhone, name, password }
      : { emailOrPhone };
    if (!validateAll(payload)) {
      return;
    }
    try {
      const data = await register(payload);
      /* Реальный API регистрирует и сразу входит; mock продолжает на верификацию email. */
      if (usesApi && data.token) {
        closeAuth();
        return;
      }
      openAuth("/auth/verify", {
        state: { flow: AUTH_FLOW.REGISTER, emailOrPhone },
      });
    } catch {
      // ошибка отображается через контекст
    }
  };
  return (
    <AuthCard title="Create account">
      <AuthFormMessage error={error} />
      <form className="auth-form__body" onSubmit={handleSubmit} noValidate>
        <AuthFormField
          label={usesApi ? "Email" : "Email or phone"}
          error={getError("emailOrPhone")}
        >
          <input
            type="text"
            className="auth-form__input"
            placeholder={usesApi ? "Email" : "Email or phone"}
            value={emailOrPhone}
            onChange={(e) => setEmailOrPhone(e.target.value)}
            onBlur={() =>
              handleBlur(
                usesApi ? { emailOrPhone, name, password } : { emailOrPhone },
                "emailOrPhone",
              )
            }
            autoComplete="username"
            disabled={isSubmitting}
          />
        </AuthFormField>
        {usesApi ? (
          <>
            <AuthFormField label="Full name" error={getError("name")}>
              <input
                type="text"
                className="auth-form__input"
                placeholder="Full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={() =>
                  handleBlur({ emailOrPhone, name, password }, "name")
                }
                autoComplete="name"
                disabled={isSubmitting}
                required
              />
            </AuthFormField>
            <AuthFormField label="Password" error={getError("password")}>
              <input
                type="password"
                className="auth-form__input"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() =>
                  handleBlur({ emailOrPhone, name, password }, "password")
                }
                autoComplete="new-password"
                disabled={isSubmitting}
                required
              />
            </AuthFormField>
          </>
        ) : null}
        <button
          type="submit"
          className="auth-form__submit"
          disabled={isSubmitting}
        >
          {isSubmitting
            ? "Sending..."
            : usesApi
              ? "Create account"
              : "Continue"}
        </button>
        <div className="auth-form__links auth-form__links--center">
          <button
            type="button"
            className="auth-form__link"
            onClick={() => openAuth("/login")}
          >
            Already have an account
          </button>
        </div>
      </form>
    </AuthCard>
  );
};

export default CreateAccountForm;
