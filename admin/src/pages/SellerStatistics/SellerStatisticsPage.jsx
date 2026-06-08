import { useMemo } from "react";
import { Link } from "react-router-dom";
import { PanelError, PanelLoading } from "../../components/PanelState/PanelState";
import { SELLER_ROUTES } from "../../constants/routes";
import { SELLER_STAT_METRICS } from "../../data/mockSellerProfile";
import { useSellerStats } from "../../hooks/useSellerAccount";
import "../../styles/_dashboard.scss";
import "./SellerStatisticsPage.scss";

const SellerStatisticsPage = () => {
  const { stats, activeMetric, setActiveMetric, isLoading, error } =
    useSellerStats();

  const metric = stats?.[activeMetric];
  const maxValue = useMemo(
    () => (metric ? Math.max(...metric.daily, 1) : 1),
    [metric],
  );

  if (isLoading) {
    return (
      <section className="seller-stats-page">
        <PanelLoading />
      </section>
    );
  }

  if (!stats || !metric) {
    return (
      <section className="seller-stats-page">
        <PanelError message={error || "Statistics unavailable"} />
      </section>
    );
  }

  return (
    <section className="seller-stats-page">
      <div className="seller-stats-page__head">
        <Link
          to={SELLER_ROUTES.dashboard}
          className="seller-stats-page__back"
          aria-label="Back to dashboard"
        >
          ‹
        </Link>
        <h1 className="seller-stats-page__title">Last 7 days</h1>
      </div>

      <PanelError message={error} />

      <div className="seller-stats-page__chart-wrap">
        <div className="seller-stats-page__chart" role="img" aria-label="Bar chart">
          {metric.daily.map((value, index) => (
            <div key={index} className="seller-stats-page__chart-col">
              <div
                className="seller-stats-page__chart-bar"
                style={{ height: `${(value / maxValue) * 100}%` }}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="seller-stats-page__metrics">
        {SELLER_STAT_METRICS.map((key) => {
          const item = stats[key];

          return (
            <button
              key={key}
              type="button"
              className={`seller-stats-page__metric ${
                activeMetric === key ? "seller-stats-page__metric--active" : ""
              }`.trim()}
              onClick={() => setActiveMetric(key)}
            >
              <span className="seller-stats-page__metric-label">
                {item.label}
              </span>
              <span className="seller-stats-page__metric-value">
                {item.total}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
};

export default SellerStatisticsPage;
