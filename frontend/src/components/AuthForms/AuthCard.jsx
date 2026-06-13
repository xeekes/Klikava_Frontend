/* Оболочка карточной разметки, общая для форм модального окна авторизации. */

/**
 * Общая оболочка карточной разметки для форм модального окна авторизации.
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
