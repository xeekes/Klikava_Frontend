import { useEffect, useMemo, useState } from "react";

const PAGE_SIZE_OPTIONS = [10, 25, 50];

export const useTablePagination = (items, { defaultPageSize = 10 } = {}) => {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(defaultPageSize);

  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize) || 1);
  const safePage = Math.min(page, totalPages - 1);

  useEffect(() => {
    setPage(0);
  }, [items, pageSize]);

  useEffect(() => {
    if (page > totalPages - 1) {
      setPage(Math.max(0, totalPages - 1));
    }
  }, [page, totalPages]);

  const paginatedItems = useMemo(() => {
    const start = safePage * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, safePage, pageSize]);

  const rangeStart = total === 0 ? 0 : safePage * pageSize + 1;
  const rangeEnd = Math.min(safePage * pageSize + pageSize, total);

  const handlePageSizeChange = (nextSize) => {
    setPageSize(Number(nextSize));
    setPage(0);
  };

  return {
    paginatedItems,
    page: safePage,
    pageSize,
    pageSizeOptions: PAGE_SIZE_OPTIONS,
    total,
    totalPages,
    rangeStart,
    rangeEnd,
    setPage,
    setPageSize: handlePageSizeChange,
    goFirst: () => setPage(0),
    goPrev: () => setPage((current) => Math.max(0, current - 1)),
    goNext: () =>
      setPage((current) => Math.min(totalPages - 1, current + 1)),
    goLast: () => setPage(totalPages - 1),
    canGoFirst: safePage > 0,
    canGoPrev: safePage > 0,
    canGoNext: safePage < totalPages - 1,
    canGoLast: safePage < totalPages - 1,
  };
};
