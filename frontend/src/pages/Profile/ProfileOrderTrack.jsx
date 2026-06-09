import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "../../iconComponents";
import { getOrderByIdFromList } from "../../utils/orderHelpers";
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
        <p className="profile-page__empty">Order not found.</p>
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
        <p className="profile-page__empty">Tracking information is not available yet.</p>
      </div>
    </section>
  );
};

export default ProfileOrderTrack;
