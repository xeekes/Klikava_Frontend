import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  DEFAULT_PERSONAL_INFO,
  PROFILE_ADDRESSES,
  PROFILE_CHAT_MESSAGES,
  PROFILE_FEEDBACK,
  PROFILE_ORDERS,
  PROFILE_SAVED_CARDS,
} from "../data/profile";
import { readStorage, STORAGE_KEYS, writeStorage } from "../utils/storage";

const UserDataContext = createContext(null);

const buildAddressLines = (address) => [
  `${address.address},`,
  `c. ${address.city}, s/p. ${address.city} ${address.postalCode},`,
  address.country,
];

const normalizeAddress = (address) => ({
  ...address,
  fullName: `${address.firstName} ${address.lastName}`.trim(),
  lines: buildAddressLines(address),
});

export const UserDataProvider = ({ children }) => {
  const [personalInfo, setPersonalInfo] = useState(() =>
    readStorage(STORAGE_KEYS.personalInfo, DEFAULT_PERSONAL_INFO)
  );
  const [addresses, setAddresses] = useState(() =>
    readStorage(STORAGE_KEYS.addresses, PROFILE_ADDRESSES).map(normalizeAddress)
  );
  const [cards, setCards] = useState(() =>
    readStorage(STORAGE_KEYS.cards, PROFILE_SAVED_CARDS)
  );
  const [orders, setOrders] = useState(() =>
    readStorage(STORAGE_KEYS.orders, PROFILE_ORDERS)
  );
  const [feedback, setFeedback] = useState(() =>
    readStorage(STORAGE_KEYS.feedback, PROFILE_FEEDBACK)
  );
  const [chatMessages, setChatMessages] = useState(() =>
    readStorage(STORAGE_KEYS.chatMessages, PROFILE_CHAT_MESSAGES)
  );
  const [activeCoupon, setActiveCoupon] = useState(() =>
    readStorage(STORAGE_KEYS.activeCoupon, null)
  );

  useEffect(() => writeStorage(STORAGE_KEYS.personalInfo, personalInfo), [personalInfo]);
  useEffect(() => writeStorage(STORAGE_KEYS.addresses, addresses), [addresses]);
  useEffect(() => writeStorage(STORAGE_KEYS.cards, cards), [cards]);
  useEffect(() => writeStorage(STORAGE_KEYS.orders, orders), [orders]);
  useEffect(() => writeStorage(STORAGE_KEYS.feedback, feedback), [feedback]);
  useEffect(() => writeStorage(STORAGE_KEYS.chatMessages, chatMessages), [chatMessages]);
  useEffect(() => writeStorage(STORAGE_KEYS.activeCoupon, activeCoupon), [activeCoupon]);

  const savePersonalInfo = useCallback((nextInfo) => {
    setPersonalInfo(nextInfo);
  }, []);

  const addAddress = useCallback((form) => {
    const nextAddress = normalizeAddress({
      id: `addr-${Date.now()}`,
      ...form,
    });
    setAddresses((prev) => [...prev, nextAddress]);
    return nextAddress;
  }, []);

  const updateAddress = useCallback((addressId, form) => {
    setAddresses((prev) =>
      prev.map((item) =>
        item.id === addressId ? normalizeAddress({ ...item, ...form, id: addressId }) : item
      )
    );
  }, []);

  const deleteAddress = useCallback((addressId) => {
    setAddresses((prev) => prev.filter((item) => item.id !== addressId));
  }, []);

  const addCard = useCallback((card) => {
    const nextCard = { id: `card-${Date.now()}`, ...card };
    setCards((prev) => [...prev, nextCard]);
    return nextCard;
  }, []);

  const updateCard = useCallback((cardId, patch) => {
    setCards((prev) =>
      prev.map((item) => (item.id === cardId ? { ...item, ...patch } : item))
    );
  }, []);

  const deleteCard = useCallback((cardId) => {
    setCards((prev) => prev.filter((item) => item.id !== cardId));
  }, []);

  const addOrder = useCallback((order) => {
    setOrders((prev) => [order, ...prev]);
    return order;
  }, []);

  const addFeedback = useCallback((entry) => {
    const nextEntry = { id: `fb-${Date.now()}`, ...entry };
    setFeedback((prev) => [nextEntry, ...prev]);
    return nextEntry;
  }, []);

  const updateFeedback = useCallback((feedbackId, patch) => {
    setFeedback((prev) =>
      prev.map((item) => (item.id === feedbackId ? { ...item, ...patch } : item))
    );
  }, []);

  const deleteFeedback = useCallback((feedbackId) => {
    setFeedback((prev) => prev.filter((item) => item.id !== feedbackId));
  }, []);

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
      {
        id: `m-${Date.now()}-reply`,
        sender: "KlikAVASupport",
        text: "Thanks for your message. Our support team will get back to you shortly.",
        time,
        incoming: true,
      },
    ]);
  }, []);

  const applyCoupon = useCallback((coupon) => {
    setActiveCoupon(coupon);
  }, []);

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
      savePersonalInfo,
      addAddress,
      updateAddress,
      deleteAddress,
      addCard,
      updateCard,
      deleteCard,
      addOrder,
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
      savePersonalInfo,
      addAddress,
      updateAddress,
      deleteAddress,
      addCard,
      updateCard,
      deleteCard,
      addOrder,
      addFeedback,
      updateFeedback,
      deleteFeedback,
      sendChatMessage,
      applyCoupon,
      clearCoupon,
    ]
  );

  return (
    <UserDataContext.Provider value={value}>{children}</UserDataContext.Provider>
  );
};

export const useUserData = () => {
  const context = useContext(UserDataContext);
  if (!context) {
    throw new Error("useUserData must be used within UserDataProvider");
  }
  return context;
};
