import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useContext, useEffect } from "react";
import { AuthContext } from "./context/AuthContext";
import { ToastProvider } from './Component/ui/ToastContext';
import './App.css';

import Navbar from './Component/common/Navbar';
import HomePage from "./Pages/HomePage";
import Users from "./Pages/Users";
import Login from "./Pages/Login";
import Register from "./Pages/Register";
import Settings from "./Pages/Settings";
import Profile from "./Pages/Profile";
import Reels from "./Pages/Reels"
function App() {
  const { user, logout, loading } = useContext(AuthContext);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    document.documentElement.setAttribute("data-theme", savedTheme);
  }, []);

  if (loading) return <div className="h-screen flex justify-center items-center"><span className="loading loading-spinner loading-lg"></span></div>;

  return (
    <Router>
      <div className="min-h-screen bg-base-100 font-sans" dir="rtl">
        <ToastProvider>
          <Navbar /> 
          
          <main className="container mx-auto p-0">
            <Routes>
              {user ? (
                <>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/Reels" element={<Reels/>} />
                  <Route path="/Users" element={<Users />} />
                  <Route path="/Settings" element={<Settings />} />
                  <Route path="/Profile" element={<Profile />} />
                  {/* إعادة توجيه أي مسار خاطئ للرئيسية */}
                  <Route path="*" element={<Navigate to="/" />} />
                </>
              ) : (
                <>
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  {/* إعادة توجيه أي مسار خاطئ لصفحة الدخول */}
                  <Route path="*" element={<Navigate to="/login" />} />
                </>
              )}
            </Routes>
          </main>
        </ToastProvider>
      </div>
    </Router>
  );
}

export default App;
