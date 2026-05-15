import { createContext, useState, useEffect } from "react";
import API from "../api/axiosInstance";
import { useCookies } from "react-cookie";
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cookies, setCookie, removeCookie] = useCookies(["theme"]);
  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    
    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = (userData, token) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  // دالة تسجيل الخروج
  const logout = () => {
    // حذف بيانات التوكن والمستخدم من الـ LocalStorage
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    removeCookie("theme", { path: "/" });
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
