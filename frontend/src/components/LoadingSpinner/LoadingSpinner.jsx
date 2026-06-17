/* General loading indicator (inline or full-screen overlay). */
import { useEffect, useState } from "react";
import "./LoadingSpinner.scss";

/**
 * General loading indicator as an inline block or full-screen overlay.
 */
const LoadingSpinner = ({
  label = "Loading...",
  variant = "inline",
  className = "",
}) => {
  const [isVisible, setIsVisible] = useState(variant !== "overlay");
  useEffect(() => {
    if (variant !== "overlay") {
      return undefined;
    }
    const frame = window.requestAnimationFrame(() => {
      setIsVisible(true);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [variant]);
  return (
    <div
      className={`loading-spinner loading-spinner--${variant} ${
        isVisible ? "loading-spinner--visible" : ""
      } ${className}`.trim()}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <span className="loading-spinner__ring" aria-hidden="true" />
      {label ? <p className="loading-spinner__label">{label}</p> : null}
    </div>
  );
};

export default LoadingSpinner;
