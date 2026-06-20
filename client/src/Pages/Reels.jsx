import Loader from "../Component/common/Loader";
import { useToast } from '../Component/ui/PopUp/ToastContext';
import { useConfirm } from '../Component/ui/PopUp/ConfirmContext';
import { useNavigate } from "react-router-dom";
import React, { useState, useRef, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@supabase/supabase-js'; 
import {
  Heart, MessageCircle, Share2, Music2, Play,
  Volume2, VolumeX, ArrowRight, Trash2, Plus, X, Upload
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

// 🌐 دالة مساعدة لتحويل المسارات النسبية للصور إلى روابط كاملة وثابتة
const getFullImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
    return path;
  }
  const cleanPath = path.startsWith('/') ? path.substring(1) : path;
  return `${API_URL}/${cleanPath}`;
};

// إنشاء Supabase client
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const BUCKET_NAME = "vd";

// ─── المكون الفرعي: فيديو واحد ───
const ReelItem = ({
  id, videoUrl, userObj, description, songName,
  likes, comments, isGlobalMuted, toggleMute, onDelete, isAdminUser,
  isActive, shouldPreload 
}) => {
  const [playing, setPlaying] = useState(false);
  const videoRef = useRef(null);

  // استخراج الاسم والصورة الافتراضية بشكل ديناميكي وآمن من الكائن القادم عبر الـ Populate
  const username = userObj?.username || "مستخدم غير معروف";
  const avatarRaw = userObj?.avatar || userObj?.profileImage;
  const avatarUrl = getFullImageUrl(avatarRaw);

  useEffect(() => {
    if (!videoRef.current) return;

    if (isActive) {
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => setPlaying(true))
          .catch((err) => console.log("تم منع التشغيل التلقائي مؤقتاً:", err.message));
      }
    } else {
      videoRef.current.pause();
      setPlaying(false);
    }
  }, [isActive]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (playing) {
      videoRef.current.pause();
    } else {
      videoRef.current.play().catch(() => {});
    }
    setPlaying(!playing);
  };

  return (
    <div className="relative h-screen w-full flex justify-center items-center bg-black overflow-hidden">
      <div className="relative h-full w-full max-w-[500px] bg-black shadow-2xl flex items-center">
        <video
          ref={videoRef}
          className="h-full w-full object-cover cursor-pointer"
          src={videoUrl}
          loop
          onClick={togglePlay}
          playsInline
          muted={isGlobalMuted}
          crossOrigin="anonymous"
          preload={shouldPreload ? "auto" : "none"} 
          controlsList="nodownload"
        />
        
        {!playing && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
            <div className="bg-black/30 p-6 rounded-full backdrop-blur-sm">
              <Play className="w-12 h-12 text-white/80" fill="currentColor" />
            </div>
          </div>
        )}

        <button
          onClick={(e) => { e.stopPropagation(); toggleMute(); }}
          className="absolute bottom-24 left-4 z-40 p-2 bg-black/40 rounded-full text-white backdrop-blur-md hover:bg-black/60 transition-all active:scale-90"
        >
          {isGlobalMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
        </button>

        <div className="absolute right-4 bottom-24 flex flex-col gap-6 items-center z-30">
          {isAdminUser && (
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(id); }}
              className="p-3 bg-red-600/80 hover:bg-red-700 rounded-full text-white backdrop-blur-lg transition-transform active:scale-90 shadow-lg"
            >
              <Trash2 size={24} />
            </button>
          )}
          <div className="flex flex-col items-center gap-1">
            <button className="p-3 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur-lg transition-transform active:scale-90">
              <Heart size={28} className="hover:text-red-500 transition-colors" />
            </button>
            <span className="text-xs text-white font-bold drop-shadow-md">{likes || 0}</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <button className="p-3 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur-lg transition-transform active:scale-90">
              <MessageCircle size={28} />
            </button>
            <span className="text-xs text-white font-bold drop-shadow-md">{comments || 0}</span>
          </div>
          <button className="p-3 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur-lg transition-transform active:scale-90">
            <Share2 size={28} />
          </button>
          
          {/* 🖼️ صورة الحساب التلقائية لكاتب الريلز الحالي */}
          <div className="w-12 h-12 rounded-full border-2 border-primary overflow-hidden shadow-lg mt-2 bg-neutral-800 flex items-center justify-center text-white font-bold">
            {avatarUrl ? (
              <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="text-sm uppercase">{username.charAt(0)}</span>
            )}
          </div>
        </div>

        <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-black/90 via-black/40 to-transparent text-white z-20" dir="rtl">
          <div className="flex items-center gap-3 mb-3 mr-12">
            <span className="font-bold text-lg drop-shadow-lg">@{username}</span>
            <button className="px-4 py-1 text-xs font-semibold border border-white rounded-full hover:bg-white hover:text-black transition-all">
              متابعة
            </button>
          </div>
          <p className="text-sm mb-4 line-clamp-2 drop-shadow-md max-w-[80%] text-right">{description}</p>
          <div className="flex items-center gap-2 text-sm bg-black/30 w-fit px-3 py-1 rounded-full backdrop-blur-sm">
            <Music2 size={14} />
            <span className="overflow-hidden whitespace-nowrap max-w-[120px] inline-block">{songName || "صوت أصلي"}</span>
          </div>
        </div>
      </div>
    </div>
  );
};


// ─── المكون الرئيسي ───
const Reels = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useContext(AuthContext);
  const askConfirm = useConfirm();
  const showToast = useToast();

  const isAdminUser = user && user.role === "admin";

  const [isGlobalMuted, setIsGlobalMuted] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0); 
  const [selectedFile, setSelectedFile] = useState(null);  
  const [activeVideoId, setActiveVideoId] = useState(null);

  // فورم الإضافة مقتصر على الوصف ومقطع الصوت فقط
  const [newReel, setNewReel] = useState({
    description: "",
    songName: ""
  });

  const { data: videoData = [], isLoading } = useQuery({
    queryKey: ['reels'],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/api/reels/`);
      if (!response.ok) throw new Error("فشل جلب الفيديوهات");
      return response.json();
    }
  });

  useEffect(() => {
    if (videoData.length > 0 && !activeVideoId) {
      setActiveVideoId(videoData[0]._id);
    }
  }, [videoData, activeVideoId]);

  useEffect(() => {
    if (videoData.length === 0) return;

    const options = { threshold: 0.6 }; 
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('data-id');
          setActiveVideoId(id);
        }
      });
    }, options);

    const elements = document.querySelectorAll('.reel-container');
    elements.forEach(el => observer.observe(el));

    return () => elements.forEach(el => observer.unobserve(el));
  }, [videoData]);

  const toggleMute = () => setIsGlobalMuted((prev) => !prev);

  const handleDeleteReel = (id) => {
    if (!isAdminUser) return;
    askConfirm(
      "تأكيد الحذف",
      "هل أنت متأكد من حذف هذا الريلز نهائيًا من السيرفر وسوبابيز؟",
      async () => {
        try {
          const token = localStorage.getItem("token");
          const response = await fetch(`${API_URL}/api/reels/${id}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}` }
          });

          if (response.ok) {
            queryClient.setQueryData(['reels'], (oldReels = []) =>
              oldReels.filter((video) => video._id !== id)
            );
            showToast("تم حذف الريلز بنجاح!", "success");
          } else {
            const errData = await response.json();
            showToast(errData.message || "فشل حذف الريلز من السيرفر", "error");
          }
        } catch (error) {
          console.error("Error deleting reel:", error);
          showToast("حدث خطأ أثناء عملية الحذف", "error");
        }
      }
    );
  };

  const handleCreateReel = async (e) => {
    e.preventDefault();
    if (!isAdminUser || !selectedFile) {
      showToast("يرجى اختيار ملف الفيديو أولاً!", "error");
      return;
    }
    setFormLoading(true);
    setUploadProgress(10);
    try {
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `reel_${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(fileName, selectedFile, {
          cacheControl: '3600',
          upsert: false,
          contentType: selectedFile.type,
        });
      if (uploadError) throw new Error(`فشل رفع الفيديو: ${uploadError.message}`);
      setUploadProgress(70);
      const { data: urlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(fileName);
      const videoUrl = urlData.publicUrl;
      setUploadProgress(85);
      const token = localStorage.getItem("token");
      
      const response = await fetch(`${API_URL}/api/reels/`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json", 
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify({ ...newReel, videoUrl })
      });
      if (response.ok) {
        const savedData = await response.json();
        queryClient.setQueryData(['reels'], (oldReels = []) => [savedData, ...oldReels]);
        setUploadProgress(100);
        setIsModalOpen(false);
        setSelectedFile(null);
        setNewReel({ description: "", songName: "" });
        setUploadProgress(0);
        queryClient.invalidateQueries(['reels']);
        showToast("تم نشر الفيديو بنجاح!", "success");
      } else {
        throw new Error("فشل حفظ البيانات في السيرفر");
      }
    } catch (error) {
      console.error("Error:", error);
      showToast(`حدث خطأ: ${error.message}`, "error");
      setUploadProgress(0);
    } finally {
      setFormLoading(false);
    }
  };

  if (isLoading && videoData.length === 0) return <Loader />;

  const activeIndex = videoData.findIndex(v => v._id === activeVideoId);

  return (
    <div className="relative h-screen w-full overflow-y-scroll snap-y snap-mandatory bg-black no-scrollbar scroll-smooth">
      <button onClick={() => navigate("/")} className="fixed top-6 right-6 z-50 p-3 bg-black/40 backdrop-blur-xl border border-white/10 rounded-full text-white hover:bg-black/60 transition-all active:scale-90 shadow-2xl">
        <ArrowRight size={24} />
      </button>

      {isAdminUser && (
        <button onClick={() => setIsModalOpen(true)} className="fixed top-6 left-6 z-50 p-3 bg-blue-600 hover:bg-blue-700 rounded-full text-white transition-all active:scale-90 shadow-2xl">
          <Plus size={24} />
        </button>
      )}

      {/* مودال الرفع المبسط للأدمن */}
      {isAdminUser && isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
          <div className="bg-neutral-900 border border-white/10 text-white w-full max-w-md p-6 rounded-2xl relative shadow-2xl" dir="rtl">
            <button
              onClick={() => { if (!formLoading) { setIsModalOpen(false); setSelectedFile(null); setUploadProgress(0); } }}
              className="absolute top-4 left-4 p-1 text-gray-400 hover:text-white rounded-full bg-white/5"
              disabled={formLoading}
            >
              <X size={20} />
            </button>

            <h3 className="text-xl font-bold mb-4 text-center border-b border-white/10 pb-2">إضافة ريل جديد</h3>

            <form onSubmit={handleCreateReel} className="flex flex-col gap-4">
              <div>
                <label className="text-xs text-gray-400 block mb-1">ملف الفيديو *</label>
                <label className={`flex flex-col items-center justify-center w-full h-28 border-2 border-dashed rounded-xl cursor-pointer transition-all
                  ${selectedFile ? 'border-blue-500 bg-blue-500/10' : 'border-white/20 bg-black/30 hover:border-white/40'}`}
                >
                  <input
                    type="file"
                    accept="video/*"
                    className="hidden"
                    disabled={formLoading}
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) setSelectedFile(file);
                    }}
                  />
                  {selectedFile ? (
                    <div className="text-center px-3">
                      <Upload size={20} className="mx-auto mb-1 text-blue-400" />
                      <p className="text-xs text-blue-300 font-medium truncate max-w-[200px]">{selectedFile.name}</p>
                      <p className="text-xs text-gray-500 mt-1">{(selectedFile.size / (1024 * 1024)).toFixed(1)} MB</p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Upload size={24} className="mx-auto mb-2 text-gray-500" />
                      <p className="text-xs text-gray-400">اضغط لاختيار فيديو</p>
                      <p className="text-xs text-gray-600 mt-1">MP4, MOV, WebM</p>
                    </div>
                  )}
                </label>
              </div>

              {uploadProgress > 0 && (
                <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              )}

              <div>
                <label className="text-xs text-gray-400 block mb-1">وصف الفيديو</label>
                <textarea
                  rows="2"
                  className="w-full bg-black/40 border border-white/10 p-2.5 rounded-xl text-sm text-right focus:outline-none focus:border-blue-500 resize-none"
                  value={newReel.description}
                  onChange={(e) => setNewReel({ ...newReel, description: e.target.value })}
                  disabled={formLoading}
                />
              </div>

              <div>
                <label className="text-xs text-gray-400 block mb-1">اسم الصوت</label>
                <input
                  type="text"
                  className="w-full bg-black/40 border border-white/10 p-2.5 rounded-xl text-sm text-right focus:outline-none focus:border-blue-500"
                  value={newReel.songName}
                  placeholder="صوت أصلي (اختياري)"
                  onChange={(e) => setNewReel({ ...newReel, songName: e.target.value })}
                  disabled={formLoading}
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white p-3 rounded-xl font-bold mt-2 flex justify-center items-center gap-2"
                disabled={formLoading || !selectedFile}
              >
                {formLoading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    جاري الرفع... {uploadProgress}%
                  </>
                ) : "نشر الفيديو الآن 🚀"}
              </button>
            </form>
          </div>
        </div>
      )}

      {videoData.length === 0 ? (
        <div className="h-screen w-full flex items-center justify-center text-gray-400">لا توجد فيديوهات حالياً.</div>
      ) : (
        videoData.map((video, index) => {
          const shouldPreload = index === activeIndex || index === activeIndex + 1;

          return (
            <div key={video._id} data-id={video._id} className="reel-container h-screen w-full snap-start">
              <ReelItem
                id={video._id}
                videoUrl={video.videoUrl}
                userObj={video.userId} // تمرير كائن الـ userId الممتلئ بالكامل (الاسم + الصورة)
                description={video.description}
                songName={video.songName}
                likes={video.likes}
                comments={video.comments}
                isGlobalMuted={isGlobalMuted}
                toggleMute={toggleMute}
                onDelete={handleDeleteReel}
                isAdminUser={isAdminUser}
                isActive={video._id === activeVideoId} 
                shouldPreload={shouldPreload}         
              />
            </div>
          );
        })
      )}
    </div>
  );
};

export default Reels;
