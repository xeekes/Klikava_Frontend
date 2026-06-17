/* Line of the saved card with the selection status when placing an order. */
import "./CheckoutPaymentCard.scss";

/**
 * The saved card string with the selection status when placing an order or in your profile.
 */
const CheckoutPaymentCard = ({
  card,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
}) => {
  const isProfileMode = Boolean(onDelete);
  return (
    <article
      className={`checkout-payment-card ${
        isSelected ? "checkout-payment-card--selected" : ""
      } ${isProfileMode ? "" : "checkout-payment-card--selectable"}`.trim()}
      onClick={isProfileMode ? undefined : onSelect}
      onKeyDown={
        isProfileMode
          ? undefined
          : (event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onSelect?.();
              }
            }
      }
      role={isProfileMode ? undefined : "button"}
      tabIndex={isProfileMode ? undefined : 0}
      aria-pressed={isProfileMode ? undefined : isSelected}
    >
      <div className="checkout-payment-card__brand-wrap">
        <span
          className={`checkout-payment-card__brand checkout-payment-card__brand--${card.brand}`}
          aria-hidden
        />
        <div className="checkout-payment-card__meta">
          <span className="checkout-payment-card__label">{card.label}</span>
          <span className="checkout-payment-card__last4">..{card.last4}</span>
        </div>
      </div>
      <div className="checkout-payment-card__actions">
        {isProfileMode ? (
          <button
            type="button"
            className="checkout-outline-btn"
            onClick={(event) => {
              event.stopPropagation();
              onDelete?.();
            }}
          >
            Delete
          </button>
        ) : null}
        <button
          type="button"
          className="checkout-outline-btn"
          onClick={(event) => {
            event.stopPropagation();
            onEdit?.();
          }}
        >
          Edit
        </button>
      </div>
    </article>
  );
};

export default CheckoutPaymentCard;
