import {
  MOCK_ADMIN_CREDENTIALS,
  MOCK_SELLER_CREDENTIALS,
} from "../constants/auth";
import { getPanelToken, readPanelSession } from "../utils/panelSession";
import { PANEL_ENDPOINTS } from "../constants/endpoints";
import { AUTH_PORTALS } from "../constants/roles";
import { panelStore } from "../mocks/panelStore";
import { hasApiBaseUrl, apiRequest } from "./client";

const MOCK_USERS = {
  [AUTH_PORTALS.ADMIN]: {
    id: 1,
    email: MOCK_ADMIN_CREDENTIALS.email,
    name: "Admin",
    role: "admin",
  },
  [AUTH_PORTALS.SELLER]: {
    id: 2,
    email: MOCK_SELLER_CREDENTIALS.email,
    name: "Seller",
    role: "seller",
    sellerId: 1,
  },
};

const delay = (ms = 400) => new Promise((resolve) => setTimeout(resolve, ms));

const getMockCredentials = (portal) =>
  portal === AUTH_PORTALS.SELLER
    ? MOCK_SELLER_CREDENTIALS
    : MOCK_ADMIN_CREDENTIALS;

const buildSellerUser = (account) => ({
  id: account.sellerId + 1,
  email: account.email,
  name: account.name,
  role: "seller",
  sellerId: account.sellerId,
});

export const panelAuthApi = {
  async login({ email, password, portal = AUTH_PORTALS.ADMIN }) {
    if (hasApiBaseUrl()) {
      const endpoint =
        portal === AUTH_PORTALS.SELLER
          ? PANEL_ENDPOINTS.auth.sellerLogin
          : PANEL_ENDPOINTS.auth.adminLogin;

      return apiRequest(endpoint, {
        method: "POST",
        body: { email, password },
      });
    }

    await delay();

    if (portal === AUTH_PORTALS.SELLER) {
      const registered = await panelStore.findSellerAccount(email, password);
      if (registered) {
        return {
          token: `mock-seller-token-${registered.sellerId}`,
          user: buildSellerUser(registered),
        };
      }
    }

    const expected = getMockCredentials(portal);

    if (email !== expected.email || password !== expected.password) {
      throw new Error("Invalid email or password");
    }

    return {
      token: `mock-${portal}-token`,
      user: MOCK_USERS[portal],
    };
  },

  async register(form, portal = AUTH_PORTALS.SELLER) {
    if (hasApiBaseUrl()) {
      const endpoint =
        portal === AUTH_PORTALS.SELLER
          ? PANEL_ENDPOINTS.auth.sellerRegister
          : PANEL_ENDPOINTS.auth.adminLogin;

      return apiRequest(endpoint, {
        method: "POST",
        body: form,
      });
    }

    await delay();

    if (portal !== AUTH_PORTALS.SELLER) {
      throw new Error("Admin registration is not available in mock mode");
    }

    const account = await panelStore.registerSellerAccount(form);

    return {
      token: `mock-seller-token-${account.sellerId}`,
      user: buildSellerUser(account),
    };
  },

  async getCurrentUser() {
    if (hasApiBaseUrl()) {
      return apiRequest(PANEL_ENDPOINTS.auth.me);
    }

    const session = readPanelSession();
    const token = getPanelToken();

    if (!token || !session?.role) {
      return null;
    }

    await delay(200);

    if (session.role === "seller") {
      const sellerIdMatch = token.match(/mock-seller-token-(\d+)/);
      if (sellerIdMatch) {
        const sellerId = Number(sellerIdMatch[1]);
        const accounts = await panelStore.getSellerAccounts();
        const account = accounts.find((item) => item.sellerId === sellerId);
        if (account) {
          return buildSellerUser(account);
        }
      }

      return MOCK_USERS[AUTH_PORTALS.SELLER];
    }

    return MOCK_USERS[AUTH_PORTALS.ADMIN];
  },
};

export const adminAuthApi = panelAuthApi;
