/* Триггер «загрузить ещё» для постраничных сеток товаров. */
import { Link } from "react-router-dom";
import "./SeeMoreButton.scss";

/**
 * Триггер «загрузить ещё», рендерящийся как кнопка или ссылка роутера для постраничных сеток.
 */
const SeeMoreButton = ({
  onClick,
  to,
  className = "",
  wrapClassName = "",
  children = "See more",
}) => {
  const buttonClass = `see-more-button ${className}`.trim();
  const control = to ? (
    <Link to={to} className={buttonClass}>
      {children}
    </Link>
  ) : (
    <button type="button" className={buttonClass} onClick={onClick}>
      {children}
    </button>
  );
  return (
    <div className={`see-more-button-wrap ${wrapClassName}`.trim()}>
      {control}
    </div>
  );
};

export default SeeMoreButton;
