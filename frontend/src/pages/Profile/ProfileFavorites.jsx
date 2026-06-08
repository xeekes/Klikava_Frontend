import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useFavorites } from "../../context/FavoritesContext";
import { Clock, Star } from "../../iconComponents";
import "../../styles/profile-page.scss";
import "./ProfileFavorites.scss";

const ProfileFavorites = () => {
  const { favorites, removeFavorite } = useFavorites();
  const { addItem } = useCart();

  return (
    <section className="profile-page profile-favorites">
      <h1 className="profile-page__title">Favorites</h1>

      <div className="profile-favorites__list">
        {favorites.length ? (
          favorites.map((item) => (
            <article key={item.id} className="profile-favorites__card">
              <Link to={`/product/${item.id}`} className="profile-favorites__image-wrap">
                <img src={item.image} alt={item.title} />
              </Link>

              <div className="profile-favorites__body">
                <Link to={`/product/${item.id}`} className="profile-favorites__title">
                  {item.title}
                </Link>

                <div className="profile-favorites__summary">
                  <div className="profile-favorites__price-line">
                    <Clock className="profile-favorites__icon profile-favorites__icon--clock" />
                    <p>
                      <span>{item.price} $</span>
                    </p>
                    <p>
                      <span>{item.sold} sold</span>
                    </p>
                  </div>

                  <div className="profile-favorites__rating">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Star
                        key={index}
                        className={`profile-favorites__icon profile-favorites__icon--star ${
                          index < item.rating ? "profile-favorites__icon--star-filled" : ""
                        }`.trim()}
                      />
                    ))}
                  </div>
                </div>

                <div className="profile-favorites__recent">
                  <p>
                    <span>Lowest recent price: {item.recentLowestPrice}$</span>
                  </p>
                </div>

                <div className="profile-favorites__actions">
                  <button
                    type="button"
                    className="profile-favorites__action"
                    onClick={() => addItem(item)}
                  >
                    Add to basket
                  </button>
                  <button
                    type="button"
                    className="profile-favorites__action"
                    onClick={() => removeFavorite(item.id)}
                  >
                    Delete item
                  </button>
                </div>
              </div>
            </article>
          ))
        ) : (
          <p className="profile-favorites__empty">
            No favorites yet. Tap the heart on any product card to save it here.
          </p>
        )}
      </div>
    </section>
  );
};

export default ProfileFavorites;
