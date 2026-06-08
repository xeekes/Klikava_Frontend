import { Link, Navigate, useParams } from "react-router-dom";
import CatalogListing from "../../components/CatalogListing/CatalogListing";
import PageSearchHero from "../../components/PageSearchHero/PageSearchHero";
import TagSlider from "../../components/TagSlider/TagSlider";
import { getCategoryById } from "../../data/categories";
import { useCatalog } from "../../context/CatalogContext";
import "./CategoryListingPage.scss";

const CategoryListingPage = () => {
  const { getProductsByCategory } = useCatalog();
  const { categoryId, subcategory: encodedSubcategory } = useParams();
  const category = getCategoryById(categoryId);
  const subcategory = encodedSubcategory
    ? decodeURIComponent(encodedSubcategory)
    : null;

  if (!category) {
    return <Navigate to="/categories" replace />;
  }

  if (subcategory && !category.subcategories.includes(subcategory)) {
    return <Navigate to={`/categories/${category.id}`} replace />;
  }

  const products = getProductsByCategory(category.id, subcategory || undefined);
  const title = subcategory || category.name;
  const subtitle = subcategory
    ? `${category.name} / ${subcategory}`
    : `All products in ${category.name}`;
  const popularTerms = subcategory
    ? category.subcategories.filter((item) => item !== subcategory).slice(0, 6)
    : category.subcategories.slice(0, 6);

  return (
    <div className="category-listing-page">
      <PageSearchHero
        eyebrow={category.name}
        title={title}
        subtitle={`Find items in ${category.name}${subcategory ? ` — ${subcategory}` : ""}.`}
        placeholder={`Search in ${category.name.toLowerCase()}...`}
        popularTerms={popularTerms}
        searchScope={{
          scope: "category",
          categoryId: category.id,
          subcategory: subcategory || undefined,
        }}
      />

      <div className="container category-listing-page__nav">
        <TagSlider
          className="category-listing-page__subnav"
          ariaLabel="Subcategories"
        >
          <Link
            to={`/categories/${category.id}`}
            className={`category-listing-page__subnav-link ${
              !subcategory ? "category-listing-page__subnav-link--active" : ""
            }`.trim()}
          >
            All
          </Link>
          {category.subcategories.map((item) => (
            <Link
              key={item}
              to={`/categories/${category.id}/${encodeURIComponent(item)}`}
              className={`category-listing-page__subnav-link ${
                subcategory === item
                  ? "category-listing-page__subnav-link--active"
                  : ""
              }`.trim()}
            >
              {item}
            </Link>
          ))}
        </TagSlider>
      </div>

      <CatalogListing
        title={title}
        subtitle={subtitle}
        products={products}
        emptyMessage="No products in this category yet."
      />
    </div>
  );
};

export default CategoryListingPage;
