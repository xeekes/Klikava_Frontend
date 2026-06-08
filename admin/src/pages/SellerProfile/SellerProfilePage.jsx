import { useEffect, useState } from "react";
import SellerFormField from "../../components/SellerFormField/SellerFormField";
import {
  PanelError,
  PanelLoading,
  PanelSuccess,
} from "../../components/PanelState/PanelState";
import { useSellerProfile } from "../../hooks/useSellerAccount";
import "../../styles/_dashboard.scss";
import "./SellerProfilePage.scss";

const SellerProfilePage = () => {
  const { profile, isLoading, error, save, isSubmitting } = useSellerProfile();
  const [form, setForm] = useState(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (profile) {
      setForm(profile);
    }
  }, [profile]);

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

  if (isLoading || !form) {
    return (
      <section className="seller-profile-page">
        <h1 className="dash-page-title">My profile</h1>
        <PanelLoading />
      </section>
    );
  }

  return (
    <section className="seller-profile-page">
      <h1 className="dash-page-title">My profile</h1>

      <PanelError message={error} />
      <PanelSuccess message={saved ? "Profile saved." : ""} />

      <form className="seller-profile-page__form" onSubmit={handleSubmit}>
        <div className="seller-profile-page__layout">
          <div className="seller-profile-page__avatar-wrap">
            <img
              className="seller-profile-page__avatar"
              src={form.avatar}
              alt=""
            />
            <button
              type="button"
              className="seller-profile-page__avatar-upload"
              aria-label="Upload profile photo"
            >
              <span aria-hidden="true">↑</span>
            </button>
          </div>

          <div className="seller-profile-page__fields">
            <SellerFormField
              id="seller-first-name"
              label="First Name"
              value={form.firstName}
              onChange={handleChange("firstName")}
            />
            <SellerFormField
              id="seller-last-name"
              label="Last Name"
              value={form.lastName}
              onChange={handleChange("lastName")}
            />
            <SellerFormField
              id="seller-web-address"
              label="Public Web Address"
              value={form.publicWebAddress}
              onChange={handleChange("publicWebAddress")}
              className="seller-profile-page__field--wide"
            />
            <SellerFormField
              id="seller-about"
              label="About Me"
              value={form.aboutMe}
              onChange={handleChange("aboutMe")}
              className="seller-profile-page__field--wide"
              multiline
            />
          </div>
        </div>

        <div className="seller-profile-page__footer">
          <button type="submit" className="dash-btn" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </section>
  );
};

export default SellerProfilePage;
