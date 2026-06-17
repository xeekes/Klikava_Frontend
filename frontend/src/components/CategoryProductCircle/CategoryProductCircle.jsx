/* Round category link icon for home page grids. */
import { Link } from "react-router-dom";
import { getProductPath } from "../../utils/productPaths";
import "./CategoryProductCircle.scss";

/**
 * Round category link icon for product grids on the main page.
 */
const CategoryProductCircle = ({ product }) => {
  const { id, image, price, title, slug } = product;
  return (
    <Link to={getProductPath({ id, slug })} className="category-product-circle">
      <div className="circle-image-wrapper">
        <img
          src={image || "/placeholder.jpg"}
          alt={title}
          className="circle-product-image"
        />
        {price && <span className="price-badge">{price}$</span>}
      </div>
    </Link>
  );
};

export default CategoryProductCircle;
