import { useState } from "react";
import TagSlider from "../TagSlider/TagSlider";
import "./CategoryNav.scss";
const CategoryNav = ({ categories, onCategoryChange }) => {
  const [activeCategory, setActiveCategory] = useState(categories[0]?.id || null)

  const handleCategoryClick = (categoryId) => {
    setActiveCategory(categoryId)
    if (onCategoryChange) {
      onCategoryChange(categoryId)
    }
  }

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
  );}

export default CategoryNav
