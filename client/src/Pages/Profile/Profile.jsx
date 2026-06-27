import React from "react";
import Loader from "../../Component/common/Loader/Loader";
import ProfileCard from "./ProfileCard";
import EditProfileModal from "./EditProfileModal";
import { useProfile } from "./useProfile"; // تأكد من مسار الـ hook الصحيح
import UserPosts from "./UserPosts";

const Profile = () => {
  const {
    user,
    profileData,
    isLoading,
    isOpen,
    setIsOpen,
    formState,
    formLoading,
    handleFileChange,
    resetForm,
    handleSubmit
  } = useProfile();

  if (!user || (isLoading && !profileData)) {
    return <Loader />;
  }
  
  const currentUserId = user?._id || user?.userID || user?.id;
  
  return (
    <div dir="rtl" className="min-h-screen bg-base-200 p-0 pb-24 font-sans">
      <div className="max-w-md mx-auto mt-0">
        
        {/* مكون عرض بطاقة البيانات */}
        <ProfileCard 
          user={user} 
          profileData={profileData} 
          onEditClick={() => setIsOpen(true)} 
        />
        
      </div>
      
      <UserPosts userId={currentUserId} user={user}/>
      
      {/* مكون النافذة المنبثقة للتعديل */}
      {isOpen && (
        <EditProfileModal 
          formState={formState}
          formLoading={formLoading}
          handleFileChange={handleFileChange}
          resetForm={resetForm}
          handleSubmit={handleSubmit}
        />
      )}
    </div>
  );
};

export default Profile;
