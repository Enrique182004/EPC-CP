import { createContext, useContext, useState, useEffect } from "react";
import { auth } from "../api/index.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { setLoading(false); return; }
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    auth
      .me({ signal: controller.signal })
      .then(setUser)
      .catch(() => {
        localStorage.removeItem("token");
        setUser(null);
      })
      .finally(() => { clearTimeout(timeout); setLoading(false); });
  }, []);

  const login = async (email, password) => {
    const data = await auth.login({ email, password });
    localStorage.setItem("token", data.token);
    setUser(data.user);
    return data.user;
  };

  const logout = async () => {
    await auth.logout().catch(() => {});
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
