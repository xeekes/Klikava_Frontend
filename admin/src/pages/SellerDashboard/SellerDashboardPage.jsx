import { Link } from "react-router-dom";
import { PanelError, PanelLoading } from "../../components/PanelState/PanelState";
import { SELLER_ROUTES } from "../../constants/routes";
import { useSellerDashboard } from "../../hooks/useSellerAccount";
import "../../styles/_dashboard.scss";
import "./SellerDashboardPage.scss";

const SellerDashboardPage = () => {
  const { summary, isLoading, error } = useSellerDashboard();

  if (isLoading) {
    return (
      <section className="seller-dashboard-page">
        <h1 className="dash-page-title">Dashboard</h1>
        <PanelLoading />
      </section>
    );
  }

  return (
    <section className="seller-dashboard-page">
      <h1 className="dash-page-title">Dashboard</h1>

      <PanelError message={error} />

      <div className="seller-dashboard-page__cards">
        <article className="seller-dashboard-page__card">
          <span className="seller-dashboard-page__card-label">Products</span>
          <strong className="seller-dashboard-page__card-value">
            {summary?.productsCount ?? 0}
          </strong>
        </article>
        <article className="seller-dashboard-page__card">
          <span className="seller-dashboard-page__card-label">Orders</span>
          <strong className="seller-dashboard-page__card-value">
            {summary?.ordersCount ?? 0}
          </strong>
        </article>
        <article className="seller-dashboard-page__card">
          <span className="seller-dashboard-page__card-label">Views</span>
          <strong className="seller-dashboard-page__card-value">
            {summary?.views ?? 0}
          </strong>
        </article>
        <article className="seller-dashboard-page__card">
          <span className="seller-dashboard-page__card-label">Purchased</span>
          <strong className="seller-dashboard-page__card-value">
            {summary?.purchased ?? 0}
          </strong>
        </article>
      </div>

      <div className="seller-dashboard-page__links">
        <Link to={SELLER_ROUTES.products} className="dash-btn">
          All products
        </Link>
        <Link to={SELLER_ROUTES.orders} className="dash-btn dash-btn--light">
          Orders
        </Link>
        <Link to={SELLER_ROUTES.statistics} className="dash-btn dash-btn--light">
          Statistics
        </Link>
      </div>
    </section>
  );
};

export default SellerDashboardPage;
