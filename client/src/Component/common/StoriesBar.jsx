import React, { useState, useEffect } from 'react';
import StoriesComponent from 'react-insta-stories';

// حل مشكلة التوافقية مع بيئات البناء الحديثة مثل Vite
const Stories = StoriesComponent.default || StoriesComponent;

// بيانات تجريبية للستوريات
const storiesData = [
  {
    id: 1,
    username: "𝙼𝚄𝚂𝚃𝙰𝙵𝙰",
    userAvatar: "https://ik.imagekit.io/2vom8qfmg/images/profile.jpg",
    isUnread: true,
    stories: [
      { url: "https://ackbctzmmrrvckpkdvpj.supabase.co/storage/v1/object/sign/vd/VID_20260404_142517.mp4?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV80ODhkMTlmNC0xMWY4LTQ1NWYtYmRmOS0yYjEzNjMyYTAzYTUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJ2ZC9WSURfMjAyNjA0MDRfMTQyNTE3Lm1wNCIsImlhdCI6MTc3OTcyMzM4NiwiZXhwIjoxODExMjU5Mzg2fQ.tagClfdIROT0bJbPtwhDOnmrbe8SUBSS57nXmAbznvI",type:'video', duration: 4000 },
      { url: "https://ackbctzmmrrvckpkdvpj.supabase.co/storage/v1/object/sign/vd/VID_20260519_184747_842.mp4?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV80ODhkMTlmNC0xMWY4LTQ1NWYtYmRmOS0yYjEzNjMyYTAzYTUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJ2ZC9WSURfMjAyNjA1MTlfMTg0NzQ3Xzg0Mi5tcDQiLCJpYXQiOjE3Nzk3MjIxNTgsImV4cCI6MTgxMTI1ODE1OH0.j8w61_rUA6w4htsamZw_apz6ozWNKMWMX7DA66MYByk",type:'video', duration: 4000 }
    ]
  },
];

export default function InstagramStoriesBar() {
  const currentUser = {
    username: "قصتك",
    avatar: "https://ik.imagekit.io/2vom8qfmg/images/DefaultUser.jpg?updatedAt=1779202542905"
  };

  const currentUserStories = [
    { url: "https://picsum.photos/1080/1920?random=10", duration: 4000 }
  ];

  const [activeStories, setActiveStories] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  // دالة فتح الستوري
  const handleOpenStories = (storiesArray) => {
    if (!storiesArray || storiesArray.length === 0) return;
    setActiveStories(storiesArray);
    setIsOpen(true);
  };

  // دالة إغلاق الستوري وإدارة الـ History
  const handleCloseStories = () => {
    setIsOpen(false);
    setActiveStories(null);
    // تنظيف تاريخ المتصفح إذا أغلق المستخدم الستوري يدوياً
    if (window.history.state?.storiesOpen) {
      window.history.back();
    }
  };

  // تأثير التعامل مع زر الرجوع في الهاتف الفعلي
  useEffect(() => {
    if (isOpen) {
      // دفع حالة وهمية لتاريخ المتصفح لمنع الخروج من الموقع
      window.history.pushState({ storiesOpen: true }, "");

      const handlePopState = () => {
        // عند ضغط زر الرجوع بالهاتف، نغلق الستوري فقط
        setIsOpen(false);
        setActiveStories(null);
      };

      window.addEventListener("popstate", handlePopState);

      return () => {
        window.removeEventListener("popstate", handlePopState);
      };
    }
  }, [isOpen]);

  return (
    <div className="w-full bg-base-100 p-0 border-b border-base-200 transition-colors duration-300">
      
      {/* شريط الستوريات الأفقي باتجاه RTL */}
      <div dir="rtl" className="flex overflow-x-auto scrollbar-hide px-2 gap-4 pt-2 pb-2">
        
        {/* 1. ستوري المستخدم الحالي */}
        <div 
          onClick={() => handleOpenStories(currentUserStories)}
          className="flex flex-col items-center flex-shrink-0 cursor-pointer group select-none"
        >
          <div className="relative">
            <div className="avatar placeholder">
              <div className="w-16 h-16 md:w-18 md:h-18 rounded-full ring ring-base-300 ring-offset-base-100 ring-offset-2">
                <img 
                  src={currentUser.avatar} 
                  alt="My Story" 
                  className="rounded-full object-cover"
                />
              </div>
            </div>
            
            <div className="absolute bottom-0 left-0 bg-primary text-primary-content p-0.5 rounded-full border-2 border-base-100 flex items-center justify-center shadow-md z-10 -translate-x-1 translate-y-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
            </div>
          </div>

          <span className="text-xs text-base-content/70 mt-2 w-16 truncate text-center font-medium">
            {currentUser.username}
          </span>
        </div>

        {/* 2. عرض ستوريات الأصدقاء */}
        {storiesData.map((story) => (
          <div 
            key={story.id} 
            onClick={() => handleOpenStories(story.stories)}
            className="flex flex-col items-center flex-shrink-0 cursor-pointer active:scale-95 transition duration-150 select-none"
          >
            <div className="avatar">
              <div className={`w-16 h-16 md:w-18 md:h-18 rounded-full p-[2.5px] ${
                story.isUnread 
                  ? 'bg-gradient-to-tr from-yellow-500 via-red-500 to-purple-600 p-[3px]' 
                  : 'ring ring-base-300 ring-offset-base-100 ring-offset-2'
              }`}>
                <div className={`w-full h-full rounded-full ${story.isUnread ? 'bg-base-100 p-[2px]' : ''}`}>
                  <img 
                    src={story.userAvatar} 
                    alt={story.username} 
                    className="rounded-full object-cover w-full h-full"
                  />
                </div>
              </div>
            </div>
            <span className="text-xs text-base-content mt-2 w-16 truncate text-center font-medium">
              {story.username}
            </span>
          </div>
        ))}
      </div>
      
      {/* 3. نافذة العرض المنبثقة (Modal) */}
{isOpen && activeStories && (
  <div className="fixed inset-0 bg-black/95 z-99 flex items-center justify-center select-none touch-none">
    
    {/* 💡 معلومات المستخدم العائمة (الأفتار + الاسم + شارة التوثيق) */}
    <div 
      className="absolute top-4 right-4 flex items-center gap-2.5 bg-gradient-to-b from-black/60 to-transparent p-3 rounded-bl-xl pointer-events-none"
      style={{ zIndex: 9999 }} 
      dir="rtl" // لترتيب الأفتار ثم الاسم من اليمين لليسار
    >
      {/* 1. أفتار المستخدم المصغر */}
      <div className="avatar">
        <div className="w-9 h-9 rounded-full ring-1 ring-white/40">
          <img 
            src="https://ik.imagekit.io/2vom8qfmg/images/profile.jpg" 
            alt="User Avatar" 
            className="object-cover rounded-full"
          />
        </div>
      </div>

      {/* 2. النصوص (الاسم + الرتبة) */}
      <div className="flex flex-col gap-0.5 text-right">
        {/* الاسم مع علامة التوثيق */}
        <div className="flex items-center gap-1.5 justify-start">
          {/* لون النص أبيض ثابت لأن خلفية الستوري سوداء دائماً */}
          <h3 className="text-sm md:text-base font-bold text-white leading-none">𝙼𝚄𝚂𝚃𝙰𝙵𝙰</h3>
          
          {/* أيقونة التوثيق */}
          <svg 
            className="w-[14px] h-[14px] md:w-[16px] md:h-[16px] text-[#1d9bf0] fill-current flex-shrink-0" 
            viewBox="0 0 24 24" 
            aria-label="Verified account"
          >
            <g>
              <path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.99-3.818-3.99-.48 0-.94.1-1.348.27C14.825 2.515 13.512 1.5 12 1.5s-2.825 1.015-3.422 2.28c-.406-.17-.866-.27-1.348-.27-2.108 0-3.818 1.78-3.818 3.99 0 .495.084.965.238 1.4-1.273.65-2.148 2.02-2.148 3.6 0 1.58.875 2.95 2.148 3.6-.154.435-.238.905-.238 1.4 0 2.21 1.71 3.99 3.818 3.99.48 0 .94-.1 1.348-.27.597 1.265 1.91 2.28 3.422 2.28s2.825-1.015 3.422-2.28c.406.17.866.27 1.348.27 2.108 0 3.818-1.78 3.818-3.99 0-.495-.084-.965-.238-1.4 1.273-.65 2.148-2.02 2.148-3.6zm-12.5 4l-4.25-4.25 1.4-1.4 2.85 2.85 6.65-6.65 1.4 1.4-8.05 8.05z"></path>
            </g>
          </svg>
        </div>
        
        {/* user/admin */}
        <span className="text-[10px] md:text-xs text-white/60 font-medium tracking-wide">admin</span>
      </div>
    </div>

    {/* زر الإغلاق العلوي جهة اليسار */}
    <button 
      onClick={(e) => {
        e.stopPropagation();
        handleCloseStories();
      }}
      className="absolute top-4 left-4 text-white text-2xl font-bold p-3 rounded-full bg-black/40 hover:bg-black/60 transition"
      style={{ zIndex: 9999 }}
    >
      ✕
    </button>

    {/* حاوية الستوري */}
    <div className="w-full max-w-[420px] h-full max-h-[85vh] md:rounded-lg overflow-hidden relative">
      <Stories
        stories={activeStories}
        defaultInterval={4000}
        width="100%"
        height="100%"
        storyStyles={{ objectFit: 'cover' }}
        
        progressContainerStyles={{
          direction: 'rtl',
          marginTop: '55px' // زيادة المسافة لكي لا يغطي شريط التقدم على الأفتار والاسم
        }}
        progressWrapperStyles={{
          direction: 'rtl',
        }}
        progressStyles={{
          transformOrigin: 'right center',
        }}

        onAllStoriesEnd={handleCloseStories}
      />
    </div>
  </div>
)}

    </div>
  );
}
