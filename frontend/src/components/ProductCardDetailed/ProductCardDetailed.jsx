import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Cart, Heart, Star } from '../../iconComponents'
import './ProductCardDetailed.scss'

const ProductCardDetailed = ({ product }) => {
  const { id, title, price, lowestPrice, images, rating, sold } = product
  const [isLiked, setIsLiked] = useState(false)
  
  const productImages = images || [product.image || '/placeholder.jpg']

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating)
    const stars = []
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="star-filled" />)
    }
    const emptyStars = 5 - fullStars
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="star-empty" />)
    }
    
    return stars
  }

  const handleLike = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsLiked(!isLiked)
  }

  const handleAddToCart = (e) => {
    e.preventDefault()
    e.stopPropagation()
    console.log('Добавить в корзину:', id)
  }

  return (
    <Link to={`/product/${id}`} className="product-card-detailed">
      <div className="product-image-detailed">
        <img 
          src={productImages[0]} 
          alt={title} 
          className="product-detailed-img" 
        />
      </div>
      <div className="product-info-detailed">
        <h3 className="product-title-detailed">{title}</h3>
        <div className="product-price-detailed">
          <span className="current-price-detailed">{price}$</span>
        </div>
        {lowestPrice && (
          <div className="lowest-price">
            Lowest recent price: {lowestPrice}$
          </div>
        )}
        {sold && (
          <div className="sold-info">{sold} sold</div>
        )}
        <div className="product-rating-detailed">
          <div className="stars-container">
            {renderStars(rating || 5)}
          </div>
          <div className="product-actions-detailed">
            <button 
              className={`action-button like-button ${isLiked ? 'liked' : ''}`}
              onClick={handleLike}
              aria-label="Добавить в избранное"
            >
              <Heart className={isLiked ? "liked" : ""} />
            </button>
            <button 
              className="action-button cart-button"
              onClick={handleAddToCart}
              aria-label="Добавить в корзину"
            >
              <Cart />
            </button>
          </div>
        </div>
      </div>
    </Link>
  )
}

export default ProductCardDetailed
