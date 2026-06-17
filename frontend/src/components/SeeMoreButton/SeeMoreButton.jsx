/* “Load more” trigger for page grids of products. */
import { Link } from "react-router-dom";
import "./SeeMoreButton.scss";

/**
 * A “load more” trigger rendered as a button or router link for page grids.
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
