# Компоненты

## CategoryNav
Навигация по категориям товаров с активным состоянием.

**Использование:**
```jsx
const categories = [
  { id: 'all', name: 'All' },
  { id: 'home', name: 'Home and comfort' },
  { id: 'kitchen', name: 'Kitchen' },
  { id: 'beauty', name: 'Beauty and care' },
  { id: 'children', name: 'Goods for children' },
  { id: 'office', name: 'Office' }
]

<CategoryNav 
  categories={categories} 
  onCategoryChange={(categoryId) => console.log(categoryId)} 
/>
```

## CategoryProductCircle
Круглая карточка товара для категорий с зеленым бейджем цены.

**Использование:**
```jsx
const product = {
  id: 1,
  title: 'Product Name',
  image: 'https://example.com/image.jpg',
  price: '20'
}

<CategoryProductCircle product={product} />
```

## ProductCardWithCarousel
Карточка товара с каруселью изображений, рейтингом и количеством проданных товаров.

**Использование:**
```jsx
const product = {
  id: 1,
  title: 'NUOYAQI Men\'s Corduroy Crossbody Bag',
  price: '68',
  images: ['image1.jpg', 'image2.jpg'],
  rating: 5,
  sold: 422
}

<ProductCardWithCarousel product={product} />
```

## ProductGrid
Сетка товаров с настраиваемым количеством колонок.

**Использование:**
```jsx
const products = [
  { id: 1, title: 'Product 1', price: '68', rating: 5, sold: 422 },
  { id: 2, title: 'Product 2', price: '31', rating: 5, sold: 2521 }
]

<h2 className="my-page__grid-title">Section title</h2>
<ProductGrid products={products} columns={3} />
```

## CategoryProducts
Контейнер для отображения круглых карточек товаров категории.

**Использование:**
```jsx
const products = [
  { id: 1, image: 'image1.jpg', price: '20' },
  { id: 2, image: 'image2.jpg', price: '25' }
]

<CategoryProducts products={products} />
```
