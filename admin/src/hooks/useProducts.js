import { useCallback } from "react";
import { productsApi } from "../api/products";
import { useAdminAuth } from "../context/AdminAuthContext";
import { usePanelMutation, usePanelQuery } from "./usePanelQuery";

export const useProducts = (search = "") => {
  const { user } = useAdminAuth();

  const query = usePanelQuery(
    () => productsApi.list(user, { search }),
    [user, search],
  );

  const mutation = usePanelMutation();

  const removeByIds = useCallback(
    async (ids) => {
      await mutation.run(() => productsApi.remove(user, ids));
      await query.reload();
    },
    [mutation, query, user],
  );

  const create = useCallback(
    async (payload) => {
      const product = await mutation.run(() =>
        productsApi.create(user, payload),
      );
      await query.reload();
      return product;
    },
    [mutation, query, user],
  );

  return {
    products: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error || mutation.error,
    reload: query.reload,
    removeByIds,
    create,
    isSubmitting: mutation.isSubmitting,
  };
};
