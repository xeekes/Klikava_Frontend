/*
 * Configuration C: after idle, loads possible route chunks in the background.
 * Works on any storefront page (via MainLayout), not only on Home.
 */
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { prefetchRouteChunks } from "../routes/routeChunks";

const IDLE_TIMEOUT_MS = 4000;
const TIER2_DELAY_MS = 2500;

/**
 * Schedules a callback via requestIdleCallback or setTimeout.
 * @param {() => void} callback
 * @returns {() => void}
 */
const scheduleIdle = (callback) => {
  if (typeof window.requestIdleCallback === "function") {
    const id = window.requestIdleCallback(callback, { timeout: IDLE_TIMEOUT_MS });
    return () => window.cancelIdleCallback(id);
  }
  const timerId = window.setTimeout(callback, 2000);
  return () => window.clearTimeout(timerId);
};

/**
 * After rendering the current page, it prefetches chunks of frequent routes.
 */
export const useRouteChunkPrefetch = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    if (navigator.connection?.saveData) {
      return undefined;
    }

    let cancelTier2 = () => {};
    const cancelTier1 = scheduleIdle(() => {
      prefetchRouteChunks(pathname, { tier: 1 });
      const tier2Timer = window.setTimeout(() => {
        prefetchRouteChunks(pathname, { tier: 2 });
      }, TIER2_DELAY_MS);
      cancelTier2 = () => window.clearTimeout(tier2Timer);
    });

    return () => {
      cancelTier1();
      cancelTier2();
    };
  }, [pathname]);
};
