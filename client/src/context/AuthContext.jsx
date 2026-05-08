import { createContext, useState, useEffect } from "react";
import API from "../api/axiosInstance";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // تخزين بيانات المستخدم (id, role)
  const [loading, setLoading] = useState(true); // للتأكد من انتهاء فحص التوكن

  useEffect(() => {
    // عند فتح الموقع، نفحص إذا كان هناك توكن مخزن
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    
    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // دالة تسجيل الدخول
  const login = (userData, token) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  // دالة تسجيل الخروج
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
