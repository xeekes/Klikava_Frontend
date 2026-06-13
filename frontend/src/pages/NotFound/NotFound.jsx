/* Fallback 404 для неизвестных маршрутов внутри MainLayout. */
import { Link } from "react-router-dom";
import "./NotFound.scss";

/**
 * Fallback UI для несовпадающих маршрутов приложения.
 */
const NotFound = () => (
  <section className="not-found">
    <div className="not-found__container">
      <p className="not-found__code">404</p>
      <h1 className="not-found__title">Page not found</h1>
      <p className="not-found__text">
        The page you are looking for does not exist or has been moved.
      </p>
      <div className="not-found__actions">
        <Link to="/" className="not-found__action not-found__action--primary">
          Go to home
        </Link>
        <Link to="/catalog" className="not-found__action">
          Browse catalog
        </Link>
      </div>
    </div>
  </section>
);
export default NotFound;
