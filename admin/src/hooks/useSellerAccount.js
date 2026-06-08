import { useCallback, useState } from "react";
import { sellerApi } from "../api/seller";
import { useAdminAuth } from "../context/AdminAuthContext";
import { usePanelMutation, usePanelQuery } from "./usePanelQuery";

export const useSellerProfile = () => {
  const { user } = useAdminAuth();
  const query = usePanelQuery(
    () => sellerApi.getProfile(user),
    [user?.sellerId],
  );
  const mutation = usePanelMutation();

  const save = useCallback(
    async (payload) => {
      const saved = await mutation.run(() =>
        sellerApi.updateProfile(user, payload),
      );
      query.setData(saved);
      return saved;
    },
    [mutation, query, user],
  );

  return {
    profile: query.data,
    isLoading: query.isLoading,
    error: query.error || mutation.error,
    save,
    isSubmitting: mutation.isSubmitting,
  };
};

export const useSellerSettings = () => {
  const { user } = useAdminAuth();
  const query = usePanelQuery(
    () => sellerApi.getSettings(user),
    [user?.sellerId],
  );
  const mutation = usePanelMutation();

  const save = useCallback(
    async (payload) => {
      const saved = await mutation.run(() =>
        sellerApi.updateSettings(user, payload),
      );
      query.setData(saved);
      return saved;
    },
    [mutation, query, user],
  );

  const deleteAccount = useCallback(async () => {
    return mutation.run(() => sellerApi.deleteAccount());
  }, [mutation]);

  return {
    settings: query.data,
    isLoading: query.isLoading,
    error: query.error || mutation.error,
    save,
    deleteAccount,
    isSubmitting: mutation.isSubmitting,
  };
};

export const useSellerStats = () => {
  const query = usePanelQuery(() => sellerApi.getStats(), []);
  const [activeMetric, setActiveMetric] = useState("views");

  return {
    stats: query.data,
    activeMetric,
    setActiveMetric,
    isLoading: query.isLoading,
    error: query.error,
  };
};

export const useSellerDashboard = () => {
  const { user } = useAdminAuth();

  const query = usePanelQuery(() => sellerApi.getDashboard(user), [user]);

  return {
    summary: query.data,
    isLoading: query.isLoading,
    error: query.error,
  };
};
