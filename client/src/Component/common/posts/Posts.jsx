import { io } from "socket.io-client";
import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../../context/AuthContext";
import { useToast } from '../../ui/PopUp/ToastContext';
import { useConfirm } from "../../ui/PopUp/ConfirmContext";
import Loader from "../../common/Loader";
import API from "../../../api/axiosInstance"; 
import { FaSearch, FaPlus } from 'react-icons/fa';

// 🟢 استيراد الـ Hooks الخاصة بإدارة الكاش
import { useQuery, useQueryClient } from '@tanstack/react-query';

import PostCard from "./PostCard";
import PostForm from "./PostForm";

const socket = io(import.meta.env.VITE_API_URL, {
  transports: ["websocket"],
  withCredentials: true
});

function Posts() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { user } = useContext(AuthContext);
  const askConfirm = useConfirm();
  const showToast = useToast();
  const queryClient = useQueryClient(); // 🟢 محرك التحكم في كاش التطبيق
  
  const [searchTerm, setSearchTerm] = useState("");
  const [editId, setEditId] = useState(null);
  const [formLoading, setFormLoading] = useState(false); // لودينج خاص بأزرار الفورم فقط
  const [preview, setPreview] = useState(null); 
  const [file, setFile] = useState(null);
  const [formData, setFormData] = useState({ title: "", avatar: "", text: "", fileId: "" });

  // 🟢 جلب المنشورات وحفظها في الكاش تلقائياً (تستبدل fetchPosts بالكامل)
  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['posts'], // المعرف الفريد لكاش المنشورات
    queryFn: async () => {
      const res = await API.get("/posts");
      return res.data;
    }
  });

  // الجلب والتحديث الفوري عبر socket.io بالتزامن مع الكاش العالمي
  useEffect(() => {
    // الاستماع للمنشورات الجديدة وتحديث الكاش فوراً
    socket.on("newPost", (newPostFromServer) => {
      queryClient.setQueryData(['posts'], (oldPosts = []) => {
        if (oldPosts.some(p => p._id === newPostFromServer._id)) return oldPosts;
        return [newPostFromServer, ...oldPosts];
      });
    });

    // الاستماع لحذف المنشورات وتحديث الكاش فوراً
    socket.on("post_deleted", (deletedId) => {
      queryClient.setQueryData(['posts'], (oldPosts = []) => 
        oldPosts.filter(post => post._id !== deletedId)
      );
    });

    // الاستماع لتحديث اللايكات وتحديث الكاش فوراً
    socket.on("post_likes_updated", ({ postId, likes }) => {
      queryClient.setQueryData(['posts'], (oldPosts = []) => 
        oldPosts.map(p => p._id === postId ? { ...p, likes: likes } : p)
      );
    });

    // الاستماع لتعديل المنشورات وتحديث الكاش فوراً
    socket.on("post_updated", (updatedPostFromServer) => {
      queryClient.setQueryData(['posts'], (oldPosts = []) => 
        oldPosts.map(p => p._id === updatedPostFromServer._id ? updatedPostFromServer : p)
      );
    });

    return () => {
      socket.off("newPost");
      socket.off("post_deleted");
      socket.off("post_likes_updated");
      socket.off("post_updated");
    };
  }, [queryClient]);

  // دالة تفريغ الفورمة
  const resetForm = () => {
    setEditId(null);
    setFile(null);
    setPreview(null);
    setFormData({ title: "", avatar: "", text: "", fileId: "" });
    setIsFormOpen(false);
  };

  // دالة تعديل المنشور
  const handleEditClick = (post) => {
    setEditId(post._id);
    setFormData({ title: post.title, text: post.text, avatar: post.avatar, fileId: post.fileId });
    setIsFormOpen(true);
  };

  // دالة الحذف المنشور
  const handleDeleteClick = (post) => {
    askConfirm(
      "تأكيد الحذف", 
      `هل أنت متأكد من حذف المنشور "${post.title}"؟ لا يمكن التراجع عن هذا الإجراء.`, 
      async () => {
        try {
          await API.delete(`/deletePost/${post._id}`);
          // تحديث الكاش محلياً فوراً لحذف المنشور بصرياً بسرعة
          queryClient.setQueryData(['posts'], (old) => old.filter(p => p._id !== post._id));
          showToast("تم الحذف بنجاح", "success");
        } catch (err) {
          showToast("خطأ في عملية الحذف", "error");
        }
      }
    );
  };

  // دالة اضافة وتعديل المنشور
  const submitData = async () => {
    const { title, text } = formData;
    if (!title || !text) return showToast("يرجى ملء جميع الحقول المطلوبة", "error");
    setFormLoading(true);
    try {
      let finalAvatarUrl = formData.avatar;
      let imageKitFileId = formData.fileId;

      if (file) {
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

      const postData = { ...formData, avatar: finalAvatarUrl, fileId: imageKitFileId };
      
      if (editId) {
        await API.put(`/UpdatePost/${editId}`, postData);
        showToast("تم التعديل بنجاح", "success");
      } else {
        await API.post("/newpost", postData);
        showToast("تم النشر بنجاح", "success");
      }
      
      // 🟢 أمر سحري: يخبر الكاش بأن يقوم بعمل تحديث صامت في الخلفية للبيانات
      queryClient.invalidateQueries(['posts']);
      resetForm();
    } catch (err) {
      showToast(err.message || "حدث خطأ ما", "error");
    } finally {
      setFormLoading(false);
    }
  };

  const filtered = posts.filter(u => 
    u.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.text?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div dir="rtl" className="min-h-screen bg-base-200 pb-2 font-sans w-full relative">
      
      {/* الزر العائم للأدمن */}
      {user?.role === "admin" && (
        <button 
          onClick={() => setIsFormOpen(true)} 
          className="fixed bottom-20 right-6 z-50 btn btn-primary btn-circle btn-lg shadow-2xl hover:scale-110 transition-all cursor-pointer opacity-50"
          title="إضافة منشور جديد"
        >
          <FaPlus size={22} className="text-white" />
        </button>
      )}

      {/* نافذة الفورم العائمة (Modal) */}
      {user?.role === "admin" && isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-base-100 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-base-300 relative">
            <button onClick={resetForm} className="btn btn-sm btn-circle btn-ghost absolute left-4 top-4 z-10">✕</button>

            <PostForm 
              editId={editId}
              formData={formData}
              setFormData={setFormData}
              preview={preview}
              setPreview={setPreview}
              setFile={setFile}
              loading={formLoading}
              onSubmit={submitData}
              onReset={resetForm}
            />
          </div>
        </div>
      )}
      
      <div className="max-w-4xl mx-auto px-0">
        {/* خانة البحث */}
        <div className="px-2 py-2">
          <div className="relative">
            <FaSearch className="absolute right-3 top-3.5 text-base-content/40" />
            <input type="text" placeholder="ابحث عن منشور..." className="input input-bordered w-full pr-10 rounded-xl" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
        </div>

        {/* 🟢 عرض المنشورات الذكي: الـ Loader يظهر لأول مرة في تاريخ فتح التطبيق فقط! */}
        {isLoading && posts.length === 0 ? (
          <Loader />
        ) : (
          <div className="flex flex-col gap-0.5 items-center">
            {filtered.map((post) => (
              <PostCard 
                key={post._id}
                post={post}
                user={user}
                onEdit={handleEditClick}
                onDelete={handleDeleteClick}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Posts;
