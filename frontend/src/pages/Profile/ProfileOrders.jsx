/* Order history with tabs by status; data from API or localStorage. */
import { useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import ProfileOrderCard from "../../components/Profile/ProfileOrderCard/ProfileOrderCard";
import { useCatalog } from "../../context/CatalogContext";
import { useUserData } from "../../context/UserDataContext";
import { ORDER_TABS } from "../../constants/profile";
import {
  filterOrdersByTabFromList,
  getOrderActions,
  withOrderCoverImage,
} from "../../utils/orderHelpers";
import "../../styles/profile-page.scss";
import "./ProfileOrders.scss";

/**
 * Order history with tabs by status based on the user data warehouse.
 */
const ProfileOrders = () => {
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "all";
  const { orders } = useUserData();
  const { products } = useCatalog();
  const ordersWithImages = useMemo(
    () =>
      orders.map((order) => withOrderCoverImage(order, { catalogProducts: products })),
    [orders, products],
  );
  const visibleOrders = filterOrdersByTabFromList(ordersWithImages, activeTab);
  const actions = getOrderActions(activeTab);
  return (
    <section className="profile-page profile-orders">
      <ul className="profile-page__tabs">
        {ORDER_TABS.map((tab) => (
          <li key={tab.id}>
            <Link
              to={`/profile/orders${tab.id === "all" ? "" : `?tab=${tab.id}`}`}
              className={`profile-page__tab ${
                activeTab === tab.id ? "profile-page__tab--active" : ""
              }`.trim()}
            >
              {tab.label}
            </Link>
          </li>
        ))}
      </ul>
      {visibleOrders.length === 0 ? (
        <p className="profile-page__empty">No orders yet.</p>
      ) : (
        <div className="profile-page__stack">
          {visibleOrders.map((order) => (
            <ProfileOrderCard key={order.id} order={order} actions={actions} />
          ))}
        </div>
      )}
    </section>
  );
};

export default ProfileOrders;
