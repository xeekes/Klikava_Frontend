/* Адаптивное число колонок ProductGrid по брейкпоинтам viewport. */
import { useEffect, useState } from "react";

/**
 * Определяет число колонок по брейкпоинтам viewport с запасным значением при SSR.
 * @param {number} columns
 * @returns {number}
 */
const getEffectiveColumns = (columns) => {
  if (typeof window === "undefined") {
    return columns;
  }
  if (window.matchMedia("(max-width: 480px)").matches) {
    return 1;
  }
  if (window.matchMedia("(max-width: 625px)").matches) {
    return 2;
  }
  if (window.matchMedia("(max-width: 1000px)").matches) {
    return 3;
  }
  return columns;
};

/**
 * Подписывается на брейкпоинты viewport и возвращает эффективное число колонок.
 * @param {number} columns
 * @returns {number}
 */
const useProductGridColumns = (columns) => {
  const [effectiveColumns, setEffectiveColumns] = useState(() =>
    getEffectiveColumns(columns),
  );

  /**
   * Пересчитывает колонки при монтировании и при изменении media query брейкпоинтов.
   */
  useEffect(() => {
    const mediaQueries = [
      window.matchMedia("(max-width: 480px)"),
      window.matchMedia("(max-width: 625px)"),
      window.matchMedia("(max-width: 1000px)"),
    ];

    /**
     * Применяет актуальные правила брейкпоинтов к заданному числу колонок.
     */
    const updateColumns = () => {
      setEffectiveColumns(getEffectiveColumns(columns));
    };
    updateColumns();
    mediaQueries.forEach((mediaQuery) => {
      mediaQuery.addEventListener("change", updateColumns);
    });
    return () => {
      mediaQueries.forEach((mediaQuery) => {
        mediaQuery.removeEventListener("change", updateColumns);
      });
    };
  }, [columns]);

  return effectiveColumns;
};

export default useProductGridColumns;
