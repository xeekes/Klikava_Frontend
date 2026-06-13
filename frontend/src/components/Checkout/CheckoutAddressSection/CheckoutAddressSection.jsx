/* Выбор адреса и inline-формы добавления/редактирования при оформлении заказа. */
import CheckoutAddressEntry from "../CheckoutAddressEntry/CheckoutAddressEntry";
import CheckoutAddressForm from "../CheckoutAddressForm/CheckoutAddressForm";
import "./CheckoutAddressSection.scss";

/**
 * Выбор адреса с inline-формами добавления и редактирования при оформлении заказа.
 */
const CheckoutAddressSection = ({
  addresses,
  selectedAddressId,
  editingAddressId,
  isExpanded,
  showAddForm,
  onSelectAddress,
  onToggleExpanded,
  onShowAddForm,
  onEditAddress,
  onHideAddForm,
  onSaveAddress,
}) => {
  const editingAddress = addresses.find(
    (address) => address.id === editingAddressId,
  );
  if (showAddForm) {
    return (
      <div
        key={editingAddressId ?? "new"}
        className="checkout-address-section__swap motion-content-swap"
      >
        <CheckoutAddressForm
          initialAddress={editingAddress}
          title={editingAddressId ? "Edit address" : "Add a new address"}
          submitLabel={editingAddressId ? "Save" : "Add"}
          onSave={(form) => {
            onSaveAddress?.(form, editingAddressId);
            onHideAddForm?.();
          }}
          onCancel={onHideAddForm}
        />
      </div>
    );
  }
  const selectedAddress =
    addresses.find((address) => address.id === selectedAddressId) ??
    addresses[0];
  const visibleAddresses = isExpanded
    ? addresses
    : selectedAddress
      ? [selectedAddress]
      : [];
  return (
    <section
      key={isExpanded ? "expanded" : "collapsed"}
      className="checkout-address-section checkout-card motion-content-swap"
    >
      <div className="checkout-address-section__list">
        {visibleAddresses.map((address, index) => (
          <CheckoutAddressEntry
            key={address.id}
            address={address}
            isSelected={selectedAddressId === address.id}
            showMore={!isExpanded && index === 0 && addresses.length > 1}
            onSelect={() => onSelectAddress(address.id)}
            onEdit={() => onEditAddress?.(address.id)}
            onMore={onToggleExpanded}
          />
        ))}
      </div>
      {isExpanded ? (
        <div className="checkout-address-section__list-actions">
          <button
            type="button"
            className="checkout-text-btn"
            onClick={onToggleExpanded}
          >
            Close...
          </button>
        </div>
      ) : null}
      <button
        type="button"
        className="checkout-card-footer-link"
        onClick={onShowAddForm}
      >
        Add a new address
      </button>
    </section>
  );
};

export default CheckoutAddressSection;
