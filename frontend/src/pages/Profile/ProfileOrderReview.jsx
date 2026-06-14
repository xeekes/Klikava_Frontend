/* Отправка отзыва о товаре из доставленного заказа. */
import { Link, useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { ArrowLeft } from "../../iconComponents";
import ProfileOrderProductForm from "../../components/Profile/ProfileOrderProductForm/ProfileOrderProductForm";
import { catalogApi } from "../../api/catalogApi";
import { hasApiBaseUrl } from "../../api/client";
import { useUserData } from "../../context/UserDataContext";
import {
  getOrderByIdFromList,
  getOrderProducts,
} from "../../utils/orderHelpers";
import { rules } from "../../utils/validation";
import "../../styles/profile-page.scss";
import "./ProfileOrderFormPage.scss";

/**
 * Создаёт пустые черновики отзывов для каждой позиции заказа.
 * @param {Array<object>} products
 * @returns {Array<object>}
 */
const createInitialReviews = (products) =>
  products.map(() => ({
    rating: 0,
    text: "",
    photos: [],
  }));

/**
 * Поток отправки отзывов для каждого товара в доставленном заказе.
 */
const ProfileOrderReview = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { orders, addFeedback } = useUserData();
  const order = getOrderByIdFromList(orders, orderId);
  const products = getOrderProducts(order);
  const [reviews, setReviews] = useState(() => createInitialReviews(products));
  const [reviewErrors, setReviewErrors] = useState({});

  /**
   * Объединяет частичные данные отзыва для одного товара и сбрасывает ошибки полей.
   * @param {number} index
   * @param {object} patch
   */
  const updateReview = (index, patch) => {
    setReviews((prev) =>
      prev.map((review, reviewIndex) =>
        reviewIndex === index ? { ...review, ...patch } : review,
      ),
    );
    if (reviewErrors[index]) {
      setReviewErrors((prev) => {
        const next = { ...prev };
        delete next[index];
        return next;
      });
    }
  };

  /**
   * Проверяет рейтинг и текст черновика отзыва для одного товара.
   * @param {number} index
   * @returns {boolean}
   */
  const validateReview = (index) => {
    const review = reviews[index] ?? { text: "", rating: 0, photos: [] };
    const errors = {
      text: rules.reviewText()(review.text),
      rating: rules.rating()(review.rating),
    };
    const hasErrors = Boolean(errors.text || errors.rating);
    if (hasErrors) {
      setReviewErrors((prev) => ({ ...prev, [index]: errors }));
    }
    return !hasErrors;
  };
  if (!order) {
    return (
      <section className="profile-page">
        <Link to="/profile/orders" className="profile-page__back">
          <ArrowLeft className="profile-page__back-icon" aria-hidden="true" />
          Leave a review
        </Link>
        <p>Order not found</p>
      </section>
    );
  }
  return (
    <section className="profile-page profile-order-form-page">
      <Link to="/profile/orders" className="profile-page__back">
        <ArrowLeft className="profile-page__back-icon" aria-hidden="true" />
        Leave a review
      </Link>
      <div className="profile-order-form-page__list">
        {products.map((product, index) => (
          <ProfileOrderProductForm
            key={product.id}
            product={product}
            textLabel="Sharing your thought and experience about this item"
            textValue={reviews[index]?.text ?? ""}
            onTextChange={(value) => updateReview(index, { text: value })}
            textError={reviewErrors[index]?.text}
            ratingError={reviewErrors[index]?.rating}
            photos={reviews[index]?.photos ?? []}
            onPhotosChange={(photos) => updateReview(index, { photos })}
            submitLabel="Publish"
            onSubmit={async () => {
              if (!validateReview(index)) {
                return;
              }
              const review = reviews[index];
              const attachedPhotos = review?.photos?.length
                ? review.photos
                : [product.image];
              if (hasApiBaseUrl() && product.productId) {
                try {
                  const raw = await catalogApi.getProductByIdOrSlug(
                    product.productId,
                  );
                  const variantId =
                    product.variantId ||
                    raw?.current_version?.variants?.[0]?.id;
                  if (variantId) {
                    await catalogApi.createReview(product.productId, {
                      product_variant_id: variantId,
                      rating: review?.rating ?? 0,
                      comment: review?.text ?? "",
                    });
                  }
                } catch {
                  /* Сохраняем локальный отзыв, даже если отправка через API не удалась. */
                }
              }
              addFeedback({
                productTitle: product.title,
                image: product.image,
                text: review?.text ?? "",
                rating: review?.rating ?? 0,
                photos: attachedPhotos,
              });
              navigate("/profile/feedback");
            }}
            showRating
            rating={reviews[index]?.rating ?? 0}
            onRatingChange={(value) => updateReview(index, { rating: value })}
          />
        ))}
      </div>
    </section>
  );
};

export default ProfileOrderReview;
