/* CRUD сохранённых платёжных карт (API или локальный mock). */
import { useMemo } from "react";
import { useMatch, useNavigate } from "react-router-dom";
import CheckoutPaymentCard from "../../components/Checkout/CheckoutPaymentCard/CheckoutPaymentCard";
import ProfileCardModal from "../../components/Profile/ProfileCardModal/ProfileCardModal";
import ProfileAddCardForm from "../../components/Profile/ProfileCardForm/ProfileAddCardForm";
import ProfileEditCardForm from "../../components/Profile/ProfileCardForm/ProfileEditCardForm";
import { cardFromForm } from "../../api/mapUserData";
import { useActionFeedback } from "../../context/ActionFeedbackContext";
import { useUserData } from "../../context/UserDataContext";
import "../../styles/profile-page.scss";
import "./ProfileCards.scss";

const DELETE_CARD_CONFIRM = {
  title: "Delete card?",
  message: "This payment card will be removed from your account.",
  confirmLabel: "Delete",
  cancelLabel: "Cancel",
};

/**
 * Сохранённые платёжные карты с модальными маршрутами добавления и редактирования.
 */
const ProfileCards = () => {
  const navigate = useNavigate();
  const { confirm, showSuccess, showError } = useActionFeedback();
  const addMatch = useMatch("/profile/cards/new");
  const editMatch = useMatch("/profile/cards/:cardId/edit");
  const { cards, addCard, updateCard, deleteCard } = useUserData();
  const editingCard = useMemo(() => {
    if (!editMatch?.params.cardId) {
      return null;
    }
    return cards.find((card) => card.id === editMatch.params.cardId);
  }, [cards, editMatch?.params.cardId]);

  /** Закрывает модальное окно карты и возвращает к списку карт. */
  const closeModal = () => {
    navigate("/profile/cards");
  };

  /**
   * Удаляет карту после подтверждения.
   * @param {string} cardId
   */
  const handleDeleteCard = async (cardId) => {
    if (!(await confirm(DELETE_CARD_CONFIRM))) {
      return;
    }
    try {
      await deleteCard(cardId);
      showSuccess("Payment card deleted.");
    } catch (error) {
      showError(error.message || "Failed to delete card.");
    }
  };

  return (
    <section className="profile-page profile-cards profile-page--footer-action">
      <h1 className="profile-page__title">Saved cards</h1>
      <div className="profile-page__panel">
        <div className="profile-page__body">
          {cards.length === 0 ? (
            <p className="profile-page__empty">No saved cards yet.</p>
          ) : (
            <div className="profile-cards__grid">
              {cards.map((card) => (
                <CheckoutPaymentCard
                  key={card.id}
                  card={card}
                  isSelected={false}
                  onDelete={() => handleDeleteCard(card.id)}
                  onEdit={() => navigate(`/profile/cards/${card.id}/edit`)}
                />
              ))}
            </div>
          )}
        </div>
        <button
          type="button"
          className="profile-cards__add profile-page__footer-action"
          onClick={() => navigate("/profile/cards/new")}
        >
          Add a credit or debit card
        </button>
      </div>
      {addMatch ? (
        <ProfileCardModal title="Add a new card" onClose={closeModal}>
          <ProfileAddCardForm
            onClose={closeModal}
            onSubmit={async (form) => {
              try {
                await addCard(cardFromForm(form));
                showSuccess("Payment card added.");
                closeModal();
              } catch (error) {
                showError(error.message || "Failed to add card.");
              }
            }}
          />
        </ProfileCardModal>
      ) : null}
      {editMatch && editingCard ? (
        <ProfileCardModal title="Edit your card" onClose={closeModal}>
          <ProfileEditCardForm
            card={editingCard}
            onClose={closeModal}
            onSubmit={async (patch) => {
              try {
                await updateCard(editingCard.id, patch);
                showSuccess("Payment card updated.");
                closeModal();
              } catch (error) {
                showError(error.message || "Failed to update card.");
              }
            }}
          />
        </ProfileCardModal>
      ) : null}
    </section>
  );
};

export default ProfileCards;
