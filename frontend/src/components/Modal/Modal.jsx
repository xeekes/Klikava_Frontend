/*
 * Accessible modal window wrapper with scroll lock and closing animation.
 * Exports useModalClose so that nested panels can call the same closing flow.
 */
import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useState,
} from "react";
import { lockScroll, unlockScroll } from "../../utils/scrollLock";
import "./Modal.scss";
const CLOSE_DURATION_MS = 280;
const ModalCloseContext = createContext(null);

/**
 * Returns the generic close handler from the closest modal window provider.
 */
export const useModalClose = () => {
  const close = useContext(ModalCloseContext);
  return close ?? (() => {});
};

/**
 * Accessible modal window wrapper with scroll lock and closing animation.
 */
const Modal = ({
  children,
  onClose,
  ariaLabel,
  panelClassName = "",
  hideCloseButton = false,
}) => {
  const [phase, setPhase] = useState("closed");
  /**
   * Plays the closing animation, then calls the parent callback onClose.
   */
  const requestClose = useCallback(() => {
    setPhase("closing");
    window.setTimeout(() => {
      onClose?.();
    }, CLOSE_DURATION_MS);
  }, [onClose]);
  useLayoutEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setPhase("open");
    });
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        requestClose();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    lockScroll();
    return () => {
      window.cancelAnimationFrame(frame);
      document.removeEventListener("keydown", handleKeyDown);
      unlockScroll();
    };
  }, [requestClose]);
  const panelClass = ["modal__panel", panelClassName].filter(Boolean).join(" ");
  return (
    <ModalCloseContext.Provider value={requestClose}>
      <div
        className={`modal modal--${phase}`.trim()}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
      >
        <button
          type="button"
          className="modal__backdrop"
          onClick={requestClose}
          aria-label="Close"
        />
        <div className={panelClass}>
          {hideCloseButton ? null : (
            <div className="modal__close">
              <button
                type="button"
                onClick={requestClose}
                aria-label="Close dialog"
              >
                ×
              </button>
            </div>
          )}
          {children}
        </div>
      </div>
    </ModalCloseContext.Provider>
  );
};

export default Modal;
