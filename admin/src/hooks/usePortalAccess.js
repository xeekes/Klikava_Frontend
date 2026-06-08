import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { AUTH_PORTALS } from "../constants/roles";
import { useAdminAuth } from "../context/AdminAuthContext";

export const usePortalAccess = (portal, expectedRole) => {
  const [searchParams] = useSearchParams();
  const { user, isAuthenticated, logout } = useAdminAuth();
  const [isReady, setIsReady] = useState(false);

  const fromStorefront =
    portal === AUTH_PORTALS.SELLER &&
    searchParams.get("from") === "storefront";

  const shouldResetSession = useMemo(() => {
    if (fromStorefront) {
      return true;
    }

    return isAuthenticated && user?.role !== expectedRole;
  }, [fromStorefront, isAuthenticated, user?.role, expectedRole]);

  useEffect(() => {
    if (!shouldResetSession) {
      setIsReady(true);
      return;
    }

    logout();
    setIsReady(true);
  }, [shouldResetSession, logout]);

  const canEnterPortal = isAuthenticated && user?.role === expectedRole;

  return {
    isReady,
    shouldResetSession,
    canEnterPortal,
    fromStorefront,
  };
};
