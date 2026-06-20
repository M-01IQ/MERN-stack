import React, { useState, useEffect, useRef, useContext } from 'react';
import StoriesComponent from 'react-insta-stories';
import { FaPlus, FaRegImage, FaTrash } from 'react-icons/fa';
import API from '../../api/axiosInstance'; 
import { AuthContext } from '../../context/AuthContext';
import { createClient } from '@supabase/supabase-js';

const Stories = StoriesComponent.default || StoriesComponent;

// 🟢 القراءة التلقائية والآمنة من ملف الـ env الخاص بـ Vite
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default function InstagramStoriesBar() {
  // ... بقية كود المكون كاملاً كما هو دون أي تغيير

  const { user } = useContext(AuthContext);

  const [allStories, setAllStories] = useState([]);
  const fileInputRef = useRef(null);
  const [uploadPreview, setUploadPreview] = useState(null);
  const [uploadType, setUploadType] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false); 

  const [isOpen, setIsOpen] = useState(false);
  const [activeStories, setActiveStories] = useState(null);
  const [currentViewedUser, setCurrentViewedUser] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0); 

  const fetchStories = async () => {
    try {
      const res = await API.get('/stories');
      setAllStories(res.data); 
    } catch (err) {
      console.error("خطأ في جلب الستوريات من الباكيند:", err);
    }
  };

  useEffect(() => {
    fetchStories();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSelectedFile(file);
    const fileType = file.type.startsWith('video') ? 'video' : 'image';
    setUploadPreview(URL.createObjectURL(file));
    setUploadType(fileType);
  };

  // 🔄 دالة الرفع الذكية (فيديو -> Supabase | صورة -> ImageKit)
  const handlePublishStory = async () => {
    if (!selectedFile) return;

    if (!user) {
      alert("عذراً، يجب تسجيل الدخول أولاً لتتمكن من نشر قصة.");
      return;
    }

    setIsUploading(true);
    try {
      let finalMediaUrl = "";
      let finalFileId = "";

      if (uploadType === "video") {
        // 🟢 [أولاً] رفع الفيديو إلى Supabase Storage
        const bucketName = 'vd'; 
        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `story_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `stories/${fileName}`;

        const { data, error } = await supabase.storage
          .from(bucketName)
          .upload(filePath, selectedFile, {
            cacheControl: '3600',
            upsert: false
          });

        if (error) throw error;

        // الحصول على الرابط العام للفيديو المرفوع
        const { data: publicUrlData } = supabase.storage
          .from(bucketName)
          .getPublicUrl(filePath);

        finalMediaUrl = publicUrlData.publicUrl;
        finalFileId = data.path; // استخدام المسار كمعرف للملف

      } else {
        // 🔵 [ثانياً] رفع الصورة إلى ImageKit
        const authRes = await API.get('/imagekitRoutes');
        const authData = authRes.data;

        const uploadData = new FormData();
        uploadData.append("file", selectedFile);
        uploadData.append("fileName", selectedFile.name);
        uploadData.append("folder", "/stories"); 
        uploadData.append("publicKey", "public_8blKLRTsq6BkdVQ5OMD+OGPzNSM=");
        uploadData.append("signature", authData.signature);
        uploadData.append("expire", authData.expire.toString());
        uploadData.append("token", authData.token);

        const imgResponse = await fetch('https://upload.imagekit.io/api/v1/files/upload', { 
          method: 'POST', 
          body: uploadData 
        });
        const imgResult = await imgResponse.json();
        if (!imgResponse.ok) throw new Error("فشل رفع الميديا إلى ImageKit");

        finalMediaUrl = imgResult.url;
        finalFileId = imgResult.fileId;
      }

      // إرسال البيانات المجمعة لحفظها بقاعدة البيانات بقالب موحد
      await API.post('/newstory', {
        url: finalMediaUrl,
        mediaType: uploadType,
        fileId: finalFileId,
        duration: uploadType === 'video' ? 6000 : 4000,
        userId: user.id || user._id 
      });

      setUploadPreview(null);
      setSelectedFile(null);
      fetchStories(); 
    } catch (err) {
      alert(err.message || "حدث خطأ أثناء نشر الستوري");
    } {
      setIsUploading(false);
    }
  };

  const handleDeleteStory = async () => {
    const currentStory = activeStories[currentIndex];
    if (!currentStory || !currentStory._id) return;

    if (!window.confirm("هل أنت متأكد من رغبتك في حذف هذه الستوري؟")) return;

    setIsDeleting(true);
    try {
      await API.delete(`/stories/${currentStory._id}`);
      const updatedActive = activeStories.filter((_, idx) => idx !== currentIndex);
      
      handleCloseStories();
      await fetchStories(); 

      if (updatedActive.length > 0) {
        setTimeout(() => {
          const nextIndex = currentIndex >= updatedActive.length ? updatedActive.length - 1 : currentIndex;
          setActiveStories(updatedActive);
          setCurrentIndex(nextIndex);
          setIsOpen(true);
        }, 300);
      }
    } catch (err) {
      alert(err.response?.data?.error || "حدث خطأ أثناء حذف الستوري");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleOpenStories = (storiesArray, userDetails) => {
    if (!storiesArray || storiesArray.length === 0) return;
    
    const formattedStories = storiesArray.map(s => ({
      _id: s._id,
      url: s.url,
      type: s.mediaType,
      duration: s.duration,
      ownerId: userDetails.ownerId
    }));
    
    setCurrentIndex(0);
    setActiveStories(formattedStories);
    setCurrentViewedUser(userDetails);
    setIsOpen(true);
  };

  const handleCloseStories = () => {
    setIsOpen(false);
    setActiveStories(null);
    setCurrentViewedUser(null);
    setCurrentIndex(0);
    if (window.history.state?.storiesOpen) {
      window.history.back();
    }
  };

  useEffect(() => {
    if (isOpen) {
      window.history.pushState({ storiesOpen: true }, "");
      const handlePopState = () => {
        setIsOpen(false);
        setActiveStories(null);
        setCurrentViewedUser(null);
        setCurrentIndex(0);
      };
      window.addEventListener("popstate", handlePopState);
      return () => window.removeEventListener("popstate", handlePopState);
    }
  }, [isOpen]);

  const myStoriesGroup = allStories.find(item => item._id === user?.id || item._id === user?._id);
  const otherUsersStories = allStories.filter(item => item._id !== user?.id && item._id !== user?._id);

  const isOwnStoryActive = activeStories && activeStories[currentIndex] && 
    (activeStories[currentIndex].ownerId === user?.id || activeStories[currentIndex].ownerId === user?._id);

  return (
    <div className="w-full bg-base-100 p-0 border-b border-base-200 select-none">
      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*,video/*" className="hidden" />

      <div dir="rtl" className="flex overflow-x-auto scrollbar-hide px-2 gap-4 pt-2 pb-2 items-center">
        {user && (
          <div className="flex flex-col items-center flex-shrink-0 relative">
            <div 
              onClick={() => myStoriesGroup ? handleOpenStories(myStoriesGroup.stories, { username: "قصتك", avatar: user?.avatar || user?.profileImage, ownerId: user?.id || user?._id }) : fileInputRef.current.click()}
              className="relative cursor-pointer"
            >
              <div className="avatar">
                <div className={`w-16 h-16 rounded-full ${myStoriesGroup ? 'ring-2 ring-primary ring-offset-2' : 'ring ring-base-300'}`}>
                  <img src={user?.avatar || user?.profileImage || "https://ik.imagekit.io/2vom8qfmg/images/DefaultUser.jpg"} alt="My Profile" className="rounded-full object-cover" />
                </div>
              </div>
              {!myStoriesGroup && (
                <div className="absolute bottom-0 left-0 bg-primary text-primary-content p-0.5 rounded-full border-2 border-base-100 flex items-center justify-center -translate-x-1 translate-y-1">
                  <FaPlus className="w-3 h-3" />
                </div>
              )}
            </div>
            <span className="text-xs text-base-content/70 mt-2 w-16 truncate text-center font-medium">قصتك</span>
          </div>
        )}

        {user && myStoriesGroup && (
          <div onClick={() => fileInputRef.current.click()} className="flex flex-col items-center flex-shrink-0 cursor-pointer text-base-content/50 hover:text-primary transition">
            <div className="w-16 h-16 rounded-full border-2 border-dashed border-base-300 flex items-center justify-center bg-base-200">
              <FaRegImage size={20} />
            </div>
            <span className="text-[11px] mt-2 font-medium">إضافة جديد</span>
          </div>
        )}

        {user && <div className="w-[1px] h-12 bg-base-300 flex-shrink-0" />}

        {otherUsersStories.map((group) => (
          <div 
            key={group._id} 
            onClick={() => handleOpenStories(group.stories, { username: group.userId?.username, avatar: group.userId?.avatar || group.userId?.profileImage, role: group.userId?.role, ownerId: group._id })}
            className="flex flex-col items-center flex-shrink-0 cursor-pointer"
          >
            <div className="avatar">
              <div className="w-16 h-16 rounded-full p-[3px] bg-gradient-to-tr from-yellow-500 via-red-500 to-purple-600">
                <div className="w-full h-full rounded-full bg-base-100 p-[2px]">
                  <img src={group.userId?.avatar || group.userId?.profileImage || "https://ik.imagekit.io/2vom8qfmg/images/DefaultUser.jpg"} alt={group.userId?.username} className="rounded-full object-cover w-full h-full" />
                </div>
              </div>
            </div>
            <span className="text-xs text-base-content mt-2 w-16 truncate text-center font-medium">{group.userId?.username}</span>
          </div>
        ))}
      </div>

      {uploadPreview && (
        <div className="fixed inset-0 bg-black/90 z-[10000] flex flex-col items-center justify-center p-4">
          <div className="w-full max-w-[380px] bg-neutral text-neutral-content rounded-2xl overflow-hidden shadow-2xl flex flex-col">
            <div className="p-4 text-center border-b border-white/10 font-bold text-white">مراجعة الستوري قبل النشر</div>
            <div className="w-full aspect-[9/16] bg-black flex items-center justify-center">
              {uploadType === 'video' ? (
                <video src={uploadPreview} className="w-full h-full object-contain" autoPlay loop muted />
              ) : (
                <img src={uploadPreview} alt="Preview" className="w-full h-full object-contain" />
              )}
            </div>
            <div className="p-3 flex gap-3 bg-black/40">
              <button onClick={handlePublishStory} disabled={isUploading} className="btn btn-primary flex-1 text-white font-bold rounded-xl">
                {isUploading ? "جاري النشر..." : "نشر الآن"}
              </button>
              <button onClick={() => { setUploadPreview(null); setSelectedFile(null); }} disabled={isUploading} className="btn btn-ghost border border-white/20 text-white flex-1 rounded-xl">إلغاء</button>
            </div>
          </div>
        </div>
      )}
      
      {isOpen && activeStories && currentViewedUser && (
        <div className="fixed inset-0 bg-black/95 z-99 flex items-center justify-center touch-none">
          <div className="absolute top-4 right-4 flex items-center gap-2.5 p-3" style={{ zIndex: 9999 }} dir="rtl">
            <div className="avatar">
              <div className="w-9 h-9 rounded-full ring-1 ring-white/40">
                <img src={currentViewedUser.avatar || "https://ik.imagekit.io/2vom8qfmg/images/DefaultUser.jpg"} alt="User Avatar" className="object-cover rounded-full w-full h-full" />
              </div>
            </div>
            <div className="flex flex-col gap-0.5 text-right">
              <h3 className="text-sm font-bold text-white leading-none">{currentViewedUser.username}</h3>
            </div>
          </div>

          <div className="absolute top-4 left-4 flex items-center gap-2" style={{ zIndex: 9999 }}>
            {isOwnStoryActive && (
              <button 
                onClick={handleDeleteStory} 
                disabled={isDeleting}
                className="text-red-500 hover:text-red-400 text-lg p-3 rounded-full bg-black/40 btn-circle flex items-center justify-center border-none"
                title="حذف هذه الستوري"
              >
                <FaTrash size={16} className={isDeleting ? "animate-pulse" : ""} />
              </button>
            )}
            <button onClick={handleCloseStories} className="text-white text-xl p-3 rounded-full bg-black/40 w-10 h-10 flex items-center justify-center">✕</button>
          </div>

          <div className="w-full max-w-[420px] h-full max-h-[85vh] md:rounded-lg overflow-hidden relative">
            <Stories 
              stories={activeStories} 
              defaultInterval={4000} 
              width="100%" 
              height="100%" 
              storyStyles={{ objectFit: 'cover' }} 
              progressContainerStyles={{ direction: 'rtl', marginTop: '55px' }} 
              progressWrapperStyles={{ direction: 'rtl' }} 
              progressStyles={{ transformOrigin: 'right center' }} 
              onStoryStart={(index) => setCurrentIndex(index)} 
              onAllStoriesEnd={handleCloseStories} 
            />
          </div>
        </div>
      )}
    </div>
  );
}
