import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import SellerFormField from "../../components/SellerFormField/SellerFormField";
import {
  PanelError,
  PanelLoading,
  PanelSuccess,
} from "../../components/PanelState/PanelState";
import { SELLER_ROUTES } from "../../constants/routes";
import { useAdminAuth } from "../../context/AdminAuthContext";
import { useSellerSettings } from "../../hooks/useSellerAccount";
import "../../styles/_dashboard.scss";
import "./SellerSettingsPage.scss";

const SellerSettingsPage = () => {
  const navigate = useNavigate();
  const { logout } = useAdminAuth();
  const { settings, isLoading, error, save, deleteAccount, isSubmitting } =
    useSellerSettings();
  const [form, setForm] = useState(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (settings) {
      setForm(settings);
    }
  }, [settings]);

  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
    setSaved(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form) {
      return;
    }

    await save(form);
    setSaved(true);
  };

  const handleDeleteAccount = async () => {
    await deleteAccount();
    logout();
    navigate(SELLER_ROUTES.login, { replace: true });
  };

  if (isLoading || !form) {
    return (
      <section className="seller-settings-page">
        <h1 className="seller-settings-page__title">Account details</h1>
        <PanelLoading />
      </section>
    );
  }

  return (
    <section className="seller-settings-page">
      <h1 className="seller-settings-page__title">Account details</h1>

      <PanelError message={error} />
      <PanelSuccess message={saved ? "Settings saved." : ""} />

      <form className="seller-settings-page__form" onSubmit={handleSubmit}>
        <div className="seller-settings-page__grid">
          <SellerFormField
            id="settings-first-name"
            label="First Name"
            value={form.firstName}
            onChange={handleChange("firstName")}
          />
          <SellerFormField
            id="settings-last-name"
            label="Last Name"
            value={form.lastName}
            onChange={handleChange("lastName")}
          />
          <SellerFormField
            id="settings-email"
            label="Email"
            type="email"
            value={form.email}
            onChange={handleChange("email")}
          />
          <SellerFormField
            id="settings-phone"
            label="Phone"
            type="tel"
            value={form.phone}
            onChange={handleChange("phone")}
          />
          <SellerFormField
            id="settings-country"
            label="Country"
            value={form.country}
            onChange={handleChange("country")}
          />
          <SellerFormField
            id="settings-city"
            label="City"
            value={form.city}
            onChange={handleChange("city")}
          />
          <SellerFormField
            id="settings-address"
            label="Address"
            value={form.address}
            onChange={handleChange("address")}
            className="seller-settings-page__field--wide"
          />
          <SellerFormField
            id="settings-password"
            label="Password"
            type="password"
            value={form.password}
            onChange={handleChange("password")}
            className="seller-settings-page__field--wide"
          />
        </div>

        <div className="seller-settings-page__footer">
          <button
            type="button"
            className="seller-settings-page__delete-btn"
            onClick={handleDeleteAccount}
            disabled={isSubmitting}
          >
            Delete account permanently
          </button>
          <button type="submit" className="dash-btn" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </section>
  );
};

export default SellerSettingsPage;
