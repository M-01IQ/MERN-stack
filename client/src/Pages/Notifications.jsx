import React from 'react';
import { HiBell } from "react-icons/hi";

const Notifications = () => {
  return (
    // text-base-content تضمن تحول الخطوط العادية للأبيض في الوضع الليلي
    <div className="container mx-auto max-w-2xl mt-6 p-4 flex flex-col items-center text-base-content">
      
      <div className="flex items-center gap-3 mb-6 w-full justify-between border-b pb-4 border-base-content/20">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <HiBell className="text-primary" />
          الاشعارات
        </h1>
        {/* text-primary-content تضمن أن رقم الإشعارات يتغير لونه ليناسب خلفية البادج */}
        <span className="badge badge-primary badge-md font-bold text-primary-content">1 غير مقروء</span>
      </div>

      <div className="w-full max-h-[450px] overflow-y-auto pr-2 flex flex-col gap-3 custom-scrollbar">
        
        {/* التنبيه: تم ضبط الخلفية والحدود والخط ليتوافقوا مئة بالمئة مع الوضع الليلي */}
        <div className="alert bg-success/10 border border-success/30 shadow-sm flex justify-between items-center text-right p-4 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="avatar placeholder">
              <div className="bg-success text-success-content rounded-full w-10 h-10 flex items-center justify-center">
                <HiBell className="text-xl" />
              </div>
            </div>
            <div>
              {/* text-base-content هنا تجعل العنوان أبيض في الوضع الليلي */}
              <p className="text-sm font-bold text-base-content">إشعار جديد</p>
              {/* opacity-70 تعطي لوناً أبيض خفيفاً للنص الفرعي */}
              <p className="text-xs text-base-content opacity-70 mt-0.5">ابقى على اطلاع دائم لاخر التحديثات</p>
            </div>
          </div>
          <span className="badge badge-success badge-outline badge-sm font-bold">جديد</span>
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
          background-color: var(--fallback-bc,oklch(var(--bc)/0.3));
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: var(--fallback-bc,oklch(var(--bc)/0.5));
        }
      `}</style>

    </div>
  );
};

export default Notifications;
