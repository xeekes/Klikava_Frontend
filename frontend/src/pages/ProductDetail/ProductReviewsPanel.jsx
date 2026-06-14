/* Блок отзывов на странице товара: список, создание, редактирование. */
import { useEffect, useState } from "react";
import { catalogApi } from "../../api/catalogApi";
import { hasApiBaseUrl } from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import { Star } from "../../iconComponents";

/**
 * @param {{ product: object, usesApi: boolean }} props
 */
const ProductReviewsPanel = ({ product, usesApi }) => {
  const { user, isAuthenticated } = useAuth();
  const [reviews, setReviews] = useState(product.reviews || []);
  const [isLoading, setIsLoading] = useState(false);
  const [draft, setDraft] = useState({ rating: 0, text: "" });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!usesApi || !product?.id) {
      setReviews(product.reviews || []);
      return undefined;
    }
    let cancelled = false;
    const loadReviews = async () => {
      setIsLoading(true);
      try {
        const loaded = await catalogApi.listProductReviews(product.id);
        if (!cancelled) {
          setReviews(loaded);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Failed to load reviews.");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };
    loadReviews();
    return () => {
      cancelled = true;
    };
  }, [product?.id, product.reviews, usesApi]);

  const ownReview = reviews.find(
    (review) => String(review.userId) === String(user?.id),
  );

  const handleSubmit = async () => {
    if (!draft.rating || !draft.text.trim()) {
      setError("Rating and review text are required.");
      return;
    }
    if (!product.variantId) {
      setError("This product cannot be reviewed yet.");
      return;
    }
    setError("");
    setIsSubmitting(true);
    try {
      const created = await catalogApi.createReview(product.id, {
        product_variant_id: Number(product.variantId),
        rating: draft.rating,
        comment: draft.text.trim(),
      });
      setReviews((prev) => [created, ...prev.filter((item) => item.id !== created.id)]);
      setDraft({ rating: 0, text: "" });
    } catch (err) {
      setError(err.message || "Failed to publish review.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (reviewId) => {
    try {
      await catalogApi.deleteReview(product.id, reviewId);
      setReviews((prev) => prev.filter((item) => item.id !== reviewId));
    } catch (err) {
      setError(err.message || "Failed to delete review.");
    }
  };

  return (
    <div className="product-detail__panel-section product-detail__panel-section--reviews">
      <h4 className="product-detail__panel-title">Reviews</h4>
      {isAuthenticated && hasApiBaseUrl() && !ownReview ? (
        <div className="product-detail__review-form">
          <div
            className="product-detail__review-rating"
            aria-label="Your rating"
          >
            {Array.from({ length: 5 }).map((_, index) => (
              <button
                key={index}
                type="button"
                className="product-detail__review-rate-btn"
                onClick={() =>
                  setDraft((prev) => ({ ...prev, rating: index + 1 }))
                }
                aria-label={`Rate ${index + 1} stars`}
              >
                <Star
                  className={`product-detail__icon product-detail__icon--star ${
                    index < draft.rating ? "" : "product-detail__icon--star-empty"
                  }`.trim()}
                />
              </button>
            ))}
          </div>
          <textarea
            className="product-detail__review-input"
            value={draft.text}
            onChange={(event) =>
              setDraft((prev) => ({ ...prev, text: event.target.value }))
            }
            placeholder="Share your experience"
            rows={3}
          />
          <button
            type="button"
            className="product-detail__review-submit"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Publishing..." : "Publish review"}
          </button>
        </div>
      ) : null}
      {error ? (
        <p className="product-detail__review-error" role="alert">
          {error}
        </p>
      ) : null}
      <div className="product-detail__reviews-scroll">
        {isLoading ? <p>Loading reviews...</p> : null}
        <ul className="product-detail__reviews-list">
          {!isLoading && reviews.length === 0 ? (
            <li className="product-detail__review product-detail__review--empty">
              No reviews yet.
            </li>
          ) : null}
          {reviews.map((review) => (
            <li key={review.id} className="product-detail__review">
              <div className="product-detail__review-avatar" aria-hidden="true">
                {review.author.charAt(0)}
              </div>
              <div className="product-detail__review-body">
                <div className="product-detail__review-top">
                  <p className="product-detail__review-author">{review.author}</p>
                  <div
                    className="product-detail__review-rating"
                    aria-label={`${review.rating} out of 5 stars`}
                  >
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Star
                        key={index}
                        className={`product-detail__icon product-detail__icon--star ${
                          index < review.rating
                            ? ""
                            : "product-detail__icon--star-empty"
                        }`.trim()}
                      />
                    ))}
                  </div>
                </div>
                <p className="product-detail__review-text">{review.text}</p>
                {String(review.userId) === String(user?.id) ? (
                  <button
                    type="button"
                    className="product-detail__review-delete"
                    onClick={() => handleDelete(review.id)}
                  >
                    Delete
                  </button>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ProductReviewsPanel;
