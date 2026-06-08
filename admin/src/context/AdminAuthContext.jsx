import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { panelAuthApi } from "../api/auth";
import { AUTH_PORTALS } from "../constants/roles";
import {
  clearPanelSession,
  readPanelSession,
  writePanelSession,
} from "../utils/panelSession";

const AdminAuthContext = createContext(null);

export const AdminAuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const clearSession = useCallback(() => {
    clearPanelSession();
    setUser(null);
  }, []);

  const clearError = useCallback(() => setError(null), []);

  useEffect(() => {
    const bootstrap = async () => {
      const session = readPanelSession();
      if (!session?.token) {
        setIsLoading(false);
        return;
      }

      try {
        const currentUser = await panelAuthApi.getCurrentUser();
        if (currentUser && currentUser.role === session.role) {
          setUser(currentUser);
        } else {
          clearSession();
        }
      } catch {
        clearSession();
      } finally {
        setIsLoading(false);
      }
    };

    bootstrap();
  }, [clearSession]);

  useEffect(() => {
    const syncSessionAcrossTabs = (event) => {
      if (event.key !== "panel_auth_session") {
        return;
      }

      const session = readPanelSession();
      if (!session?.token) {
        setUser(null);
        return;
      }

      panelAuthApi
        .getCurrentUser()
        .then((currentUser) => {
          if (currentUser && currentUser.role === session.role) {
            setUser(currentUser);
            return;
          }

          clearSession();
        })
        .catch(() => {
          clearSession();
        });
    };

    window.addEventListener("storage", syncSessionAcrossTabs);
    return () => window.removeEventListener("storage", syncSessionAcrossTabs);
  }, [clearSession]);

  const login = useCallback(async (credentials, portal = AUTH_PORTALS.ADMIN) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const data = await panelAuthApi.login({ ...credentials, portal });
      writePanelSession({
        token: data.token,
        role: data.user.role,
        portal,
      });
      setUser(data.user);
      return data;
    } catch (err) {
      setError(err.message || "Login failed");
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const register = useCallback(async (form, portal = AUTH_PORTALS.SELLER) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const data = await panelAuthApi.register(form, portal);
      writePanelSession({
        token: data.token,
        role: data.user.role,
        portal,
      });
      setUser(data.user);
      return data;
    } catch (err) {
      setError(err.message || "Registration failed");
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const logout = useCallback(() => {
    clearSession();
  }, [clearSession]);

  const value = useMemo(
    () => ({
      user,
      role: user?.role ?? null,
      isAuthenticated: Boolean(user),
      isLoading,
      isSubmitting,
      error,
      clearError,
      login,
      register,
      logout,
    }),
    [user, isLoading, isSubmitting, error, clearError, login, register, logout],
  );

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error("useAdminAuth must be used within AdminAuthProvider");
  }
  return context;
};
