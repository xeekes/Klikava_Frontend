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

import { usersApi } from "../api/users";

import {

  getUserStorageKey,

  readStorage,

  STORAGE_KEYS,

  writeStorage,

} from "../utils/storage";

import { useAuth } from "./AuthContext";



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



const emptyUserData = () => ({

  personalInfo: EMPTY_PERSONAL_INFO,

  addresses: [],

  cards: [],

  orders: [],

  feedback: [],

  chatMessages: [],

  activeCoupon: null,

});



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



  const canPersistLocal = Boolean(userId && dataUserId === userId && !usesApi);

  const canPersistLocalExtras = Boolean(userId && dataUserId === userId);



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



  useEffect(() => {

    if (isAuthLoading) {

      return;

    }



    let cancelled = false;



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

          const localExtras = loadLocalUserData(userId);

          if (!cancelled) {

            setOrders(localExtras.orders);

            setFeedback(localExtras.feedback);

            setChatMessages(localExtras.chatMessages);

            setActiveCoupon(localExtras.activeCoupon);

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



  useEffect(() => {

    if (!canPersistLocal) return;

    writeStorage(getUserStorageKey(STORAGE_KEYS.personalInfo, userId), personalInfo);

  }, [personalInfo, userId, canPersistLocal]);



  useEffect(() => {

    if (!canPersistLocal) return;

    writeStorage(getUserStorageKey(STORAGE_KEYS.addresses, userId), addresses);

  }, [addresses, userId, canPersistLocal]);



  useEffect(() => {

    if (!canPersistLocal) return;

    writeStorage(getUserStorageKey(STORAGE_KEYS.cards, userId), cards);

  }, [cards, userId, canPersistLocal]);



  useEffect(() => {

    if (!canPersistLocalExtras) return;

    writeStorage(getUserStorageKey(STORAGE_KEYS.orders, userId), orders);

  }, [orders, userId, canPersistLocalExtras]);



  useEffect(() => {

    if (!canPersistLocalExtras) return;

    writeStorage(getUserStorageKey(STORAGE_KEYS.feedback, userId), feedback);

  }, [feedback, userId, canPersistLocalExtras]);



  useEffect(() => {

    if (!canPersistLocalExtras) return;

    writeStorage(

      getUserStorageKey(STORAGE_KEYS.chatMessages, userId),

      chatMessages,

    );

  }, [chatMessages, userId, canPersistLocalExtras]);



  useEffect(() => {

    if (!canPersistLocalExtras) return;

    writeStorage(getUserStorageKey(STORAGE_KEYS.activeCoupon, userId), activeCoupon);

  }, [activeCoupon, userId, canPersistLocalExtras]);



  const savePersonalInfo = useCallback(

    async (nextInfo) => {

      if (usesApi && userId) {

        await usersApi.updateUser(userId, mapPersonalInfoToUserUpdate(nextInfo));

      }

      setPersonalInfo(nextInfo);

    },

    [usesApi, userId],

  );



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

          prev.map((item) => (item.id === String(addressId) ? nextAddress : item)),

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



  const deleteAddress = useCallback(

    async (addressId) => {

      if (usesApi && userId) {

        await usersApi.deleteDeliveryAddress(userId, addressId);

      }

      setAddresses((prev) => prev.filter((item) => item.id !== String(addressId)));

    },

    [usesApi, userId],

  );



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



  const deleteCard = useCallback(

    async (cardId) => {

      if (usesApi && userId) {

        await usersApi.deleteCreditCard(userId, cardId);

      }

      setCards((prev) => prev.filter((item) => item.id !== String(cardId)));

    },

    [usesApi, userId],

  );



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

      prev.map((item) => (item.id === feedbackId ? { ...item, ...patch } : item)),

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

      addFeedback,

      updateFeedback,

      deleteFeedback,

      sendChatMessage,

      applyCoupon,

      clearCoupon,

    ],

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


