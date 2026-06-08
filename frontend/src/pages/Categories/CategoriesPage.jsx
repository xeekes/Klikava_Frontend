import { Link } from "react-router-dom";
import PageSearchHero from "../../components/PageSearchHero/PageSearchHero";
import { CATEGORIES } from "../../data/categories";
import { useCatalog } from "../../context/CatalogContext";
import "./CategoriesPage.scss";

const CategoriesPage = () => {
  const { getProductsByCategory, POPULAR_SEARCHES } = useCatalog();
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
        <div className="categories-page__grid">
          {CATEGORIES.map((category) => {
            const productCount = getProductsByCategory(category.id).length;

            return (
              <article key={category.id} className="categories-page__card">
                <Link
                  to={`/categories/${category.id}`}
                  className="categories-page__card-link"
                >
                  <h2>{category.name}</h2>
                  <p>{productCount} products</p>
                  <span>{category.subcategories.length} subcategories</span>
                </Link>

                <ul className="categories-page__subcategories">
                  {category.subcategories.slice(0, 4).map((subcategory) => (
                    <li key={subcategory}>
                      <Link
                        to={`/categories/${category.id}/${encodeURIComponent(subcategory)}`}
                      >
                        {subcategory}
                      </Link>
                    </li>
                  ))}
                </ul>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CategoriesPage;
