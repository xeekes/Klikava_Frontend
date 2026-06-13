/* Универсальный контейнер-карточка с рамкой для маркетинговых секций. */
import "./Card.scss";

/**
 * Универсальный контейнер-карточка с рамкой для маркетинговых секций.
 */
const Card = ({
  title = "",
  price = "",
  numberSold = "",
  rating = "",
  image = "",
  rounded = false,
}) => {
  return (
    <article className={`card ${rounded ? "card--rounded" : ""}`.trim()}>
      <div className="card__image-wrapper">
        {image ? (
          <img
            src={image}
            alt={title || "Card image"}
            className="card__image"
          />
        ) : null}
      </div>
      <div className="card__content">
        <h3 className="card__title">{title}</h3>
        <p className="card__price">{price}</p>
        <p className="card__sold">{numberSold}</p>
        <p className="card__rating">{rating}</p>
      </div>
    </article>
  );
};

export default Card;
