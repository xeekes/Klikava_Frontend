/* Оболочка витрины: шапка, анимированный outlet страниц, подвал, тосты корзины/избранного. */
import ShoppingFeedback from "../components/ShoppingFeedback/ShoppingFeedback";
import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";
import PageTransition from "../components/PageTransition/PageTransition";
import { useRouteChunkPrefetch } from "../hooks/useRouteChunkPrefetch";
import "./MainLayout.scss";

/**
 * Оболочка страницы витрины: шапка, анимированный outlet, подвал и тосты покупок.
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
