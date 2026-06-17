/* Home page section: products from the selected category. */
import CategoryProductCircle from "../CategoryProductCircle/CategoryProductCircle";
import SeeMoreButton from "../SeeMoreButton/SeeMoreButton";
import useProductPagination from "../../hooks/useProductPagination";
import "./CategoryProducts.scss";

/**
 * A section of the main page with page-by-page products from the selected category.
 */
const CategoryProducts = ({ products, showSeeMore = true }) => {
  const paginationKey = products.map((product) => product.id).join(",");
  const { visibleItems, hasMore, loadMore } = useProductPagination(
    products,
    paginationKey,
    {
      initialPageSize: showSeeMore ? undefined : products.length,
    },
  );
  return (
    <div className="category-products">
      {visibleItems.map((product) => (
        <CategoryProductCircle key={product.id} product={product} />
      ))}
      {showSeeMore && hasMore ? (
        <SeeMoreButton
          onClick={loadMore}
          wrapClassName="category-products__see-more-wrap"
        />
      ) : null}
    </div>
  );
};

export default CategoryProducts;
