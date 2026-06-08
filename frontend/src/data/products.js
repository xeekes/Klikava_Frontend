import bagImage from "../assets/images/bag.png";
import carImage from "../assets/images/car.png";
import phoneImage from "../assets/images/phone.png";
import phone2Image from "../assets/images/phone2.png";
import ringImage from "../assets/images/ring.png";
import cupImage from "../assets/images/cup.png";
import ironImage from "../assets/images/iron.png";
import lampImage from "../assets/images/lamp.png";
import pencilsImage from "../assets/images/pencils.png";
import socksImage from "../assets/images/socks.png";
import bearImage from "../assets/images/bear.png";
import { CATEGORIES, getCategoryById } from "./categories";

const PRODUCT_IMAGES = [
  bagImage,
  carImage,
  phoneImage,
  phone2Image,
  ringImage,
  cupImage,
  ironImage,
  lampImage,
  pencilsImage,
  socksImage,
  bearImage,
];

const BRANDS = [
  "Aurora",
  "Velora",
  "Nordex",
  "Klikava",
  "Urbanex",
  "Lumina",
  "Craftline",
  "Pureform",
  "Stellar",
  "Harbor",
  "Summit",
  "Granite",
  "Silverline",
  "Bluepeak",
  "Greenfield",
  "Ironwood",
  "Softwave",
  "Brighton",
  "Metroline",
  "Oakridge",
  "Riverstone",
  "Cloudnine",
  "Foxtrail",
  "Suncrest",
  "Nightfall",
  "Daybreak",
  "Westwind",
  "Eastbay",
  "Northline",
  "Southgate",
];

const GENERIC_LINES = [
  "Essential",
  "Premium",
  "Classic",
  "Studio",
  "Compact",
  "Deluxe",
  "Everyday",
  "Signature",
];

const CATEGORY_LINES = {
  "mobile-phones": [
    "5G Handset",
    "Dual-SIM Phone",
    "Rugged Smartphone",
    "Camera Phone",
    "Budget Smartphone",
    "Foldable Phone",
    "Gaming Phone",
    "Business Phone",
  ],
  computers: [
    "Ultrabook",
    "Gaming Laptop",
    "Workstation",
    "Mini PC",
    "All-in-One",
    "Tablet PC",
    "2-in-1 Convertible",
    "Chromebook",
  ],
  electronics: [
    "Wireless Earbuds",
    "Smart Speaker",
    "Action Camera",
    "Streaming Stick",
    "Smart Hub",
    "Portable Projector",
    "Noise-Cancel Headphones",
    "E-Reader",
  ],
  "home-appliances": [
    "Air Fryer",
    "Robot Vacuum",
    "Blender Set",
    "Coffee Machine",
    "Steam Iron",
    "Electric Kettle",
    "Food Processor",
    "Juicer",
  ],
  "home-improvement": [
    "LED Panel",
    "Power Drill",
    "Paint Kit",
    "Tool Organizer",
    "Smart Thermostat",
    "Wall Sconce",
    "Extension Ladder",
    "Measuring Laser",
  ],
  security: [
    "Door Camera",
    "Motion Sensor",
    "Smart Lock",
    "Alarm Hub",
    "Video Doorbell",
    "Safe Box",
    "Window Sensor",
    "Flood Detector",
  ],
  automobiles: [
    "Dash Camera",
    "Car Charger",
    "Seat Organizer",
    "Tire Inflator",
    "Jump Starter",
    "Phone Mount",
    "Trunk Mat",
    "Scale Model",
  ],
  "home-garden": [
    "Garden Hose",
    "Planter Set",
    "Solar Light",
    "Pruning Shears",
    "Watering Timer",
    "Patio Chair",
    "Compost Bin",
    "Seed Starter",
  ],
  furniture: [
    "Desk Chair",
    "Bookshelf",
    "Side Table",
    "Storage Ottoman",
    "Coat Rack",
    "Wall Shelf",
    "TV Stand",
    "Nightstand",
  ],
  clothing: [
    "Cotton Hoodie",
    "Denim Jacket",
    "Running Tee",
    "Wool Sweater",
    "Linen Shirt",
    "Cargo Pants",
    "Rain Jacket",
    "Thermal Set",
  ],
  "beauty-health": [
    "Face Serum",
    "Hair Dryer",
    "Electric Toothbrush",
    "Body Lotion",
    "Makeup Palette",
    "Beard Trimmer",
    "Sunscreen SPF50",
    "Massage Gun",
  ],
  "sports-outdoors": [
    "Yoga Mat",
    "Resistance Bands",
    "Camping Lantern",
    "Hiking Backpack",
    "Water Bottle",
    "Fitness Tracker",
    "Tennis Racket",
    "Cycling Gloves",
  ],
  "toys-kids": [
    "Building Blocks",
    "Plush Toy",
    "Board Game",
    "STEM Kit",
    "Puzzle Set",
    "RC Car",
    "Art Easel",
    "Storybook Pack",
  ],
  "books-media": [
    "Hardcover Novel",
    "Study Guide",
    "Graphic Novel",
    "Audiobook Card",
    "Journal Set",
    "Language Course",
    "Cookbook",
    "Poetry Collection",
  ],
  "jewelry-watches": [
    "Silver Ring",
    "Analog Watch",
    "Pearl Earrings",
    "Leather Bracelet",
    "Gold Pendant",
    "Sport Watch",
    "Charm Necklace",
    "Cufflinks",
  ],
  "shoes-bags": [
    "Crossbody Bag",
    "Running Shoes",
    "Leather Tote",
    "Travel Backpack",
    "Ankle Boots",
    "Canvas Sneakers",
    "Weekender Bag",
    "Hiking Boots",
  ],
  "pet-supplies": [
    "Pet Bed",
    "Slow Feeder",
    "Grooming Brush",
    "Chew Toy",
    "Litter Mat",
    "Harness Set",
    "Aquarium Filter",
    "Treat Jar",
  ],
  "office-stationery": [
    "Desk Lamp",
    "Notebook Pack",
    "Marker Set",
    "File Organizer",
    "Stapler Kit",
    "Whiteboard",
    "Pen Refills",
    "Label Printer",
  ],
  "industrial-scientific": [
    "Digital Caliper",
    "Safety Goggles",
    "Lab Beakers",
    "Multimeter",
    "Work Gloves",
    "Precision Scale",
    "Heat Gun",
    "Sample Kit",
  ],
  "food-grocery": [
    "Organic Coffee",
    "Snack Bundle",
    "Olive Oil",
    "Granola Mix",
    "Herbal Tea",
    "Pasta Set",
    "Honey Jar",
    "Spice Collection",
  ],
  "musical-instruments": [
    "Acoustic Guitar",
    "Keyboard",
    "Violin Starter",
    "Drum Pad",
    "Ukulele",
    "Microphone",
    "Music Stand",
    "Tuner Pedal",
  ],
  "art-crafts": [
    "Acrylic Paint",
    "Sketchbook",
    "Clay Kit",
    "Brush Set",
    "Embroidery Pack",
    "Canvas Panels",
    "Glue Gun",
    "Craft Scissors",
  ],
  "wedding-events": [
    "Table Runner",
    "Party Lights",
    "Guest Book",
    "Favor Boxes",
    "Balloon Arch",
    "Photo Backdrop",
    "Champagne Flutes",
    "Place Cards",
  ],
  "travel-luggage": [
    "Carry-on Suitcase",
    "Packing Cubes",
    "Travel Adapter",
    "Neck Pillow",
    "Toiletry Bag",
    "Luggage Scale",
    "Passport Wallet",
    "Garment Bag",
  ],
};

const DISCOUNT_PERCENTS = [8, 10, 12, 15, 18, 20, 22, 25, 28, 30, 35, 40];

const CATEGORY_TOP_MAP = {
  "mobile-phones": "office",
  computers: "office",
  electronics: "office",
  "home-appliances": "kitchen",
  "home-improvement": "home",
  security: "home",
  automobiles: "office",
  "home-garden": "home",
  furniture: "home",
  clothing: "beauty",
  "beauty-health": "beauty",
  "sports-outdoors": "home",
  "toys-kids": "children",
  "books-media": "office",
  "jewelry-watches": "beauty",
  "shoes-bags": "beauty",
  "pet-supplies": "home",
  "office-stationery": "office",
  "industrial-scientific": "office",
  "food-grocery": "kitchen",
  "musical-instruments": "office",
  "art-crafts": "children",
  "wedding-events": "home",
  "travel-luggage": "office",
};

const getSlotsForCategory = (category) =>
  Math.max(4, Math.min(category.subcategories.length, 8));

const applyDiscount = (basePrice, discountPercent) => {
  const originalPrice = basePrice;
  const price = Math.max(1, Math.round(originalPrice * (1 - discountPercent / 100)));

  return {
    price,
    originalPrice,
    discountPercent,
  };
};

const buildUniqueTitle = (id, categoryIndex, categoryId) => {
  const brand = BRANDS[(id * 3 + categoryIndex * 7) % BRANDS.length];
  const lines = CATEGORY_LINES[categoryId] || GENERIC_LINES;
  const line = lines[(id * 5 + categoryIndex * 11) % lines.length];
  const model = 1000 + ((id * 37 + categoryIndex * 13) % 9000);
  return `${brand} ${line} ${model}`;
};

const buildBasePrice = (id, categoryIndex, slotIndex) =>
  19 + ((id * 47 + categoryIndex * 19 + slotIndex * 31) % 880);

const buildCatalog = () => {
  const products = [];
  const usedTitles = new Set();
  let id = 1;

  CATEGORIES.forEach((category, categoryIndex) => {
    const slotCount = getSlotsForCategory(category);
    const topCategoryId = CATEGORY_TOP_MAP[category.id] || "home";

    for (let slotIndex = 0; slotIndex < slotCount; slotIndex += 1) {
      const subcategory = category.subcategories[slotIndex % category.subcategories.length];
      let title = buildUniqueTitle(id, categoryIndex, category.id);

      while (usedTitles.has(title)) {
        title = `${title} Mk.${slotIndex + 1}`;
      }

      usedTitles.add(title);

      const basePrice = buildBasePrice(id, categoryIndex, slotIndex);
      const hasDiscount = (id + categoryIndex) % 3 !== 1;
      const pricing = hasDiscount
        ? applyDiscount(
            basePrice,
            DISCOUNT_PERCENTS[(id + slotIndex) % DISCOUNT_PERCENTS.length]
          )
        : {
            price: basePrice,
            originalPrice: undefined,
            discountPercent: undefined,
          };

      const isTop = slotIndex < 2;
      const image = PRODUCT_IMAGES[(id + categoryIndex + slotIndex) % PRODUCT_IMAGES.length];
      const isScaleModel =
        category.id === "automobiles" &&
        slotIndex === 0 &&
        image === carImage;

      products.push({
        id,
        title,
        image,
        ...pricing,
        categoryId: category.id,
        categoryName: category.name,
        subcategory,
        topCategoryId,
        isTop,
        sold: isTop
          ? 820 + ((id * 97 + categoryIndex * 53) % 4100)
          : 45 + ((id * 41 + slotIndex * 29) % 960),
        rating: Number((3.4 + ((id * 17 + slotIndex) % 16) / 10).toFixed(1)),
        ...(isScaleModel ? { reviewsPreset: "car" } : {}),
      });

      id += 1;
    }
  });

  return products;
};

export const ALL_PRODUCTS = buildCatalog();

export const getDiscountProducts = () =>
  ALL_PRODUCTS.filter(
    (product) =>
      typeof product.discountPercent === "number" && product.discountPercent > 0
  );

export const DISCOUNT_PRODUCTS = getDiscountProducts();

const MIN_TOP_PRODUCTS = 6;

export const getTopProducts = (topCategoryId = "all") => {
  const topProducts = ALL_PRODUCTS.filter((product) => product.isTop);

  if (topCategoryId === "all") {
    return topProducts;
  }

  const filtered = topProducts.filter(
    (product) => product.topCategoryId === topCategoryId
  );

  if (filtered.length >= MIN_TOP_PRODUCTS) {
    return filtered;
  }

  const usedIds = new Set(filtered.map((product) => product.id));

  return [
    ...filtered,
    ...topProducts.filter((product) => !usedIds.has(product.id)),
  ].slice(0, MIN_TOP_PRODUCTS);
};

export const getProductsByCategory = (categoryId, subcategory) => {
  let products = ALL_PRODUCTS.filter((product) => product.categoryId === categoryId);

  if (subcategory) {
    products = products.filter((product) => product.subcategory === subcategory);
  }

  return products;
};

export const POPULAR_SEARCHES = [
  "phone",
  "bag",
  "ring",
  "lamp",
  "bear",
  "car",
];

export const getProductsForScope = (scope = {}) => {
  switch (scope.scope) {
    case "discounts":
      return getDiscountProducts();
    case "top":
      return getTopProducts(scope.topCategoryId || "all");
    case "category":
      if (!scope.categoryId) {
        return ALL_PRODUCTS;
      }
      return getProductsByCategory(scope.categoryId, scope.subcategory);
    default:
      return ALL_PRODUCTS;
  }
};

const filterProductsByQuery = (products, query) => {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return products;
  }

  const tokens = normalizedQuery.split(/\s+/).filter(Boolean);

  return products.filter((product) => {
    const haystack = [
      product.title,
      product.categoryName,
      product.subcategory,
    ]
      .join(" ")
      .toLowerCase();

    return tokens.every((token) => haystack.includes(token));
  });
};

export const searchProducts = (query, scope = {}) => {
  const pool = getProductsForScope(scope);
  return filterProductsByQuery(pool, query);
};

export const searchCategories = (query) => {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return [];
  }

  const results = [];

  CATEGORIES.forEach((category) => {
    if (category.name.toLowerCase().includes(normalizedQuery)) {
      results.push({
        categoryId: category.id,
        label: category.name,
        subcategory: null,
      });
    }

    category.subcategories.forEach((subcategory) => {
      if (subcategory.toLowerCase().includes(normalizedQuery)) {
        results.push({
          categoryId: category.id,
          label: subcategory,
          subcategory,
          parentName: category.name,
        });
      }
    });
  });

  return results;
};

export const getSearchSuggestions = (
  query,
  { productLimit = 5, categoryLimit = 4, ...scope } = {}
) => {
  const normalizedQuery = query.trim();
  const showCategories = !scope.scope || scope.scope === "category";

  if (!normalizedQuery) {
    return {
      products: [],
      categories: [],
      popular: POPULAR_SEARCHES,
    };
  }

  return {
    products: searchProducts(normalizedQuery, scope).slice(0, productLimit),
    categories: showCategories
      ? searchCategories(normalizedQuery).slice(0, categoryLimit)
      : [],
    popular: [],
  };
};

export const sortProducts = (products, sortBy) => {
  const sorted = [...products];

  switch (sortBy) {
    case "price-low":
      return sorted.sort((a, b) => a.price - b.price);
    case "price-high":
      return sorted.sort((a, b) => b.price - a.price);
    case "rating":
      return sorted.sort((a, b) => b.rating - a.rating);
    case "sold":
      return sorted.sort((a, b) => b.sold - a.sold);
    case "popular":
    default:
      return sorted.sort((a, b) => b.sold - a.sold);
  }
};

export const filterProducts = (
  products,
  { minPrice, maxPrice, minRating, discountedOnly } = {}
) =>
  products.filter((product) => {
    if (discountedOnly && !product.discountPercent) {
      return false;
    }

    if (minPrice !== undefined && minPrice !== "" && product.price < Number(minPrice)) {
      return false;
    }

    if (maxPrice !== undefined && maxPrice !== "" && product.price > Number(maxPrice)) {
      return false;
    }

    if (minRating !== undefined && minRating !== "" && product.rating < Number(minRating)) {
      return false;
    }

    return true;
  });

const defaultProductDetails = {
  sold: 422,
  recentLowestPrice: 80,
  colors: ["#d8c7a8", "#8f6f4f", "#3f6a5a", "#6a6f8f", "#2f2f2f"],
  imagesCount: 5,
  specs: [
    { label: "Material", value: "Corduroy" },
    { label: "Occasion", value: "Daily Commute" },
    { label: "Tape Type", value: "Adjustable" },
    { label: "Style", value: "Street" },
    { label: "Operation Instruction", value: "Hand wash, do not dry clean" },
    { label: "Item SKU", value: "JT842686" },
    { label: "Origin", value: "Hebei, China" },
  ],
  tabs: [
    { id: "details", label: "Product Details" },
    { id: "shipping", label: "Shipping" },
    { id: "reviews", label: "Reviews" },
  ],
  shipping: {
    company: "nova post",
    deliveryTime: "7-18 business days",
    costs: "Free on all orders",
    stats: [
      { label: "<=7 business days", percent: 12.5 },
      { label: "8 business days", percent: 18.2 },
      { label: "9 business days", percent: 25.1 },
      { label: "10 business days", percent: 16.4 },
      { label: "11 business days", percent: 11.8 },
      { label: "12 business days", percent: 8.3 },
      { label: "13 business days", percent: 4.7 },
      { label: ">=14 business days", percent: 3.0 },
    ],
  },
  reviews: [
    {
      id: 1,
      author: "Darlene_Robertson",
      rating: 4,
      text: "Wow, this is so good!",
      image: bagImage,
    },
    {
      id: 2,
      author: "Devon_Lane",
      rating: 5,
      text: "A nice, simple handbag, everything is as described.",
    },
    {
      id: 3,
      author: "Kathryn_Murphy",
      rating: 4,
      text: "Perfect, comfortable bag, just like in the picture. It's slightly wrinkled.",
      image: bagImage,
    },
    {
      id: 4,
      author: "Brooklyn_Simmons",
      rating: 4,
      text: "Nice bag, color matches the photos.",
    },
  ],
};

const CITY_SPORT_CAR_REVIEWS = [
  {
    id: 1,
    author: "Darlene_Robertson",
    rating: 4,
    text: "Wow, the model looks even better in person!",
    image: carImage,
  },
  {
    id: 2,
    author: "Devon_Lane",
    rating: 5,
    text: "A nice city sport car model, everything is as described.",
  },
  {
    id: 3,
    author: "Kathryn_Murphy",
    rating: 4,
    text: "Perfect detail level, just like in the picture. Paint is slightly matte.",
    image: carImage,
  },
  {
    id: 4,
    author: "Brooklyn_Simmons",
    rating: 4,
    text: "Color matches the photos, wheels roll smoothly.",
  },
  {
    id: 5,
    author: "Wade_Warren",
    rating: 5,
    text: "Great gift for a car fan. Packaging was solid.",
    image: carImage,
  },
  {
    id: 6,
    author: "Esther_Howard",
    rating: 3,
    text: "Good model overall, one mirror was a bit loose.",
  },
  {
    id: 7,
    author: "Jacob_Jones",
    rating: 5,
    text: "Fast delivery and the scale feels accurate on the shelf.",
  },
  {
    id: 8,
    author: "Jenny_Wilson",
    rating: 4,
    text: "My son loved it. Doors open and close cleanly.",
    image: carImage,
  },
  {
    id: 9,
    author: "Robert_Fox",
    rating: 5,
    text: "Excellent value for this price point.",
  },
  {
    id: 10,
    author: "Cameron_Williamson",
    rating: 4,
    text: "Would buy again. Sits nicely next to my other models.",
    image: carImage,
  },
];

export const getProductById = (id) => {
  const product = ALL_PRODUCTS.find((item) => item.id === Number(id));
  if (!product) return null;

  const images = Array.from(
    { length: defaultProductDetails.imagesCount },
    () => product.image
  );

  return {
    ...product,
    ...defaultProductDetails,
    images,
    sold: product.sold,
    price: product.price,
    recentLowestPrice: product.originalPrice ?? product.price,
    reviews:
      product.reviewsPreset === "car"
        ? CITY_SPORT_CAR_REVIEWS
        : defaultProductDetails.reviews,
    category: getCategoryById(product.categoryId),
  };
};

export const getRelatedProducts = (id, limit = 8) => {
  const product = ALL_PRODUCTS.find((item) => item.id === Number(id));

  if (!product) {
    return ALL_PRODUCTS.filter((item) => item.id !== Number(id)).slice(0, limit);
  }

  const sameCategory = ALL_PRODUCTS.filter(
    (item) => item.id !== Number(id) && item.categoryId === product.categoryId
  );

  if (sameCategory.length >= limit) {
    return sameCategory.slice(0, limit);
  }

  const fallback = ALL_PRODUCTS.filter((item) => item.id !== Number(id));
  return [...sameCategory, ...fallback].slice(0, limit);
};
