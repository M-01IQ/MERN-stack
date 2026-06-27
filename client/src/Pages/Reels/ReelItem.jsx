import React, { useState, useRef, useEffect } from "react";
import { Heart, MessageCircle, Share2, Music2, Play, Volume2, VolumeX, Trash2 } from "lucide-react";

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

const ReelItem = ({
  id, videoUrl, userObj, description, songName,
  likes, comments, isGlobalMuted, toggleMute, onDelete, isAdminUser,
  isActive, shouldPreload 
}) => {
  const [playing, setPlaying] = useState(false);
  const videoRef = useRef(null);

  // استخراج الاسم والصورة الافتراضية بشكل ديناميكي وآمن
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

export default ReelItem;
