import { useState ,useEffect} from "react";
import { FaPalette } from "react-icons/fa";
import { useCookies } from "react-cookie";
import Button1 from "../Component/ui/Buttons/Button1";
export default function Settings() {
  const [cookies, setCookie] = useCookies(["theme"]);

  const [selectedTheme, setSelectedTheme] = useState(cookies.theme || "light");
  
  useEffect(() => {
  if (cookies.theme) {
    setSelectedTheme(cookies.theme);
  }
}, [cookies.theme]);

  const themes = ["light", "night"];

  const applyTheme = (theme) => {
    setSelectedTheme(theme);
    document.documentElement.setAttribute("data-theme", theme);
    setCookie("theme", theme, { path: "/", maxAge: 365 * 24 * 60 * 60 });
  };
  
  const handleToggle=()=>{
    const newTheme = selectedTheme ==="light"?"night":"light";
    applyTheme(newTheme);
  }

  return (
    <div dir="rtl" className="min-h-screen bg-base-200 py-10 px-4">
      <div className="max-w-2xl mx-auto flex flex-col gap-6">

        <h1 className="text-3xl font-black text-base-content">الإعدادات</h1>
        
        {/* ===== الثيم ===== */}
         <div className="card bg-base-100 shadow-md">
          <div className="card-body flex-row items-center justify-between">
            <div>
              <h2 className="card-title text-lg">الوضع الليلي</h2>
              <p className="text-sm opacity-70">تبديل بين الوضع الفاتح والمظلم</p>
            </div>
            
            {/* استدعاء التوگل وربطه بالحالة */}
            <Button1 
              checked={selectedTheme === "night"} 
              onChange={handleToggle} 
            />
          </div>
        </div>
        
        
      </div>
    </div>
  );
}
