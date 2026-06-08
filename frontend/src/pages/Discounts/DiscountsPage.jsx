import Discounts from "../../components/Discounts/Discounts";
import CatalogListing from "../../components/CatalogListing/CatalogListing";
import PageSearchHero from "../../components/PageSearchHero/PageSearchHero";
import { useCatalog } from "../../context/CatalogContext";
import "./DiscountsPage.scss";

const DiscountsPage = () => {
  const { getDiscountProducts, POPULAR_SEARCHES } = useCatalog();
  return (
    <div className="discounts-page">
      <PageSearchHero
        eyebrow="Deals"
        title="Save on top picks"
        subtitle="Limited-time discounts across the store — search for a deal or browse below."
        placeholder="Search discounted items..."
        popularTerms={POPULAR_SEARCHES}
        searchScope={{ scope: "discounts" }}
      />

      {/* <Discounts /> */}
      <CatalogListing
        title="All discounted products"
        subtitle="Catch the best deals before they are gone."
        products={getDiscountProducts()}
      />
    </div>
  );
};

export default DiscountsPage;
