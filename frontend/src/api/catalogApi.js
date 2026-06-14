/*
 * HTTP-клиент каталога: категории, товары, скидки, отзывы.
 * Сырые ответы преобразуются в модели UI через хелперы mapCatalogItem.
 */
import { apiRequest } from "./client";
import { getListItems } from "./listUtils";
import {
  mapBackendCategory,
  mapBackendProduct,
  mapBackendProductList,
  mapBackendReview,
  mapVariantFeaturesToSpecs,
} from "./mapCatalogItem";

/* Ограничение клиентской пагинации при загрузке полного каталога. */
const MAX_PRODUCT_PAGES = 20;

export const catalogApi = {
  /**
   * Загружает страницу категорий и преобразует каждую запись в модель UI.
   * @param {{ page?: number, perPage?: number }} [params]
   * @returns {Promise<Array<object>>}
   */
  async listCategories({ page = 1, perPage = 100 } = {}) {
    const payload = await apiRequest(
      `/categories?per_page=${perPage}&page=${page}`,
    );
    return getListItems(payload).map(mapBackendCategory);
  },

  /**
   * Загружает справочник характеристик для подписей и порядка фильтров.
   * @param {{ page?: number, perPage?: number }} [params]
   * @returns {Promise<Array<{ id: string, title: string, isPrimary: boolean }>>}
   */
  async listFeatures({ page = 1, perPage = 100 } = {}) {
    const payload = await apiRequest(
      `/features?per_page=${perPage}&page=${page}`,
    );
    return getListItems(payload).map((item) => ({
      id: String(item.id),
      title: item.title || "Feature",
      isPrimary: Boolean(item.is_primary),
    }));
  },

  /**
   * Загружает одну страницу сырых товаров и метаданные пагинации сервера.
   * @param {{ page?: number, perPage?: number, q?: string|null, categoryId?: string|number|null, sortBy?: string|null, sortDir?: string|null, hasDiscount?: boolean|null }} [params]
   * @returns {Promise<{ items: Array<object>, pagination: object|null }>}
   */
  async listProductsPage({
    page = 1,
    perPage = 100,
    q = null,
    categoryId = null,
    sortBy = null,
    sortDir = null,
    hasDiscount = null,
  } = {}) {
    const params = new URLSearchParams({
      page: String(page),
      per_page: String(perPage),
    });
    if (q) {
      params.set("q", q);
    }
    if (categoryId) {
      params.set("category_id", String(categoryId));
    }
    if (sortBy) {
      params.set("sort_by", sortBy);
    }
    if (sortDir) {
      params.set("sort_dir", sortDir);
    }
    if (hasDiscount !== null && hasDiscount !== undefined) {
      params.set("has_discount", String(hasDiscount));
    }
    const payload = await apiRequest(`/products?${params.toString()}`);
    return {
      items: getListItems(payload),
      pagination: payload?.pagination || null,
    };
  },

  /**
   * Загружает id популярных товаров для блоков top/popular.
   * @param {{ perPage?: number }} [params]
   * @returns {Promise<Set<string|number>>}
   */
  async listPopularProductIds({ perPage = 12 } = {}) {
    const { items } = await this.listProductsPage({
      page: 1,
      perPage,
      sortBy: "popularity",
      sortDir: "desc",
    });
    return new Set(
      items.map((item) => item?.id ?? item?.product_id).filter(Boolean),
    );
  },

  /**
   * Загружает все страницы товаров до MAX_PRODUCT_PAGES, следуя подсказкам пагинации.
   * @returns {Promise<Array<object>>}
   */
  async listAllProducts() {
    const allItems = [];
    for (let page = 1; page <= MAX_PRODUCT_PAGES; page += 1) {
      const { items, pagination } = await this.listProductsPage({
        page,
        perPage: 100,
      });
      allItems.push(...items);
      if (!items.length) {
        break;
      }
      if (pagination && pagination.has_next === false) {
        break;
      }
      if (items.length < 100) {
        break;
      }
    }
    return allItems;
  },

  /**
   * Ищет товары через GET /products?q=...
   * @param {string} query
   * @param {{ page?: number, perPage?: number, categoryId?: string|number|null, hasDiscount?: boolean|null }} [params]
   * @returns {Promise<Array<object>>}
   */
  async searchProducts(query, params = {}) {
    const { items } = await this.listProductsPage({
      q: query,
      ...params,
    });
    return items;
  },

  /**
   * Получает один товар по числовому id или URL-slug (сырая форма бэкенда).
   * @param {string|number} idOrSlug
   * @returns {Promise<object>}
   */
  async getProductByIdOrSlug(idOrSlug) {
    return apiRequest(`/products/${idOrSlug}`);
  },

  /**
   * Загружает страницу правил скидок с бэкенда.
   * @param {{ page?: number, perPage?: number }} [params]
   * @returns {Promise<Array<object>>}
   */
  async listDiscounts({ page = 1, perPage = 100 } = {}) {
    const payload = await apiRequest(
      `/discounts?per_page=${perPage}&page=${page}`,
    );
    return getListItems(payload);
  },

  /**
   * Собирает страницы скидок, пока не вернётся короткая или пустая страница.
   * @returns {Promise<Array<object>>}
   */
  async listAllDiscounts() {
    const allItems = [];
    for (let page = 1; page <= MAX_PRODUCT_PAGES; page += 1) {
      const items = await this.listDiscounts({ page, perPage: 100 });
      allItems.push(...items);
      if (!items.length || items.length < 100) {
        break;
      }
    }
    return allItems;
  },

  /**
   * Загружает и преобразует все отзывы для указанного id товара.
   * @param {string|number} productId
   * @returns {Promise<Array<object>>}
   */
  async listProductReviews(productId) {
    const payload = await apiRequest(`/products/${productId}/reviews`);
    return getListItems(payload).map(mapBackendReview);
  },

  /**
   * Отправляет новый отзыв для указанного товара.
   * @param {string|number} productId
   * @param {object} body
   * @returns {Promise<object>}
   */
  async createReview(productId, body) {
    const payload = await apiRequest(`/products/${productId}/reviews`, {
      method: "POST",
      body,
    });
    return mapBackendReview(payload);
  },

  /**
   * Обновляет отзыв текущего пользователя.
   * @param {string|number} productId
   * @param {string|number} reviewId
   * @param {object} body
   * @returns {Promise<object>}
   */
  async updateReview(productId, reviewId, body) {
    const payload = await apiRequest(
      `/products/${productId}/reviews/${reviewId}`,
      {
        method: "PATCH",
        body,
      },
    );
    return mapBackendReview(payload);
  },

  /**
   * Удаляет отзыв текущего пользователя.
   * @param {string|number} productId
   * @param {string|number} reviewId
   * @returns {Promise<unknown>}
   */
  async deleteReview(productId, reviewId) {
    return apiRequest(`/products/${productId}/reviews/${reviewId}`, {
      method: "DELETE",
    });
  },

  /**
   * Собирает полное представление товара из сырых данных API, категорий и вложенных отзывов.
   * @param {object} raw
   * @param {Array<object>} [categories]
   * @param {number} [index]
   * @returns {object}
   */
  buildProductDetail(raw, categories = [], index = 0) {
    const lookup = this.buildCategoryLookup(categories);
    const mapped = mapBackendProduct(raw, index, lookup);
    const variant = raw?.current_version?.variants?.[0];
    const reviews = (raw?.reviews || []).map(mapBackendReview);
    const specs = mapVariantFeaturesToSpecs(variant);
    const description = raw?.current_version?.description || "";
    const deliveryInfo = raw?.current_version?.delivery_info || "";
    return {
      ...mapped,
      description,
      specs,
      reviews,
      variantId: variant?.id ?? null,
      sellerId: raw?.seller_id ?? null,
      averageRating: Number(raw?.average_rating) || 0,
      reviewsCount: Number(raw?.reviews_count) || reviews.length,
      shipping: {
        company: raw?.seller?.store_name || "Seller delivery",
        deliveryTime: deliveryInfo || "Standard delivery",
        costs: "Calculated at checkout",
        stats: [],
      },
      relatedFromApi: mapBackendProductList(
        raw?.similar_products || raw?.recommended_products || [],
        lookup,
      ),
    };
  },

  /**
   * Строит Map id категории бэкенда → преобразованная категория для быстрого поиска товаров.
   * @param {Array<object>} categories
   * @returns {Map<number|string, object>}
   */
  buildCategoryLookup(categories) {
    return new Map(
      categories.map((category) => [category.backendId, category]),
    );
  },

  /**
   * Преобразует список сырых товаров с использованием переданного lookup категорий.
   * @param {Array<object>} items
   * @param {Array<object>} [categories]
   * @returns {Array<object>}
   */
  mapProducts(items, categories = []) {
    const lookup = this.buildCategoryLookup(categories);
    return mapBackendProductList(items, lookup);
  },

  /**
   * Преобразует одну сырую запись товара с опциональным контекстом категорий и индексом списка.
   * @param {object} item
   * @param {Array<object>} [categories]
   * @param {number} [index]
   * @returns {object}
   */
  mapProduct(item, categories = [], index = 0) {
    const lookup = this.buildCategoryLookup(categories);
    return mapBackendProduct(item, index, lookup);
  },
};
