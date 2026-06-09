import { Link } from "react-router-dom";
import { useState } from "react";
import { useFormValidation } from "../../../hooks/useFormValidation";
import { schemas } from "../../../utils/validation";
import FormField from "../../FormField/FormField";
import "./CheckoutCardForm.scss";

const getBillingDisplay = (lines) => {
  if (!lines?.length) {
    return { street: "", rest: "" };
  }

  return {
    street: lines[0].replace(/,\s*$/, ""),
    rest: lines.slice(1).join(" "),
  };
};

const digitsOnly = (value, maxLength) => value.replace(/\D/g, "").slice(0, maxLength);

const formatCardNumber = (value) => {
  const digits = digitsOnly(value, 19);
  return digits.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
};

const CheckoutCardForm = ({
  billingLines = [],
  onAdd,
  onCancel,
  title = "Add a new card",
  submitLabel = "Add your card",
}) => {
  const [cardNumber, setCardNumber] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [cvv, setCvv] = useState("");
  const { street, rest } = getBillingDisplay(billingLines);
  const { getError, validateAll, handleBlur } = useFormValidation(schemas.card);

  const handleSubmit = (e) => {
    e.preventDefault();

    const values = { cardNumber, month, year, cvv };
    if (!validateAll(values)) {
      return;
    }

    onAdd?.(values);
  };

  return (
    <form className="checkout-card-form checkout-card" onSubmit={handleSubmit} noValidate>
      <h2 className="checkout-card-form__title">{title}</h2>

      <FormField
        label="Card number"
        id="checkout-card-number"
        variant="gray"
        error={getError("cardNumber")}
        className="checkout-card-form__card-number"
      >
        <div className="checkout-card-form__card-input-wrap">
          <span className="checkout-card-form__card-brand" aria-hidden />
          <input
            type="text"
            className={`form-field__control ${
              getError("cardNumber") ? "form-field__control--invalid" : ""
            }`.trim()}
            value={cardNumber}
            onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
            onBlur={() => handleBlur({ cardNumber, month, year, cvv }, "cardNumber")}
            inputMode="numeric"
            autoComplete="cc-number"
            placeholder="0000 0000 0000 0000"
          />
        </div>
      </FormField>

      <div className="checkout-card-form__row">
        <FormField
          label="Expiration date"
          variant="gray"
          error={getError("month") || getError("year")}
          className="checkout-card-form__expiry"
        >
          <div className="checkout-card-form__expiry-fields">
            <input
              type="text"
              className={`form-field__control checkout-card-form__expiry-month ${
                getError("month") ? "form-field__control--invalid" : ""
              }`.trim()}
              value={month}
              onChange={(e) => setMonth(digitsOnly(e.target.value, 2))}
              onBlur={() => handleBlur({ cardNumber, month, year, cvv }, "month")}
              placeholder="MM"
              inputMode="numeric"
              autoComplete="cc-exp-month"
              maxLength={2}
            />
            <span className="checkout-card-form__expiry-separator" aria-hidden>
              /
            </span>
            <input
              type="text"
              className={`form-field__control checkout-card-form__expiry-year ${
                getError("year") ? "form-field__control--invalid" : ""
              }`.trim()}
              value={year}
              onChange={(e) => setYear(digitsOnly(e.target.value, 4))}
              onBlur={() => handleBlur({ cardNumber, month, year, cvv }, "year")}
              placeholder="YY"
              inputMode="numeric"
              autoComplete="cc-exp-year"
              maxLength={4}
            />
          </div>
        </FormField>

        <FormField
          label="CVV"
          id="checkout-card-cvv"
          variant="gray"
          type="password"
          value={cvv}
          onChange={(e) => setCvv(digitsOnly(e.target.value, 4))}
          onBlur={() => handleBlur({ cardNumber, month, year, cvv }, "cvv")}
          error={getError("cvv")}
          placeholder="CVV"
          inputMode="numeric"
          autoComplete="cc-csc"
          maxLength={4}
          className="checkout-card-form__cvv"
        />
      </div>

      <div className="checkout-card-form__billing">
        <label className="form-field__label checkout-card-form__billing-label">
          Billing address
        </label>
        <div className="checkout-card-form__billing-box">
          <div className="checkout-card-form__billing-row">
            {street ? (
              <p className="checkout-card-form__billing-line">{street}</p>
            ) : null}
            <Link to="/profile/addresses" className="checkout-card-form__billing-edit">
              Edit
            </Link>
          </div>
          {rest ? (
            <p className="checkout-card-form__billing-line">{rest}</p>
          ) : null}
        </div>
      </div>

      <div className="checkout-form-actions">
        <button type="submit" className="checkout-form-submit">
          {submitLabel}
        </button>
        {onCancel ? (
          <button type="button" className="checkout-form-cancel" onClick={onCancel}>
            Cancel
          </button>
        ) : null}
      </div>
    </form>
  );
};

export default CheckoutCardForm;
