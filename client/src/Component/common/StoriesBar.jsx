import React from 'react';

// بيانات تجريبية للستوريات مع الروابط الخاصة بك
const storiesData = [
  {
    id: 1,
    username: "𝙼𝚄𝚂𝚃𝙰𝙵𝙰",
    userAvatar: "https://ik.imagekit.io/2vom8qfmg/images/profile.jpg",
    isUnread: true
  },
  {
    id: 2,
    username: "user_1",
    userAvatar: "https://ik.imagekit.io/2vom8qfmg/images/DefaultUser.jpg?updatedAt=1779202542905",
    isUnread: false
  },
  {
    id: 3,
    username: "user_2",
    userAvatar: "https://ik.imagekit.io/2vom8qfmg/images/DefaultUser.jpg?updatedAt=1779202542905",
    isUnread: false 
  },
  {
    id: 4,
    username: "user_3",
    userAvatar: "https://ik.imagekit.io/2vom8qfmg/images/DefaultUser.jpg?updatedAt=1779202542905",
    isUnread: false 
  },
];

export default function InstagramStoriesBar() {
  // بيانات الحساب الشخصي للمستخدم الحالي
  const currentUser = {
    username: "قصتك",
    avatar: "https://ik.imagekit.io/2vom8qfmg/images/DefaultUser.jpg?updatedAt=1779202542905"
  };

  return (
    <div className="w-full bg-base-100 p-0 border-b border-base-200 transition-colors duration-300">
      {/* حاوية الستوريات بالتمرير الأفقي المخفي */}
      <div className="flex overflow-x-auto scrollbar-hide px-2 gap-4 pt-2">
        
        {/* 1. ستوري المستخدم الحالي (إضافة قصة) */}
        <div className="flex flex-col items-center flex-shrink-0 cursor-pointer group select-none">
          
          {/* الحاوية الأب نسبيّة لمنع قص الزر */}
          <div className="relative">
            {/* الأفتار من DaisyUI */}
            <div className="avatar placeholder">
              <div className="w-16 h-16 md:w-18 md:h-18 rounded-full ring ring-base-300 ring-offset-base-100 ring-offset-2">
                <img 
                  src={currentUser.avatar} 
                  alt="My Story" 
                  className="rounded-full object-cover"
                />
              </div>
            </div>
            
            {/* تم نقل الزر خارج حاوية الـ avatar ليتجنب الـ overflow: hidden ويظهر كاملاً */}
            <div className="absolute bottom-0 right-0 bg-primary text-primary-content p-0.5 rounded-full border-2 border-base-100 flex items-center justify-center shadow-md z-10 translate-x-1 translate-y-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
            </div>
          </div>

          {/* اسم المستخدم */}
          <span className="text-xs text-base-content/70 mt-2 w-16 truncate text-center font-medium">
            {currentUser.username}
          </span>
        </div>

        {/* 2. عرض ستوريات الأصدقاء */}
        {storiesData.map((story) => (
          <div 
            key={story.id} 
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
    </div>
  );
}
