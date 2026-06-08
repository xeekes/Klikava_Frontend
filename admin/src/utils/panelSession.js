import { PANEL_AUTH_STORAGE_KEY } from "../constants/auth";

export const PANEL_SESSION_STORAGE_KEY = "panel_auth_session";

const readRawSession = () => {
  try {
    const raw = localStorage.getItem(PANEL_SESSION_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const inferRoleFromLegacyToken = (token) => {
  if (!token) {
    return null;
  }

  return token.includes("seller") ? "seller" : "admin";
};

export const readPanelSession = () => {
  const session = readRawSession();

  if (session?.token && session?.role) {
    return session;
  }

  const legacyToken = localStorage.getItem(PANEL_AUTH_STORAGE_KEY);
  if (!legacyToken) {
    return null;
  }

  return {
    token: legacyToken,
    role: inferRoleFromLegacyToken(legacyToken),
    portal: inferRoleFromLegacyToken(legacyToken),
  };
};

export const writePanelSession = ({ token, role, portal }) => {
  localStorage.setItem(
    PANEL_SESSION_STORAGE_KEY,
    JSON.stringify({ token, role, portal }),
  );
  localStorage.setItem(PANEL_AUTH_STORAGE_KEY, token);
};

export const clearPanelSession = () => {
  localStorage.removeItem(PANEL_SESSION_STORAGE_KEY);
  localStorage.removeItem(PANEL_AUTH_STORAGE_KEY);
};

export const getPanelToken = () => readPanelSession()?.token ?? null;
