import { MOCK_CATEGORIES } from "../../data/mockCategories";
import { MOCK_ORDERS } from "../../data/mockOrders";
import { MOCK_PRODUCTS } from "../../data/mockProducts";
import "./DashboardPage.scss";

const stats = [
  {
    label: "Products",
    value: MOCK_PRODUCTS.length,
    hint: "Active catalog items",
  },
  {
    label: "Categories",
    value: MOCK_CATEGORIES.length,
    hint: "Top-level departments",
  },
  {
    label: "Orders",
    value: MOCK_ORDERS.length,
    hint: "Recent orders in queue",
  },
  {
    label: "Low stock",
    value: MOCK_PRODUCTS.filter((item) => item.stock < 20).length,
    hint: "Needs restock attention",
  },
];

const DashboardPage = () => {
  return (
    <section className="dashboard-page">
      <div className="dashboard-page__stats">
        {stats.map((item) => (
          <article key={item.label} className="dashboard-page__stat-card">
            <p className="dashboard-page__stat-label">{item.label}</p>
            <p className="dashboard-page__stat-value">{item.value}</p>
            <p className="dashboard-page__stat-hint">{item.hint}</p>
          </article>
        ))}
      </div>

      <div className="dashboard-page__grid">
        <article className="dashboard-page__panel">
          <h3>Recent orders</h3>
          <ul className="dashboard-page__list">
            {MOCK_ORDERS.slice(0, 3).map((order) => (
              <li key={order.id}>
                <span>{order.id}</span>
                <span>{order.customer}</span>
                <strong>{order.total} $</strong>
              </li>
            ))}
          </ul>
        </article>

        <article className="dashboard-page__panel">
          <h3>Top sellers</h3>
          <ul className="dashboard-page__list">
            {MOCK_PRODUCTS.slice(0, 3).map((product) => (
              <li key={product.id}>
                <span>{product.title}</span>
                <strong>{product.sold} sold</strong>
              </li>
            ))}
          </ul>
        </article>
      </div>
    </section>
  );
};

export default DashboardPage;
