import { useNavigate } from "react-router-dom";
import { Clock } from "../../iconComponents";
import { PROFILE_COUPONS } from "../../data/profile";
import { useUserData } from "../../context/UserDataContext";
import "../../styles/profile-page.scss";
import "./ProfileCoupons.scss";

const ProfileCoupons = () => {
  const navigate = useNavigate();
  const { applyCoupon, activeCoupon } = useUserData();

  return (
    <section className="profile-page profile-coupons">
      <h1 className="profile-page__title">Coupons</h1>

      {activeCoupon ? (
        <p className="profile-coupons__active">
          Active coupon: {activeCoupon.amount} (applied at checkout)
        </p>
      ) : null}

      <div className="profile-coupons__grid">
        {PROFILE_COUPONS.map((coupon) => (
          <article key={coupon.id} className="profile-coupons__card">
            <div className="profile-coupons__top">
              <p>
                <span>{coupon.amount}</span>
              </p>
              <div className="profile-coupons__expiry">
                <Clock className="profile-coupons__clock" />
                <p>
                  <span>{coupon.expiry}</span>
                </p>
              </div>
            </div>

            <p className="profile-coupons__description">
              <span>coupon for order from $ {coupon.minOrder}</span>
            </p>

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
    </section>
  );
};

export default ProfileCoupons;
