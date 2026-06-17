import { useLayoutEffect } from "react";
import { lockScroll, unlockScroll } from "../utils/scrollLock";

/**
 * Blocks page scrolling before rendering (useLayoutEffect) so that there is no content shifting.
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
