/* Шаг OTP-верификации между регистрацией и установкой пароля. */
import { useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { AUTH_FLOW } from "../../constants/auth";
import { useAuthModal } from "../../hooks/useAuthModal";
import { useFormValidation } from "../../hooks/useFormValidation";
import { schemas } from "../../utils/validation";
import AuthCard from "./AuthCard";
import AuthFormMessage from "./AuthFormMessage";
import "./AuthForms.scss";
const CODE_LENGTH = 4;

/**
 * Шаг OTP-верификации между регистрацией и установкой пароля.
 */
const EnterCodeForm = ({ showResend = true }) => {
  const location = useLocation();
  const { openAuth } = useAuthModal();
  const flow = location.state?.flow || AUTH_FLOW.REGISTER;
  const emailOrPhone =
    location.state?.emailOrPhone ||
    localStorage.getItem("auth_email_or_phone") ||
    "";
  const { verifyCode, sendVerificationCode, isSubmitting, error, clearError } =
    useAuth();
  const [code, setCode] = useState(Array(CODE_LENGTH).fill(""));
  const [localSuccess, setLocalSuccess] = useState("");
  const inputRefs = useRef([]);
  const { getError, validateAll } = useFormValidation(schemas.verificationCode);
  /**
   * Принимает одну цифру и переводит фокус на следующую ячейку ввода.
   */
  const handleChange = (index, value) => {
    if (!/^\d?$/.test(value)) {
      return;
    }
    const nextCode = [...code];
    nextCode[index] = value;
    setCode(nextCode);
    if (value && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };
  /**
   * Переводит фокус на предыдущую ячейку, когда backspace очищает пустой слот.
   */
  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };
  /**
   * Проверяет собранный код и направляет на экран пароля или сброса.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    setLocalSuccess("");
    const joinedCode = code.join("");
    if (!validateAll({ code: joinedCode })) {
      return;
    }
    try {
      await verifyCode(joinedCode);
      const nextPath =
        flow === AUTH_FLOW.RECOVER ? "/auth/reset-password" : "/auth/password";
      openAuth(nextPath, { state: { flow } });
    } catch {
      // ошибка отображается через контекст
    }
  };
  /**
   * Запрашивает новый код верификации для текущего email или телефона.
   */
  const handleResend = async () => {
    if (!emailOrPhone) {
      return;
    }
    clearError();
    setLocalSuccess("");
    try {
      await sendVerificationCode({ emailOrPhone, flow });
      setLocalSuccess("Verification code sent again");
    } catch {
      // ошибка отображается через контекст
    }
  };
  const codeError = getError("code");
  return (
    <AuthCard title="Enter code">
      <AuthFormMessage error={error} success={localSuccess} />
      <form className="auth-form__body" onSubmit={handleSubmit} noValidate>
        <div
          className={`auth-form__code-group ${
            codeError ? "auth-form__code-group--invalid" : ""
          }`.trim()}
        >
          <div className="auth-form__code-inputs">
            {code.map((digit, index) => (
              <input
                key={index}
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
                type="text"
                inputMode="numeric"
                className="auth-form__code-input"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                disabled={isSubmitting}
                aria-invalid={Boolean(codeError)}
              />
            ))}
          </div>
          {codeError ? (
            <p className="auth-form__code-error" role="alert">
              {codeError}
            </p>
          ) : null}
        </div>
        <button
          type="submit"
          className="auth-form__submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Verifying..." : "Continue"}
        </button>
        {showResend ? (
          <div className="auth-form__links auth-form__links--center">
            <button
              type="button"
              className="auth-form__link"
              onClick={handleResend}
              disabled={isSubmitting || !emailOrPhone}
            >
              Send the code again
            </button>
          </div>
        ) : null}
      </form>
    </AuthCard>
  );
};

export default EnterCodeForm;
