/*
 * Toast success/error and modal confirm for ActionFeedbackContext.
 */
import { useEffect } from "react";
import "./ActionFeedback.scss";

/**
 * @param {{
 *   toast: { type: string, message: string, id: number } | null,
 *   onDismiss: () => void,
 *   confirmState: object | null,
 *   onConfirm: (result: boolean) => void,
 * }} props
 */
const ActionFeedback = ({ toast, onDismiss, confirmState, onConfirm }) => {
  useEffect(() => {
    if (!confirmState) {
      return undefined;
    }
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onConfirm(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [confirmState, onConfirm]);

  return (
    <>
      {toast ? (
        <div
          className={`action-feedback action-feedback--${toast.type}`}
          role="status"
          aria-live="polite"
        >
          <p className="action-feedback__message">{toast.message}</p>
          <button
            type="button"
            className="action-feedback__close"
            onClick={onDismiss}
            aria-label="Dismiss notification"
          >
            ×
          </button>
        </div>
      ) : null}
      {confirmState ? (
        <div
          className="action-feedback__confirm-overlay"
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="action-feedback-confirm-title"
          aria-describedby="action-feedback-confirm-message"
        >
          <button
            type="button"
            className="action-feedback__confirm-backdrop"
            onClick={() => onConfirm(false)}
            aria-label="Cancel"
          />
          <div className="action-feedback__confirm-panel">
            <h2
              id="action-feedback-confirm-title"
              className="action-feedback__confirm-title"
            >
              {confirmState.title}
            </h2>
            <p
              id="action-feedback-confirm-message"
              className="action-feedback__confirm-message"
            >
              {confirmState.message}
            </p>
            <div className="action-feedback__confirm-actions">
              <button
                type="button"
                className="action-feedback__confirm-btn action-feedback__confirm-btn--ghost"
                onClick={() => onConfirm(false)}
              >
                {confirmState.cancelLabel}
              </button>
              <button
                type="button"
                className="action-feedback__confirm-btn action-feedback__confirm-btn--primary"
                onClick={() => onConfirm(true)}
              >
                {confirmState.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
};

export default ActionFeedback;
