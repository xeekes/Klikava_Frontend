import { useCallback, useEffect, useMemo, useState } from "react";
import {
  PRODUCTS_INITIAL_PAGE_SIZE,
  PRODUCTS_LOAD_MORE_SIZE,
} from "../constants/productListing";

const useProductPagination = (
  items,
  resetKey,
  {
    initialPageSize = PRODUCTS_INITIAL_PAGE_SIZE,
    loadMoreSize = PRODUCTS_LOAD_MORE_SIZE,
  } = {},
) => {
  const [visibleCount, setVisibleCount] = useState(initialPageSize);

  useEffect(() => {
    setVisibleCount(initialPageSize);
  }, [resetKey, initialPageSize]);

  const visibleItems = useMemo(
    () => items.slice(0, visibleCount),
    [items, visibleCount],
  );

  const hasMore = visibleCount < items.length;

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
