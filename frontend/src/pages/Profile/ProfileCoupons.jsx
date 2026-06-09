import { useNavigate } from "react-router-dom";
import { useUserData } from "../../context/UserDataContext";
import "../../styles/profile-page.scss";
import "./ProfileCoupons.scss";

const ProfileCoupons = () => {
  const navigate = useNavigate();
  const { applyCoupon, activeCoupon } = useUserData();
  const coupons = [];

  return (
    <section className="profile-page profile-coupons">
      <h1 className="profile-page__title">Coupons</h1>

      {activeCoupon ? (
        <p className="profile-coupons__active">
          Active coupon: {activeCoupon.amount} (applied at checkout)
        </p>
      ) : null}

      {coupons.length === 0 ? (
        <p className="profile-page__empty">No coupons available.</p>
      ) : (
        <div className="profile-coupons__grid">
          {coupons.map((coupon) => (
            <article key={coupon.id} className="profile-coupons__card">
              <button
                type="button"
                className="profile-coupons__use"
                onClick={() => {
                  applyCoupon(coupon);
                  navigate("/checkout");
                }}
              >
                Use now
              </button>
            </article>
          ))}
        </div>
      )}
    </section>
  );
};

export default ProfileCoupons;
