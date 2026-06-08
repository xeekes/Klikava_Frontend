import "./AuthFormField.scss";

const AuthFormField = ({ error, className = "", children }) => (
  <div
    className={`auth-form__field ${error ? "auth-form__field--invalid" : ""} ${className}`.trim()}
  >
    {children}
    {error ? (
      <p className="auth-form__field-error" role="alert">
        {error}
      </p>
    ) : null}
  </div>
);

export default AuthFormField;
