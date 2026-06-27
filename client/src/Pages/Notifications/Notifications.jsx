import React from 'react';
import { HiBell } from "react-icons/hi";

const Notifications = () => {
  return (
    // تم تعديل max-w-2xl إلى max-w-4xl ليعطي مساحة أكبر ومريحة على شاشات الحاسوب
    <div className="container mx-auto max-w-4xl mt-6 p-4 md:p-6 flex flex-col items-center text-base-content animate-fade-in">
      
      {/* قسم العنوان: يتناسق تلقائياً بين الهواتف والحواسب */}
      <div className="flex items-center gap-3 mb-6 w-full justify-between border-b pb-4 border-base-content/20">
        <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2">
          <HiBell className="text-primary" />
          الاشعارات
        </h1>
        <span className="badge badge-primary badge-sm md:badge-md font-bold text-primary-content">1 غير مقروء</span>
      </div>

      {/* قائمة الإشعارات: تم زيادة الارتفاع الأقصى على الشاشات الكبيرة md:max-h-[600px] */}
      <div className="w-full max-h-[450px] md:max-h-[600px] overflow-y-auto pl-2 flex flex-col gap-3 custom-scrollbar" dir="rtl">
        
        {/* كرت الإشعار: مرن ومتجاوب تماماً */}
        <div className="alert bg-success/10 border border-success/30 shadow-sm flex flex-row justify-between items-center text-right p-4 rounded-xl transition-all hover:bg-success/15">
          <div className="flex items-center gap-3md:gap-4">
            <div className="avatar placeholder">
              <div className="bg-success text-success-content rounded-full w-10 h-10 md:w-12 md:h-12 flex items-center justify-center shadow-sm">
                <HiBell className="text-xl md:text-2xl" />
              </div>
            </div>
            <div>
              {/* العنوان - يتغير حجم الخط حسب الشاشة */}
              <p className="text-sm md:text-base font-bold text-base-content">إشعار جديد</p>
              {/* الشرح */}
              <p className="text-xs md:text-sm text-base-content opacity-70 mt-0.5">ابقى على اطلاع دائم لاخر التحديثات</p>
            </div>
          </div>
          
          {/* وقت الإشعار */}
          <span className="badge badge-success badge-outline badge-sm md:badge-md font-medium whitespace-nowrap">8:15 م</span>
        </div>

      </div>
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: var(--fallback-bc,oklch(var(--bc)/0.2));
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: var(--fallback-bc,oklch(var(--bc)/0.4));
        }
      `}</style>

    </div>
  );
};

export default Notifications;
