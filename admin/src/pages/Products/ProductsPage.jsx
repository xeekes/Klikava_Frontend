import { useState } from "react";
import { Link } from "react-router-dom";
import { PanelError, PanelLoading } from "../../components/PanelState/PanelState";
import TableFooter from "../../components/TableFooter/TableFooter";
import TableToolbar from "../../components/TableToolbar/TableToolbar";
import { usePanelRoutes } from "../../hooks/usePanelRoutes";
import { useProducts } from "../../hooks/useProducts";
import { useTablePagination } from "../../hooks/useTablePagination";
import "../../styles/_dashboard.scss";
import "./ProductsPage.scss";

const ProductsPage = () => {
  const routes = usePanelRoutes();
  const [query, setQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const { products, isLoading, error, removeByIds, isSubmitting } =
    useProducts(query);

  const pagination = useTablePagination(products);
  const { paginatedItems } = pagination;

  const allSelected =
    paginatedItems.length > 0 &&
    paginatedItems.every((product) => selectedIds.includes(product.id));

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
        .map((product) => product.id)
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
    <section className="products-page">
      <TableToolbar
        value={query}
        onChange={setQuery}
        action={
          <Link to={routes.addProduct} className="dash-btn">
            Add New
          </Link>
        }
      />

      <PanelError message={error} />
      {isLoading ? <PanelLoading /> : null}

      <div className="dash-table-wrap">
        <table className="dash-table">
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  className="dash-table__checkbox"
                  checked={allSelected}
                  onChange={toggleAll}
                  aria-label="Select all products on page"
                />
              </th>
              <th>Name</th>
              <th>SKU</th>
              <th>Stok</th>
              <th>Price</th>
              <th>Categories</th>
              <th>Tags</th>
              <th>Date</th>
              <th aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {paginatedItems.map((product) => (
              <tr key={product.id}>
                <td>
                  <input
                    type="checkbox"
                    className="dash-table__checkbox"
                    checked={selectedIds.includes(product.id)}
                    onChange={() => toggleOne(product.id)}
                    aria-label={`Select ${product.name}`}
                  />
                </td>
                <td>{product.name}</td>
                <td>{product.sku}</td>
                <td>{product.stock}</td>
                <td>{product.price}$</td>
                <td>{product.categories}</td>
                <td>{product.tags}</td>
                <td>{product.date}</td>
                <td>
                  <div className="dash-table__actions">
                    <button
                      type="button"
                      className="dash-table__action dash-table__action--edit"
                      aria-label="Edit product"
                    >
                      ✎
                    </button>
                    <button
                      type="button"
                      className="dash-table__action dash-table__action--delete"
                      aria-label="Delete product"
                      onClick={() => handleDelete([product.id])}
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
        showFilterSelected
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

export default ProductsPage;
