import { useState } from "react";
import { Link } from "react-router-dom";
import { CATEGORIES } from "../../data/categories";
import "./CategoriesDropdown.scss";

const CategoriesDropdown = () => {
  const [activeCategoryId, setActiveCategoryId] = useState(CATEGORIES[0].id);

  const activeCategory =
    CATEGORIES.find((category) => category.id === activeCategoryId) ??
    CATEGORIES[0];

  return (
    <div className="categories-dropdown" role="menu" aria-label="Categories">
      <ul className="categories-dropdown__main-list">
        {CATEGORIES.map((category) => (
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
        <ul className="categories-dropdown__subcategories-list">
          {activeCategory.subcategories.map((subcategory) => (
            <li key={subcategory}>
              <Link
                to={`/categories/${activeCategory.id}/${encodeURIComponent(subcategory)}`}
                className="categories-dropdown__item"
              >
                {subcategory}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default CategoriesDropdown;
