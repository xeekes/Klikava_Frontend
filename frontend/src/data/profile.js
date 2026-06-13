/* Устаревшие статические фикстуры профиля (не используются при активном API/local context). */
import bagImage from "../assets/images/bag.png";
import carImage from "../assets/images/car.png";
import phoneImage from "../assets/images/phone.png";
import ringImage from "../assets/images/ring.png";
import logoImage from "../assets/icons/logo.svg";
import bearImage from "../assets/images/bear.png";
import { ALL_PRODUCTS } from "./products";

export const DEFAULT_PERSONAL_INFO = {
  avatar: bearImage,
  firstName: "Alex",
  lastName: "Buyer",
  city: "Demo City",
  address: "123 Market Street",
  phone: "+1 555 010 0001",
  email: "buyer@example.com",
  country: "Demo Country",
  password: "********",
};
const ORDER_PRODUCT_BY_IMAGE = {
  [ringImage]: { id: "ring", title: "Silver Ring" },
  [bearImage]: { id: "bear", title: "Cute Teddy Bear Plush" },
  [carImage]: { id: "car", title: "City Sport Car Model" },
  [phoneImage]: { id: "phone", title: "Phone Case Pro" },
  [bagImage]: { id: "bag", title: "NUOYAQI Men's Corduroy Crossbody Bag" },
};

/**
 * Преобразует URL изображений заказа в готовые к отображению позиции со стабильными id.
 * @param {object|null} order
 * @returns {Array<object>}
 */
export const getOrderProducts = (order) => {
  if (!order) return [];
  return order.images.map((image, index) => {
    const meta = ORDER_PRODUCT_BY_IMAGE[image] || {
      id: `product-${index}`,
      title: order.productTitle,
    };
    return {
      id: `${order.id}-${meta.id}-${index}`,
      title: meta.title,
      image,
    };
  });
};

export const PROFILE_ORDERS = [
  {
    id: "PO-130-14393975201832636",
    status: "delivered",
    itemCount: 1,
    total: 3,
    orderTime: "Nov 6, 2024",
    images: [ringImage],
    productTitle: "Pair Charming Floral Stud Earrings - Vibrant Multiple",
  },
  {
    id: "PO-130-5433975201832636",
    status: "delivered",
    itemCount: 5,
    total: 65,
    orderTime: "Nov 3, 2025",
    images: [bearImage, carImage, phoneImage, ringImage],
    productTitle: "Pair Charming Floral Stud Earrings - Vibrant Multiple",
  },
  {
    id: "PO-130-998877665544",
    status: "processing",
    itemCount: 1,
    total: 3,
    orderTime: "Nov 6, 2024",
    images: [ringImage],
    productTitle: "Pair Charming Floral Stud Earrings - Vibrant Multiple",
  },
  {
    id: "PO-130-112233445566",
    status: "sent",
    itemCount: 5,
    total: 65,
    orderTime: "Nov 3, 2025",
    images: [bearImage, carImage, phoneImage],
    productTitle: "Pair Charming Floral Stud Earrings - Vibrant Multiple",
  },
  {
    id: "PO-130-778899001122",
    status: "return",
    itemCount: 1,
    total: 3,
    orderTime: "Nov 6, 2024",
    images: [ringImage],
    productTitle: "Pair Charming Floral Stud Earrings - Vibrant Multiple",
  },
  {
    id: "PO-130-334455667788",
    status: "return",
    itemCount: 3,
    total: 65,
    orderTime: "Nov 3, 2025",
    images: [bearImage, carImage, phoneImage],
    productTitle: "Pair Charming Floral Stud Earrings - Vibrant Multiple",
  },
];
export const PROFILE_FAVORITES = ALL_PRODUCTS.slice(0, 4).map((product) => ({
  ...product,
  sold: 422,
  recentLowestPrice: 89,
  rating: 5,
}));
export const PROFILE_BROWSING_HISTORY = [
  {
    date: "Apr 4, 2025",
    products: ALL_PRODUCTS.slice(0, 3).map((product) => ({
      ...product,
      title: "New Fashion Vintage Creative Versatile Niche",
      price: 123,
      sold: 5315,
    })),
  },
  {
    date: "Apr 8, 2025",
    products: ALL_PRODUCTS.slice(3, 4).map((product) => ({
      ...product,
      title: "New Fashion Vintage Creative Versatile Niche",
      price: 123,
      sold: 5315,
    })),
  },
];
export const PROFILE_COUPONS = Array.from({ length: 9 }, (_, index) => ({
  id: `coupon-${index + 1}`,
  amount: index % 2 === 0 ? "-1.20 $" : "-0.40 $",
  expiry: "until 1 may",
  minOrder: index % 2 === 0 ? "11.88" : "5.00",
}));
export const PROFILE_FEEDBACK = [
  {
    id: "fb-1",
    productTitle: "Pair Charming Floral Stud Earrings - Vibrant Multiple",
    image: ringImage,
    text: "The earrings are very beautiful, the quality is excellent, and the delivery was fast. I recommend them to everyone!",
    rating: 5,
    photos: [ringImage, ringImage, ringImage],
  },
  {
    id: "fb-2",
    productTitle: "NUOYAQI Men's Corduroy Crossbody Bag",
    image: bagImage,
    text: "Great bag for daily use. Comfortable and looks exactly like on the photo.",
    rating: 4,
    photos: [bagImage, bagImage, bagImage],
  },
];
export const PROFILE_SUPPORT_CHAT_DATE = "18.03.2025";
export const PROFILE_CHAT_THREADS = [
  {
    id: "support",
    name: "KlikAVASupport",
    preview: "Hello, Zhenya!",
    time: "12:10",
    date: PROFILE_SUPPORT_CHAT_DATE,
    subtitle: "Help and support",
    logo: logoImage,
  },
  {
    id: "store",
    name: "CRAZYRACE Store",
    preview: "Your order has been shipped",
    time: "15:45",
    date: "10.02.2025",
    subtitle: "Store chat",
    logo: carImage,
  },
];
export const PROFILE_CHAT_MESSAGES = [
  {
    id: "m1",
    sender: "KlikAVASupport",
    text: "Hello, Zhenya!",
    time: "12:10",
    incoming: true,
  },
  {
    id: "m2",
    sender: "KlikAVASupport",
    text: "Describe your problem or select an order.",
    time: "12:11",
    incoming: true,
  },
  {
    id: "m3",
    sender: "You",
    text: "I have a problem and I need to solve it",
    time: "12:15",
    incoming: false,
  },
  {
    id: "m4",
    sender: "KlikAVASupport",
    text: "The question could not be recognized. Please formulate your request differently.",
    time: "12:11",
    incoming: true,
  },
];
export const PROFILE_TRACK_STEPS = [
  {
    id: "1",
    title: "Delivered",
    date: "November 25, 2024, 12:37 Pm",
    active: true,
  },
  {
    id: "2",
    title: "At The Post Office",
    date: "Nov 24, 2024, 4:51 Pm",
    active: false,
  },
  {
    id: "3",
    title: "Being Handed Over By Customs",
    date: "Nov 20, 2024, 3:44 Pm",
    active: false,
  },
  {
    id: "4",
    title: "Arrived At The Destination Country",
    date: "Nov 18, 2024, 3:41 Pm",
    active: false,
  },
  {
    id: "5",
    title: "Departure From Country",
    date: "Nov 10, 2024, 12:00 Am",
    active: false,
  },
  {
    id: "6",
    title: "Order Shipped",
    date: "Nov 7, 2024, 3:20 Pm",
    active: false,
  },
  {
    id: "7",
    title: "Order Submitted",
    date: "Nov 6, 2024, 9:42 Pm",
    active: false,
  },
];
export const PROFILE_ADDRESSES = [
  {
    id: "addr-1",
    firstName: "Alex",
    lastName: "Buyer",
    fullName: "Alex Buyer",
    phone: "+1 555 010 0001",
    country: "Demo Country",
    address: "123 Market Street",
    city: "Demo City",
    postalCode: "DC 10001",
    lines: ["123 Market Street,", "Demo City, DC 10001,", "Demo Country"],
  },
  {
    id: "addr-2",
    firstName: "Alex",
    lastName: "Buyer",
    fullName: "Alex Buyer",
    phone: "+1 555 010 0001",
    country: "Demo Country",
    address: "123 Market Street",
    city: "Demo City",
    postalCode: "DC 10001",
    lines: ["123 Market Street,", "Demo City, DC 10001,", "Demo Country"],
  },
];
export const PROFILE_SAVED_CARDS = [
  {
    id: "card-1",
    brand: "mastercard",
    label: "Mastercard",
    last4: "9298",
    expiryMonth: "04",
    expiryYear: "2028",
  },
  {
    id: "card-2",
    brand: "visa",
    label: "Visa",
    last4: "9298",
    expiryMonth: "04",
    expiryYear: "2028",
  },
  {
    id: "card-3",
    brand: "mastercard",
    label: "Mastercard",
    last4: "5959",
    expiryMonth: "04",
    expiryYear: "2028",
  },
];
export const PROFILE_BILLING_ADDRESS = {
  title: "123 Market Street",
  line: "Demo City, DC 10001, Demo Country",
};

export const PROFILE_CARD_FORM_DEFAULTS = {
  cardNumber: "4441 1110 3400 6043",
  expiryMonth: "04",
  expiryYear: "2028",
};

/**
 * Определяет id товара каталога по первой позиции в заказе.
 * @param {object} order
 * @returns {string|number}
 */
export const getBuyAgainProductId = (order) => {
  const products = getOrderProducts(order);
  if (!products.length) {
    return ALL_PRODUCTS[0]?.id ?? 1;
  }
  const match = ALL_PRODUCTS.find(
    (product) => product.image === products[0].image,
  );
  return match?.id ?? ALL_PRODUCTS[0]?.id ?? 1;
};

/**
 * Сужает список заказов до записей, соответствующих id вкладки статуса.
 * @param {Array<object>} orders
 * @param {string} tab
 * @returns {Array<object>}
 */
export const filterOrdersByTabFromList = (orders, tab) => {
  if (!tab || tab === "all") {
    return orders;
  }
  return orders.filter((order) => order.status === tab);
};

/**
 * Находит один заказ в переданном списке по id.
 * @param {Array<object>} orders
 * @param {string} orderId
 * @returns {object|undefined}
 */
export const getOrderByIdFromList = (orders, orderId) =>
  orders.find((order) => order.id === orderId);

/**
 * Находит один mock-заказ в статическом seed-списке профиля.
 * @param {string} orderId
 * @returns {object|undefined}
 */
export const getOrderById = (orderId) =>
  PROFILE_ORDERS.find((order) => order.id === orderId);

/**
 * Фильтрует статический список заказов профиля по id вкладки статуса.
 * @param {string} tab
 * @returns {Array<object>}
 */
export const filterOrdersByTab = (tab) =>
  filterOrdersByTabFromList(PROFILE_ORDERS, tab);

/**
 * Возвращает ключи действий, доступных для заказов на вкладке с данным статусом.
 * @param {string} tab
 * @returns {Array<string>}
 */
export const getOrderActions = (tab) => {
  if (tab === "processing" || tab === "sent") {
    return ["track", "buy-again"];
  }
  if (tab === "return") {
    return ["track", "review", "buy-again"];
  }
  return ["track", "review", "return", "buy-again"];
};
