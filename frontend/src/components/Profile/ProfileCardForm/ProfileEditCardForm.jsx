import { useState } from "react";
import { useFormValidation } from "../../../hooks/useFormValidation";
import { schemas } from "../../../utils/validation";
import { PROFILE_BILLING_ADDRESS } from "../../../data/profile";
import "./ProfileEditCardForm.scss";

const MONTHS = Array.from({ length: 12 }, (_, index) =>
  String(index + 1).padStart(2, "0")
);

const YEARS = Array.from({ length: 12 }, (_, index) => String(2026 + index));

const editCardSchema = {
  month: schemas.profileCard.month,
  year: schemas.profileCard.year,
};

const ProfileEditCardForm = ({ card, onSubmit, onClose }) => {
  const [month, setMonth] = useState(card?.expiryMonth ?? "");
  const [year, setYear] = useState(card?.expiryYear ?? "");
  const { getError, validateAll, handleBlur } = useFormValidation(editCardSchema);

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!validateAll({ month, year })) {
      return;
    }

    onSubmit?.({
      expiryMonth: month,
      expiryYear: year,
    });
    onClose?.();
  };

  if (!card) {
    return null;
  }

  return (
    <form className="profile-card-form" onSubmit={handleSubmit} noValidate>
      <h2 className="profile-card-form__title">Edit your card</h2>

      <div className="profile-card-form__card-row">
        <div className="profile-card-form__card-chip">
          <span
            className={`profile-card-form__brand profile-card-form__brand--${card.brand}`}
            aria-hidden="true"
          />
          <span>{card.label}</span>
        </div>
        <div className="profile-card-form__card-chip">...{card.last4}</div>
      </div>

      <div className="profile-card-form__field">
        <span className="profile-card-form__label">Expiration date</span>
        <div className="profile-card-form__expiry-row">
          <select
            className={`profile-card-form__control ${
              getError("month") ? "profile-card-form__control--invalid" : ""
            }`.trim()}
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            onBlur={() => handleBlur({ month, year }, "month")}
          >
            <option value="" disabled>
              Month
            </option>
            {MONTHS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

          <select
            className={`profile-card-form__control ${
              getError("year") ? "profile-card-form__control--invalid" : ""
            }`.trim()}
            value={year}
            onChange={(e) => setYear(e.target.value)}
            onBlur={() => handleBlur({ month, year }, "year")}
          >
            <option value="" disabled>
              Year
            </option>
            {YEARS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
        {getError("month") || getError("year") ? (
          <span className="profile-card-form__error" role="alert">
            {getError("month") || getError("year")}
          </span>
        ) : null}
      </div>

      <div className="profile-card-form__field">
        <span className="profile-card-form__label">Billing address</span>
        <div className="profile-card-form__billing">
          <div className="profile-card-form__billing-head">
            <span>{PROFILE_BILLING_ADDRESS.title}</span>
            <button type="button" className="profile-card-form__billing-edit">
              Edit
            </button>
          </div>
          <p className="profile-card-form__billing-line">
            {PROFILE_BILLING_ADDRESS.line}
          </p>
        </div>
      </div>

      <button type="submit" className="profile-card-form__submit">
        Save
      </button>
    </form>
  );
};

export default ProfileEditCardForm;
