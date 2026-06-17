/* Profile form: all fields are edited at once, Save saves only changes. */
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { hasApiBaseUrl } from "../../api/client";
import { mapAuthUserToPersonalInfo, pickUserAvatar } from "../../api/mapUserData";
import { isApiMediaUrl, picturesApi } from "../../api/pictures";
import { usersApi } from "../../api/users";
import { getSellerPanelLoginUrl } from "../../constants/panel";
import { useActionFeedback } from "../../context/ActionFeedbackContext";
import { useAuth } from "../../context/AuthContext";
import { useUserData } from "../../context/UserDataContext";
import { useFormValidation } from "../../hooks/useFormValidation";
import { formatPhoneInput, MAX_PHONE_DIGITS } from "../../utils/inputFormatters";
import { schemas } from "../../utils/validation";
import FormField from "../../components/FormField/FormField";
import { Upload, User } from "../../iconComponents";
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
 * @param {object} personalInfo
 * @param {object|null|undefined} user
 * @returns {object}
 */
const buildFormValues = (personalInfo, user) =>
  mapAuthUserToPersonalInfo(user, personalInfo);

/**
 * @param {object} form
 * @param {object} baseline
 * @returns {string[]}
 */
const getChangedFieldIds = (form, baseline) =>
  FIELDS.filter(
    (field) => (form[field.id] ?? "") !== (baseline[field.id] ?? ""),
  ).map((field) => field.id);

/**
 * Editable personal data form with one Save button.
 */
const ProfilePersonalInfo = () => {
  const navigate = useNavigate();
  const { confirm, showSuccess, showError } = useActionFeedback();
  const { user, logout } = useAuth();
  const { personalInfo, savePersonalInfoChanges, deleteAccount } =
    useUserData();
  const fileInputRef = useRef(null);
  const avatarBlobRef = useRef("");
  const [form, setForm] = useState(() => buildFormValues(personalInfo, user));
  const [avatarSrc, setAvatarSrc] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isAvatarLoading, setIsAvatarLoading] = useState(false);
  const [avatarLoadError, setAvatarLoadError] = useState(false);
  const showAvatar = Boolean(avatarSrc) && !avatarLoadError;

  const { getError, validateFields, handleBlur } = useFormValidation(
    schemas.personalInfo,
  );

  useEffect(() => {
    setAvatarLoadError(false);
  }, [avatarSrc]);

  useEffect(() => {
    setForm(buildFormValues(personalInfo, user));
  }, [personalInfo, user]);

  useEffect(() => {
    let cancelled = false;

    /**
     * Frees the previous blob:-URL of the avatar.
     */
    const revokeAvatarBlob = () => {
      if (avatarBlobRef.current?.startsWith("blob:")) {
        URL.revokeObjectURL(avatarBlobRef.current);
      }
      avatarBlobRef.current = "";
    };

    /**
     * Substitutes src for <img>: external URL directly, media API via blob + JWT.
     */
    const resolveAvatar = async () => {
      const avatarUrl =
        form.avatar || personalInfo.avatar || user?.avatar || "";

      if (!user?.id || !hasApiBaseUrl()) {
        const offlineUrl = avatarUrl;
        setAvatarSrc(
          offlineUrl && !isApiMediaUrl(offlineUrl) ? offlineUrl : "",
        );
        return;
      }

      setIsAvatarLoading(true);
      revokeAvatarBlob();

      const resolvedSrc = await picturesApi.resolveUserAvatarObjectUrl({
        userId: user.id,
        avatarUrl,
      });

      if (cancelled) {
        if (resolvedSrc.startsWith("blob:")) {
          URL.revokeObjectURL(resolvedSrc);
        }
        return;
      }

      if (resolvedSrc.startsWith("blob:")) {
        avatarBlobRef.current = resolvedSrc;
        setAvatarSrc(resolvedSrc);
      } else if (resolvedSrc && !isApiMediaUrl(resolvedSrc)) {
        setAvatarSrc(resolvedSrc);
      } else {
        setAvatarSrc("");
      }
      setIsAvatarLoading(false);
    };

    resolveAvatar();

    return () => {
      cancelled = true;
      revokeAvatarBlob();
    };
  }, [form.avatar, personalInfo.avatar, user?.avatar, user?.id]);

  /**
   * @param {string} field
   */
  const handleChange = (field) => (event) => {
    const value =
      field === "phone"
        ? formatPhoneInput(event.target.value)
        : event.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  /**
   * @param {import("react").FormEvent} event
   */
  const handleSubmit = async (event) => {
    event.preventDefault();
    const changedFieldIds = getChangedFieldIds(form, personalInfo);
    if (changedFieldIds.length === 0) {
      showSuccess("No changes to save.");
      return;
    }
    if (!validateFields(form, changedFieldIds)) {
      return;
    }
    setIsSaving(true);
    try {
      await savePersonalInfoChanges(form, changedFieldIds);
      showSuccess("Changes saved.");
    } catch (error) {
      showError(error.message || "Failed to save changes.");
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * @param {import("react").ChangeEvent<HTMLInputElement>} event
   */
  const handleAvatarUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file || !user?.id || !hasApiBaseUrl()) {
      return;
    }
    setIsUploadingAvatar(true);
    try {
      const uploadResult = await picturesApi.uploadUserAvatar(user.id, file);
      const profileUser = await usersApi.getUser(user.id);
      const nextAvatar =
        pickUserAvatar(uploadResult) ||
        pickUserAvatar(profileUser) ||
        `avatar:${user.id}`;
      const nextForm = { ...form, avatar: nextAvatar };
      await savePersonalInfoChanges(nextForm, ["avatar"]);
      setForm(nextForm);
      setAvatarLoadError(false);
      showSuccess("Profile photo updated.");
    } catch (error) {
      showError(error.message || "Failed to upload photo.");
    } finally {
      setIsUploadingAvatar(false);
      event.target.value = "";
    }
  };

  const handleDeleteAccount = async () => {
    if (
      !(await confirm({
        title: "Delete account?",
        message: "Delete your account permanently? This action cannot be undone.",
        confirmLabel: "Delete account",
        cancelLabel: "Cancel",
      }))
    ) {
      return;
    }
    try {
      await deleteAccount();
      await logout();
      showSuccess("Your account has been deleted.");
      navigate("/");
    } catch (error) {
      showError(error.message || "Failed to delete account.");
    }
  };

  return (
    <section className="profile-page profile-personal-info profile-page--footer-action">
      <h1 className="profile-page__title">Personal info</h1>
      <form
        className="profile-personal-info__card"
        onSubmit={handleSubmit}
        noValidate
      >
        <div className="profile-page__body">
          <div className="profile-personal-info__grid">
            <div className="profile-personal-info__avatar-block">
              <div className="profile-personal-info__avatar-wrap">
                {showAvatar ? (
                  <img
                    className="profile-personal-info__avatar"
                    src={avatarSrc}
                    alt=""
                    onError={() => setAvatarLoadError(true)}
                  />
                ) : (
                  <div
                    className="profile-personal-info__avatar profile-personal-info__avatar--placeholder"
                    aria-hidden="true"
                  >
                    <User className="profile-personal-info__avatar-icon" />
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="profile-personal-info__avatar-input"
                  onChange={handleAvatarUpload}
                  hidden
                />
                <button
                  type="button"
                  className="profile-personal-info__avatar-upload"
                  aria-label="Upload profile photo"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingAvatar || isAvatarLoading}
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
                <input
                  type={field.type || "text"}
                  id={`personal-info-${field.id}`}
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
                  inputMode={field.id === "phone" ? "numeric" : undefined}
                  maxLength={field.id === "phone" ? MAX_PHONE_DIGITS : undefined}
                />
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
            <button
              type="submit"
              className="profile-personal-info__save-btn"
              disabled={isSaving}
            >
              {isSaving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </form>
    </section>
  );
};

export default ProfilePersonalInfo;
