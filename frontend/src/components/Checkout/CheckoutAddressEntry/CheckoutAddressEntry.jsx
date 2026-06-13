/* Строка адреса только для чтения с действиями выбора/редактирования. */
import FormField from "../../FormField/FormField";
import "./CheckoutAddressEntry.scss";

/**
 * Разделяет строки адреса на улицу и остаток для отображения.
 */
const getAddressDisplay = (lines) => {
  if (!lines?.length) {
    return { street: "", rest: "" };
  }
  return {
    street: lines[0],
    rest: lines.slice(1).join(" "),
  };
};

/**
 * Строка адреса только для чтения с действиями выбора и редактирования при оформлении заказа.
 */
const CheckoutAddressEntry = ({
  address,
  isSelected,
  showMore = false,
  onSelect,
  onEdit,
  onMore,
}) => {
  const { street, rest } = getAddressDisplay(address.lines);
  return (
    <div
      className={`checkout-address-entry ${
        isSelected ? "checkout-address-entry--selected" : ""
      }`.trim()}
    >
      <div className="checkout-address-entry__top">
        <div className="checkout-address-entry__fields">
          <FormField variant="gray" readOnly readOnlyValue={address.fullName} />
          <FormField variant="gray" readOnly readOnlyValue={address.phone} />
        </div>
      </div>
      <div className="checkout-address-entry__address-box">
        {street ? (
          <p className="checkout-address-entry__address-line">{street}</p>
        ) : null}
        {rest ? (
          <p className="checkout-address-entry__address-line">{rest}</p>
        ) : null}
      </div>
      <div className="checkout-address-entry__actions">
        <div className="checkout-address-entry__action-group">
          <button
            type="button"
            className={`checkout-outline-btn ${
              isSelected ? "checkout-outline-btn--selected" : ""
            }`.trim()}
            onClick={onSelect}
          >
            Select this
          </button>
          <button
            type="button"
            className="checkout-outline-btn"
            onClick={onEdit}
          >
            Edit
          </button>
        </div>
        {showMore ? (
          <button type="button" className="checkout-text-btn" onClick={onMore}>
            More...
          </button>
        ) : null}
      </div>
    </div>
  );
};

export default CheckoutAddressEntry;
