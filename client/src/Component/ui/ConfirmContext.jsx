import React, { createContext, useState, useContext } from 'react';

const ConfirmContext = createContext();

export const ConfirmProvider = ({ children }) => {
  const [config, setConfig] = useState({
    show: false,
    title: "",
    msg: "",
    onConfirm: null,
  });

  const askConfirm = (title, msg, callback) => {
    setConfig({
      show: true,
      title,
      msg,
      onConfirm: () => {
        callback(); // نفذ العملية
        closeConfirm(); // أغلق النافذة
      },
    });
  };

  const closeConfirm = () => {
    setConfig((prev) => ({ ...prev, show: false }));
  };

  return (
    <ConfirmContext.Provider value={askConfirm}>
      {children}

      {/* ===== نافذة التأكيد (Modal) ===== */}
      <div className={`fixed inset-0 z-[10000] flex items-center justify-center p-4 transition-all duration-300
        ${config.show ? "opacity-100 visible" : "opacity-0 invisible"}`}>
        
        {/* الخلفية المظلمة */}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeConfirm}></div>

        {/* جسم النافذة */}
        <div className={`relative bg-base-100 w-full max-w-sm rounded-3xl shadow-2xl p-6 transition-all duration-300 transform
          ${config.show ? "scale-100 translate-y-0" : "scale-95 translate-y-4"}`}>
          
          <h3 className="text-xl font-bold text-base-content mb-2">{config.title}</h3>
          <p className="text-base-content/70 text-sm mb-6 leading-relaxed">
            {config.msg}
          </p>

          <div className="flex gap-3">
            <button 
              onClick={closeConfirm}
              className="flex-1 py-3 rounded-xl font-bold bg-base-200 hover:bg-base-300 transition-colors text-base-content"
            >
              إلغاء
            </button>
            <button 
              onClick={config.onConfirm}
              className="flex-1 py-3 rounded-xl font-bold bg-error text-error-content hover:opacity-90 transition-opacity shadow-lg shadow-error/20"
            >
              تأكيد
            </button>
          </div>
        </div>
      </div>
    </ConfirmContext.Provider>
  );
};

export const useConfirm = () => useContext(ConfirmContext);
