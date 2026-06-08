import { useState } from "react";
import { useFormValidation } from "../../../hooks/useFormValidation";
import { schemas } from "../../../utils/validation";
import {
  PROFILE_BILLING_ADDRESS,
  PROFILE_CARD_FORM_DEFAULTS,
} from "../../../data/profile";
import "./ProfileAddCardForm.scss";

const MONTHS = Array.from({ length: 12 }, (_, index) =>
  String(index + 1).padStart(2, "0")
);

const YEARS = Array.from({ length: 12 }, (_, index) => String(2026 + index));

const digitsOnly = (value, maxLength) => value.replace(/\D/g, "").slice(0, maxLength);

const formatCardNumber = (value) => {
  const digits = digitsOnly(value, 19);
  return digits.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
};

const ProfileBillingAddress = () => (
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
);

const ProfileAddCardForm = ({ onSubmit, onClose }) => {
  const [cardNumber, setCardNumber] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [cvv, setCvv] = useState("");
  const { getError, validateAll, handleBlur } = useFormValidation(schemas.profileCard);

  const handleSubmit = (event) => {
    event.preventDefault();

    const values = { cardNumber, month, year, cvv };
    if (!validateAll(values)) {
      return;
    }

    onSubmit?.();
    onClose?.();
  };

  return (
    <form className="profile-card-form" onSubmit={handleSubmit} noValidate>
      <h2 className="profile-card-form__title">Add a new card</h2>

      <label className="profile-card-form__field">
        <span className="profile-card-form__label">Card number</span>
        <div className="profile-card-form__card-number-wrap">
          <span
            className="profile-card-form__brand profile-card-form__brand--mastercard"
            aria-hidden="true"
          />
          <input
            type="text"
            className={`profile-card-form__control ${
              getError("cardNumber") ? "profile-card-form__control--invalid" : ""
            }`.trim()}
            value={cardNumber}
            onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
            onBlur={() => handleBlur({ cardNumber, month, year, cvv }, "cardNumber")}
            placeholder={PROFILE_CARD_FORM_DEFAULTS.cardNumber}
            inputMode="numeric"
            autoComplete="cc-number"
          />
        </div>
        {getError("cardNumber") ? (
          <span className="profile-card-form__error" role="alert">
            {getError("cardNumber")}
          </span>
        ) : null}
      </label>

      <div className="profile-card-form__details-row">
        <label className="profile-card-form__field">
          <span className="profile-card-form__label">Expiration date</span>
          <select
            className={`profile-card-form__control ${
              getError("month") ? "profile-card-form__control--invalid" : ""
            }`.trim()}
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            onBlur={() => handleBlur({ cardNumber, month, year, cvv }, "month")}
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
          {getError("month") ? (
            <span className="profile-card-form__error" role="alert">
              {getError("month")}
            </span>
          ) : null}
        </label>

        <label className="profile-card-form__field">
          <span className="profile-card-form__label">&nbsp;</span>
          <select
            className={`profile-card-form__control ${
              getError("year") ? "profile-card-form__control--invalid" : ""
            }`.trim()}
            value={year}
            onChange={(e) => setYear(e.target.value)}
            onBlur={() => handleBlur({ cardNumber, month, year, cvv }, "year")}
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
          {getError("year") ? (
            <span className="profile-card-form__error" role="alert">
              {getError("year")}
            </span>
          ) : null}
        </label>

        <label className="profile-card-form__field">
          <span className="profile-card-form__label">CVV</span>
          <input
            type="password"
            className={`profile-card-form__control ${
              getError("cvv") ? "profile-card-form__control--invalid" : ""
            }`.trim()}
            value={cvv}
            onChange={(e) => setCvv(digitsOnly(e.target.value, 4))}
            onBlur={() => handleBlur({ cardNumber, month, year, cvv }, "cvv")}
            placeholder="CVV"
            inputMode="numeric"
            autoComplete="cc-csc"
            maxLength={4}
          />
          {getError("cvv") ? (
            <span className="profile-card-form__error" role="alert">
              {getError("cvv")}
            </span>
          ) : null}
        </label>
      </div>

      <ProfileBillingAddress />

      <button type="submit" className="profile-card-form__submit">
        Add your card
      </button>
    </form>
  );
};

export default ProfileAddCardForm;
