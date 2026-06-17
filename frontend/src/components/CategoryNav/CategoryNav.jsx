/* Horizontal navigation with category chips for listing pages. */
import { useState } from "react";
import TagSlider from "../TagSlider/TagSlider";
import "./CategoryNav.scss";

/**
 * Horizontal navigation with category chips for listing pages.
 */
const CategoryNav = ({ categories, onCategoryChange }) => {
  const [activeCategory, setActiveCategory] = useState(
    categories[0]?.id || null,
  );
  /**
   * Updates the active chip and notifies the parent of the selection.
   */
  const handleCategoryClick = (categoryId) => {
    setActiveCategory(categoryId);
    if (onCategoryChange) {
      onCategoryChange(categoryId);
    }
  };
  return (
    <TagSlider className="category-nav" ariaLabel="Categories">
      {categories.map((category) => (
        <button
          key={category.id}
          type="button"
          className={`category-link ${
            activeCategory === category.id ? "active" : ""
          }`.trim()}
          onClick={() => handleCategoryClick(category.id)}
        >
          {category.name}
        </button>
      ))}
    </TagSlider>
  );
};

export default CategoryNav;
