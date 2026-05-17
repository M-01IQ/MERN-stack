import { Routes, Route, Navigate, useLocation } from 'react-router-dom'; // قم باضافة useLocation هنا
import { useContext, useEffect } from "react";
import { AuthContext } from "./context/AuthContext";
import { ToastProvider } from './Component/ui/PopUp/ToastContext';
import { useCookies } from "react-cookie";

import Navbar from './Component/common/Navbar';
import Loader from './Component/common/Loader';
import Register from "./Pages/Register";
import Login from "./Pages/Login";
import HomePage from "./Pages/HomePage";
import Users from "./Pages/Users";
import Reels from "./Pages/Reels";
import Profile from "./Pages/Profile";
import Notifications from "./Pages/Notifications";
import Settings from "./Pages/Settings";

function App() {
  const { user, loading } = useContext(AuthContext);
  const [cookies] = useCookies(["theme"]);
  const location = useLocation(); // هنا قمنا باستدعاء التhook لمعرفة المسار الحالي

  useEffect(() => {
    const savedTheme = cookies.theme || "light";
    document.documentElement.setAttribute("data-theme", savedTheme);
  }, [cookies.theme]);

  if (loading) return (<Loader/>);

  // فحص ما إذا كان المستخدم في صفحة الريلز حالياً (مع مراعاة حالة الأحرف الكبيرة والصغيرة)
  const isReelsPage = location.pathname.toLowerCase() === '/reels';

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
            
            <main className={`container mx-auto p-0 ${isReelsPage ? '' : 'pb-15'}`}>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/Users" element={<Users />} />
                <Route path="/Reels" element={<Reels/>} />
                <Route path="/Profile" element={<Profile />} />
                <Route path="/Notifications" element={<Notifications />} />
                <Route path="/Settings" element={<Settings />} />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </main>
          </div>
        )}
      </ToastProvider>
  );
}

export default App;
