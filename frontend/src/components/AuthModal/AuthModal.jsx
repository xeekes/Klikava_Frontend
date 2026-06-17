/*
 * Authorization overlay: nested Routes for login/registration/verification flows.
 * Redirects authorized users back to backgroundLocation (or home).
 */
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useScrollLock } from "../../hooks/useScrollLock";
import LoginForm from "../AuthForms/LoginForm";
import CreateAccountForm from "../AuthForms/CreateAccountForm";
import RecoverPasswordForm from "../AuthForms/RecoverPasswordForm";
import EnterCodeForm from "../AuthForms/EnterCodeForm";
import CreatePasswordForm from "../AuthForms/CreatePasswordForm";
import LoadingSpinner from "../LoadingSpinner/LoadingSpinner";
import Modal from "../Modal/Modal";
import { useAuthModal } from "../../hooks/useAuthModal";
import "./AuthModal.scss";

/**
 * Authorization overlay with nested routes; redirects logged-in users to the background page.
 */
const AuthModal = () => {
  const location = useLocation();
  const { closeAuth } = useAuthModal();
  const { isAuthenticated, isLoading } = useAuth();
  useScrollLock();
  if (isLoading) {
    return <LoadingSpinner variant="overlay" label="Loading..." />;
  }
  if (isAuthenticated) {
    const back = location.state?.backgroundLocation;
    return (
      <Navigate
        to={{
          pathname: back?.pathname || "/",
          search: back?.search || "",
          hash: back?.hash || "",
        }}
        replace
      />
    );
  }
  return (
    <Modal
      ariaLabel="Authentication"
      onClose={closeAuth}
      panelClassName="auth-modal__panel"
    >
      <div className="auth-modal">
        <Routes location={location} key={location.pathname}>
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register" element={<CreateAccountForm />} />
          <Route path="/auth/verify" element={<EnterCodeForm />} />
          <Route path="/auth/password" element={<CreatePasswordForm />} />
          <Route
            path="/auth/reset-password"
            element={<CreatePasswordForm isNewPassword />}
          />
          <Route path="/forgot-password" element={<RecoverPasswordForm />} />
        </Routes>
      </div>
    </Modal>
  );
};

export default AuthModal;
