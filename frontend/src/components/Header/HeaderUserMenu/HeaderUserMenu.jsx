/* User menu taking into account authorization: login link or drop-down profile. */
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Filter,
  Language2,
  Logout,
  MenuArrowRight,
  User,
} from "../../../iconComponents";
import { useAuth } from "../../../context/AuthContext";
import { useUserData } from "../../../context/UserDataContext";
import { useAuthModal } from "../../../hooks/useAuthModal";
import { useMotionPresence } from "../../../hooks/useMotionPresence";
import {
  readStorage,
  STORAGE_KEYS,
  writeStorage,
} from "../../../utils/storage";
import "./HeaderUserMenu.scss";
const LANGUAGES = [
  { id: "en", label: "English" },
  { id: "ru", label: "Russian" },
  { id: "uk", label: "Ukrainian" },
];

/**
 * User menu taking into account authorization: login link or drop-down profile.
 */
const HeaderUserMenu = () => {
  const navigate = useNavigate();
  const { openAuth } = useAuthModal();
  const { isAuthenticated, logout, user } = useAuth();
  const { personalInfo } = useUserData();
  const rootRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isLanguagesOpen, setIsLanguagesOpen] = useState(false);
  const menuMotion = useMotionPresence(isAuthenticated && isOpen);
  const languagesMotion = useMotionPresence(isLanguagesOpen);
  const [activeLanguage, setActiveLanguage] = useState(() =>
    readStorage(STORAGE_KEYS.language, "en"),
  );
  const userName = useMemo(() => {
    if (user?.displayName) {
      return user.displayName;
    }
    if (user?.emailOrPhone) {
      return user.emailOrPhone;
    }
    const fullName =
      `${personalInfo.firstName} ${personalInfo.lastName}`.trim();
    return fullName || "User Name";
  }, [user, personalInfo.firstName, personalInfo.lastName]);
  /**
   * Collapses the language drop-down list and nested submenu.
   */
  const closeMenu = () => {
    setIsOpen(false);
    setIsLanguagesOpen(false);
  };
  /**
   * Opens a modal login window for guests or toggles a drop-down profile.
   */
  const handleToggle = () => {
    if (!isAuthenticated) {
      openAuth("/login");
      return;
    }
    setIsOpen((prev) => !prev);
    setIsLanguagesOpen(false);
  };
  /**
   * Logs out of the account and returns to the main page.
   */
  const handleLogout = async () => {
    closeMenu();
    await logout();
    navigate("/");
  };
  /**
   * Saves the selected interface language and closes the submenu.
   */
  const handleLanguageSelect = (languageId) => {
    setActiveLanguage(languageId);
    writeStorage(STORAGE_KEYS.language, languageId);
    setIsLanguagesOpen(false);
  };
  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }
    const handlePointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) {
        closeMenu();
      }
    };
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [isOpen]);
  useEffect(() => {
    if (!isAuthenticated) {
      closeMenu();
    }
  }, [isAuthenticated]);
  return (
    <div
      ref={rootRef}
      className={`header-user-menu ${isOpen ? "header-user-menu--open" : ""}`.trim()}
    >
      <button
        type="button"
        className="header-user-menu__toggle"
        aria-label={isAuthenticated ? "User menu" : "Log in"}
        aria-expanded={isOpen}
        onClick={handleToggle}
      >
        <User
          className="header-user-menu__toggle-icon header-action-icon"
          aria-hidden="true"
        />
      </button>
      {menuMotion.rendered ? (
        <div
          className={`header-user-menu__dropdown ${menuMotion.className}`.trim()}
        >
          <div className="header-user-menu__head">
            <p className="header-user-menu__name">{userName}</p>
            <span className="header-user-menu__avatar">
              <User
                className="header-user-menu__avatar-icon"
                aria-hidden="true"
              />
            </span>
          </div>
          <ul className="header-user-menu__list">
            <li className="header-user-menu__item-row">
              <Link
                to="/profile/personal-info"
                className="header-user-menu__item"
                onClick={closeMenu}
              >
                <Filter
                  className="header-user-menu__item-icon"
                  aria-hidden="true"
                />
                <span className="header-user-menu__item-label">Settings</span>
                <MenuArrowRight
                  className="header-user-menu__item-arrow"
                  aria-hidden="true"
                />
              </Link>
            </li>
            <li
              className={`header-user-menu__item-row header-user-menu__item-row--languages ${
                isLanguagesOpen ? "header-user-menu__item-row--active" : ""
              }`.trim()}
              onMouseEnter={() => setIsLanguagesOpen(true)}
              onMouseLeave={() => setIsLanguagesOpen(false)}
            >
              <button
                type="button"
                className="header-user-menu__item"
                aria-expanded={isLanguagesOpen}
                onClick={() => setIsLanguagesOpen((prev) => !prev)}
              >
                <Language2
                  className="header-user-menu__item-icon"
                  aria-hidden="true"
                />
                <span className="header-user-menu__item-label">Languages</span>
                <MenuArrowRight
                  className="header-user-menu__item-arrow"
                  aria-hidden="true"
                />
              </button>
              {languagesMotion.rendered ? (
                <div
                  className={`header-user-menu__submenu ${languagesMotion.className}`.trim()}
                >
                  {LANGUAGES.map((language) => (
                    <button
                      key={language.id}
                      type="button"
                      className={`header-user-menu__submenu-item ${
                        activeLanguage === language.id
                          ? "header-user-menu__submenu-item--active"
                          : ""
                      }`.trim()}
                      onClick={() => handleLanguageSelect(language.id)}
                    >
                      {language.label}
                    </button>
                  ))}
                </div>
              ) : null}
            </li>
            <li className="header-user-menu__item-row">
              <button
                type="button"
                className="header-user-menu__item"
                onClick={handleLogout}
              >
                <Logout
                  className="header-user-menu__item-icon"
                  aria-hidden="true"
                />
                <span className="header-user-menu__item-label">Log out</span>
                <MenuArrowRight
                  className="header-user-menu__item-arrow"
                  aria-hidden="true"
                />
              </button>
            </li>
          </ul>
        </div>
      ) : null}
    </div>
  );
};

export default HeaderUserMenu;
