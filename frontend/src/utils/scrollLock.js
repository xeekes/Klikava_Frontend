/* Scroll lock reference counting for modal stack; fixing the body without shifting the layout. */

/** Number of active calls to lockScroll; styles are reset only when they reach zero. */
let lockCount = 0;

/** The scroll position before locking is restored when unlocked. */
let savedScrollY = 0;

/** Fixed elements are outside the document flow - they need a separate padding-right. */
const FIXED_PADDING_SELECTORS = [".header"];

/**
 * Reliably measures the width of the viewport scrollbar.
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
 * Compensates for the disappearance of the scrollbar on fixed elements.
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
 * Removes scroll-lock overrides.
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
 * Resets the lock counter and clears scroll-lock styles (for example, when the application is fully mounted).
 */
export const resetScrollLock = () => {
  lockCount = 0;
  savedScrollY = 0;
  clearScrollLockStyles();
};

/**
 * Increments the lock counter and locks the body at the current scroll position.
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
 * Decrements the lock count and restores scrolling when there are no locks left.
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
