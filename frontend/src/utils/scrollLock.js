/* Подсчёт ссылок блокировки прокрутки body для стека модалок; компенсация ширины скроллбара. */

/** Число активных вызовов lockScroll; стили body сбрасываются только при достижении нуля. */
let lockCount = 0;

/**
 * Измеряет ширину скроллбара, чтобы предотвратить горизонтальный сдвиг при overflow: hidden.
 * @returns {number}
 */
const getScrollbarWidth = () =>
  window.innerWidth - document.documentElement.clientWidth;

/**
 * Убирает переопределения overflow и padding-right у body и элементов header.
 */
const clearScrollLockStyles = () => {
  document.body.style.overflow = "";
  document.body.style.paddingRight = "";
  document.querySelectorAll(".header").forEach((element) => {
    element.style.removeProperty("padding-right");
  });
};

/**
 * Сбрасывает счётчик блокировки и очищает стили scroll-lock (например, при полном монтировании приложения).
 */
export const resetScrollLock = () => {
  lockCount = 0;
  clearScrollLockStyles();
};

/**
 * Увеличивает счётчик блокировки и скрывает прокрутку body при первой блокировке; добавляет padding под скроллбар.
 */
export const lockScroll = () => {
  if (lockCount === 0) {
    const scrollbarWidth = getScrollbarWidth();
    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
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
  clearScrollLockStyles();
};
