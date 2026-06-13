/* Секция главной страницы: товары из выбранной категории. */
import CategoryProductCircle from "../CategoryProductCircle/CategoryProductCircle";
import SeeMoreButton from "../SeeMoreButton/SeeMoreButton";
import useProductPagination from "../../hooks/useProductPagination";
import "./CategoryProducts.scss";

/**
 * Секция главной страницы с постраничными товарами из выбранной категории.
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
