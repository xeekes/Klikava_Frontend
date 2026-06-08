import { MOCK_ORDERS } from "../data/mockOrders";
import { MOCK_PRODUCTS } from "../data/mockProducts";
import {
  MOCK_SELLER_PROFILE,
  MOCK_SELLER_SETTINGS,
  MOCK_SELLER_STATS,
} from "../data/mockSellerProfile";

export const PANEL_STORE_VERSION = 2;

const STORAGE_KEYS = {
  version: "panel_store_version",
  products: "panel_store_products",
  orders: "panel_store_orders",
  sellerProfile: (sellerId) => `panel_store_seller_profile_${sellerId}`,
  sellerSettings: (sellerId) => `panel_store_seller_settings_${sellerId}`,
  sellerAccounts: "panel_store_seller_accounts",
};

const readJson = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const writeJson = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

const formatDate = (date = new Date()) => {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = String(date.getFullYear()).slice(-2);
  return `${day}.${month}.${year}`;
};

const delay = (ms = 250) => new Promise((resolve) => setTimeout(resolve, ms));

const ensureStoreVersion = () => {
  const current = localStorage.getItem(STORAGE_KEYS.version);

  if (current === String(PANEL_STORE_VERSION)) {
    return false;
  }

  localStorage.setItem(STORAGE_KEYS.version, String(PANEL_STORE_VERSION));
  localStorage.removeItem(STORAGE_KEYS.products);
  return true;
};

export const panelStore = {
  async getProducts() {
    await delay();
    ensureStoreVersion();
    return readJson(STORAGE_KEYS.products, MOCK_PRODUCTS);
  },

  async saveProducts(products) {
    await delay();
    writeJson(STORAGE_KEYS.products, products);
    return products;
  },

  async getOrders() {
    await delay();
    return readJson(STORAGE_KEYS.orders, MOCK_ORDERS);
  },

  async saveOrders(orders) {
    await delay();
    writeJson(STORAGE_KEYS.orders, orders);
    return orders;
  },

  async getSellerProfile(sellerId) {
    await delay();
    return readJson(
      STORAGE_KEYS.sellerProfile(sellerId),
      { ...MOCK_SELLER_PROFILE },
    );
  },

  async saveSellerProfile(sellerId, profile) {
    await delay();
    writeJson(STORAGE_KEYS.sellerProfile(sellerId), profile);
    return profile;
  },

  async getSellerSettings(sellerId) {
    await delay();
    return readJson(
      STORAGE_KEYS.sellerSettings(sellerId),
      { ...MOCK_SELLER_SETTINGS },
    );
  },

  async saveSellerSettings(sellerId, settings) {
    await delay();
    writeJson(STORAGE_KEYS.sellerSettings(sellerId), settings);
    return settings;
  },

  async getSellerStats() {
    await delay();
    return structuredClone(MOCK_SELLER_STATS);
  },

  async createProduct(payload, sellerId) {
    const products = await this.getProducts();
    const nextId = products.reduce((max, item) => Math.max(max, item.id), 0) + 1;

    const product = {
      id: nextId,
      sellerId: sellerId ?? 1,
      name: payload.name || "Product Name",
      sku: payload.sku || "-",
      stock: payload.stock || "in stock",
      price: Number(payload.price) || 0,
      categories: payload.categories || "-",
      tags: payload.tags || "-",
      date: formatDate(),
      description: payload.description || "",
      regularPrice: payload.regularPrice,
      salePrice: payload.salePrice,
    };

    const next = [product, ...products];
    await this.saveProducts(next);
    return product;
  },

  async updateProduct(id, patch) {
    const products = await this.getProducts();
    const next = products.map((item) =>
      item.id === id ? { ...item, ...patch } : item,
    );
    await this.saveProducts(next);
    return next.find((item) => item.id === id) ?? null;
  },

  async deleteProducts(ids) {
    const products = await this.getProducts();
    const idSet = new Set(ids);
    const next = products.filter((item) => !idSet.has(item.id));
    await this.saveProducts(next);
    return next;
  },

  async deleteOrders(ids) {
    const orders = await this.getOrders();
    const idSet = new Set(ids);
    const next = orders.filter((item) => !idSet.has(item.id));
    await this.saveOrders(next);
    return next;
  },

  async getSellerAccounts() {
    await delay(100);
    return readJson(STORAGE_KEYS.sellerAccounts, []);
  },

  async registerSellerAccount({ email, password, ...profile }) {
    const accounts = await this.getSellerAccounts();
    const sellerId = accounts.length + 1;

    const account = {
      sellerId,
      email: email.trim().toLowerCase(),
      password,
      name: `${profile.firstName || "Seller"} ${profile.lastName || ""}`.trim(),
    };

    const nextAccounts = [...accounts, account];
    writeJson(STORAGE_KEYS.sellerAccounts, nextAccounts);

    await this.saveSellerSettings(sellerId, {
      firstName: profile.firstName || "",
      lastName: profile.lastName || "",
      email: profile.email || email,
      phone: profile.phone || "",
      country: profile.country || "",
      city: profile.city || "",
      address: profile.address || "",
      password: "****************",
    });

    await this.saveSellerProfile(sellerId, {
      ...MOCK_SELLER_PROFILE,
      firstName: profile.firstName || MOCK_SELLER_PROFILE.firstName,
      lastName: profile.lastName || MOCK_SELLER_PROFILE.lastName,
    });

    return account;
  },

  async findSellerAccount(email, password) {
    const accounts = await this.getSellerAccounts();
    const normalized = email.trim().toLowerCase();

    return accounts.find(
      (account) =>
        account.email === normalized && account.password === password,
    );
  },

  reset() {
    Object.entries(STORAGE_KEYS).forEach(([, key]) => {
      if (typeof key === "string") {
        localStorage.removeItem(key);
      }
    });
  },
};

export { formatDate };
