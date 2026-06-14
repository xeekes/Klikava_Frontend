import { useLayoutEffect } from "react";
import { lockScroll, unlockScroll } from "../utils/scrollLock";

/**
 * Блокирует прокрутку страницы до отрисовки (useLayoutEffect), чтобы не было сдвига контента.
 * @param {boolean} [enabled=true]
 */
export const useScrollLock = (enabled = true) => {
  useLayoutEffect(() => {
    if (!enabled) {
      return undefined;
    }
    lockScroll();
    return () => {
      unlockScroll();
    };
  }, [enabled]);
};
