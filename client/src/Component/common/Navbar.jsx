import { Link, useLocation } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { 
  HiHome, HiOutlineHome, 
  HiUsers, HiOutlineUsers, 
  HiCog, HiOutlineCog, 
  HiUser, HiOutlineUser,
  HiOutlineLogout ,
  HiFilm,HiOutlineFilm
} from "react-icons/hi";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();

  const hideOnPages = ["/login", "/register", "/reels"]; 
  
  if (hideOnPages.includes(location.pathname.toLowerCase()) || !user) return null;

  const isActive = (path) => location.pathname === path;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-base-100 border-t border-base-200 z-50 h-16 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
      <div className="flex h-full items-center justify-around px-2">
        
        {/* الرئيسية */}
        <Link to="/" className={`flex flex-col items-center flex-1 ${isActive("/") ? "text-primary" : "text-gray-400"}`}>
          {isActive("/") ? <HiHome className="text-2xl" /> : <HiOutlineHome className="text-2xl" />}
          <span className="text-[10px] mt-1">الرئيسية</span>
        </Link>

        {/* تظهر "المستخدمين" فقط إذا كان Admin */}
        {user?.role === "admin" && (
          <Link to="/users" className={`flex flex-col items-center flex-1 ${isActive("/users") ? "text-primary" : "text-gray-400"}`}>
            {isActive("/users") ? <HiUsers className="text-2xl" /> : <HiOutlineUsers className="text-2xl" />}
            <span className="text-[10px] mt-1">المستخدمين</span>
          </Link>
        )}

        {/* ريلز  */}
        <Link to="/reels" className={`flex flex-col items-center flex-1 ${isActive("/reels") ? "text-primary" : "text-gray-400"}`}>
          {isActive("/reels") ? <HiFilm className="text-2xl" /> : <HiOutlineFilm className="text-2xl" />}
          <span className="text-[10px] mt-1">ريلز</span>
        </Link>

        {/* الملف الشخصي */}
        <Link to="/profile" className={`flex flex-col items-center flex-1 ${isActive("/profile") ? "text-primary" : "text-gray-400"}`}>
          {isActive("/profile") ? <HiUser className="text-2xl" /> : <HiOutlineUser className="text-2xl" />}
          <span className="text-[10px] mt-1">حسابي</span>
        </Link>

        {/* الإعدادات */}
        <Link to="/Settings" className={`flex flex-col items-center flex-1 ${isActive("/Settings") ? "text-primary" : "text-gray-400"}`}>
          {isActive("/Settings") ? <HiCog className="text-2xl" /> : <HiOutlineCog className="text-2xl" />}
          <span className="text-[10px] mt-1">الإعدادات</span>
        </Link>

        {/* زر خروج */}
        <button onClick={logout} className="flex flex-col items-center flex-1 text-error/70 hover:text-error">
          <HiOutlineLogout className="text-2xl" />
          <span className="text-[10px] mt-1">خروج</span>
        </button>

      </div>
    </div>
  );
};

export default Navbar;
