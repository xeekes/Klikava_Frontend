/* Удерживает DOM модалки/выпадающего списка смонтированным во время анимации закрытия (open → closing → closed). */
import { useEffect, useState } from "react";

export const MOTION_DURATION_MS = 280;

/**
 * Откладывает размонтирование до завершения анимации закрытия и возвращает классы фазы.
 * @param {boolean} isVisible
 * @param {number} [duration]
 * @returns {{ rendered: boolean, phase: string, className: string }}
 */
export const useMotionPresence = (isVisible, duration = MOTION_DURATION_MS) => {
  const [rendered, setRendered] = useState(isVisible);
  const [phase, setPhase] = useState(isVisible ? "open" : "closed");

  /**
   * Переключает фазы open, closing и closed в зависимости от видимости.
   */
  useEffect(() => {
    if (isVisible) {
      setRendered(true);
      const frame = window.requestAnimationFrame(() => {
        setPhase("open");
      });
      return () => window.cancelAnimationFrame(frame);
    }
    if (!rendered) {
      return undefined;
    }
    setPhase("closing");
    const timer = window.setTimeout(() => {
      setRendered(false);
      setPhase("closed");
    }, duration);
    return () => window.clearTimeout(timer);
  }, [isVisible, duration, rendered]);

  return {
    rendered,
    phase,
    className: `motion-surface motion-surface--${phase}`,
  };
};
