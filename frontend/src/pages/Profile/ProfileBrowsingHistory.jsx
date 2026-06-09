import ProductCard from "../../components/ProductCard/ProductCard";
import SeeMoreButton from "../../components/SeeMoreButton/SeeMoreButton";
import { useBrowsingHistory } from "../../context/BrowsingHistoryContext";
import useProductPagination from "../../hooks/useProductPagination";
import "../../styles/profile-page.scss";
import "./ProfileBrowsingHistory.scss";

const BrowsingHistoryGroup = ({ group }) => {
  const { visibleItems, hasMore, loadMore } = useProductPagination(
    group.products,
    group.date,
  );

  return (
    <section className="profile-browsing-history__group">
      <h2 className="profile-browsing-history__date">{group.date}</h2>
      <div className="profile-browsing-history__grid">
        {visibleItems.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            rounded
            showAddToBasket
          />
        ))}
      </div>

      {hasMore ? (
        <SeeMoreButton
          onClick={loadMore}
          wrapClassName="profile-browsing-history__see-more-wrap"
        />
      ) : null}
    </section>
  );
};

const ProfileBrowsingHistory = () => {
  const { groups } = useBrowsingHistory();

  return (
    <section className="profile-page profile-browsing-history">
      <h1 className="profile-page__title">Browsing history</h1>

      {groups.length === 0 ? (
        <p className="profile-page__empty">No browsing history yet.</p>
      ) : (
        <div className="profile-browsing-history__groups">
          {groups.map((group) => (
            <BrowsingHistoryGroup key={group.date} group={group} />
          ))}
        </div>
      )}
    </section>
  );
};

export default ProfileBrowsingHistory;
