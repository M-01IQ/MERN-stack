import { Routes, Route, Navigate } from 'react-router-dom';
import { useContext, useEffect } from "react";
import { AuthContext } from "./context/AuthContext";
import { ToastProvider } from './Component/ui/ToastContext';
import { useCookies } from "react-cookie";
import './App.css';

import Navbar from './Component/common/Navbar';
import HomePage from "./Pages/HomePage";
import Users from "./Pages/Users";
import Login from "./Pages/Login";
import Register from "./Pages/Register";
import Settings from "./Pages/Settings";
import Profile from "./Pages/Profile";
import Reels from "./Pages/Reels";

function App() {
  const { user, loading } = useContext(AuthContext);
  const [cookies] = useCookies(["theme"]);

  useEffect(() => {
    const savedTheme = cookies.theme || "light";
    document.documentElement.setAttribute("data-theme", savedTheme);
  }, [cookies.theme]);

  if (loading) return (
    <div className="h-screen flex justify-center items-center">
      <span className="loading loading-spinner loading-lg"></span>
    </div>
  );

  return (
      <ToastProvider>
        {!user ? (
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        ) : (
          /* إذا كان المستخدم مسجلاً، نعرض الهيكل الكامل للموقع */
          <div className="min-h-screen bg-base-100 font-sans" dir="rtl">
            <Navbar /> 
            <main className="container mx-auto p-0 pb-20"> {/* أضفت pb-20 لضمان عدم اختفاء المحتوى خلف النافبار السفلي */}
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/Reels" element={<Reels/>} />
                <Route path="/Users" element={<Users />} />
                <Route path="/Settings" element={<Settings />} />
                <Route path="/Profile" element={<Profile />} />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </main>
          </div>
        )}
      </ToastProvider>
  );
}

export default App;
