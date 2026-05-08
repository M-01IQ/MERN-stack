import React, { createContext, useState, useContext } from 'react';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toast, setToast] = useState({ show: false, msg: "", type: "success" });

  const showToast = (msg, type = "success") => {
    setToast({ show: true, msg, type });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 1500);
  };

  return (
    <ToastContext.Provider value={showToast}>
      {children}

      {/* ===== التنبيه ===== */}
      <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[9999] transition-all duration-500
        ${toast.show ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4 pointer-events-none"}`}>
        
        <div className={`flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl backdrop-blur-md border
          ${toast.type === "success"
            ? "bg-emerald-500/10 border-emerald-400/60 text-emerald-500"
            : "bg-red-500/10 border-red-400/60 text-red-500"
          }`}
        >
          {/* الأيقونة */}
          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0
            ${toast.type === "success" ? "bg-emerald-500/30" : "bg-red-500/30"}`}>
            {toast.type === "success" ? "✓" : "✕"}
          </div>

          {/* النص */}
          <span className="text-sm font-semibold whitespace-nowrap">{toast.msg}</span>
        </div>
      </div>

    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
export default ToastContext;