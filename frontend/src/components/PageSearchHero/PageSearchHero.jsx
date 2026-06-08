import { useNavigate } from "react-router-dom";
import SiteSearch from "../SiteSearch/SiteSearch";
import TagSlider from "../TagSlider/TagSlider";
import { buildSearchUrl } from "../../utils/searchScope";
import "./PageSearchHero.scss";

const PageSearchHero = ({
  eyebrow,
  title,
  subtitle,
  placeholder = "Search products, categories...",
  popularTerms = [],
  showPopular = true,
  initialQuery = "",
  autoFocus = false,
  searchScope = null,
  children,
}) => {
  const navigate = useNavigate();
  const scope = searchScope || {};

  const handlePopularClick = (term) => {
    navigate(buildSearchUrl(term, scope));
  };

  return (
    <section className="page-search-hero">
      <div className="container">
        {eyebrow ? <p className="page-search-hero__eyebrow">{eyebrow}</p> : null}
        <h1 className="page-search-hero__title">{title}</h1>
        {subtitle ? <p className="page-search-hero__subtitle">{subtitle}</p> : null}

        <SiteSearch
          variant="hero"
          initialQuery={initialQuery}
          autoFocus={autoFocus}
          placeholder={placeholder}
          searchScope={searchScope}
        />

        {showPopular && popularTerms.length > 0 ? (
          <div className="page-search-hero__popular">
            <span>Popular:</span>
            <TagSlider
              className="page-search-hero__popular-list"
              spaceBetween={8}
            >
              {popularTerms.map((term) => (
                <button
                  key={term}
                  type="button"
                  className="page-search-hero__popular-chip"
                  onClick={() => handlePopularClick(term)}
                >
                  {term}
                </button>
              ))}
            </TagSlider>
          </div>
        ) : null}

        {children ? <div className="page-search-hero__extra">{children}</div> : null}
      </div>
    </section>
  );
};

export default PageSearchHero;
