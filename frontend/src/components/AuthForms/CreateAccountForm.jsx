/* Registration: direct registration via API or mock verification flow. */
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
 * Registration form with support for direct registration via API or mock verification flow.
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
   * Registers the user and directs them to verification or closes the form when logging in via the API.
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
      /* The real API registers and logs in immediately; mock continues on email verification. */
      if (usesApi && data.token) {
        closeAuth();
        return;
      }
      openAuth("/auth/verify", {
        state: { flow: AUTH_FLOW.REGISTER, emailOrPhone },
      });
    } catch {
      // the error is displayed through the context
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
