/*
 * Конфигурация C: после idle подгружает вероятные route-чанки в фоне.
 * Работает на любой странице витрины (через MainLayout), не только на Home.
 */
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { prefetchRouteChunks } from "../routes/routeChunks";

const IDLE_TIMEOUT_MS = 4000;
const TIER2_DELAY_MS = 2500;

/**
 * Планирует callback через requestIdleCallback или setTimeout.
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
 * После отрисовки текущей страницы префетчит чанки частых маршрутов.
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
