/* Adaptive number of ProductGrid columns based on viewport breakpoints. */
import { useEffect, useState } from "react";

/**
 * Defines the number of columns by viewport breakpoints with a fallback value for SSR.
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
 * Subscribes to viewport breakpoints and returns the effective number of columns.
 * @param {number} columns
 * @returns {number}
 */
const useProductGridColumns = (columns) => {
  const [effectiveColumns, setEffectiveColumns] = useState(() =>
    getEffectiveColumns(columns),
  );

  /**
   * Recalculates columns when mounting and when changing media query breakpoints.
   */
  useEffect(() => {
    const mediaQueries = [
      window.matchMedia("(max-width: 480px)"),
      window.matchMedia("(max-width: 625px)"),
      window.matchMedia("(max-width: 1000px)"),
    ];

    /**
     * Applies the current breakpoint rules to the specified number of columns.
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
