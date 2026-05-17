import { useNavigate } from "react-router-dom";
import React, { useState, useRef, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import {
  Heart,
  MessageCircle,
  Share2,
  Music2,
  Play,
  Volume2,
  VolumeX,
  ArrowRight,
  Trash2,
  Plus,
  X
} from "lucide-react";

const API_URL = "http://localhost:8080/api/reels";

// --- المكون الفرعي: فيديو واحد ---
const ReelItem = ({
  id,
  videoUrl,
  username,
  description,
  songName,
  likes,
  comments,
  avatarUrl,
  isGlobalMuted,
  toggleMute,
  onDelete,
  isAdminUser // استلام حالة الأدمن كـ Prop
}) => {
  const [playing, setPlaying] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
  const options = { threshold: 0.7 };
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      // 🟢 إضافة التحقق هنا لمنع خطأ الـ null pointer
      if (videoRef.current) { 
        if (entry.isIntersecting) {
          videoRef.current.play().catch(() => {});
          setPlaying(true);
        } else {
          videoRef.current.pause(); // 👈 هنا كان يحدث الانهيار والآن أصبح محمياً
          setPlaying(false);
        }
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
      <div className="relative h-full w-full max-w-[500px] bg-black shadow-2xl flex items-center">
        <video
          ref={videoRef}
          className="h-full w-full object-cover cursor-pointer"
          src={videoUrl}
          loop
          onClick={togglePlay}
          playsInline
          muted={isGlobalMuted}
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

        {/* الأزرار الجانبية */}
        <div className="absolute right-4 bottom-24 flex flex-col gap-6 items-center z-30">
          
          {/* 🔒 زر الحذف: يظهر فقط إذا كان المستخدم المسجل حالياً Admin */}
          {isAdminUser && (
            <button 
              onClick={(e) => { e.stopPropagation(); onDelete(id); }}
              className="p-3 bg-red-600/80 hover:bg-red-700 rounded-full text-white backdrop-blur-lg transition-transform active:scale-90 shadow-lg"
              title="حذف الفيديو"
            >
              <Trash2 size={24} />
            </button>
          )}

          <div className="flex flex-col items-center gap-1">
            <button className="p-3 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur-lg transition-transform active:scale-90">
              <Heart size={28} className="hover:text-red-500 transition-colors" />
            </button>
            <span className="text-xs text-white font-bold drop-shadow-md">{likes}</span>
          </div>

          <div className="flex flex-col items-center gap-1">
            <button className="p-3 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur-lg transition-transform active:scale-90">
              <MessageCircle size={28} />
            </button>
            <span className="text-xs text-white font-bold drop-shadow-md">{comments}</span>
          </div>

          <button className="p-3 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur-lg transition-transform active:scale-90">
            <Share2 size={28} />
          </button>

          <div className="w-12 h-12 rounded-full border-2 border-primary overflow-hidden shadow-lg mt-2">
            <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
          </div>
        </div>

        {/* معلومات الفيديو */}
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
            <span className="overflow-hidden whitespace-nowrap max-w-[120px] inline-block">{songName}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- المكون الرئيسي ---
const Reels = () => {
  const navigate = useNavigate();
  
  // 3. استهلاك التوكن وبيانات المستخدم من الكونتكس
  const { user } = useContext(AuthContext); 
  
  // 4. التحقق مما إذا كان حساب المستخدم الحالي هو أدمن بالفعل (تأكد من تسمية الحقل 'admin' في قاعدة بياناتك)
  const isAdminUser = user && user.role === "admin"; 

  const [videoData, setVideoData] = useState([]);
  const [isGlobalMuted, setIsGlobalMuted] = useState(true);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newReel, setNewReel] = useState({
    videoUrl: "",
    username: "",
    description: "",
    songName: ""
  });

  useEffect(() => {
    fetchReels();
  }, []);

  const fetchReels = async () => {
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      setVideoData(data);
    } catch (error) {
      console.error("Error fetching reels:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleMute = () => {
    setIsGlobalMuted((prev) => !prev);
  };

  const handleDeleteReel = async (id) => {
    if (!isAdminUser) return;

    if (window.confirm("هل أنت متأكد من حذف هذا الريل نهائياً؟")) {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_URL}/${id}`, { 
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        if (response.ok) {
          setVideoData((prev) => prev.filter((video) => video._id !== id));
        }
      } catch (error) {
        console.error("Error deleting reel:", error);
      }
    }
  };

  const handleCreateReel = async (e) => {
    e.preventDefault();
    if (!isAdminUser) return;

    if (!newReel.videoUrl || !newReel.username) {
      alert("يرجى ملء كافة الحقول الإلزامية!");
      return;
    }

    try {
      // إرسال التوكن مع طلب النشر
      const token = localStorage.getItem("token");
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(newReel)
      });

      if (response.ok) {
        const savedData = await response.json();
        setVideoData((prev) => [savedData, ...prev]);
        setIsModalOpen(false);
        setNewReel({ videoUrl: "", username: "", description: "", songName: "" });
        alert("تم نشر الفيديو بنجاح! 🎉");
      }
    } catch (error) {
      console.error("Error creating reel:", error);
    }
  };

  if (loading) {
    return (
      <div className="h-screen w-full bg-black flex items-center justify-center text-white text-xl">
        جاري تحميل الفيديوهات...
      </div>
    );
  }

  return (
    <div className="relative h-screen w-full overflow-y-scroll snap-y snap-mandatory bg-black no-scrollbar scroll-smooth">
      
      {/* زر الرجوع */}
      <button 
        onClick={() => navigate("/")} 
        className="fixed top-6 right-6 z-50 p-3 bg-black/40 backdrop-blur-xl border border-white/10 rounded-full text-white hover:bg-black/60 transition-all active:scale-90 shadow-2xl"
      >
        <ArrowRight size={24} />
      </button>

      {/* 🔒 زر الرفع (+): يظهر فقط وفقط إذا كان المستخدم أدمن */}
      {isAdminUser && (
        <button 
          onClick={() => setIsModalOpen(true)} 
          className="fixed top-6 left-6 z-50 p-3 bg-blue-600 hover:bg-blue-700 rounded-full text-white transition-all active:scale-90 shadow-2xl flex items-center justify-center"
          title="إضافة فيديو جديد"
        >
          <Plus size={24} />
        </button>
      )}

      {/* نافذة الرفع المنبثقة للأدمن */}
      {isAdminUser && isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
          <div className="bg-neutral-900 border border-white/10 text-white w-full max-w-md p-6 rounded-2xl relative shadow-2xl" dir="rtl">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 left-4 p-1 text-gray-400 hover:text-white rounded-full bg-white/5">
              <X size={20} />
            </button>
            <h3 className="text-xl font-bold mb-4 text-center border-b border-white/10 pb-2">إضافة ريل (Reel) جديد</h3>
            <form onSubmit={handleCreateReel} className="flex flex-col gap-4">
              <div>
                <label className="text-xs text-gray-400 block mb-1">اسم المستخدم *</label>
                <input 
                  type="text" 
                  className="w-full bg-black/40 border border-white/10 p-2.5 rounded-xl text-sm text-right focus:outline-none focus:border-blue-500"
                  value={newReel.username}
                  onChange={(e) => setNewReel({...newReel, username: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1">رابط الفيديو *</label>
                <input 
                  type="url" 
                  className="w-full bg-black/40 border border-white/10 p-2.5 rounded-xl text-sm text-left focus:outline-none focus:border-blue-500"
                  value={newReel.videoUrl}
                  onChange={(e) => setNewReel({...newReel, videoUrl: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1">وصف الفيديو</label>
                <textarea 
                  rows="2"
                  className="w-full bg-black/40 border border-white/10 p-2.5 rounded-xl text-sm text-right resize-none focus:outline-none focus:border-blue-500"
                  value={newReel.description}
                  onChange={(e) => setNewReel({...newReel, description: e.target.value})}
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1">اسم الصوت</label>
                <input 
                  type="text" 
                  className="w-full bg-black/40 border border-white/10 p-2.5 rounded-xl text-sm text-right focus:outline-none focus:border-blue-500"
                  value={newReel.songName}
                  onChange={(e) => setNewReel({...newReel, songName: e.target.value})}
                />
              </div>
              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-xl font-bold mt-2">
                نشر الفيديو الآن 🚀
              </button>
            </form>
          </div>
        </div>
      )}

      {/* عرض الفيديوهات */}
      {videoData.length === 0 ? (
        <div className="h-screen w-full flex items-center justify-center text-gray-400">
          لا توجد فيديوهات حالياً.
        </div>
      ) : (
        videoData.map((video) => (
          <ReelItem
            key={video._id}
            id={video._id}
            {...video}
            isGlobalMuted={isGlobalMuted}
            toggleMute={toggleMute}
            onDelete={handleDeleteReel}
            isAdminUser={isAdminUser}
          />
        ))
      )}
    </div>
  );
};

export default Reels;
