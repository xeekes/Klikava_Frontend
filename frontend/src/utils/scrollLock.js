let lockCount = 0;

const getScrollbarWidth = () =>
  window.innerWidth - document.documentElement.clientWidth;

const clearScrollLockStyles = () => {
  document.body.style.overflow = "";
  document.body.style.paddingRight = "";

  document.querySelectorAll(".header").forEach((element) => {
    element.style.removeProperty("padding-right");
  });
};

export const resetScrollLock = () => {
  lockCount = 0;
  clearScrollLockStyles();
};

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

export const unlockScroll = () => {
  lockCount = Math.max(0, lockCount - 1);

  if (lockCount !== 0) {
    return;
  }

  clearScrollLockStyles();
};
