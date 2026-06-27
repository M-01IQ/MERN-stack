import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@supabase/supabase-js'; 
import { AuthContext } from "../../context/AuthContext";
import { useToast } from '../../Component/ui/PopUp/ToastContext';
import { useConfirm } from '../../Component/ui/PopUp/ConfirmContext';

const API_URL = import.meta.env.VITE_API_URL;
const BUCKET_NAME = "vd";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export const useReels = () => {
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

  const [newReel, setNewReel] = useState({
    description: "",
    songName: ""
  });

  // 1. جلب البيانات
  const { data: videoData = [], isLoading } = useQuery({
    queryKey: ['reels'],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/api/reels/`);
      if (!response.ok) throw new Error("فشل جلب الفيديوهات");
      return response.json();
    }
  });

  // 2. تعيين أول فيديو كفيديو نشط تلقائياً
  useEffect(() => {
    if (videoData.length > 0 && !activeVideoId) {
      setActiveVideoId(videoData[0]._id);
    }
  }, [videoData, activeVideoId]);

  // 3. مراقبة التمرير لتحديد الفيديو الظاهر
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

  // 4. منطق حذف الريل
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

  // 5. منطق رفع وإنشاء ريل جديد
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
      
      const response = await fetch(`${API_URL}/api/reels//`, {
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

  const handleCloseModal = () => {
    if (!formLoading) {
      setIsModalOpen(false);
      setSelectedFile(null);
      setUploadProgress(0);
    }
  };

  const activeIndex = videoData.findIndex(v => v._id === activeVideoId);

  return {
    navigate,
    isAdminUser,
    isGlobalMuted,
    isModalOpen,
    setIsModalOpen,
    formLoading,
    uploadProgress,
    selectedFile,
    setSelectedFile,
    activeVideoId,
    newReel,
    setNewReel,
    videoData,
    isLoading,
    activeIndex,
    toggleMute,
    handleDeleteReel,
    handleCreateReel,
    handleCloseModal
  };
};
