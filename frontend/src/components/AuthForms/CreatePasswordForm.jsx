/* Setting a new password after verification or reset. */
import { useState } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { AUTH_FLOW } from "../../constants/auth";
import { useAuthModal } from "../../hooks/useAuthModal";
import { useFormValidation } from "../../hooks/useFormValidation";
import { schemas } from "../../utils/validation";
import AuthFormField from "../AuthFormField/AuthFormField";
import AuthCard from "./AuthCard";
import AuthFormMessage from "./AuthFormMessage";
import "./AuthForms.scss";
const PASSWORD_HINT =
  "It must contain at least one digit and two Latin letters of each case. Use 8 to 20 characters.";

/**
 * Sets a new password after verification or when recovering a password.
 */
const CreatePasswordForm = ({ isNewPassword = false }) => {
  const location = useLocation();
  const { openAuth, closeAuth } = useAuthModal();
  const flow = location.state?.flow || AUTH_FLOW.REGISTER;
  const isRecoverFlow = isNewPassword || flow === AUTH_FLOW.RECOVER;
  const { createPassword, resetPassword, isSubmitting, error, clearError } =
    useAuth();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { getError, validateAll, handleBlur } = useFormValidation(
    schemas.password,
  );
  /**
   * Stores a new password through a creation or reset flow depending on the authorization state.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    if (!validateAll({ password, confirmPassword })) {
      return;
    }
    try {
      if (isRecoverFlow) {
        await resetPassword({ password, confirmPassword });
        openAuth("/login", {
          state: { message: "Password updated. Please log in." },
        });
        return;
      }
      await createPassword({ password, confirmPassword });
      closeAuth();
    } catch {
      // the error is displayed through the context
    }
  };
  return (
    <AuthCard
      title={isRecoverFlow ? "Create a new password" : "Create a password"}
    >
      <AuthFormMessage error={error} />
      <p className="auth-form__hint">{PASSWORD_HINT}</p>
      <form className="auth-form__body" onSubmit={handleSubmit} noValidate>
        <AuthFormField label="Password" error={getError("password")}>
          <input
            type="password"
            className="auth-form__input"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onBlur={() => handleBlur({ password, confirmPassword }, "password")}
            autoComplete="new-password"
            maxLength={20}
            disabled={isSubmitting}
          />
        </AuthFormField>
        <AuthFormField
          label="Confirm password"
          error={getError("confirmPassword")}
        >
          <input
            type="password"
            className="auth-form__input"
            placeholder="Confirm password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            onBlur={() =>
              handleBlur({ password, confirmPassword }, "confirmPassword")
            }
            autoComplete="new-password"
            maxLength={20}
            disabled={isSubmitting}
          />
        </AuthFormField>
        <button
          type="submit"
          className="auth-form__submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Saving..." : "Continue"}
        </button>
        {!isRecoverFlow && (
          <div className="auth-form__links auth-form__links--center">
            <button
              type="button"
              className="auth-form__link"
              onClick={() => openAuth("/login")}
            >
              Already have an account
            </button>
          </div>
        )}
      </form>
    </AuthCard>
  );
};

export default CreatePasswordForm;
