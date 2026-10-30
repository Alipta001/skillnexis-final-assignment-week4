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

  const authenticate = useCallback(async (endpoint, details, expectedRole) => {
    const { data } = await api.post(`/auth/${endpoint}`, details);
    if (expectedRole && data.user.role !== expectedRole) {
      throw new Error(
        expectedRole === "admin"
          ? "This account does not have administrator access."
          : "This is an administrator account. Choose admin login.",
      );
    }
    localStorage.setItem("fieldFormToken", data.token);
    setUser(data.user);
    return data.user;
  }, []);

  const login = useCallback(
    (details, expectedRole) => authenticate("login", details, expectedRole),
    [authenticate],
  );
  const register = useCallback(async (details) => {
    const { data } = await api.post("/auth/register", details);
    return data.user;
  }, []);
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
