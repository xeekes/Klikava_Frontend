/* Блок отзывов на странице товара: только просмотр списка. */
import { useEffect, useState } from "react";
import { catalogApi } from "../../api/catalogApi";
import { ApiError } from "../../api/errors";
import { useAuth } from "../../context/AuthContext";
import { Star } from "../../iconComponents";

/**
 * @param {{ product: object, usesApi: boolean }} props
 */
const ProductReviewsPanel = ({ product, usesApi }) => {
  const { isAuthenticated } = useAuth();
  const [reviews, setReviews] = useState(product.reviews || []);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!usesApi || !product?.id || !isAuthenticated) {
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
          if (err instanceof ApiError && err.status === 401) {
            setReviews([]);
          } else {
            setReviews(product.reviews || []);
          }
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
  }, [product?.id, product.reviews, usesApi, isAuthenticated]);

  return (
    <div className="product-detail__panel-section product-detail__panel-section--reviews">
      <h4 className="product-detail__panel-title">Reviews</h4>
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
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ProductReviewsPanel;
