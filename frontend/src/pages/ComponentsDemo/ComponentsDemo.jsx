import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import CategoryNav from '../../components/CategoryNav/CategoryNav'
import CategoryProducts from '../../components/CategoryProducts/CategoryProducts'
import ProductGrid from '../../components/ProductGrid/ProductGrid'
import ProductCardDetailed from '../../components/ProductCardDetailed/ProductCardDetailed'
import './ComponentsDemo.scss'

const ComponentsDemo = () => {
  const location = useLocation()
  const [selectedCategory, setSelectedCategory] = useState(null)

  const categories = [
    { id: 'all', name: 'All' },
    { id: 'home', name: 'Home and comfort' },
    { id: 'kitchen', name: 'Kitchen' },
    { id: 'beauty', name: 'Beauty and care' },
    { id: 'children', name: 'Goods for children' },
    { id: 'office', name: 'Office' }
  ]

  const categoryProducts = [
    {
      id: 1,
      title: 'Лампочка',
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&h=200&fit=crop',
      price: '20'
    },
    {
      id: 2,
      title: 'Одеяло',
      image: 'https://images.unsplash.com/photo-1586105251261-72a756497a11?w=200&h=200&fit=crop',
      price: '20'
    },
    {
      id: 3,
      title: 'Плюшевый мишка',
      image: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=200&h=200&fit=crop',
      price: '20'
    },
    {
      id: 4,
      title: 'Подставка для ручек',
      image: 'https://images.unsplash.com/photo-1583484963886-47ce2e4d1d2a?w=200&h=200&fit=crop',
      price: '20'
    },
    {
      id: 5,
      title: 'Чайник',
      image: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=200&h=200&fit=crop',
      price: '20'
    },
    {
      id: 6,
      title: 'Крем',
      image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=200&h=200&fit=crop',
      price: '20'
    },
    {
      id: 7,
      title: 'Ковер',
      image: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=200&h=200&fit=crop',
      price: '20'
    },
    {
      id: 8,
      title: 'Тапочки',
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&h=200&fit=crop',
      price: '20'
    }
  ]

  const gridProducts = [
    {
      id: 1,
      title: 'NUOYAQI Men\'s Corduroy Crossbody Bag',
      price: '68',
      images: [
        'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=400&h=400&fit=crop'
      ],
      rating: 5,
      sold: 422
    },
    {
      id: 2,
      title: 'High-Quality Solid Color Leather Texture Phone',
      price: '31',
      images: [
        'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=400&fit=crop'
      ],
      rating: 5,
      sold: 2521
    },
    {
      id: 3,
      title: 'High-Quality Solid Color Leather Texture Phone',
      price: '31',
      images: [
        'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=400&fit=crop'
      ],
      rating: 5,
      sold: 2621
    },
    {
      id: 4,
      title: 'Silvery Thorn Rings Spiked Wire Rings',
      price: '2',
      images: [
        'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400&h=400&fit=crop'
      ],
      rating: 5,
      sold: 5213
    },
    {
      id: 5,
      title: 'MOC White Classic Supercar',
      price: '129',
      images: [
        'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400&h=400&fit=crop'
      ],
      rating: 5,
      sold: 521
    },
    {
      id: 6,
      title: 'High-Quality Solid Color Leather Texture Phone',
      price: '31',
      images: [
        'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=400&fit=crop'
      ],
      rating: 5,
      sold: 2521
    }
  ]

  return (
    <div className="components-demo">
      <div className="demo-container">
        <h1 className="demo-title">Демонстрация компонентов</h1>

        {/* CategoryNav Demo */}
        <section className="demo-section">
          <h2 className="section-title">CategoryNav - Навигация по категориям</h2>
          <div className="demo-content">
            <CategoryNav 
              categories={categories} 
              onCategoryChange={(categoryId) => {
                setSelectedCategory(categoryId)
                console.log('Выбрана категория:', categoryId)
              }} 
            />
            {selectedCategory && (
              <p className="selected-info">Выбрана категория: {selectedCategory}</p>
            )}
          </div>
        </section>

        {/* CategoryProducts Demo */}
        <section className="demo-section">
          <h2 className="section-title">CategoryProducts - Круглые карточки товаров</h2>
          <div className="demo-content">
            <CategoryProducts products={categoryProducts} />
          </div>
        </section>

        {/* ProductGrid Demo */}
        <section className="demo-section">
          <h2 className="section-title">ProductGrid - Сетка товаров с каруселью</h2>
          <div className="demo-content">
            <ProductGrid products={gridProducts} columns={3} />
          </div>
        </section>

        {/* ProductGrid с 2 колонками */}
        <section className="demo-section">
          <h2 className="section-title">ProductGrid - 2 колонки</h2>
          <div className="demo-content">
            <ProductGrid products={gridProducts.slice(0, 4)} columns={2} />
          </div>
        </section>

        {/* ProductCardDetailed Demo */}
        <section className="demo-section">
          <h2 className="section-title">ProductCardDetailed - Детальная карточка товара</h2>
          <div className="demo-content">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
              <ProductCardDetailed 
                product={{
                  id: 1,
                  title: 'High-Quality Solid Color Leather Texture Phone',
                  price: '31',
                  lowestPrice: '40',
                  images: ['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop'],
                  rating: 5,
                  sold: 2521
                }}
              />
            </div>
          </div>
        </section>

        {/* Auth Forms Demo */}
        <section className="demo-section">
          <h2 className="section-title">Формы авторизации</h2>
          <div className="demo-content">
            <p>
              Формы авторизации:{" "}
              <Link to="/login" state={{ backgroundLocation: location }}>
                login
              </Link>
              ,{" "}
              <Link to="/register" state={{ backgroundLocation: location }}>
                register
              </Link>
              ,{" "}
              <Link to="/forgot-password" state={{ backgroundLocation: location }}>
                forgot password
              </Link>
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}

export default ComponentsDemo
