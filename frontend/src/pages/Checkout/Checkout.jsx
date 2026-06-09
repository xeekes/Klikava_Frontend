import { useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import CartItem from "../../components/CartItem/CartItem";
import CheckoutAddressSection from "../../components/Checkout/CheckoutAddressSection/CheckoutAddressSection";
import CheckoutPaymentSection from "../../components/Checkout/CheckoutPaymentSection/CheckoutPaymentSection";
import CheckoutSummary from "../../components/Checkout/CheckoutSummary/CheckoutSummary";
import { cardFromForm } from "../../api/mapUserData";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { useUserData } from "../../context/UserDataContext";
import LoadingSpinner from "../../components/LoadingSpinner/LoadingSpinner";
import "./Checkout.scss";

const Checkout = () => {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const { items, isEmpty, isLoading, updateQuantity, removeItem } = useCart();
  const { addresses, cards, addAddress, updateAddress, addCard } = useUserData();

  const [selectedAddressId, setSelectedAddressId] = useState(addresses[0]?.id);
  const [selectedCardId, setSelectedCardId] = useState(cards[0]?.id);
  const [isAddressesExpanded, setIsAddressesExpanded] = useState(false);
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [showAddCard, setShowAddCard] = useState(false);
  const [editingCardId, setEditingCardId] = useState(null);

  const selectedAddress = useMemo(
    () => addresses.find((item) => item.id === selectedAddressId),
    [addresses, selectedAddressId]
  );

  const billingLines = useMemo(
    () => selectedAddress?.lines || [],
    [selectedAddress],
  );

  if (!isAuthLoading && !isAuthenticated) {
    return <Navigate to="/cart" replace />;
  }

  if (!isLoading && isEmpty) {
    return <Navigate to="/cart" replace />;
  }

  const handleSaveAddress = (form, addressId) => {
    if (addressId) {
      updateAddress(addressId, form);
      setSelectedAddressId(addressId);
    } else {
      const nextAddress = addAddress(form);
      setSelectedAddressId(nextAddress.id);
    }
    setShowAddAddress(false);
    setEditingAddressId(null);
    setIsAddressesExpanded(false);
  };

  const handleAddCard = async (form) => {
    const nextCard = await addCard(cardFromForm(form));
    setSelectedCardId(nextCard.id);
    setShowAddCard(false);
    setEditingCardId(null);
  };

  return (
    <div className="checkout-page">
      <div className="checkout-page__layout">
        <div className="container">
          <p className="checkout-page__label">Place an order</p>

          <div className="checkout-page__grid">
            <section className="checkout-page__main">
              {isAuthLoading || isLoading ? (
                <LoadingSpinner variant="block" label="Preparing checkout..." />
              ) : (
                <>
                  <CheckoutAddressSection
                    addresses={addresses}
                    selectedAddressId={selectedAddressId}
                    editingAddressId={editingAddressId}
                    isExpanded={isAddressesExpanded}
                    showAddForm={showAddAddress}
                    onSelectAddress={setSelectedAddressId}
                    onToggleExpanded={() => setIsAddressesExpanded((prev) => !prev)}
                    onShowAddForm={() => {
                      setEditingAddressId(null);
                      setShowAddAddress(true);
                      setIsAddressesExpanded(false);
                    }}
                    onEditAddress={(addressId) => {
                      setEditingAddressId(addressId);
                      setShowAddAddress(true);
                      setIsAddressesExpanded(false);
                    }}
                    onHideAddForm={() => {
                      setShowAddAddress(false);
                      setEditingAddressId(null);
                    }}
                    onSaveAddress={handleSaveAddress}
                  />

                  <CheckoutPaymentSection
                    cards={cards}
                    selectedCardId={selectedCardId}
                    showAddForm={showAddCard}
                    billingLines={billingLines}
                    onSelectCard={setSelectedCardId}
                    onShowAddForm={() => {
                      setShowAddCard(true);
                      setEditingCardId(null);
                    }}
                    onHideAddForm={() => {
                      setShowAddCard(false);
                      setEditingCardId(null);
                    }}
                    onAddCard={handleAddCard}
                    onEditCard={(cardId) => {
                      setEditingCardId(cardId);
                      setShowAddCard(true);
                    }}
                    editingCardId={editingCardId}
                  />

                  <ul className="checkout-page__items">
                    {items.map((item) => (
                      <li key={item.productId}>
                        <CartItem
                          item={item}
                          onUpdateQuantity={updateQuantity}
                          onRemove={removeItem}
                        />
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </section>

            <CheckoutSummary />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
