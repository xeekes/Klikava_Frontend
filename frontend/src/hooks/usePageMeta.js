import { useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";
import { resolvePageMeta } from "../constants/pageMeta";
import {
  SITE_DESCRIPTION,
  SITE_LOCALE,
  SITE_NAME,
  SITE_THEME_COLOR,
  buildDocumentTitle,
} from "../constants/site";

/**
 * @param {"name"|"property"} attr
 * @param {string} key
 * @param {string} value
 */
const setMetaContent = (attr, key, value) => {
  let element = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attr, key);
    document.head.appendChild(element);
  }
  element.setAttribute("content", value);
};

/**
 * @param {import("../constants/pageMeta").PageMeta | null | undefined} meta
 */
export const applyPageMeta = (meta) => {
  const title = buildDocumentTitle(meta?.title);
  const description = meta?.description || SITE_DESCRIPTION;
  const robots = meta?.robots || "index, follow";

  document.title = title;
  setMetaContent("name", "description", description);
  setMetaContent("name", "robots", robots);
  setMetaContent("name", "application-name", SITE_NAME);
  setMetaContent("name", "theme-color", SITE_THEME_COLOR);

  setMetaContent("property", "og:site_name", SITE_NAME);
  setMetaContent("property", "og:locale", SITE_LOCALE);
  setMetaContent("property", "og:type", "website");
  setMetaContent("property", "og:title", title);
  setMetaContent("property", "og:description", description);

  setMetaContent("name", "twitter:card", "summary");
  setMetaContent("name", "twitter:title", title);
  setMetaContent("name", "twitter:description", description);
};

/**
 * Applies SEO meta to the current pathname (the base layer for the route).
 */
export const useDefaultPageMeta = () => {
  const { pathname } = useLocation();

  useLayoutEffect(() => {
    applyPageMeta(resolvePageMeta(pathname));
  }, [pathname]);
};

/**
 * Overrides SEO meta for pages with dynamic content (product, category).
 * @param {import("../constants/pageMeta").PageMeta | null | undefined} meta
 */
export const usePageMetaOverride = (meta) => {
  useLayoutEffect(() => {
    if (!meta) {
      return undefined;
    }

    const frameId = window.requestAnimationFrame(() => {
      applyPageMeta(meta);
    });

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [meta?.title, meta?.description, meta?.robots]);
};
