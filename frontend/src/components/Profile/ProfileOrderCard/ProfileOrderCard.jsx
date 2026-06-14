/* Карточка сводки заказа с кнопками действий в зависимости от статуса. */
import { Link } from "react-router-dom";
import {
  getBuyAgainProductId,
  getOrderCoverImage,
} from "../../../utils/orderHelpers";
import "./ProfileOrderCard.scss";

const ACTION_LABELS = {
  track: "Track",
  review: "Leave a review",
  return: "Return/Refund",
  "buy-again": "Buy this again",
};

/**
 * Карточка сводки заказа с кнопками действий в зависимости от статуса.
 */
const ProfileOrderCard = ({ order, actions }) => {
  const orderBasePath = `/profile/orders/${encodeURIComponent(order.id)}`;
  const coverImage = order.image || getOrderCoverImage(order);

  /**
   * Определяет маршрут для заданного типа действия с заказом.
   */
  const getActionLink = (action) => {
    if (action === "track") return `${orderBasePath}/track`;
    if (action === "review") return `${orderBasePath}/review`;
    if (action === "return") return `${orderBasePath}/return`;
    const productId = getBuyAgainProductId(order);
    return productId ? `/product/${productId}` : "/catalog";
  };

  return (
    <article className="profile-order-card">
      <div className="profile-order-card__top">
        <div className="profile-order-card__gallery">
          <div className="profile-order-card__slide">
            {coverImage ? (
              <img
                className="profile-order-card__image"
                src={coverImage}
                alt=""
              />
            ) : (
              <div
                className="profile-order-card__image profile-order-card__image--placeholder"
                aria-hidden="true"
              />
            )}
          </div>
        </div>
        <div className="profile-order-card__actions">
          {actions.map((action) => (
            <Link
              key={action}
              to={getActionLink(action)}
              className="profile-order-card__action"
            >
              {ACTION_LABELS[action]}
            </Link>
          ))}
        </div>
      </div>
      <div className="profile-order-card__meta">
        <div className="profile-order-card__meta-item">
          <p>
            {order.itemCount} Item: {order.total} $
          </p>
        </div>
        <div className="profile-order-card__meta-item">
          <p>Order Time: {order.orderTime}</p>
        </div>
        <div className="profile-order-card__meta-item">
          <p>Order ID: {order.id}</p>
        </div>
      </div>
    </article>
  );
};

export default ProfileOrderCard;
