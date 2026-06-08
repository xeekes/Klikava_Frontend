const AuthFormMessage = ({ error, success }) => {
  if (!error && !success) return null;

  return (
    <p
      className={`auth-form__message ${
        error ? "auth-form__message--error" : "auth-form__message--success"
      }`.trim()}
      role="alert"
    >
      {error || success}
    </p>
  );
};

export default AuthFormMessage;
