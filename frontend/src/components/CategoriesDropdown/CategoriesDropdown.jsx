/* Mega menu of categories in the header from CatalogContext. */
import { useState } from "react";
import { Link } from "react-router-dom";
import { useCatalog } from "../../context/CatalogContext";
import "./CategoriesDropdown.scss";

/**
 * Mega menu of categories in the header, filled from CatalogContext.
 */
const CategoriesDropdown = () => {
  const { categories } = useCatalog();
  const [activeCategoryId, setActiveCategoryId] = useState(categories[0]?.id);
  if (!categories.length) {
    return (
      <div
        className="categories-dropdown categories-dropdown--empty"
        role="menu"
      >
        <p>No categories</p>
      </div>
    );
  }
  const activeCategory =
    categories.find((category) => category.id === activeCategoryId) ??
    categories[0];
  return (
    <div className="categories-dropdown" role="menu" aria-label="Categories">
      <ul className="categories-dropdown__main-list">
        {categories.map((category) => (
          <li key={category.id}>
            <button
              type="button"
              className={`categories-dropdown__item ${
                activeCategoryId === category.id
                  ? "categories-dropdown__item--active"
                  : ""
              }`.trim()}
              onMouseEnter={() => setActiveCategoryId(category.id)}
            >
              {category.name}
            </button>
          </li>
        ))}
      </ul>
      <div
        key={activeCategoryId}
        className="categories-dropdown__subcategories motion-content-swap"
      >
        <h3 className="categories-dropdown__subcategories-title">
          {activeCategory.name}
        </h3>
        <hr className="categories-dropdown__subcategories-divider" />
        <Link
          to={`/categories/${activeCategory.id}`}
          className="categories-dropdown__view-all"
        >
          View all in {activeCategory.name}
        </Link>
      </div>
    </div>
  );
};

export default CategoriesDropdown;
