import { useState } from "react";
import { PanelError, PanelLoading } from "../../components/PanelState/PanelState";
import TableFooter from "../../components/TableFooter/TableFooter";
import TableToolbar from "../../components/TableToolbar/TableToolbar";
import { useOrders } from "../../hooks/useOrders";
import { useTablePagination } from "../../hooks/useTablePagination";
import "../../styles/_dashboard.scss";
import "./OrdersPage.scss";

const OrdersPage = () => {
  const [query, setQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const { orders, isLoading, error, removeByIds, isSubmitting } =
    useOrders(query);

  const pagination = useTablePagination(orders);
  const { paginatedItems } = pagination;

  const allSelected =
    paginatedItems.length > 0 &&
    paginatedItems.every((order) => selectedIds.includes(order.id));

  const toggleAll = () => {
    if (allSelected) {
      setSelectedIds((prev) =>
        prev.filter((id) => !paginatedItems.some((item) => item.id === id)),
      );
      return;
    }

    setSelectedIds((prev) => [
      ...prev,
      ...paginatedItems
        .map((order) => order.id)
        .filter((id) => !prev.includes(id)),
    ]);
  };

  const toggleOne = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleDelete = async (ids) => {
    if (!ids.length) {
      return;
    }

    await removeByIds(ids);
    setSelectedIds((prev) => prev.filter((id) => !ids.includes(id)));
  };

  const handleTrashSelected = () => handleDelete(selectedIds);

  return (
    <section className="orders-page">
      <TableToolbar value={query} onChange={setQuery} />

      <PanelError message={error} />
      {isLoading ? <PanelLoading /> : null}

      <div className="dash-table-wrap">
        <table className="dash-table orders-page__table">
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  className="dash-table__checkbox"
                  checked={allSelected}
                  onChange={toggleAll}
                  aria-label="Select all orders on page"
                />
              </th>
              <th>Sku</th>
              <th>Date</th>
              <th>Status</th>
              <th>Billing</th>
              <th>Total</th>
              <th aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {paginatedItems.map((order) => (
              <tr key={order.id}>
                <td>
                  <input
                    type="checkbox"
                    className="dash-table__checkbox"
                    checked={selectedIds.includes(order.id)}
                    onChange={() => toggleOne(order.id)}
                    aria-label={`Select order ${order.sku}`}
                  />
                </td>
                <td>{order.sku}</td>
                <td>{order.date}</td>
                <td>{order.status}</td>
                <td className="orders-page__billing">{order.billing}</td>
                <td>{order.total}$</td>
                <td>
                  <div className="dash-table__actions">
                    <button
                      type="button"
                      className="dash-table__action dash-table__action--delete"
                      aria-label="Delete order"
                      onClick={() => handleDelete([order.id])}
                      disabled={isSubmitting}
                    >
                      ×
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <TableFooter
        onTrashSelected={handleTrashSelected}
        isTrashDisabled={!selectedIds.length || isSubmitting}
        total={pagination.total}
        rangeStart={pagination.rangeStart}
        rangeEnd={pagination.rangeEnd}
        pageSize={pagination.pageSize}
        pageSizeOptions={pagination.pageSizeOptions}
        onPageSizeChange={pagination.setPageSize}
        onFirst={pagination.goFirst}
        onPrev={pagination.goPrev}
        onNext={pagination.goNext}
        onLast={pagination.goLast}
        canGoFirst={pagination.canGoFirst}
        canGoPrev={pagination.canGoPrev}
        canGoNext={pagination.canGoNext}
        canGoLast={pagination.canGoLast}
      />
    </section>
  );
};

export default OrdersPage;
