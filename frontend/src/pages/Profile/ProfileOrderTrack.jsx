/* Просмотр отслеживания одного заказа через API shipments. */
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "../../iconComponents";
import { ordersApi } from "../../api/orders";
import { hasApiBaseUrl } from "../../api/client";
import LoadingSpinner from "../../components/LoadingSpinner/LoadingSpinner";
import { getOrderByIdFromList } from "../../utils/orderHelpers";
import { useUserData } from "../../context/UserDataContext";
import "../../styles/profile-page.scss";
import "./ProfileOrderTrack.scss";

/**
 * Просмотр отслеживания одного заказа с данными shipments API.
 */
const ProfileOrderTrack = () => {
  const { orderId } = useParams();
  const { orders } = useUserData();
  const order = getOrderByIdFromList(orders, orderId);
  const [shipments, setShipments] = useState([]);
  const [isLoading, setIsLoading] = useState(hasApiBaseUrl());
  const [error, setError] = useState("");

  useEffect(() => {
    if (!hasApiBaseUrl() || !order) {
      setIsLoading(false);
      return undefined;
    }
    let cancelled = false;
    const loadShipments = async () => {
      setIsLoading(true);
      setError("");
      try {
        const targetId = order.backendId ?? order.id;
        const loaded = await ordersApi.listShipments(targetId);
        if (!cancelled) {
          setShipments(loaded);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Failed to load tracking.");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };
    loadShipments();
    return () => {
      cancelled = true;
    };
  }, [order]);

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
        {isLoading ? (
          <LoadingSpinner variant="block" label="Loading tracking..." />
        ) : error ? (
          <p className="profile-page__empty">{error}</p>
        ) : shipments.length === 0 ? (
          <p className="profile-page__empty">
            Tracking information is not available yet.
          </p>
        ) : (
          <ul className="profile-order-track__timeline">
            {shipments.map((shipment) => (
              <li key={shipment.id} className="profile-order-track__step">
                <p className="profile-order-track__status">{shipment.status}</p>
                {shipment.trackingNumber ? (
                  <p className="profile-order-track__tracking">
                    Tracking: {shipment.trackingNumber}
                  </p>
                ) : null}
                {shipment.createdAt ? (
                  <p className="profile-order-track__date">
                    {new Date(shipment.createdAt).toLocaleString()}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
};

export default ProfileOrderTrack;
