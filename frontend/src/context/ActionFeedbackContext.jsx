/*
 * Глобальные toast-уведомления и диалог подтверждения для действий вне корзины/избранного.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import ActionFeedback from "../components/ActionFeedback/ActionFeedback";

const ActionFeedbackContext = createContext(null);

const SUCCESS_DURATION_MS = 4000;
const ERROR_DURATION_MS = 5500;

/**
 * @param {string} message
 * @returns {{ title: string, message: string }}
 */
const normalizeConfirmOptions = (message) => {
  if (typeof message === "string") {
    return { title: "Confirm action", message };
  }
  return {
    title: message.title || "Confirm action",
    message: message.message || "",
    confirmLabel: message.confirmLabel || "Confirm",
    cancelLabel: message.cancelLabel || "Cancel",
  };
};

/**
 * Предоставляет showSuccess, showError и confirm для дерева компонентов.
 * @param {{ children: import("react").ReactNode }} props
 */
export const ActionFeedbackProvider = ({ children }) => {
  const [toast, setToast] = useState(null);
  const [confirmState, setConfirmState] = useState(null);
  const timerRef = useRef(null);

  const dismissToast = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setToast(null);
  }, []);

  const showToast = useCallback(
    (type, message) => {
      dismissToast();
      setToast({ type, message, id: Date.now() });
      timerRef.current = setTimeout(
        dismissToast,
        type === "error" ? ERROR_DURATION_MS : SUCCESS_DURATION_MS,
      );
    },
    [dismissToast],
  );

  const showSuccess = useCallback(
    (message) => showToast("success", message),
    [showToast],
  );

  const showError = useCallback(
    (message) => showToast("error", message),
    [showToast],
  );

  /**
   * @param {string | { title?: string, message: string, confirmLabel?: string, cancelLabel?: string }} options
   * @returns {Promise<boolean>}
   */
  const confirm = useCallback((options) => {
    const normalized = normalizeConfirmOptions(options);
    return new Promise((resolve) => {
      setConfirmState({ ...normalized, resolve });
    });
  }, []);

  const closeConfirm = useCallback((result) => {
    setConfirmState((current) => {
      current?.resolve(result);
      return null;
    });
  }, []);

  useEffect(
    () => () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    },
    [],
  );

  const value = useMemo(
    () => ({ showSuccess, showError, confirm }),
    [showSuccess, showError, confirm],
  );

  return (
    <ActionFeedbackContext.Provider value={value}>
      {children}
      <ActionFeedback
        toast={toast}
        onDismiss={dismissToast}
        confirmState={confirmState}
        onConfirm={closeConfirm}
      />
    </ActionFeedbackContext.Provider>
  );
};

/**
 * @returns {{ showSuccess: (message: string) => void, showError: (message: string) => void, confirm: (options: string | object) => Promise<boolean> }}
 */
export const useActionFeedback = () => {
  const context = useContext(ActionFeedbackContext);
  if (!context) {
    throw new Error(
      "useActionFeedback must be used within ActionFeedbackProvider",
    );
  }
  return context;
};
