/* Подвал сайта со ссылками и заглушкой подписки на рассылку. */
import { Link } from "react-router-dom";
import "./Footer.scss";
import {
  Facebook,
  Instagram,
  Logo,
  TikTok,
  YouTube,
} from "../../iconComponents";

/**
 * Подвал сайта с навигационными ссылками и заглушками соцсетей.
 */
const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <Link to="/" className="footer-logo" aria-label="KLIKAVA home">
            <Logo className="footer-logo__icon" aria-hidden="true" />
            <span className="footer-logo__text">
              KLIK<span>AVA</span>
            </span>
          </Link>
          <div className="footer-column">
            <h3 className="footer-heading">Company info</h3>
            <div className="footer-column-links">
              <Link to="/about" className="footer-link">
                About KlikAVA
              </Link>
            </div>
          </div>
          <div className="footer-column">
            <h3 className="footer-heading">Collaborate with us</h3>
            <div className="footer-column-links">
              <Link to="/sell" className="footer-link">
                Sell on KlikAVA
              </Link>
              <Link to="/blog" className="footer-link">
                Blog for sellers
              </Link>
            </div>
          </div>
          <div className="footer-column">
            <h3 className="footer-heading">Support service</h3>
            <div className="footer-column-links">
              <Link to="/support" className="footer-link">
                Support chat
              </Link>
              <Link to="/calendar" className="footer-link">
                Sales Calendar
              </Link>
            </div>
          </div>
          <div className="footer-column">
            <h3 className="footer-heading">Connect with BuyWay</h3>
            <div className="social-icons">
              <a
                href="https://instagram.com"
                className="social-icon"
                aria-label="Instagram"
                target="_blank"
                rel="noreferrer"
              >
                <Instagram className="social-icon-glyph" aria-hidden="true" />
              </a>
              <a
                href="https://facebook.com"
                className="social-icon"
                aria-label="Facebook"
                target="_blank"
                rel="noreferrer"
              >
                <Facebook className="social-icon-glyph" aria-hidden="true" />
              </a>
              <a
                href="https://tiktok.com"
                className="social-icon"
                aria-label="TikTok"
                target="_blank"
                rel="noreferrer"
              >
                <TikTok className="social-icon-glyph" aria-hidden="true" />
              </a>
              <a
                href="https://youtube.com"
                className="social-icon"
                aria-label="YouTube"
                target="_blank"
                rel="noreferrer"
              >
                <YouTube className="social-icon-glyph" aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>
        <div className="footer-copyright">
          <p className="footer-copyright-text">© 2025 KlikAVA Inc.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
