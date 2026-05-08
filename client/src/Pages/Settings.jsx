import { useState } from "react";
import { useToast } from "../Component/ui/ToastContext";
import { FaPalette } from "react-icons/fa";
import { useCookies } from "react-cookie";

export default function Settings() {
  const showToast = useToast();
  const [cookies, setCookie] = useCookies(["theme"]);

  const [selectedTheme, setSelectedTheme] = useState(cookies.theme || "light");

  const themes = ["light", "night"];

  const applyTheme = (theme) => {
    setSelectedTheme(theme);
    document.documentElement.setAttribute("data-theme", theme);
    setCookie("theme", theme, { path: "/", maxAge: 365 * 24 * 60 * 60 });
  };

  return (
    <div dir="rtl" className="min-h-screen bg-base-200 py-10 px-4">
      <div className="max-w-2xl mx-auto flex flex-col gap-6">

        <h1 className="text-3xl font-black text-base-content">الإعدادات</h1>

        {/* ===== الثيم ===== */}
        <div className="card bg-base-100 shadow-md">
          <div className="card-body">
            <h2 className="card-title text-lg mb-4">
              <FaPalette className="text-secondary" />
              اختر الثيم
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {themes.map((theme) => (
                <button
                  key={theme}
                  onClick={() => applyTheme(theme)}
                  data-theme={theme}
                  className={`rounded-xl border-2 p-3 flex items-center gap-2 transition-all
                    ${selectedTheme === theme
                      ? "border-primary scale-105 shadow-md"
                      : "border-base-300 hover:border-primary"
                    }`}
                >
                  <div className="flex gap-1">
                    <span className="w-4 h-4 rounded-full bg-primary"></span>
                    <span className="w-4 h-4 rounded-full bg-secondary"></span>
                    <span className="w-4 h-4 rounded-full bg-accent"></span>
                  </div>
                  <span className="text-sm font-semibold capitalize text-base-content">
                    {theme}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
