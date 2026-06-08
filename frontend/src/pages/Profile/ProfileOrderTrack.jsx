import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "../../iconComponents";
import { PROFILE_TRACK_STEPS } from "../../data/profile";
import { getOrderByIdFromList } from "../../data/profile";
import { useUserData } from "../../context/UserDataContext";
import "../../styles/profile-page.scss";
import "./ProfileOrderTrack.scss";

const ProfileOrderTrack = () => {
  const { orderId } = useParams();
  const { orders } = useUserData();
  const order = getOrderByIdFromList(orders, orderId);

  if (!order) {
    return (
      <section className="profile-page">
        <Link to="/profile/orders" className="profile-page__back">
          <ArrowLeft className="profile-page__back-icon" aria-hidden="true" />
          Track
        </Link>
        <p>Order not found</p>
      </section>
    );
  }

  return (
    <section className="profile-page profile-order-track">
      <Link to="/profile/orders" className="profile-page__back">
        <ArrowLeft className="profile-page__back-icon" aria-hidden="true" />
        Track
      </Link>

      <div className="profile-order-track__card profile-page__card">
        <ul className="profile-order-track__timeline">
          {PROFILE_TRACK_STEPS.map((step) => (
            <li
              key={step.id}
              className={`profile-order-track__step ${
                step.active ? "profile-order-track__step--active" : ""
              }`.trim()}
            >
              <div className="profile-order-track__marker">
                <div
                  className="profile-order-track__marker-circle"
                  aria-hidden="true"
                />
                <div
                  className="profile-order-track__marker-line"
                  aria-hidden="true"
                />
              </div>
              <div className="profile-order-track__content">
                <p className="profile-order-track__step-title">{step.title}</p>
                <p className="profile-order-track__step-date">{step.date}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default ProfileOrderTrack;
