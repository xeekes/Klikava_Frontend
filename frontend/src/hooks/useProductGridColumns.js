import { useEffect, useState } from "react";

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

const useProductGridColumns = (columns) => {
  const [effectiveColumns, setEffectiveColumns] = useState(() =>
    getEffectiveColumns(columns),
  );

  useEffect(() => {
    const mediaQueries = [
      window.matchMedia("(max-width: 480px)"),
      window.matchMedia("(max-width: 625px)"),
      window.matchMedia("(max-width: 1000px)"),
    ];

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
