/* Подсчёт ссылок блокировки прокрутки для стека модалок; фиксация body без сдвига layout. */

/** Число активных вызовов lockScroll; стили сбрасываются только при достижении нуля. */
let lockCount = 0;

/** Позиция прокрутки до блокировки — восстанавливается при unlock. */
let savedScrollY = 0;

/** Фиксированные элементы вне потока документа — им нужен отдельный padding-right. */
const FIXED_PADDING_SELECTORS = [".header"];

/**
 * Надёжно измеряет ширину скроллбара viewport.
 * @returns {number}
 */
const getScrollbarWidth = () => {
  const measured = window.innerWidth - document.documentElement.clientWidth;
  if (measured > 0) {
    return measured;
  }

  const outer = document.createElement("div");
  outer.style.visibility = "hidden";
  outer.style.overflow = "scroll";
  outer.style.width = "100px";
  outer.style.position = "absolute";
  outer.style.top = "-9999px";
  document.body.appendChild(outer);

  const inner = document.createElement("div");
  inner.style.width = "100%";
  outer.appendChild(inner);

  const width = outer.offsetWidth - inner.offsetWidth;
  document.body.removeChild(outer);
  return width;
};

/**
 * Компенсирует исчезновение скроллбара у фиксированных элементов.
 * @param {number} scrollbarWidth
 */
const applyFixedPadding = (scrollbarWidth) => {
  if (scrollbarWidth <= 0) {
    return;
  }
  FIXED_PADDING_SELECTORS.forEach((selector) => {
    document.querySelectorAll(selector).forEach((element) => {
      element.style.paddingRight = `${scrollbarWidth}px`;
    });
  });
};

/**
 * Убирает переопределения scroll-lock.
 */
const clearScrollLockStyles = () => {
  document.documentElement.style.overflow = "";
  document.documentElement.style.removeProperty("padding-right");
  document.body.style.position = "";
  document.body.style.top = "";
  document.body.style.left = "";
  document.body.style.right = "";
  document.body.style.width = "";
  document.body.style.overflow = "";
  document.body.style.removeProperty("padding-right");

  FIXED_PADDING_SELECTORS.forEach((selector) => {
    document.querySelectorAll(selector).forEach((element) => {
      element.style.removeProperty("padding-right");
    });
  });
};

/**
 * Сбрасывает счётчик блокировки и очищает стили scroll-lock (например, при полном монтировании приложения).
 */
export const resetScrollLock = () => {
  lockCount = 0;
  savedScrollY = 0;
  clearScrollLockStyles();
};

/**
 * Увеличивает счётчик блокировки и фиксирует body на текущей позиции прокрутки.
 */
export const lockScroll = () => {
  if (lockCount === 0) {
    savedScrollY = window.scrollY;
    const scrollbarWidth = getScrollbarWidth();

    document.documentElement.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${savedScrollY}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.width = "100%";
    document.body.style.overflow = "hidden";

    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
      applyFixedPadding(scrollbarWidth);
    }
  }
  lockCount += 1;
};

/**
 * Уменьшает счётчик блокировки и восстанавливает прокрутку, когда блокировок не осталось.
 */
export const unlockScroll = () => {
  lockCount = Math.max(0, lockCount - 1);
  if (lockCount !== 0) {
    return;
  }

  const scrollY = savedScrollY;
  clearScrollLockStyles();
  window.scrollTo(0, scrollY);
};
