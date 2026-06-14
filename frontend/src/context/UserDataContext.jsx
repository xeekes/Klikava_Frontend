/*
 * Данные профиля: гибридное хранение — адреса/карты/личные данные из API при наличии,
 * заказы из API при наличии; отзывы/чат/купоны в localStorage на пользователя.
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

/** React-контекст для срезов профиля и обработчиков изменений. */
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
 * Формирует строки отображения для карточки адреса доставки.
 * @param {object} address
 * @returns {string[]}
 */
const buildAddressLines = (address) => [
  `${address.address},`,
  `c. ${address.city}, s/p. ${address.city} ${address.postalCode},`,
  address.country,
];

/**
 * Добавляет производное полное имя и форматированные строки к сырой записи адреса.
 * @param {object} address
 * @returns {object}
 */
const normalizeAddress = (address) => ({
  ...address,
  fullName: `${address.firstName} ${address.lastName}`.trim(),
  lines: buildAddressLines(address),
});

/**
 * Читает все пользовательские срезы из локального хранилища для указанного id аккаунта.
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
 * Возвращает пустые срезы, когда нет авторизованного аккаунта.
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
 * Предоставляет срезы профиля, гибридное сохранение и обработчики изменений дереву компонентов.
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
  /* Блокирует запись, пока не загружены данные нужного пользователя (защита от утечки между аккаунтами). */
  const canPersistLocal = Boolean(userId && dataUserId === userId && !usesApi);
  const canPersistLocalExtras = Boolean(userId && dataUserId === userId);

  /**
   * Загружает адреса, карты и личные данные из удалённого API профиля.
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
    setPersonalInfo(
      mapAuthUserToPersonalInfo(profileUser || authUser, EMPTY_PERSONAL_INFO),
    );
  }, []);

  /**
   * Загружает или очищает срезы профиля при смене авторизованного аккаунта.
   */
  useEffect(() => {
    if (isAuthLoading) {
      return;
    }
    /* Не даёт устаревшему async-результату перезаписать данные после смены аккаунта. */
    let cancelled = false;

    /**
     * Наполняет удалённые или локальные срезы для активного аккаунта.
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
   * Сохраняет личные данные в localStorage в офлайн-режиме.
   */
  useEffect(() => {
    if (!canPersistLocal) return;
    writeStorage(
      getUserStorageKey(STORAGE_KEYS.personalInfo, userId),
      personalInfo,
    );
  }, [personalInfo, userId, canPersistLocal]);

  /**
   * Сохраняет адреса в localStorage в офлайн-режиме.
   */
  useEffect(() => {
    if (!canPersistLocal) return;
    writeStorage(getUserStorageKey(STORAGE_KEYS.addresses, userId), addresses);
  }, [addresses, userId, canPersistLocal]);

  /**
   * Сохраняет платёжные карты в localStorage в офлайн-режиме.
   */
  useEffect(() => {
    if (!canPersistLocal) return;
    writeStorage(getUserStorageKey(STORAGE_KEYS.cards, userId), cards);
  }, [cards, userId, canPersistLocal]);

  /**
   * Сохраняет историю заказов в localStorage пользователя.
   */
  useEffect(() => {
    if (!canPersistLocalExtras || usesApi) return;
    writeStorage(getUserStorageKey(STORAGE_KEYS.orders, userId), orders);
  }, [orders, userId, canPersistLocalExtras, usesApi]);

  /**
   * Сохраняет отзывы о товарах в localStorage пользователя.
   */
  useEffect(() => {
    if (!canPersistLocalExtras) return;
    writeStorage(getUserStorageKey(STORAGE_KEYS.feedback, userId), feedback);
  }, [feedback, userId, canPersistLocalExtras]);

  /**
   * Сохраняет сообщения чата поддержки в localStorage пользователя.
   */
  useEffect(() => {
    if (!canPersistLocalExtras) return;
    writeStorage(
      getUserStorageKey(STORAGE_KEYS.chatMessages, userId),
      chatMessages,
    );
  }, [chatMessages, userId, canPersistLocalExtras]);

  /**
   * Сохраняет выбранный активный купон в localStorage пользователя.
   */
  useEffect(() => {
    if (!canPersistLocalExtras) return;
    writeStorage(
      getUserStorageKey(STORAGE_KEYS.activeCoupon, userId),
      activeCoupon,
    );
  }, [activeCoupon, userId, canPersistLocalExtras]);

  /**
   * Обновляет личные данные локально и в удалённом профиле при активном API-режиме.
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
   * Создаёт адрес доставки через API или добавляет локальную запись.
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
   * Обновляет существующий адрес доставки по id.
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
   * Удаляет адрес доставки локально и удалённо при активном API-режиме.
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
   * Создаёт платёжную карту через API или добавляет локальную запись.
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
   * Применяет патч к существующей платёжной карте по id.
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
   * Удаляет платёжную карту локально и удалённо при активном API-режиме.
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
   * Создаёт заказ через API или добавляет локальную запись.
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
   * Перезагружает заказы с бэкенда.
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
   * Удаляет аккаунт на бэкенде и очищает локальные данные пользователя.
   * @returns {Promise<void>}
   */
  const deleteAccount = useCallback(async () => {
    if (usesApi && userId) {
      await usersApi.deleteUser(userId);
    }
  }, [usesApi, userId]);

  /**
   * Добавляет новый отзыв о товаре с сгенерированным id.
   * @param {object} entry
   * @returns {object}
   */
  const addFeedback = useCallback((entry) => {
    const nextEntry = { id: `fb-${Date.now()}`, ...entry };
    setFeedback((prev) => [nextEntry, ...prev]);
    return nextEntry;
  }, []);

  /**
   * Применяет патч к существующей записи отзыва по id.
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
   * Удаляет запись отзыва из локальной истории по id.
   * @param {string} feedbackId
   */
  const deleteFeedback = useCallback((feedbackId) => {
    setFeedback((prev) => prev.filter((item) => item.id !== feedbackId));
  }, []);

  /**
   * Добавляет исходящее сообщение в чат поддержки, если текст не пустой.
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
   * Сохраняет купон, применённый при оформлении заказа.
   * @param {object} coupon
   */
  const applyCoupon = useCallback((coupon) => {
    setActiveCoupon(coupon);
  }, []);

  /** Сбрасывает выбранный активный купон. */
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
 * Читает срезы профиля и действия из ближайшего провайдера.
 * @returns {object}
 */
export const useUserData = () => {
  const context = useContext(UserDataContext);
  if (!context) {
    throw new Error("useUserData must be used within UserDataProvider");
  }
  return context;
};
