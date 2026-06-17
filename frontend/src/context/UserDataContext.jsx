/*
 * Profile data: hybrid storage - addresses/cards/personal data from API if available,
 * orders from API, subject to availability; reviews/chat/coupons in localStorage per user.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { hasApiBaseUrl } from "../api/client";
import {
  decodeAddressItem,
  decodeCardItem,
  encodeAddressForm,
  encodeCardPayload,
  mapAuthUserToPersonalInfo,
  mapPersonalInfoToUserUpdate,
  pickUserAvatar,
} from "../api/mapUserData";
import { ordersApi } from "../api/orders";
import { withOrderCoverImage } from "../utils/orderHelpers";
import { usersApi } from "../api/users";
import {
  getUserStorageKey,
  readStorage,
  STORAGE_KEYS,
  writeStorage,
} from "../utils/storage";
import { useAuth } from "./AuthContext";

/** React context for profile slicers and change handlers. */
const UserDataContext = createContext(null);

export const EMPTY_PERSONAL_INFO = {
  avatar: "",
  firstName: "",
  lastName: "",
  city: "",
  address: "",
  phone: "",
  email: "",
  country: "",
  password: "",
};

/**
 * Generates display lines for the delivery address card.
 * @param {object} address
 * @returns {string[]}
 */
const buildAddressLines = (address) => [
  `${address.address},`,
  `c. ${address.city}, s/p. ${address.city} ${address.postalCode},`,
  address.country,
];

/**
 * Appends the derived full name and formatted strings to the raw address record.
 * @param {object} address
 * @returns {object}
 */
const normalizeAddress = (address) => ({
  ...address,
  fullName: `${address.firstName} ${address.lastName}`.trim(),
  lines: buildAddressLines(address),
});

/**
 * Reads all user slices from local storage for the specified account id.
 * @param {string|number} userId
 * @returns {object}
 */
const loadLocalUserData = (userId) => ({
  personalInfo: readStorage(
    getUserStorageKey(STORAGE_KEYS.personalInfo, userId),
    EMPTY_PERSONAL_INFO,
  ),
  addresses: (
    readStorage(getUserStorageKey(STORAGE_KEYS.addresses, userId), []) || []
  ).map(normalizeAddress),
  cards: readStorage(getUserStorageKey(STORAGE_KEYS.cards, userId), []),
  orders: readStorage(getUserStorageKey(STORAGE_KEYS.orders, userId), []),
  feedback: readStorage(getUserStorageKey(STORAGE_KEYS.feedback, userId), []),
  chatMessages: readStorage(
    getUserStorageKey(STORAGE_KEYS.chatMessages, userId),
    [],
  ),
  activeCoupon: readStorage(
    getUserStorageKey(STORAGE_KEYS.activeCoupon, userId),
    null,
  ),
});

/**
 * Returns empty slices when there is no authorized account.
 * @returns {object}
 */
const emptyUserData = () => ({
  personalInfo: EMPTY_PERSONAL_INFO,
  addresses: [],
  cards: [],
  orders: [],
  feedback: [],
  chatMessages: [],
  activeCoupon: null,
});

/**
 * Provides profile slices, hybrid persistence, and change handlers to the component tree.
 * @param {{ children: import("react").ReactNode }} props
 */
export const UserDataProvider = ({ children }) => {
  const { user, isLoading: isAuthLoading } = useAuth();
  const userId = user?.id ?? null;
  const usesApi = hasApiBaseUrl();
  const [personalInfo, setPersonalInfo] = useState(EMPTY_PERSONAL_INFO);
  const [addresses, setAddresses] = useState([]);
  const [cards, setCards] = useState([]);
  const [orders, setOrders] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [activeCoupon, setActiveCoupon] = useState(null);
  const [dataUserId, setDataUserId] = useState(null);
  const [isUserDataLoading, setIsUserDataLoading] = useState(false);
  const [userDataError, setUserDataError] = useState(null);
  /* Blocks the recording until the data of the desired user is loaded (protection against leakage between accounts). */
  const canPersistLocal = Boolean(userId && dataUserId === userId && !usesApi);
  const canPersistLocalExtras = Boolean(userId && dataUserId === userId);

  /**
   * Loads addresses, maps and personal data from a remote profile API.
   * @param {string|number} nextUserId
   * @param {object} authUser
   */
  const loadRemoteProfileData = useCallback(async (nextUserId, authUser) => {
    const [addressItems, cardItems, profileUser] = await Promise.all([
      usersApi.listDeliveryAddresses(nextUserId),
      usersApi.listCreditCards(nextUserId),
      usersApi.getUser(nextUserId).catch(() => null),
    ]);
    setAddresses(addressItems.map(decodeAddressItem).map(normalizeAddress));
    setCards(cardItems.map(decodeCardItem));
    const localPersonal = loadLocalUserData(nextUserId).personalInfo;
    const remoteUser = profileUser
      ? {
          ...authUser,
          ...profileUser,
          avatar_url: profileUser.avatar_url || authUser?.avatar_url || "",
        }
      : authUser;
    setPersonalInfo(mapAuthUserToPersonalInfo(remoteUser, localPersonal));
  }, []);

  /**
   * Loads or clears profile slices when changing the authorized account.
   */
  useEffect(() => {
    if (isAuthLoading) {
      return;
    }
    /* Prevents legacy async results from overwriting data after an account change. */
    let cancelled = false;

    /**
     * Fills remote or local slices for the active account.
     */
    const load = async () => {
      if (!userId) {
        const empty = emptyUserData();
        setPersonalInfo(empty.personalInfo);
        setAddresses(empty.addresses);
        setCards(empty.cards);
        setOrders(empty.orders);
        setFeedback(empty.feedback);
        setChatMessages(empty.chatMessages);
        setActiveCoupon(empty.activeCoupon);
        setDataUserId(null);
        setUserDataError(null);
        return;
      }
      setIsUserDataLoading(true);
      setUserDataError(null);
      try {
        if (usesApi) {
          await loadRemoteProfileData(userId, user);
          const remoteOrders = await ordersApi.listOrders();
          if (!cancelled) {
            setOrders(remoteOrders);
            setFeedback(loadLocalUserData(userId).feedback);
            setChatMessages(loadLocalUserData(userId).chatMessages);
            setActiveCoupon(loadLocalUserData(userId).activeCoupon);
          }
        } else {
          const data = loadLocalUserData(userId);
          if (!cancelled) {
            setPersonalInfo(data.personalInfo);
            setAddresses(data.addresses);
            setCards(data.cards);
            setOrders(data.orders);
            setFeedback(data.feedback);
            setChatMessages(data.chatMessages);
            setActiveCoupon(data.activeCoupon);
          }
        }
        if (!cancelled) {
          setDataUserId(userId);
        }
      } catch (err) {
        if (!cancelled) {
          setUserDataError(err.message || "Failed to load profile data");
          const data = loadLocalUserData(userId);
          setOrders(data.orders);
          setFeedback(data.feedback);
          setChatMessages(data.chatMessages);
          setActiveCoupon(data.activeCoupon);
          setDataUserId(userId);
        }
      } finally {
        if (!cancelled) {
          setIsUserDataLoading(false);
        }
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [userId, isAuthLoading, usesApi, user, loadRemoteProfileData]);

  /**
   * Stores personal data in localStorage (including local fields and avatar in API mode).
   */
  useEffect(() => {
    if (!userId || dataUserId !== userId) {
      return;
    }
    writeStorage(
      getUserStorageKey(STORAGE_KEYS.personalInfo, userId),
      personalInfo,
    );
  }, [personalInfo, userId, dataUserId]);

  /**
   * Stores addresses in localStorage in offline mode.
   */
  useEffect(() => {
    if (!canPersistLocal) return;
    writeStorage(getUserStorageKey(STORAGE_KEYS.addresses, userId), addresses);
  }, [addresses, userId, canPersistLocal]);

  /**
   * Stores payment cards in localStorage in offline mode.
   */
  useEffect(() => {
    if (!canPersistLocal) return;
    writeStorage(getUserStorageKey(STORAGE_KEYS.cards, userId), cards);
  }, [cards, userId, canPersistLocal]);

  /**
   * Saves order history in the user's localStorage.
   */
  useEffect(() => {
    if (!canPersistLocalExtras || usesApi) return;
    writeStorage(getUserStorageKey(STORAGE_KEYS.orders, userId), orders);
  }, [orders, userId, canPersistLocalExtras, usesApi]);

  /**
   * Stores product reviews in the user's localStorage.
   */
  useEffect(() => {
    if (!canPersistLocalExtras) return;
    writeStorage(getUserStorageKey(STORAGE_KEYS.feedback, userId), feedback);
  }, [feedback, userId, canPersistLocalExtras]);

  /**
   * Stores support chat messages in the user's localStorage.
   */
  useEffect(() => {
    if (!canPersistLocalExtras) return;
    writeStorage(
      getUserStorageKey(STORAGE_KEYS.chatMessages, userId),
      chatMessages,
    );
  }, [chatMessages, userId, canPersistLocalExtras]);

  /**
   * Saves the selected active coupon to the user's localStorage.
   */
  useEffect(() => {
    if (!canPersistLocalExtras) return;
    writeStorage(
      getUserStorageKey(STORAGE_KEYS.activeCoupon, userId),
      activeCoupon,
    );
  }, [activeCoupon, userId, canPersistLocalExtras]);

  /**
   * Updates personal data locally and in a remote profile when API mode is active.
   * @param {object} nextInfo
   */
  const savePersonalInfo = useCallback(
    async (nextInfo) => {
      if (usesApi && userId) {
        await usersApi.updateUser(
          userId,
          mapPersonalInfoToUserUpdate(nextInfo),
        );
      }
      setPersonalInfo(nextInfo);
    },
    [usesApi, userId],
  );

  /**
   * Saves only changed fields: API fields are sent with a PATCH request, the rest is stored in localStorage.
   * @param {object} nextInfo
   * @param {string[]} changedFieldIds
   * @returns {Promise<void>}
   */
  const savePersonalInfoChanges = useCallback(
    async (nextInfo, changedFieldIds) => {
      const apiPayload = {};
      const changed = new Set(changedFieldIds);

      if (changed.has("firstName") || changed.has("lastName")) {
        const name = `${nextInfo.firstName || ""} ${nextInfo.lastName || ""}`.trim();
        if (name) {
          apiPayload.name = name;
        }
      }
      if (changed.has("email") && nextInfo.email) {
        apiPayload.email = nextInfo.email;
      }
      if (changed.has("phone") && nextInfo.phone) {
        apiPayload.phone_number = nextInfo.phone;
      }

      if (usesApi && userId && Object.keys(apiPayload).length > 0) {
        await usersApi.updateUser(userId, apiPayload);
      }
      setPersonalInfo(nextInfo);
    },
    [usesApi, userId],
  );

  /**
   * Creates a delivery address via the API or adds a local entry.
   * @param {object} form
   * @returns {Promise<object>}
   */
  const addAddress = useCallback(
    async (form) => {
      if (usesApi && userId) {
        const created = await usersApi.createDeliveryAddress(
          userId,
          encodeAddressForm(form),
        );
        const nextAddress = normalizeAddress(decodeAddressItem(created));
        setAddresses((prev) => [...prev, nextAddress]);
        return nextAddress;
      }
      const nextAddress = normalizeAddress({
        id: `addr-${Date.now()}`,
        ...form,
      });
      setAddresses((prev) => [...prev, nextAddress]);
      return nextAddress;
    },
    [usesApi, userId],
  );

  /**
   * Updates an existing delivery address by id.
   * @param {string|number} addressId
   * @param {object} form
   * @returns {Promise<object|undefined>}
   */
  const updateAddress = useCallback(
    async (addressId, form) => {
      if (usesApi && userId) {
        const updated = await usersApi.updateDeliveryAddress(
          userId,
          addressId,
          encodeAddressForm(form),
        );
        const nextAddress = normalizeAddress(decodeAddressItem(updated));
        setAddresses((prev) =>
          prev.map((item) =>
            item.id === String(addressId) ? nextAddress : item,
          ),
        );
        return nextAddress;
      }
      setAddresses((prev) =>
        prev.map((item) =>
          item.id === addressId
            ? normalizeAddress({ ...item, ...form, id: addressId })
            : item,
        ),
      );
    },
    [usesApi, userId],
  );

  /**
   * Deletes the delivery address locally and remotely when API mode is active.
   * @param {string|number} addressId
   */
  const deleteAddress = useCallback(
    async (addressId) => {
      if (usesApi && userId) {
        await usersApi.deleteDeliveryAddress(userId, addressId);
      }
      setAddresses((prev) =>
        prev.filter((item) => item.id !== String(addressId)),
      );
    },
    [usesApi, userId],
  );

  /**
   * Creates a payment card via API or adds a local entry.
   * @param {object} card
   * @returns {Promise<object>}
   */
  const addCard = useCallback(
    async (card) => {
      if (usesApi && userId) {
        const created = await usersApi.createCreditCard(
          userId,
          encodeCardPayload(card),
        );
        const nextCard = decodeCardItem(created);
        setCards((prev) => [...prev, nextCard]);
        return nextCard;
      }
      const nextCard = { id: `card-${Date.now()}`, ...card };
      setCards((prev) => [...prev, nextCard]);
      return nextCard;
    },
    [usesApi, userId],
  );

  /**
   * Applies a patch to an existing payment card by id.
   * @param {string|number} cardId
   * @param {object} patch
   * @returns {Promise<object|undefined>}
   */
  const updateCard = useCallback(
    async (cardId, patch) => {
      if (usesApi && userId) {
        const current = cards.find((item) => item.id === String(cardId));
        const merged = { ...current, ...patch };
        const updated = await usersApi.updateCreditCard(
          userId,
          cardId,
          encodeCardPayload(merged),
        );
        const nextCard = decodeCardItem(updated);
        setCards((prev) =>
          prev.map((item) => (item.id === String(cardId) ? nextCard : item)),
        );
        return nextCard;
      }
      setCards((prev) =>
        prev.map((item) => (item.id === cardId ? { ...item, ...patch } : item)),
      );
    },
    [usesApi, userId, cards],
  );

  /**
   * Deletes a payment card locally and remotely when API mode is active.
   * @param {string|number} cardId
   */
  const deleteCard = useCallback(
    async (cardId) => {
      if (usesApi && userId) {
        await usersApi.deleteCreditCard(userId, cardId);
      }
      setCards((prev) => prev.filter((item) => item.id !== String(cardId)));
    },
    [usesApi, userId],
  );

  /**
   * Creates an order via the API or adds a local record.
   * @param {object|Array<object>} orderOrCartItems
   * @param {{ deliveryPrice?: number, discountItemId?: number|null, localSnapshot?: object }} [options]
   * @returns {Promise<object>}
   */
  const addOrder = useCallback(
    async (orderOrCartItems, options = {}) => {
      if (usesApi && Array.isArray(orderOrCartItems)) {
        const created = await ordersApi.createOrder(orderOrCartItems, {
          deliveryPrice: options.deliveryPrice,
          discountItemId: options.discountItemId,
        });
        const withImages = withOrderCoverImage(created, {
          cartItems: orderOrCartItems,
        });
        setOrders((prev) => [withImages, ...prev]);
        return withImages;
      }
      const order = Array.isArray(orderOrCartItems)
        ? options.localSnapshot
        : orderOrCartItems;
      setOrders((prev) => [order, ...prev]);
      return order;
    },
    [usesApi],
  );

  /**
   * Reloads orders from the backend.
   * @returns {Promise<Array<object>>}
   */
  const reloadOrders = useCallback(async () => {
    if (!usesApi) {
      return orders;
    }
    const remoteOrders = await ordersApi.listOrders();
    setOrders(remoteOrders);
    return remoteOrders;
  }, [orders, usesApi]);

  /**
   * Deletes the account on the backend and clears the user's local data.
   * @returns {Promise<void>}
   */
  const deleteAccount = useCallback(async () => {
    if (usesApi && userId) {
      await usersApi.deleteUser(userId);
    }
  }, [usesApi, userId]);

  /**
   * Adds a new review about a product with the generated id.
   * @param {object} entry
   * @returns {object}
   */
  const addFeedback = useCallback((entry) => {
    const nextEntry = { id: `fb-${Date.now()}`, ...entry };
    setFeedback((prev) => [nextEntry, ...prev]);
    return nextEntry;
  }, []);

  /**
   * Applies a patch to an existing review entry by id.
   * @param {string} feedbackId
   * @param {object} patch
   */
  const updateFeedback = useCallback((feedbackId, patch) => {
    setFeedback((prev) =>
      prev.map((item) =>
        item.id === feedbackId ? { ...item, ...patch } : item,
      ),
    );
  }, []);

  /**
   * Removes a review entry from the local history by id.
   * @param {string} feedbackId
   */
  const deleteFeedback = useCallback((feedbackId) => {
    setFeedback((prev) => prev.filter((item) => item.id !== feedbackId));
  }, []);

  /**
   * Adds an outgoing message to the support chat if the text is not empty.
   * @param {string} text
   */
  const sendChatMessage = useCallback((text) => {
    const trimmed = text.trim();
    if (!trimmed) {
      return;
    }
    const now = new Date();
    const time = now.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    });
    setChatMessages((prev) => [
      ...prev,
      {
        id: `m-${Date.now()}`,
        sender: "You",
        text: trimmed,
        time,
        incoming: false,
      },
    ]);
  }, []);

  /**
   * Saves the coupon applied at checkout.
   * @param {object} coupon
   */
  const applyCoupon = useCallback((coupon) => {
    setActiveCoupon(coupon);
  }, []);

  /** Resets the selected active coupon. */
  const clearCoupon = useCallback(() => {
    setActiveCoupon(null);
  }, []);

  const value = useMemo(
    () => ({
      personalInfo,
      addresses,
      cards,
      orders,
      feedback,
      chatMessages,
      activeCoupon,
      isUserDataLoading,
      userDataError,
      usesApi,
      savePersonalInfo,
      savePersonalInfoChanges,
      addAddress,
      updateAddress,
      deleteAddress,
      addCard,
      updateCard,
      deleteCard,
      addOrder,
      reloadOrders,
      deleteAccount,
      addFeedback,
      updateFeedback,
      deleteFeedback,
      sendChatMessage,
      applyCoupon,
      clearCoupon,
    }),
    [
      personalInfo,
      addresses,
      cards,
      orders,
      feedback,
      chatMessages,
      activeCoupon,
      isUserDataLoading,
      userDataError,
      usesApi,
      savePersonalInfo,
      savePersonalInfoChanges,
      addAddress,
      updateAddress,
      deleteAddress,
      addCard,
      updateCard,
      deleteCard,
      addOrder,
      reloadOrders,
      deleteAccount,
      addFeedback,
      updateFeedback,
      deleteFeedback,
      sendChatMessage,
      applyCoupon,
      clearCoupon,
    ],
  );

  return (
    <UserDataContext.Provider value={value}>
      {children}
    </UserDataContext.Provider>
  );
};

/**
 * Reads profile slices and actions from the nearest provider.
 * @returns {object}
 */
export const useUserData = () => {
  const context = useContext(UserDataContext);
  if (!context) {
    throw new Error("useUserData must be used within UserDataProvider");
  }
  return context;
};
