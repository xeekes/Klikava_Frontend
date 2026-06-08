import CheckoutPaymentCard from "../CheckoutPaymentCard/CheckoutPaymentCard";
import CheckoutCardForm from "../CheckoutCardForm/CheckoutCardForm";
import "./CheckoutPaymentSection.scss";

const CheckoutPaymentSection = ({
  cards,
  selectedCardId,
  showAddForm,
  billingLines,
  onSelectCard,
  onShowAddForm,
  onHideAddForm,
  onAddCard,
  onEditCard,
  editingCardId,
}) => {
  if (showAddForm) {
    return (
      <div
        key={editingCardId ?? "new"}
        className="checkout-payment-section__swap motion-content-swap"
      >
      <CheckoutCardForm
        billingLines={billingLines}
        onAdd={() => {
          onAddCard?.();
          onHideAddForm?.();
        }}
        onCancel={onHideAddForm}
        title={editingCardId ? "Edit your card" : "Add a new card"}
        submitLabel={editingCardId ? "Save card" : "Add your card"}
      />
      </div>
    );
  }

  return (
    <section className="checkout-payment-section checkout-card motion-content-swap">
      <div className="checkout-payment-section__cards">
        {cards.map((card) => (
          <CheckoutPaymentCard
            key={card.id}
            card={card}
            isSelected={selectedCardId === card.id}
            onSelect={() => onSelectCard(card.id)}
            onEdit={() => onEditCard?.(card.id)}
          />
        ))}
      </div>

      <button
        type="button"
        className="checkout-card-footer-link"
        onClick={onShowAddForm}
      >
        Add a credit or debit card
      </button>
    </section>
  );
};

export default CheckoutPaymentSection;
