import React from "react";
import { FaIdBadge, FaEnvelope, FaCalendarAlt, FaShieldAlt } from "react-icons/fa";

const ProfileCard = ({ user, profileData, onEditClick }) => {
  const displayedUsername = profileData?.username || user?.username || "مستخدم";
  const displayedEmail = profileData?.email || user?.email || "لا يوجد بريد";
  const userAvatar = profileData?.avatar || null;
  const userAge = profileData?.age || user?.age || "غير محدد";

  return (
    <div className="card bg-base-100 shadow-xl border border-base-300">
      <div className="h-36 bg-gradient-to-l from-success to-green-600 rounded-t-2xl"></div>
      
      <div className="card-body items-center text-center -mt-22">
        <div className="avatar">
          <div className="bg-neutral text-neutral-content rounded-full w-34 h-34 ring ring-base-100 ring-offset-base-100 ring-offset-2 flex items-center justify-center overflow-hidden">
            {userAvatar ? (
              <img src={userAvatar} alt={displayedUsername} className="w-full h-full object-cover" />
            ) : (
              <span className="text-5xl font-black uppercase select-none">
                {displayedUsername?.charAt(0)}
              </span>
            )}
          </div>
        </div>

        <h2 className="card-title text-2xl font-black mt-2">{displayedUsername}</h2>
        
        <div className={`badge ${user?.role === 'admin' ? 'badge-info' : 'badge-ghost'} gap-2 p-3 font-bold`}>
          {user?.role === 'admin' ? <FaShieldAlt /> : <FaIdBadge />}
          {user?.role === 'admin' ? 'مسؤول' : 'مستخدم'}
        </div>

        <div className="divider w-full">المعلومات الشخصية</div>

        <div className="w-full space-y-4 text-right">
          <div className="flex items-center gap-4 bg-base-200 p-3 rounded-lg">
            <div className="bg-success/10 p-2 rounded-full text-success"><FaCalendarAlt /></div>
            <div>
              <p className="text-xs text-gray-500">العمر</p>
              <p className="font-bold">{userAge} {userAge !== "غير محدد" && "سنة"}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-base-200 p-3 rounded-lg">
            <div className="bg-success/10 p-2 rounded-full text-success"><FaEnvelope /></div>
            <div>
              <p className="text-xs text-gray-500">البريد الإلكتروني</p>
              <p className="font-bold truncate max-w-[240px]">{displayedEmail}</p>
            </div>
          </div>
        </div>

        <div className="card-actions mt-6 w-full">
          <button onClick={onEditClick} className="btn btn-success btn-outline w-full rounded-xl">
            تعديل الملف الشخصي
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;
