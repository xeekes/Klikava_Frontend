/* Showcase shell: header, animated outlet pages, footer, basket/favorites toasts. */
import ShoppingFeedback from "../components/ShoppingFeedback/ShoppingFeedback";
import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";
import PageTransition from "../components/PageTransition/PageTransition";
import { useRouteChunkPrefetch } from "../hooks/useRouteChunkPrefetch";
import "./MainLayout.scss";

/**
 * Showcase page skin: header, animated outlet, footer and shopping toasts.
 */
const MainLayout = () => {
  useRouteChunkPrefetch();

  return (
    <div className="main-layout">
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>
      <Header />
      <main id="main-content" className="main-content">
        <PageTransition />
      </main>
      <Footer />
      <ShoppingFeedback />
    </div>
  );
};
export default MainLayout;
