/* Обёртка поля формы авторизации с отображением ошибок валидации inline. */
import { cloneElement, isValidElement, useId } from "react";
import "./AuthFormField.scss";

/**
 * Оборачивает поля авторизации в доступные метки и inline-ошибки валидации.
 */
const AuthFormField = ({ error, className = "", label, children }) => {
  const generatedId = useId();
  const errorId = error ? `${generatedId}-error` : undefined;
  let control = children;

  if (isValidElement(children)) {
    const fieldId = children.props.id || generatedId;
    control = cloneElement(children, {
      id: fieldId,
      "aria-invalid": error ? true : undefined,
      "aria-describedby": error ? errorId : undefined,
    });
  }

  const fieldId = isValidElement(control) ? control.props.id : generatedId;

  return (
    <div
      className={`auth-form__field ${error ? "auth-form__field--invalid" : ""} ${className}`.trim()}
    >
      {label ? (
        <label className="auth-form__label visually-hidden" htmlFor={fieldId}>
          {label}
        </label>
      ) : null}
      {control}
      {error ? (
        <p
          id={errorId}
          className="auth-form__field-error"
          role="alert"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
};

export default AuthFormField;
