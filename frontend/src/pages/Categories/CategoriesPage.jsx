/* Индексная сетка категорий со ссылками на маршруты листинга категорий. */
import { Link } from "react-router-dom";
import PageSearchHero from "../../components/PageSearchHero/PageSearchHero";
import { useCatalog } from "../../context/CatalogContext";
import "./CategoriesPage.scss";

/**
 * Индекс категорий со ссылками на маршруты листинга отделов.
 */
const CategoriesPage = () => {
  const { categories, getProductsByCategory, POPULAR_SEARCHES } = useCatalog();
  return (
    <section className="categories-page">
      <PageSearchHero
        eyebrow="Categories"
        title="Shop by department"
        subtitle="Browse products by category or jump straight to what you are looking for."
        placeholder="Search categories and products..."
        popularTerms={POPULAR_SEARCHES}
      />
      <div className="container">
        {categories.length === 0 ? (
          <p className="categories-page__empty">No categories available.</p>
        ) : (
          <div className="categories-page__grid">
            {categories.map((category) => {
              const productCount = getProductsByCategory(category.id).length;
              return (
                <article key={category.id} className="categories-page__card">
                  <Link
                    to={`/categories/${category.id}`}
                    className="categories-page__card-link"
                  >
                    <h2>{category.name}</h2>
                    <p>{productCount} products</p>
                  </Link>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default CategoriesPage;
