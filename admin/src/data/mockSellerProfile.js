export const MOCK_SELLER_PROFILE = {
  firstName: "Sam",
  lastName: "Seller",
  publicWebAddress: "https://www.figma.com/design",
  aboutMe: "",
  avatar:
    "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&h=400&fit=crop",
};

export const MOCK_SELLER_SETTINGS = {
  firstName: "Sam",
  lastName: "Seller",
  email: "seller@example.com",
  phone: "+1 555 010 0002",
  country: "Demo Country",
  city: "Demo City",
  address: "456 Commerce Ave",
  password: "****************",
};

export const MOCK_SELLER_STATS = {
  views: {
    label: "Views",
    total: 1,
    daily: [1, 0, 0, 0, 0, 0, 0],
  },
  purchased: {
    label: "Purchased",
    total: 0,
    daily: [0, 0, 0, 0, 0, 0, 0],
  },
  favorite: {
    label: "Favorite",
    total: 0,
    daily: [0, 0, 0, 0, 0, 0, 0],
  },
  comments: {
    label: "Comments",
    total: 0,
    daily: [0, 0, 0, 0, 0, 0, 0],
  },
};

export const SELLER_STAT_METRICS = Object.keys(MOCK_SELLER_STATS);
