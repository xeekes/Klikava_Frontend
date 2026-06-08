import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PanelError } from "../../components/PanelState/PanelState";
import { usePanelRoutes } from "../../hooks/usePanelRoutes";
import { useProducts } from "../../hooks/useProducts";
import "../../styles/_dashboard.scss";
import "./AddProductPage.scss";

const DATA_TABS = [
  { id: "price", label: "Price" },
  { id: "categories", label: "Categories" },
  { id: "sku", label: "SKU" },
  { id: "quantity", label: "Quantity" },
];

const AddProductPage = () => {
  const navigate = useNavigate();
  const routes = usePanelRoutes();
  const { create, isSubmitting, error } = useProducts();
  const [activeTab, setActiveTab] = useState("price");
  const [productName, setProductName] = useState("");
  const [description, setDescription] = useState("");
  const [regularPrice, setRegularPrice] = useState("");
  const [salePrice, setSalePrice] = useState("");
  const [sku, setSku] = useState("");
  const [quantity, setQuantity] = useState("");
  const [categories, setCategories] = useState("");

  const handlePublish = async () => {
    const price = Number(salePrice || regularPrice) || 0;
    const stock =
      quantity === "" || Number(quantity) > 0 ? "in stock" : "out of stock";

    await create({
      name: productName.trim() || "Product Name",
      description,
      regularPrice: Number(regularPrice) || undefined,
      salePrice: Number(salePrice) || undefined,
      price,
      sku: sku.trim() || "-",
      categories: categories.trim() || "-",
      stock,
    });

    navigate(routes.products, { replace: true });
  };

  return (
    <section className="add-product-page">
      <div className="add-product-page__head">
        <h1 className="dash-page-title">Add products</h1>
        <button
          type="button"
          className="dash-btn"
          onClick={handlePublish}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Publishing..." : "Publish"}
        </button>
      </div>

      <PanelError message={error} />

      <input
        type="text"
        className="dash-input add-product-page__name"
        placeholder="Product Name"
        value={productName}
        onChange={(event) => setProductName(event.target.value)}
      />

      <div className="add-product-page__layout">
        <div className="add-product-page__main">
          <article className="dash-panel add-product-page__panel">
            <div className="dash-panel__head">Products Description</div>
            <div className="dash-panel__body">
              <textarea
                className="dash-input dash-input--area"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
              />
            </div>
          </article>

          <article className="dash-panel add-product-page__panel add-product-page__data-panel">
            <div className="dash-panel__head">Products Data</div>
            <div className="add-product-page__data-body">
              <div className="add-product-page__data-tabs">
                {DATA_TABS.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    className={`add-product-page__data-tab ${
                      activeTab === tab.id
                        ? "add-product-page__data-tab--active"
                        : ""
                    }`.trim()}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="add-product-page__data-content">
                {activeTab === "price" ? (
                  <>
                    <label className="add-product-page__field">
                      <span>Regular Price</span>
                      <input
                        type="text"
                        className="dash-input"
                        value={regularPrice}
                        onChange={(event) => setRegularPrice(event.target.value)}
                      />
                    </label>
                    <label className="add-product-page__field">
                      <span>Sale Price</span>
                      <input
                        type="text"
                        className="dash-input"
                        value={salePrice}
                        onChange={(event) => setSalePrice(event.target.value)}
                      />
                    </label>
                  </>
                ) : null}

                {activeTab === "categories" ? (
                  <label className="add-product-page__field">
                    <span>Categories</span>
                    <input
                      type="text"
                      className="dash-input"
                      value={categories}
                      onChange={(event) => setCategories(event.target.value)}
                    />
                  </label>
                ) : null}

                {activeTab === "sku" ? (
                  <label className="add-product-page__field">
                    <span>SKU</span>
                    <input
                      type="text"
                      className="dash-input"
                      value={sku}
                      onChange={(event) => setSku(event.target.value)}
                    />
                  </label>
                ) : null}

                {activeTab === "quantity" ? (
                  <label className="add-product-page__field">
                    <span>Quantity</span>
                    <input
                      type="number"
                      min="0"
                      className="dash-input"
                      value={quantity}
                      onChange={(event) => setQuantity(event.target.value)}
                    />
                  </label>
                ) : null}
              </div>
            </div>
          </article>
        </div>

        <aside className="add-product-page__aside">
          <article className="dash-panel">
            <div className="dash-panel__head">Publish</div>
            <div className="dash-panel__body">
              <p className="add-product-page__status">Status: Draft</p>
            </div>
          </article>

          <article className="dash-panel">
            <div className="dash-panel__head">Product Image</div>
            <div className="dash-panel__body">
              <div className="add-product-page__media-row">
                <button type="button" className="dash-btn dash-btn--light">
                  Add
                </button>
                <div className="add-product-page__media-placeholder" />
              </div>
            </div>
          </article>

          <article className="dash-panel">
            <div className="dash-panel__head">Product Gallery</div>
            <div className="dash-panel__body">
              <div className="add-product-page__media-row">
                <button type="button" className="dash-btn dash-btn--light">
                  Add
                </button>
                <div className="add-product-page__media-placeholder" />
              </div>
            </div>
          </article>
        </aside>
      </div>
    </section>
  );
};

export default AddProductPage;
