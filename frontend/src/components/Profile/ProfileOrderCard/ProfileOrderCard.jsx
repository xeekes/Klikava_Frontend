/* Карточка сводки заказа с кнопками действий в зависимости от статуса. */
import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { SliderArrowRight } from "../../../iconComponents";
import { useMotionPresence } from "../../../hooks/useMotionPresence";
import "swiper/css";
import "./ProfileOrderCard.scss";
import { getBuyAgainProductId } from "../../../utils/orderHelpers";

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
  const swiperRef = useRef(null);
  const [showNext, setShowNext] = useState(false);
  const nextButtonMotion = useMotionPresence(showNext);
  const orderBasePath = `/profile/orders/${encodeURIComponent(order.id)}`;
  /**
   * Показывает или скрывает кнопку «далее» галереи в зависимости от состояния блокировки Swiper.
   */
  const updateNavigation = (swiper) => {
    setShowNext(!swiper.isLocked && !swiper.isEnd);
  };
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
          <Swiper
            className="profile-order-card__swiper"
            slidesPerView="auto"
            spaceBetween={16}
            watchOverflow
            onSwiper={(swiper) => {
              swiperRef.current = swiper;
              updateNavigation(swiper);
            }}
            onResize={updateNavigation}
            onSlideChange={updateNavigation}
            onLock={updateNavigation}
            onUnlock={updateNavigation}
          >
            {order.images.map((image, index) => (
              <SwiperSlide
                key={`${order.id}-${index}`}
                className="profile-order-card__slide"
              >
                <img className="profile-order-card__image" src={image} alt="" />
              </SwiperSlide>
            ))}
          </Swiper>
          {nextButtonMotion.rendered ? (
            <button
              type="button"
              className={`profile-order-card__gallery-next ${nextButtonMotion.className}`.trim()}
              aria-label="Next images"
              onClick={() => swiperRef.current?.slideNext()}
            >
              <SliderArrowRight aria-hidden="true" />
            </button>
          ) : null}
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
