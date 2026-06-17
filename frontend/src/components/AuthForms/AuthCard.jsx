/* Card markup wrapper, common to login modal window forms. */

/**
 * A general card markup wrapper for login modal window forms.
 */
const AuthCard = ({ title, titleUppercase = false, children }) => (
  <div className="auth-form">
    <h1
      className={`auth-form__title ${
        titleUppercase ? "auth-form__title--uppercase" : ""
      }`.trim()}
    >
      {title}
    </h1>
    {children}
  </div>
);
export default AuthCard;
