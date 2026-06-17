/* Reusable field wrapper with label and error slot for profile forms. */
import { useId } from "react";
import "./FormField.scss";

/**
 * Reusable field wrapper with label and error slot for profile forms.
 */
const FormField = ({
  label,
  id,
  name,
  variant = "gray",
  className = "",
  controlClassName = "",
  error,
  readOnly = false,
  readOnlyValue,
  children,
  as,
  ...controlProps
}) => {
  const generatedId = useId();
  const fieldId = id || name || controlProps.id || generatedId;
  const controlClasses = [
    "form-field__control",
    error ? "form-field__control--invalid" : "",
    controlClassName,
  ]
    .filter(Boolean)
    .join(" ");
  let control = children;
  if (!control) {
    if (readOnly) {
      control = (
        <div
          className={`${controlClasses} form-field__control--readonly`.trim()}
        >
          {readOnlyValue ?? controlProps.value ?? ""}
        </div>
      );
    } else {
      const ControlTag = as || "input";
      control = (
        <ControlTag
          id={fieldId}
          name={name}
          className={controlClasses}
          {...controlProps}
        />
      );
    }
  }
  return (
    <div
      className={`form-field form-field--${variant} ${
        error ? "form-field--invalid" : ""
      } ${className}`.trim()}
    >
      {label ? (
        <label
          className="form-field__label"
          htmlFor={readOnly ? undefined : fieldId}
        >
          {label}
        </label>
      ) : null}
      <div className="form-field__control-wrap">{control}</div>
      {error ? (
        <p className="form-field__error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
};

export default FormField;
