import { Link } from 'react-router-dom'
import './CategoryProductCircle.scss'

const CategoryProductCircle = ({ product }) => {
  const { id, image, price, title } = product

  return (
    <Link to={`/product/${id}`} className="category-product-circle">
      <div className="circle-image-wrapper">
        <img 
          src={image || '/placeholder.jpg'} 
          alt={title} 
          className="circle-product-image" 
        />
        {price && (
          <span className="price-badge">{price}$</span>
        )}
      </div>
    </Link>
  )
}

export default CategoryProductCircle
