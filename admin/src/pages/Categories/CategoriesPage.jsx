import PageHeader from "../../components/PageHeader/PageHeader";
import { MOCK_CATEGORIES } from "../../data/mockCategories";
import "./CategoriesPage.scss";

const CategoriesPage = () => {
  return (
    <section className="categories-page">
      <PageHeader
        title="Categories"
        subtitle="Manage departments and subcategories."
        actions={
          <button type="button" className="admin-btn admin-btn--primary" disabled>
            Add category
          </button>
        }
      />

      <div className="categories-page__grid">
        {MOCK_CATEGORIES.map((category) => (
          <article key={category.id} className="categories-page__card">
            <div className="categories-page__card-head">
              <h3>{category.name}</h3>
              <button type="button" className="admin-btn admin-btn--ghost" disabled>
                Edit
              </button>
            </div>
            <p className="categories-page__slug">{category.id}</p>
            <div className="categories-page__meta">
              <span>{category.subcategoriesCount} subcategories</span>
              <span>{category.productsCount} products</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default CategoriesPage;
