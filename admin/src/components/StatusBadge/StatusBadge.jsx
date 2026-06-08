import "./StatusBadge.scss";

const STATUS_LABELS = {
  published: "Published",
  draft: "Draft",
  out_of_stock: "Out of stock",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const StatusBadge = ({ status }) => {
  const label = STATUS_LABELS[status] || status;

  return (
    <span className={`status-badge status-badge--${status}`.trim()}>
      {label}
    </span>
  );
};

export default StatusBadge;
