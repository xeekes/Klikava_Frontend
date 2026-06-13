/* Форма профиля, синхронизируемая с API пользователей при наличии. */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getSellerPanelLoginUrl } from "../../constants/panel";
import { useAuth } from "../../context/AuthContext";
import { useUserData } from "../../context/UserDataContext";
import { useFormValidation } from "../../hooks/useFormValidation";
import { schemas } from "../../utils/validation";
import FormField from "../../components/FormField/FormField";
import { Filter, Upload } from "../../iconComponents";
import "../../styles/profile-page.scss";
import "./ProfilePersonalInfo.scss";
const FIELDS = [
  { id: "firstName", label: "First Name", area: "firstName" },
  { id: "lastName", label: "Last Name", area: "lastName" },
  { id: "phone", label: "Phone", area: "phone", type: "tel" },
  { id: "email", label: "Email", area: "email", type: "email" },
  { id: "city", label: "City", area: "city" },
  { id: "country", label: "Country", area: "country" },
  { id: "address", label: "Address", area: "address" },
  { id: "password", label: "Password", area: "password", type: "password" },
];

/**
 * Редактируемая форма личных данных, синхронизируемая с API пользователей при наличии.
 */
const ProfilePersonalInfo = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { personalInfo, savePersonalInfo } = useUserData();
  const [form, setForm] = useState({
    ...personalInfo,
    email: user?.emailOrPhone?.includes("@")
      ? user.emailOrPhone
      : personalInfo.email,
    firstName: user?.displayName || personalInfo.firstName,
  });
  const [saved, setSaved] = useState(false);
  const { getError, validateAll, handleBlur } = useFormValidation(
    schemas.personalInfo,
  );

  /**
   * Возвращает обработчик изменения, обновляющий одно поле формы и сбрасывающий состояние сохранения.
   * @param {string} field
   */
  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
    setSaved(false);
  };

  /**
   * Проверяет и сохраняет изменения личных данных в хранилище пользователя.
   * @param {import("react").FormEvent} event
   */
  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateAll(form)) {
      setSaved(false);
      return;
    }
    try {
      await savePersonalInfo(form);
      setSaved(true);
    } catch {
      setSaved(false);
    }
  };

  /**
   * Выходит из аккаунта и перенаправляет на главную витрины после удаления учётной записи.
   */
  const handleDeleteAccount = async () => {
    await logout();
    navigate("/");
  };
  return (
    <section className="profile-page profile-personal-info profile-page--footer-action">
      <h1 className="profile-page__title">Personal info</h1>
      {saved ? (
        <p className="profile-personal-info__saved">Changes saved.</p>
      ) : null}
      <form
        className="profile-personal-info__card"
        onSubmit={handleSubmit}
        noValidate
      >
        <div className="profile-page__body">
          <div className="profile-personal-info__grid">
            <div className="profile-personal-info__avatar-block">
              <div className="profile-personal-info__avatar-wrap">
                {form.avatar ? (
                  <img
                    className="profile-personal-info__avatar"
                    src={form.avatar}
                    alt=""
                  />
                ) : (
                  <div
                    className="profile-personal-info__avatar profile-personal-info__avatar--placeholder"
                    aria-hidden="true"
                  />
                )}
                <button
                  type="button"
                  className="profile-personal-info__avatar-upload"
                  aria-label="Upload profile photo"
                >
                  <Upload
                    className="profile-personal-info__upload-icon"
                    aria-hidden="true"
                  />
                </button>
              </div>
            </div>
            {FIELDS.map((field) => (
              <FormField
                key={field.id}
                label={field.label}
                id={`personal-info-${field.id}`}
                variant="white"
                error={getError(field.id)}
                className={`profile-personal-info__field profile-personal-info__field--${field.area}`}
              >
                <div className="profile-personal-info__control-wrap">
                  <input
                    type={field.type || "text"}
                    className={`form-field__control profile-personal-info__control ${
                      getError(field.id) ? "form-field__control--invalid" : ""
                    }`.trim()}
                    value={form[field.id] ?? ""}
                    onChange={handleChange(field.id)}
                    onBlur={() => handleBlur(form, field.id)}
                    placeholder={personalInfo[field.id]}
                    autoComplete={
                      field.id === "password" ? "new-password" : undefined
                    }
                  />
                  <button
                    type="button"
                    className="profile-personal-info__edit-btn"
                    aria-label={`Edit ${field.label}`}
                    tabIndex={-1}
                  >
                    <Filter
                      className="profile-personal-info__filter-icon"
                      aria-hidden="true"
                    />
                  </button>
                </div>
              </FormField>
            ))}
          </div>
        </div>
        <div className="profile-personal-info__footer profile-page__footer-action">
          <a
            href={getSellerPanelLoginUrl(form.email)}
            className="profile-personal-info__sellers-btn"
          >
            Account for sellers
          </a>
          <div className="profile-personal-info__footer-actions">
            <button
              type="button"
              className="profile-personal-info__delete-btn"
              onClick={handleDeleteAccount}
            >
              Delete account permanently
            </button>
            <button type="submit" className="profile-personal-info__save-btn">
              Save
            </button>
          </div>
        </div>
      </form>
    </section>
  );
};

export default ProfilePersonalInfo;
