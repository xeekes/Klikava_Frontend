/* Форма адреса при оформлении заказа со схемой валидации. */
import { useState } from "react";
import { useFormValidation } from "../../../hooks/useFormValidation";
import { formatAddressFieldInput, MAX_PHONE_DIGITS } from "../../../utils/inputFormatters";
import { schemas } from "../../../utils/validation";
import FormField from "../../FormField/FormField";
import "./CheckoutAddressForm.scss";
const EMPTY_FORM = {
  firstName: "",
  lastName: "",
  country: "",
  phone: "",
  address: "",
  city: "",
  postalCode: "",
};
const FIELDS = [
  ["firstName", "First Name", "text"],
  ["lastName", "Last Name", "text"],
  ["country", "Country", "text"],
  ["phone", "Phone", "tel"],
  ["address", "Address", "text"],
  ["city", "City", "text"],
  ["postalCode", "Postal Code", "text"],
];

/**
 * Преобразует сущность сохранённого адреса в плоские значения полей формы.
 */
const addressToFormValues = (address) => {
  if (!address) {
    return EMPTY_FORM;
  }
  return {
    firstName: address.firstName ?? "",
    lastName: address.lastName ?? "",
    country: address.country ?? "",
    phone: address.phone ?? "",
    address: address.address ?? "",
    city: address.city ?? "",
    postalCode: address.postalCode ?? "",
  };
};

/**
 * Форма адреса с валидацией для добавления или редактирования при оформлении заказа.
 */
const CheckoutAddressForm = ({
  initialAddress = null,
  onSave,
  onCancel,
  title = "Add a new address",
  submitLabel = "Add",
}) => {
  const [form, setForm] = useState(() => addressToFormValues(initialAddress));
  const { getError, validateAll, handleBlur } = useFormValidation(
    schemas.address,
  );
  /**
   * Возвращает обработчик изменения одного поля формы адреса.
   */
  const handleChange = (field) => (e) => {
    const nextValue = formatAddressFieldInput(field, e.target.value);
    setForm((prev) => ({ ...prev, [field]: nextValue }));
  };
  /**
   * Проверяет форму и передаёт значения в родительский callback сохранения.
   */
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateAll(form)) {
      return;
    }
    onSave?.(form);
    setForm(EMPTY_FORM);
  };
  return (
    <form
      className="checkout-address-form checkout-card"
      onSubmit={handleSubmit}
      noValidate
    >
      <h2 className="checkout-address-form__title">{title}</h2>
      <div className="checkout-address-form__grid">
        {FIELDS.map(([field, label, type]) => (
          <FormField
            key={field}
            label={label}
            id={`checkout-address-${field}`}
            variant="gray"
            type={type}
            value={form[field]}
            onChange={handleChange(field)}
            onBlur={() => handleBlur(form, field)}
            error={getError(field)}
            inputMode={field === "phone" ? "numeric" : undefined}
            maxLength={
              field === "phone"
                ? MAX_PHONE_DIGITS
                : field === "postalCode"
                  ? 12
                  : undefined
            }
            className={
              field === "postalCode" ? "checkout-address-form__postal" : ""
            }
          />
        ))}
      </div>
      <div className="checkout-form-actions">
        <button type="submit" className="checkout-form-submit">
          {submitLabel}
        </button>
        {onCancel ? (
          <button
            type="button"
            className="checkout-form-cancel"
            onClick={onCancel}
          >
            Cancel
          </button>
        ) : null}
      </div>
    </form>
  );
};

export default CheckoutAddressForm;
