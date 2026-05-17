import { useState, useEffect, useContext } from "react";
import { useCookies } from "react-cookie";
import NightBtn from "../Component/ui/Buttons/NightBtn";
import NotificationsBtn from "../Component/ui/Buttons/NotificationsBtn";
import PublicBtn from "../Component/ui/Buttons/PublicBtn"
import { AuthContext } from "../context/AuthContext";
import { useConfirm } from "../Component/ui/PopUp/ConfirmContext";
import { useToast } from "../Component/ui/PopUp/ToastContext"; // استيراد التوست
import { HiOutlineLogout } from "react-icons/hi";

export default function Settings() {
  const { user, logout } = useContext(AuthContext); 
  const askConfirm = useConfirm();
  const showToast = useToast(); // تعريف التوست لاستخدامه
  
  const [cookies, setCookie] = useCookies(["theme"]);
  const [selectedTheme, setSelectedTheme] = useState(cookies.theme || "light");
  
  useEffect(() => {
    if (cookies.theme) {
      setSelectedTheme(cookies.theme);
    }
  }, [cookies.theme]);

  const applyTheme = (theme) => {
    setSelectedTheme(theme);
    document.documentElement.setAttribute("data-theme", theme);
    setCookie("theme", theme, { path: "/", maxAge: 365 * 24 * 60 * 60 });
  };
  
  const handleToggle = () => {
    const newTheme = selectedTheme === "light" ? "night" : "light";
    applyTheme(newTheme);
  };
  
  const handleConfirmation = () => {
    askConfirm(
      "تسجيل الخروج ؟", 
      "هل أنت متأكد أنك تريد الخروج من الحساب؟", 
      () => {
        logout(); 
        showToast("تم تسجيل الخروج بنجاح", "success");
      }
    );
  };
  
  return (
    <div dir="rtl" className="min-h-screen bg-base-200 py-10 px-4">
      <div className="max-w-2xl mx-auto flex flex-col gap-6">
        <h1 className="text-2xl font-black text-base-content">الإعدادات</h1>
        
        <div className="card bg-base-100 shadow-md">
          {/* قسم الثيم */}
          <div className="card-body flex-row items-center justify-between border-b border-base-200">
            <div>
              <h2 className="card-title text-lg">الوضع الليلي</h2>
              <p className="text-sm opacity-70">تبديل بين الوضع الفاتح والمظلم</p>
            </div>
            <NightBtn 
              checked={selectedTheme === "night"} 
              onChange={handleToggle} 
            />
          </div>
          
          {/* قسم الاشعارات */}
          <div className="card-body flex-row items-center justify-between border-b border-base-200">
            <div>
              <h2 className="card-title text-lg">الاشعارات</h2>
              <p className="text-sm opacity-70">تفعيل الاشعارات</p>
            </div>
            <NotificationsBtn />
          </div>

          {/* قسم جديد */}
          <div className="card-body flex-row items-center justify-between border-b border-base-200">
            <div>
              <h2 className="card-title text-lg">جديد</h2>
              <p className="text-sm opacity-70">تفعيل </p>
            </div>
            <PublicBtn />
          </div>
          {/* قسم جديد */}
          <div className="card-body flex-row items-center justify-between border-b border-base-200">
            <div>
              <h2 className="card-title text-lg">جديد</h2>
              <p className="text-sm opacity-70">تفعيل </p>
            </div>
            <PublicBtn />
          </div>

          {/* قسم تسجيل الخروج */}
          <div className="card-body flex-row items-center justify-between">
            <div>
              <h2 className="card-title text-lg">تسجيل الخروج</h2>
              {user && <p className="text-xs opacity-50">الحساب: {user.email || user.name}</p>}
            </div>
            <button 
              onClick={handleConfirmation} 
              className="flex flex-col items-center text-error/70 hover:text-error transition-colors"
            >
              <HiOutlineLogout className="text-3xl" />
              <span className="text-[10px] mt-1">خروج</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
