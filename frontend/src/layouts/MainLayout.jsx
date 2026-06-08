import { Outlet } from "react-router-dom";
import ShoppingFeedback from "../components/ShoppingFeedback/ShoppingFeedback";
import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";
import PageTransition from "../components/PageTransition/PageTransition";
import "./MainLayout.scss";

const MainLayout = () => (
  <div className="main-layout">
    <Header />
    <main className="main-content">
      <PageTransition />
    </main>
    <Footer />
    <ShoppingFeedback />
  </div>
);

export default MainLayout;
