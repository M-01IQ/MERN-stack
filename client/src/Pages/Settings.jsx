import { useState, useEffect, useContext, useRef } from "react";
import { useCookies } from "react-cookie";
import NightBtn from "../Component/ui/Buttons/NightBtn";
import NotificationsBtn from "../Component/ui/Buttons/NotificationsBtn";
import PublicBtn from "../Component/ui/Buttons/PublicBtn";
import { AuthContext } from "../context/AuthContext";
import { useConfirm } from "../Component/ui/PopUp/ConfirmContext";
import { useToast } from "../Component/ui/PopUp/ToastContext"; 
import { HiOutlineLogout } from "react-icons/hi";
import { useQueryClient } from '@tanstack/react-query';

export default function Settings() {
  const { user, logout } = useContext(AuthContext); 
  const askConfirm = useConfirm();
  const showToast = useToast(); 
  const queryClient = useQueryClient();
  
  const [cookies, setCookie] = useCookies(["theme"]);
  // تحسين 1: قراءة القيمة الابتدائية مباشرة لتجنب الريندر المتكرر
  const [selectedTheme, setSelectedTheme] = useState(() => cookies.theme || "light");
  
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState("ar"); 

  const langContainerRef = useRef(null);
  
  // تحسين 2: إصلاح الـ Effect الخاص بغلق القائمة وحذف المستمع بشكل صحيح
  useEffect(() => {
    function handleClickOutside(event) {
      if (langContainerRef.current && !langContainerRef.current.contains(event.target)) {
        setIsLangOpen(false);
      }
    }

    if (isLangOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isLangOpen]); // تحديث مصفوفة الاعتمادات لضمان التنظيف الفوري

  const applyTheme = (theme) => {
    setSelectedTheme(theme);
    document.documentElement.setAttribute("data-theme", theme);
    setCookie("theme", theme, { path: "/", maxAge: 365 * 24 * 60 * 60 });
  };
  
  const handleToggle = () => {
    const newTheme = selectedTheme === "light" ? "night" : "light";
    applyTheme(newTheme);
  };
  
  const handleLangChange = (langCode) => {
    setCurrentLang(langCode);
    setIsLangOpen(false);
  };

  const handleConfirmation = () => {
    askConfirm(
      "تسجيل الخروج ؟", 
      "هل أنت متأكد أنك تريد الخروج من الحساب؟", 
      () => {
        queryClient.clear(); 
        logout(); 
        showToast("تم تسجيل الخروج بنجاح", "success");
      }
    );
  };
  
  return (
    <div dir="rtl" className="min-h-screen bg-base-200 py-6 md:py-10 px-4 md:px-0">
      <div className="max-w-4xl mx-auto flex flex-col gap-6">
        <h1 className="text-xl md:text-2xl font-black text-base-content px-1">الإعدادات</h1>
        
        <div className="card bg-base-100 shadow-md border border-base-200">
          
          {/* قسم الثيم */}
          <div className="card-body p-4 md:p-6 flex-row items-center justify-between border-b border-base-200">
            <div>
              <h2 className="card-title text-base md:text-lg">الوضع الليلي</h2>
              <p className="text-xs md:text-sm opacity-70">تبديل بين الوضع الفاتح والمظلم</p>
            </div>
            <NightBtn checked={selectedTheme === "night"} onChange={handleToggle} />
          </div>
          
          {/* قسم الاشعارات */}
          <div className="card-body p-4 md:p-6 flex-row items-center justify-between border-b border-base-200">
            <div>
              <h2 className="card-title text-base md:text-lg">الاشعارات</h2>
              <p className="text-xs md:text-sm opacity-70">تفعيل الاشعارات</p>
            </div>
            <NotificationsBtn />
          </div>

          {/* قسم اختيار اللغة */}
          <div 
            ref={langContainerRef} 
            className="border-b border-base-200 transition-all duration-300"
          >
            {/* تحسين 3: إضافة أدوار الوصول (Accessibility) للـ div التفاعلي */}
            <div 
              onClick={() => setIsLangOpen(!isLangOpen)}
              onKeyDown={(e) => { if(e.key === 'Enter' || e.key === ' ') setIsLangOpen(!isLangOpen); }}
              role="button"
              tabIndex={0}
              className={`card-body p-4 md:p-6 flex-row items-center justify-between cursor-pointer select-none transition-colors hover:bg-base-200/40 focus:outline-none focus:bg-base-200/40 ${isLangOpen ? 'bg-base-200/50' : ''}`}
            >
              <div>
                <h2 className="card-title text-base md:text-lg">لغة التطبيق</h2>
                <p className="text-xs md:text-sm opacity-70">اختر لغتك المفضلة</p>
              </div>
              
              <div className="btn btn-ghost btn-sm gap-1 px-2 font-normal pointer-events-none">
                <span>🌐</span>
                <span>{currentLang === "ar" ? "العربية" : currentLang === "en" ? "English" : "فارسی"}</span>
                <span className={`text-[10px] opacity-50 transition-transform duration-200 ${isLangOpen ? 'rotate-180' : ''}`}>▼</span>
              </div>
            </div>

            {/* قائمة اللغات */}
            {isLangOpen && (
              <div 
                className="px-4 md:px-6 pb-4 flex justify-end animate-fade-in"
                onClick={(e) => e.stopPropagation()} 
              >
                <ul className="menu menu-sm bg-base-200/60 rounded-xl w-full sm:w-36 p-1 border border-base-200 gap-1">
                  <li>
                    <button 
                      className={`py-2 justify-center ${currentLang === "ar" ? "active font-bold" : ""}`}
                      onClick={() => handleLangChange("ar")}
                    >
                      العربية
                    </button>
                  </li>
                  <li>
                    <button 
                      className={`py-2 justify-center ${currentLang === "en" ? "active font-bold" : ""}`}
                      onClick={() => handleLangChange("en")}
                    >
                      English
                    </button>
                  </li>
                  <li>
                    <button 
                      className={`py-2 justify-center ${currentLang === "fa" ? "active font-bold" : ""}`}
                      onClick={() => handleLangChange("fa")}
                    >
                      فارسی 
                    </button>
                  </li>
                </ul>
              </div>
            )}
          </div>
          
          {/* قسم جديد */}
          <div className="card-body p-4 md:p-6 flex-row items-center justify-between border-b border-base-200">
            <div>
              <h2 className="card-title text-base md:text-lg">جديد</h2>
              <p className="text-xs md:text-sm opacity-70">تفعيل </p>
            </div>
            <PublicBtn />
          </div>

          {/* قسم تسجيل الخروج */}
          <div className="card-body p-4 md:p-6 flex-row items-center justify-between">
            <div>
              <h2 className="card-title text-base md:text-lg">تسجيل الخروج</h2>
              {user && <p className="text-[11px] md:text-xs opacity-50">الحساب: {user.email || user.name}</p>}
            </div>
            <button 
              onClick={handleConfirmation} 
              className="flex flex-col items-center text-error/70 hover:text-error transition-colors px-2"
            >
              <HiOutlineLogout className="text-2xl md:text-3xl" />
              <span className="text-[10px] mt-0.5">خروج</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
