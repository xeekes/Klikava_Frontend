import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import AdminBrand from "../../components/AdminBrand/AdminBrand";
import PortalBadge from "../../components/PortalBadge/PortalBadge";
import {
  ADMIN_ROUTES,
  getRoutesForRole,
  SELLER_ROUTES,
} from "../../constants/routes";
import { AUTH_PORTALS, USER_ROLES } from "../../constants/roles";
import { useAdminAuth } from "../../context/AdminAuthContext";
import { usePortalAccess } from "../../hooks/usePortalAccess";
import "../../styles/_auth-page.scss";
import "./RegisterPage.scss";

const PORTAL_CONFIG = {
  [AUTH_PORTALS.ADMIN]: {
    role: USER_ROLES.ADMIN,
    routes: ADMIN_ROUTES,
    loginLabel: "Already have an account",
  },
  [AUTH_PORTALS.SELLER]: {
    role: USER_ROLES.SELLER,
    routes: SELLER_ROUTES,
    loginLabel: "Already have a seller account",
  },
};

const INITIAL_FORM = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  phone: "",
  country: "",
  city: "",
  address: "",
};

const RegisterPage = ({ portal = AUTH_PORTALS.ADMIN }) => {
  const navigate = useNavigate();
  const { isSubmitting, error, register } = useAdminAuth();
  const [form, setForm] = useState(INITIAL_FORM);

  const config = PORTAL_CONFIG[portal];
  const { isReady, canEnterPortal } = usePortalAccess(portal, config.role);

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

  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      if (portal === AUTH_PORTALS.SELLER) {
        await register(form, portal);
        navigate(getRoutesForRole(USER_ROLES.SELLER).products, {
          replace: true,
        });
        return;
      }

      navigate(config.routes.login);
    } catch {
      // handled in context
    }
  };

  return (
    <div className="auth-page auth-page--register register-page">
      <AdminBrand />
      <PortalBadge role={config.role} variant="auth" />

      <div className="auth-page__card">
        <form className="auth-page__form" onSubmit={handleSubmit}>
          <label className="auth-page__field">
            <input
              type="text"
              placeholder="First Name"
              value={form.firstName}
              onChange={handleChange("firstName")}
              autoComplete="given-name"
              required
            />
          </label>

          <label className="auth-page__field">
            <input
              type="text"
              placeholder="Last Name"
              value={form.lastName}
              onChange={handleChange("lastName")}
              autoComplete="family-name"
              required
            />
          </label>

          <label className="auth-page__field">
            <input
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange("email")}
              autoComplete="email"
              required
            />
          </label>

          <label className="auth-page__field">
            <input
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange("password")}
              autoComplete="new-password"
              required
            />
          </label>

          <label className="auth-page__field">
            <input
              type="tel"
              placeholder="Phone"
              value={form.phone}
              onChange={handleChange("phone")}
              autoComplete="tel"
            />
          </label>

          <label className="auth-page__field">
            <input
              type="text"
              placeholder="Country"
              value={form.country}
              onChange={handleChange("country")}
              autoComplete="country-name"
            />
          </label>

          <label className="auth-page__field">
            <input
              type="text"
              placeholder="City"
              value={form.city}
              onChange={handleChange("city")}
              autoComplete="address-level2"
            />
          </label>

          <label className="auth-page__field">
            <input
              type="text"
              placeholder="Address"
              value={form.address}
              onChange={handleChange("address")}
              autoComplete="street-address"
            />
          </label>

          {error ? <p className="auth-page__error">{error}</p> : null}

          <button
            type="submit"
            className="auth-page__submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Registering..." : "Register"}
          </button>
        </form>

        <Link to={config.routes.login} className="auth-page__footer-link">
          {config.loginLabel}
        </Link>
      </div>
    </div>
  );
};

export default RegisterPage;
