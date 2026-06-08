import { useCallback } from "react";
import { ordersApi } from "../api/orders";
import { useAdminAuth } from "../context/AdminAuthContext";
import { usePanelMutation, usePanelQuery } from "./usePanelQuery";

export const useOrders = (search = "") => {
  const { user } = useAdminAuth();

  const query = usePanelQuery(
    () => ordersApi.list(user, { search }),
    [user, search],
  );

  const mutation = usePanelMutation();

  const removeByIds = useCallback(
    async (ids) => {
      await mutation.run(() => ordersApi.remove(user, ids));
      await query.reload();
    },
    [mutation, query, user],
  );

  return {
    orders: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error || mutation.error,
    reload: query.reload,
    removeByIds,
    isSubmitting: mutation.isSubmitting,
  };
};
