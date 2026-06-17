/* Login form; sending via AuthContext.login. */
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
 * Credential form submitted via AuthContext login and Google OAuth.
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
   * Validates the fields, calls login and closes the modal window if successful.
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
      // the error is displayed through the context
    }
  };
  /**
   * Starts a Google OAuth flow and closes the modal window on success.
   */
  const handleGoogleLogin = async () => {
    clearError();
    try {
      await loginWithGoogle();
      closeAuth();
    } catch {
      // the error is displayed through the context
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
