/* Order summary card with action buttons based on status. */
import { Link } from "react-router-dom";
import { useCatalog } from "../../../context/CatalogContext";
import {
  getBuyAgainProductId,
  getOrderCoverImage,
} from "../../../utils/orderHelpers";
import { getProductPath } from "../../../utils/productPaths";
import "./ProfileOrderCard.scss";

const ACTION_LABELS = {
  track: "Track",
  review: "Leave a review",
  return: "Return/Refund",
  "buy-again": "Buy this again",
};

/**
 * Order summary card with action buttons based on status.
 */
const ProfileOrderCard = ({ order, actions }) => {
  const { getProductById } = useCatalog();
  const orderBasePath = `/profile/orders/${encodeURIComponent(order.id)}`;
  const coverImage = order.image || getOrderCoverImage(order);

  /**
   * Defines the route for a given order action type.
   */
  const getActionLink = (action) => {
    if (action === "track") return `${orderBasePath}/track`;
    if (action === "review") return `${orderBasePath}/review`;
    if (action === "return") return `${orderBasePath}/return`;
    const productId = getBuyAgainProductId(order);
    const product = productId ? getProductById(productId) : null;
    return product ? getProductPath(product) : productId ? `/product/${productId}` : "/catalog";
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
