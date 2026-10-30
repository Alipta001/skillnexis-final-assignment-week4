import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import api from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!localStorage.getItem("fieldFormToken")) {
      setLoading(false);
      return;
    }

    api
      .get("/auth/me")
      .then(({ data }) => setUser(data.user))
      .catch(() => {
        localStorage.removeItem("fieldFormToken");
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const authenticate = useCallback(async (endpoint, details) => {
    const { data } = await api.post(`/auth/${endpoint}`, details);
    localStorage.setItem("fieldFormToken", data.token);
    setUser(data.user);
    return data.user;
  }, []);

  const login = useCallback(
    (details) => authenticate("login", details),
    [authenticate],
  );
  const register = useCallback(
    (details) => authenticate("register", details),
    [authenticate],
  );
  const logout = useCallback(() => {
    localStorage.removeItem("fieldFormToken");
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, register, logout }),
    [user, loading, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
