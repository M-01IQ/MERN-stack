import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { io } from "socket.io-client";
import API from '../../api/axiosInstance';
import PostCard from '../../Component/common/posts/PostCard';
import PostForm from '../../Component/common/posts/PostForm';
import { useConfirm } from "../../Component/ui/PopUp/ConfirmContext";
import { useToast } from '../../Component/ui/PopUp/ToastContext';
// ربط السوكت للتحديث اللحظي داخل البروفايل أيضاً
const socket = io(import.meta.env.VITE_API_URL, {
  transports: ["websocket"],
  withCredentials: true
});

const UserPosts = ({ userId, user }) => {
  const queryClient = useQueryClient();
    //دالة التأكيد
  const askConfirm = useConfirm();
  //دالة الاشعار
  const showToast = useToast();
  
  // إدارة تشغيل الصوت والفيديوهات بشكل مركزي للمنشورات الشخصية
  const [activePostId, setActivePostId] = useState(null);
  const [isAllMuted, setIsAllMuted] = useState(true);

  // حالات الـ Modal والتحكم بالفورم المستورد لتعديل المنشور
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingPostId, setEditingPostId] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [formData, setFormData] = useState({ text: "", avatar: "", fileId: "", videoUrl: "", mediaType: "image" });

  // 1️⃣ جلب منشورات هذا المستخدم فقط من السيرفر مباشرة
  const { data: userPosts = [], isLoading } = useQuery({
    queryKey: ['userPosts', userId], 
    queryFn: async () => {
      const res = await API.get(`/posts/user/${userId}`); 
      return res.data;
    },
    enabled: !!userId, 
  });

  // 2️⃣ التحديث الفوري عبر الـ WebSockets لمنشورات البروفايل فقط
  useEffect(() => {
    if (!userId) return;

    socket.on("post_deleted", (deletedId) => {
      queryClient.setQueryData(['userPosts', userId], (old = []) => old.filter(p => p._id !== deletedId));
    });

    socket.on("post_likes_updated", ({ postId, likes }) => {
      queryClient.setQueryData(['userPosts', userId], (old = []) => 
        old.map(p => p._id === postId ? { ...p, likes: likes } : p)
      );
    });

    socket.on("post_updated", (updatedPost) => {
      queryClient.setQueryData(['userPosts', userId], (old = []) => 
        old.map(p => p._id === updatedPost._id ? updatedPost : p)
      );
    });

    return () => {
      socket.off("post_deleted");
      socket.off("post_likes_updated");
      socket.off("post_updated");
    };
  }, [queryClient, userId]);

  // تجهيز البيانات عند الضغط على تعديل
  const handleEditClick = (post) => {
    setEditingPostId(post._id);
    setFormData({
      text: post.text || "",
      avatar: post.mediaType !== "video" ? post.avatar || "" : "",
      fileId: post.fileId || "",
      videoUrl: post.mediaType === "video" ? post.videoUrl || "" : "",
      mediaType: post.mediaType || "image"
    });
    setPreview(post.mediaType === "video" ? post.videoUrl : post.avatar);
    setFile(null);
    setIsEditModalOpen(true);
  };

  const handleResetForm = () => {
    setIsEditModalOpen(false);
    setEditingPostId(null);
    setFile(null);
    setPreview(null);
    setFormData({ text: "", avatar: "", fileId: "", videoUrl: "", mediaType: "image" });
  };

  // إرسال التعديل للسيرفر (بنفس منطق صفحة Posts المتقدم)
  const handleUpdateSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!formData.text.trim()) return alert("لا يمكن ترك محتوى المنشور فارغاً");

    setFormLoading(true);
    try {
      let finalAvatarUrl = formData.avatar;
      let imageKitFileId = formData.fileId;

      if (file && formData.mediaType !== "video") {
        const authRes = await API.get('/imagekitRoutes');
        const authData = authRes.data;
        const uploadData = new FormData();
        uploadData.append("file", file);
        uploadData.append("fileName", file.name);
        uploadData.append("folder", "/posts");
        uploadData.append("publicKey", "public_8blKLRTsq6BkdVQ5OMD+OGPzNSM=");
        uploadData.append("signature", authData.signature);
        uploadData.append("expire", authData.expire.toString());
        uploadData.append("token", authData.token);

        const imgResponse = await fetch('https://upload.imagekit.io/api/v1/files/upload', { method: 'POST', body: uploadData });
        const imgResult = await imgResponse.json();
        if (!imgResponse.ok) throw new Error("فشل رفع الصورة");
        finalAvatarUrl = imgResult.url;
        imageKitFileId = imgResult.fileId; 
      }

      const updatePayload = {
        text: formData.text,
        mediaType: formData.mediaType,
        avatar: formData.mediaType === "video" ? "" : finalAvatarUrl,
        fileId: formData.mediaType === "video" ? "" : imageKitFileId,
        videoUrl: formData.mediaType === "video" ? formData.videoUrl : ""
      };

      await API.put(`/UpdatePost/${editingPostId}`, updatePayload);
      
      // تحديث كاش البروفايل فوراً
      queryClient.invalidateQueries(['userPosts', userId]);
      handleResetForm();
    } catch (err) {
      console.error(err);
      alert(err.message || "حدث خطأ ما");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = (post) => {
  askConfirm(
    "تأكيد الحذف", 
    `هل أنت متأكد من حذف هذا المنشور؟ لا يمكن التراجع عن هذا الإجراء.`, 
    async () => {
      try {
        // إرسال طلب الحذف للسيرفر
        await API.delete(`/deletePost/${post._id}`);
        
        // تحديث كاش المتصفح فوراً ليختفي المنشور سلسلاً
        queryClient.setQueryData(['userPosts', userId], (old = []) => 
          old.filter(p => p._id !== post._id)
        );
        
        // إظهار تنبيه النجاح المخصص للتطبيق
        showToast("تم حذف المنشور بنجاح", "success");
      } catch (err) {
        console.error(err);
        showToast("حدث خطأ أثناء عملية الحذف", "error");
      }
    }
  );
};


  if (isLoading) {
    return (
      <div className="flex justify-center py-12"><span className="loading loading-spinner loading-md text-primary"></span></div>
    );
  }

  if (userPosts.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 bg-base-100 rounded-2xl shadow-sm border border-base-200">لم تقم بنشر أي شيء بعد.</div>
    );
  }

  return (
    <div className="space-y-4 mt-6 text-right" dir="rtl">
      <h3 className="text-xl font-bold mb-4 text-neutral px-1">منشوراتي ({userPosts.length})</h3>
      
      <div className="flex flex-col gap-3">
        {userPosts.map((post) => (
          <PostCard 
            key={post._id}
            post={post}
            user={user} // يسمح للمستخدم العادي بالتحكم بمنشوراته داخل بروفايله
            onEdit={handleEditClick}
            onDelete={handleDelete}
            isAllMuted={isAllMuted}
            setIsAllMuted={setIsAllMuted}
            activePostId={activePostId}
            setActivePostId={setActivePostId}
          />
        ))}
      </div>

      {/* النافذة المنبثقة للتعديل تفتح وتغلق هنا بشكل معزول وآمن */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-base-100 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-base-300 relative">
            <button onClick={handleResetForm} className="btn btn-sm btn-circle btn-ghost absolute left-4 top-4 z-10">✕</button>
            <PostForm 
              editId={editingPostId}
              formData={formData}
              setFormData={setFormData}
              preview={preview}
              setPreview={setPreview}
              setFile={setFile}
              loading={formLoading}
              onSubmit={handleUpdateSubmit}
              onReset={handleResetForm}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default UserPosts;
