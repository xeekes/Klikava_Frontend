import { getRoutesForRole } from "../constants/routes";
import { useAdminAuth } from "../context/AdminAuthContext";

export const usePanelRoutes = () => {
  const { user } = useAdminAuth();
  return getRoutesForRole(user?.role);
};
