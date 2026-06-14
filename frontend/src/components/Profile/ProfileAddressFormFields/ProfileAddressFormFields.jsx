/* Общая группа полей адреса для форм профиля и оформления заказа. */
import { useMemo, useState } from "react";
import { useUserData } from "../../../context/UserDataContext";
import { useFormValidation } from "../../../hooks/useFormValidation";
import { formatAddressFieldInput, MAX_PHONE_DIGITS } from "../../../utils/inputFormatters";
import { schemas } from "../../../utils/validation";
import FormField from "../../FormField/FormField";
import "./ProfileAddressFormFields.scss";
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
 * Общая группа полей адреса для режимов создания и редактирования в профиле.
 */
const ProfileAddressFormFields = ({
  addressId,
  onSubmit,
  onDelete,
  submitLabel,
  mode = "create",
}) => {
  const { addresses } = useUserData();
  const existing = useMemo(
    () => addresses.find((item) => item.id === addressId),
    [addresses, addressId],
  );
  const [form, setForm] = useState(
    existing
      ? {
          firstName: existing.firstName,
          lastName: existing.lastName,
          country: existing.country,
          phone: existing.phone,
          address: existing.address,
          city: existing.city,
          postalCode: existing.postalCode,
        }
      : EMPTY_FORM,
  );
  const { getError, validateAll, handleBlur } = useFormValidation(
    schemas.address,
  );
  /**
   * Возвращает обработчик изменения одного поля формы адреса.
   */
  const handleChange = (field) => (event) => {
    const nextValue = formatAddressFieldInput(field, event.target.value);
    setForm((prev) => ({ ...prev, [field]: nextValue }));
  };
  /**
   * Проверяет форму и передаёт значения в родительский callback отправки.
   */
  const handleSubmit = (event) => {
    event.preventDefault();
    if (!validateAll(form)) {
      return;
    }
    onSubmit?.(form);
  };
  return (
    <form
      className={`profile-address-form-fields profile-address-form-fields--${mode}`.trim()}
      onSubmit={handleSubmit}
      noValidate
    >
      <div className="profile-address-form-fields__grid">
        {FIELDS.map(([field, label, type]) => (
          <FormField
            key={field}
            label={label}
            id={`profile-address-${field}-${addressId ?? "new"}`}
            variant="white"
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
              field === "postalCode"
                ? "profile-address-form-fields__field--postal"
                : ""
            }
          />
        ))}
      </div>
      <div className="profile-address-form-fields__actions">
        {onDelete ? (
          <button
            type="button"
            className="profile-address-form-fields__delete"
            onClick={onDelete}
          >
            Delete delivery address
          </button>
        ) : null}
        <button type="submit" className="profile-address-form-fields__submit">
          {submitLabel}
        </button>
      </div>
    </form>
  );
};

export default ProfileAddressFormFields;
