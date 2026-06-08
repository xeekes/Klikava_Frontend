import { useEffect, useState } from "react";
import {
  Link,
  Navigate,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import AdminBrand from "../../components/AdminBrand/AdminBrand";
import PortalBadge from "../../components/PortalBadge/PortalBadge";
import {
  MOCK_ADMIN_CREDENTIALS,
  MOCK_SELLER_CREDENTIALS,
} from "../../constants/auth";
import {
  ADMIN_ROUTES,
  getRoutesForRole,
  SELLER_ROUTES,
} from "../../constants/routes";
import { AUTH_PORTALS, USER_ROLES } from "../../constants/roles";
import { useAdminAuth } from "../../context/AdminAuthContext";
import { usePortalAccess } from "../../hooks/usePortalAccess";
import "../../styles/_auth-page.scss";
import "./LoginPage.scss";

const PORTAL_CONFIG = {
  [AUTH_PORTALS.ADMIN]: {
    role: USER_ROLES.ADMIN,
    routes: ADMIN_ROUTES,
    mockCredentials: MOCK_ADMIN_CREDENTIALS,
    registerLabel: "Create an account",
  },
  [AUTH_PORTALS.SELLER]: {
    role: USER_ROLES.SELLER,
    routes: SELLER_ROUTES,
    mockCredentials: MOCK_SELLER_CREDENTIALS,
    registerLabel: "Become a seller",
  },
};

const LoginPage = ({ portal = AUTH_PORTALS.ADMIN }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { isSubmitting, error, clearError, login } = useAdminAuth();
  const { isReady, canEnterPortal } = usePortalAccess(portal, PORTAL_CONFIG[portal].role);

  const config = PORTAL_CONFIG[portal];
  const portalSwitchMessage = location.state?.portalSwitch
    ? "Previous portal session was closed. Log in again for this portal."
    : "";

  const [email, setEmail] = useState(
    () => searchParams.get("email") || "",
  );
  const [password, setPassword] = useState("");

  const redirectTo =
    location.state?.from?.pathname || config.routes.products;

  useEffect(() => {
    const prefillEmail = searchParams.get("email");
    if (prefillEmail) {
      setEmail(prefillEmail);
    }
  }, [searchParams]);

  useEffect(() => {
    clearError();
  }, [email, password, clearError]);

  if (!isReady) {
    return (
      <div className="admin-loading-screen">
        <p>Loading...</p>
      </div>
    );
  }

  if (canEnterPortal) {
    const home = getRoutesForRole(config.role).products;
    return <Navigate to={home} replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      await login({ email, password }, portal);
      navigate(redirectTo, { replace: true });
    } catch {
      // error handled in context
    }
  };

  const handleQuickLogin = async () => {
    try {
      await login(config.mockCredentials, portal);
      navigate(redirectTo, { replace: true });
    } catch {
      // error handled in context
    }
  };

  return (
    <div className="auth-page login-page">
      <AdminBrand />
      <PortalBadge role={config.role} variant="auth" />

      <div className="auth-page__card">
        <form className="auth-page__form" onSubmit={handleSubmit}>
          <label className="auth-page__field">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="username"
              required
            />
          </label>

          <label className="auth-page__field">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required
            />
          </label>

          {portalSwitchMessage ? (
            <p className="auth-page__notice">{portalSwitchMessage}</p>
          ) : null}

          {error ? <p className="auth-page__error">{error}</p> : null}

          <button
            type="submit"
            className="auth-page__submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Logging in..." : "Log In"}
          </button>
        </form>

        <Link to={config.routes.register} className="auth-page__footer-link">
          {config.registerLabel}
        </Link>

        {import.meta.env.DEV ? (
          <button
            type="button"
            className="login-page__quick-login"
            onClick={handleQuickLogin}
            disabled={isSubmitting}
          >
            Quick login (dev)
          </button>
        ) : null}
      </div>
    </div>
  );
};

export default LoginPage;
