import { useNavigate } from "react-router-dom";
import React, { useState, useRef, useEffect } from "react";
import {
  Heart,
  MessageCircle,
  Share2,
  Music2,
  Play,
  Volume2,
  VolumeX,
  ArrowRight
} from "lucide-react";

// --- المكون الفرعي: فيديو واحد ---
const ReelItem = ({
  videoUrl,
  username,
  description,
  songName,
  likes,
  comments,
  avatarUrl,
  isGlobalMuted, // القيمة من الأب
  toggleMute, // دالة التغيير من الأب
}) => {
  const [playing, setPlaying] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    const options = {
      threshold: 0.7, // تشغيل الفيديو عند ظهور 70% منه
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          videoRef.current.play().catch(() => {
          });
          setPlaying(true);
        } else {
          videoRef.current.pause();
          setPlaying(false);
        }
      });
    }, options);

    if (videoRef.current) observer.observe(videoRef.current);

    return () => {
      if (videoRef.current) observer.unobserve(videoRef.current);
    };
  }, []);

  const togglePlay = () => {
    if (playing) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setPlaying(!playing);
  };

  return (
    <div className="relative h-screen w-full flex justify-center items-center bg-black snap-start overflow-hidden">
      {/* حاوية الفيديو */}
      <div className="relative h-full w-full max-w-[500px] bg-black shadow-2xl flex items-center">
        <video
          ref={videoRef}
          className="h-full w-full object-cover cursor-pointer"
          src={videoUrl}
          loop
          onClick={togglePlay}
          playsInline
          muted={isGlobalMuted} // مرتبط بالحالة العالمية
        />

        {/* أيقونة التشغيل المركزية عند التوقف */}
        {!playing && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
            <div className="bg-black/30 p-6 rounded-full backdrop-blur-sm">
              <Play className="w-12 h-12 text-white/80" fill="currentColor" />
            </div>
          </div>
        )}

        {/* زر كتم الصوت العالمي */}
        <button
  onClick={(e) => {
    e.stopPropagation();
    toggleMute(); 
  }}
  className="absolute bottom-24 left-4 z-40 p-2 bg-black/40 rounded-full text-white backdrop-blur-md hover:bg-black/60 transition-all active:scale-90"
>
  {isGlobalMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
</button>

        {/* الأزرار الجانبية */}
        <div className="absolute right-4 bottom-24 flex flex-col gap-6 items-center z-30">
          <div className="flex flex-col items-center gap-1">
            <button className="p-3 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur-lg transition-transform active:scale-90">
              <Heart
                size={28}
                className="hover:text-red-500 transition-colors"
              />
            </button>
            <span className="text-xs text-white font-bold drop-shadow-md">
              {likes}
            </span>
          </div>

          <div className="flex flex-col items-center gap-1">
            <button className="p-3 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur-lg transition-transform active:scale-90">
              <MessageCircle size={28} />
            </button>
            <span className="text-xs text-white font-bold drop-shadow-md">
              {comments}
            </span>
          </div>

          <button className="p-3 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur-lg transition-transform active:scale-90">
            <Share2 size={28} />
          </button>

          <div className="w-12 h-12 rounded-full border-2 border-primary overflow-hidden shadow-lg mt-2">
            <img
              src={avatarUrl}
              alt="avatar"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* معلومات الفيديو */}
        <div
          className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-black/90 via-black/40 to-transparent text-white z-20"
          dir="rtl"
        >
          <div className="flex items-center gap-3 mb-3 mr-12">
            <span className="font-bold text-lg drop-shadow-lg">
              @{username}
            </span>
            <button className="px-4 py-1 text-xs font-semibold border border-white rounded-full hover:bg-white hover:text-black transition-all">
              متابعة
            </button>
          </div>

          <p className="text-sm mb-4 line-clamp-2 drop-shadow-md max-w-[80%] text-right">
            {description}
          </p>

          <div className="flex items-center gap-2 text-sm bg-black/30 w-fit px-3 py-1 rounded-full backdrop-blur-sm">
            <Music2 size={14} className="animate-spin-slow" />
            <span className="overflow-hidden whitespace-nowrap max-w-[120px] inline-block">
              {songName}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

const Reels = () => {
  const navigate = useNavigate(); // تعريف الـ navigate
  const [isGlobalMuted, setIsGlobalMuted] = useState(true);

  const toggleMute = () => {
    setIsGlobalMuted((prev) => !prev);
  };

  const videoData = [
    {
      id: 1,
      videoUrl:
        "https://ackbctzmmrrvckpkdvpj.supabase.co/storage/v1/object/sign/vd/VID_20260404_142517.mp4?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV80ODhkMTlmNC0xMWY4LTQ1NWYtYmRmOS0yYjEzNjMyYTAzYTUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJ2ZC9WSURfMjAyNjA0MDRfMTQyNTE3Lm1wNCIsImlhdCI6MTc3NjM2NTE4MCwiZXhwIjoxODA3OTAxMTgwfQ.1xQJtjbCeQe_K_q2dLL_Pdc--JRQNx3N6f5VVsgn8OU",
      username: "𝙼𝚄𝚂𝚃𝙰𝙵𝙰",
      description:"لبنان",
      songName: "Relaxing Music - Artist",
      likes: "165",
      comments: "32",
      avatarUrl:
        "https://ik.imagekit.io/2vom8qfmg/images/profile.jpg",
    },
    {
      id: 2,
      videoUrl:
        "https://ackbctzmmrrvckpkdvpj.supabase.co/storage/v1/object/sign/vd/VID_20260404_142540.mp4?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV80ODhkMTlmNC0xMWY4LTQ1NWYtYmRmOS0yYjEzNjMyYTAzYTUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJ2ZC9WSURfMjAyNjA0MDRfMTQyNTQwLm1wNCIsImlhdCI6MTc3NjM2NTQ1NSwiZXhwIjoxODA3OTAxNDU1fQ.FSZadreZthsM3UI3STilkoc-UFNCF5CFvz01NjPPC3g",
      username: "𝙼𝚄𝚂𝚃𝙰𝙵𝙰",
      description:"الوعد الصادق",
      songName: "Relaxing Music - Artist",
      likes: "78",
      comments: "35",
      avatarUrl:
        "https://ik.imagekit.io/2vom8qfmg/images/profile.jpg",
    },
    {
      id: 3,
      videoUrl:
        "https://ackbctzmmrrvckpkdvpj.supabase.co/storage/v1/object/sign/vd/null(MP4)_1.mp4?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV80ODhkMTlmNC0xMWY4LTQ1NWYtYmRmOS0yYjEzNjMyYTAzYTUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJ2ZC9udWxsKE1QNClfMS5tcDQiLCJpYXQiOjE3NzY4ODM2MTcsImV4cCI6NDU1MjA1MTYxN30.TgrqvR7F_Q5gwGh5ZZ2T1i5grn6u2TkE6rpN9ILRXo0",
      username: "𝙼𝚄𝚂𝚃𝙰𝙵𝙰",
      description:"🚀",
      songName: "Relaxing Music - Artist",
      likes: "47",
      comments: "5",
      avatarUrl:
        "https://ik.imagekit.io/2vom8qfmg/images/profile.jpg",
    },
  ];

  return (
    <div className="relative h-screen w-full overflow-y-scroll snap-y snap-mandatory bg-black no-scrollbar scroll-smooth">
      
      {/* زر الرجوع العائم */}
      <button 
        onClick={() => navigate("/")} 
        className="fixed top-6 right-2 z-50 p-3 bg-black/20 backdrop-blur-xl border border-white/10 rounded-full text-white hover:bg-black/40 transition-all active:scale-90 shadow-2xl"
      >
        <ArrowRight size={28} />
      </button>

      {videoData.map((video) => (
        <ReelItem
          key={video.id}
          {...video}
          isGlobalMuted={isGlobalMuted}
          toggleMute={toggleMute}
        />
      ))}
    </div>
  );
};

export default Reels;