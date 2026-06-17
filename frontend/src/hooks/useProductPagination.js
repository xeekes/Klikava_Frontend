/* Client-side “load more” pagination for product grids (slice, not server-side pages). */
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  PRODUCTS_INITIAL_PAGE_SIZE,
  PRODUCTS_LOAD_MORE_SIZE,
} from "../constants/productListing";

/**
 * Provides a growing slice of elements with a "load more" control for client grids.
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
   * Resets the visible window when the original list or reset key changes.
   */
  useEffect(() => {
    setVisibleCount(initialPageSize);
  }, [resetKey, initialPageSize]);

  const visibleItems = useMemo(
    () => items.slice(0, visibleCount),
    [items, visibleCount],
  );
  const hasMore = visibleCount < items.length;

  /** Extends the visible slice by one "load more" page to the full length of the list. */
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
