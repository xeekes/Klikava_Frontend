/* Клиентская пагинация «загрузить ещё» для сеток товаров (срез, не серверные страницы). */
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  PRODUCTS_INITIAL_PAGE_SIZE,
  PRODUCTS_LOAD_MORE_SIZE,
} from "../constants/productListing";

/**
 * Предоставляет растущий срез элементов с управлением «загрузить ещё» для клиентских сеток.
 * @param {object[]} items
 * @param {string|number} resetKey
 * @param {{ initialPageSize?: number, loadMoreSize?: number }} [options]
 * @returns {object}
 */
const useProductPagination = (
  items,
  resetKey,
  {
    initialPageSize = PRODUCTS_INITIAL_PAGE_SIZE,
    loadMoreSize = PRODUCTS_LOAD_MORE_SIZE,
  } = {},
) => {
  const [visibleCount, setVisibleCount] = useState(initialPageSize);

  /**
   * Сбрасывает видимое окно при изменении исходного списка или ключа сброса.
   */
  useEffect(() => {
    setVisibleCount(initialPageSize);
  }, [resetKey, initialPageSize]);

  const visibleItems = useMemo(
    () => items.slice(0, visibleCount),
    [items, visibleCount],
  );
  const hasMore = visibleCount < items.length;

  /** Расширяет видимый срез на одну страницу «загрузить ещё» до полной длины списка. */
  const loadMore = useCallback(() => {
    setVisibleCount((current) =>
      Math.min(current + loadMoreSize, items.length),
    );
  }, [items.length, loadMoreSize]);

  return {
    visibleItems,
    hasMore,
    loadMore,
    visibleCount,
    totalCount: items.length,
  };
};

export default useProductPagination;
