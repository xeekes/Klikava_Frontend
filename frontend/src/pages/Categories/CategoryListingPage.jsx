/* Товары, отфильтрованные по :categoryId и необязательному параметру маршрута :subcategory. */
import { Navigate, useParams } from "react-router-dom";
import CatalogListing from "../../components/CatalogListing/CatalogListing";
import PageSearchHero from "../../components/PageSearchHero/PageSearchHero";
import { useCatalog } from "../../context/CatalogContext";
import "./CategoryListingPage.scss";

/**
 * Листинг товаров одной категории из параметров маршрута.
 */
const CategoryListingPage = () => {
  const { categories, getProductsByCategory } = useCatalog();
  const { categoryId } = useParams();
  const category = categories.find(
    (item) => String(item.id) === String(categoryId),
  );
  if (!category) {
    return <Navigate to="/categories" replace />;
  }
  const products = getProductsByCategory(category.id);
  return (
    <div className="category-listing-page">
      <PageSearchHero
        eyebrow={category.name}
        title={category.name}
        subtitle={`Find items in ${category.name}.`}
        placeholder={`Search in ${category.name.toLowerCase()}...`}
        popularTerms={[]}
        searchScope={{
          scope: "category",
          categoryId: category.id,
        }}
      />
      {/* TODO: вернуть навигацию, когда на бэке появятся нормальные сабкатегории.
      <div className="container category-listing-page__nav">
        <Link to="/categories" className="category-listing-page__back">
          All categories
        </Link>
      </div>
      */}
      <CatalogListing
        title={category.name}
        subtitle={category.description || `Products in ${category.name}.`}
        products={products}
        showFeatureFilters
        emptyMessage="No products in this category."
      />
    </div>
  );
};

export default CategoryListingPage;
