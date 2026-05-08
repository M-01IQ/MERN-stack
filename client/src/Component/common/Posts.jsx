import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useToast } from '../ui/ToastContext';
import API from "../../api/axiosInstance"; 
import { FaHeart, FaRegHeart, FaEdit, FaTrashAlt, FaPlus, FaSearch, FaExclamationTriangle, FaRegComment, FaShareAlt } from 'react-icons/fa';

function Posts() {
  const { user } = useContext(AuthContext);
  const [posts, setPosts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // States للصور والبيانات
  const [preview, setPreview] = useState(null); 
  const [file, setFile] = useState(null);
  const [formData, setFormData] = useState({ title: "", avatar: "", text: "", fileId: "" });
  
  const showToast = useToast();
  const [showModal, setShowModal] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);

  // --- دالة معالجة اختيار الملف والمعاينة ---
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      // إنشاء رابط للمعاينة يظهر فوراً للمستخدم
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await API.get("/posts");
      setPosts(res.data);
    } catch (err) {
      showToast("خطأ في جلب المنشورات", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const submitData = async () => {
    const { title, text } = formData;
    if (!title || !text) return showToast("يرجى ملء جميع الحقول المطلوبة", "error");

    setLoading(true);
    try {
      let finalAvatarUrl = formData.avatar;
      let imageKitFileId = formData.fileId;

      // رفع الصورة لـ ImageKit فقط إذا تم اختيار ملف جديد
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

        const imgResponse = await fetch('https://upload.imagekit.io/api/v1/files/upload', {
          method: 'POST',
          body: uploadData,
        });

        const imgResult = await imgResponse.json();
        if (!imgResponse.ok) throw new Error("فشل رفع الصورة");
        
        finalAvatarUrl = imgResult.url;
        imageKitFileId = imgResult.fileId; 
      }

      const postData = { ...formData, avatar: finalAvatarUrl, fileId: imageKitFileId };
      
      if (editId) {
  const res = await API.put(`/UpdatePost/${editId}`, postData);
  // تحديث محلي للمنشور المعدل فقط
  setPosts(posts.map(u => u._id === editId ? res.data : u));
  showToast("تم التعديل بنجاح", "success");
} else {
  const res = await API.post("/newpost", postData);
  
  // تحديث محلي: أضف المنشور الجديد الذي رجع من السيرفر إلى القائمة فوراً
  // هكذا لن تحتاج لاستدعاء fetchPosts() ولن تلاحظ أي إعادة تحميل
  setPosts(prev => [res.data, ...prev]); 
  
  showToast("تم النشر بنجاح", "success");
}

resetForm(); // تفريغ الخانات
    } catch (err) {
      showToast(err.message || "حدث خطأ ما", "error");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEditId(null);
    setFile(null);
    setPreview(null); // مسح المعاينة
    setFormData({ title: "", avatar: "", text: "", fileId: "" });
  };

  const deletePost = async () => {
    try {
      await API.delete(`/deletePost/${postToDelete._id}`);
      setPosts(posts.filter(u => u._id !== postToDelete._id));
      showToast(`تم الحذف بنجاح`, "success");
      setShowModal(false);
    } catch {
      showToast("خطأ في الحذف", "error");
    }
  };

  const filtered = posts.filter(u => 
    u.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.text?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div dir="rtl" className="min-h-screen bg-base-200 pb-24 font-sans w-full">
      {user?.role === "admin" && (
        <div className="bg-base-100 border-b border-base-300 px-4 py-6 shadow-sm">
          <div className="max-w-2xl mx-auto space-y-4">
            <h2 className="text-xl font-black flex items-center gap-2">
              {editId ? <FaEdit className="text-warning" /> : <FaPlus className="text-success" />}
              {editId ? "تعديل المنشور" : "إضافة منشور جديد"}
            </h2>

            <input className="input input-bordered w-full" type="text" placeholder="عنوان المنشور" 
              value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
            
            <textarea className="textarea textarea-bordered w-full" placeholder="المحتوى..." 
              value={formData.text} onChange={e => setFormData({...formData, text: e.target.value})}></textarea>
              
              
              <div className="flex flex-col gap-4 w-full">
                {(preview || formData.avatar) && (
                <div className="relative w-32 h-32 self-center group">
                  <img 
                  src={preview || formData.avatar} 
                  alt="Preview" 
                  className="w-full h-full object-cover rounded-2xl shadow-md border-2 border-base-300 transition-transform group-hover:scale-105" />
                  <button 
                  type="button"
                  onClick={() => { setFile(null); setPreview(null); setFormData({...formData, avatar: "", fileId: ""}); }}
                  className="btn btn-circle btn-error btn-xs absolute -top-2 -left-2 shadow-lg"
                  >
                    ✕
                    </button>
                  </div>)}
                  <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-base-300 rounded-2xl cursor-pointer hover:bg-base-200 transition-all group">
                    <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-full group-hover:scale-110 transition-transform">
                    <FaPlus className="text-primary" />
                    </div>
                    <p className="text-sm text-base-content/60 font-bold">
                      {(preview || formData.avatar) ? "تغيير الصورة المختارة" : "إضافة صورة للمنشور"}
                    </p>
                    </div>
                    <input 
                    type="file" 
                    className="hidden" 
                    onChange={handleFileChange} 
                    accept="image/*"/>
                  </label>
                </div>


            <div className="flex gap-2 pt-2">
              <button className={`btn flex-1 ${editId ? "btn-warning" : "btn-success text-white"}`} 
                onClick={submitData} disabled={loading}>
                {loading ? <span className="loading loading-spinner"></span> : (editId ? "تأكيد التعديل" : "حفظ المنشور")}
              </button>
              {editId && <button className="btn btn-ghost" onClick={resetForm}>إلغاء</button>}
            </div>
          </div>
        </div>
      )}

      {/* باقي الكود (البحث والقائمة والمودال) يبقى كما هو في ملفك الأصلي */}
      <div className="max-w-4xl mx-auto px-4 mt-6">
          {/* ... كود البحث و posts.map ... */}
          {/* تأكد من استخدام filtered.map لعرض المنشورات */}
          <div className="flex flex-col gap-3 items-center">
            
            {filtered.map((post) => (
  <div key={post._id} className="card w-full  bg-base-100 shadow-[0_10px_30px_rgba(0,0,0,0.05)] border border-base-200 rounded-2xl overflow-hidden mb-4">
    {/* صورة المنشور */}
    <figure className="w-full h-72 overflow-hidden">
      <img className="w-full h-full object-cover" src={post.avatar || "https://ui-avatars.com/api/?name=" + post.title} alt="post" />
    </figure>

    <div className="card-body p-3">
      <h2 className="card-title text-xl font-black mb-2">{post.title}</h2>
      
      {/* الحفاظ على المسافات والأسطر كما كتبها المستخدم */}
      <p className="text-base-content/70 leading-relaxed whitespace-pre-wrap break-words text-right mb-6">
        {post.text}
      </p>
      
      {/* شريط التفاعل - أيقونات فقط */}
      <div className="flex items-center justify-between pt-2 border-t border-base-200">
        <div className="flex items-center gap-4">
          {/* زر الإعجاب */}
          <button className="group flex items-center gap-1.5 text-gray-500 hover:text-error transition-all">
            <div className="p-2 rounded-full group-hover:bg-error/10">
              <FaRegHeart size={22} />
            </div>
            <span className="text-sm font-bold">{post.likes?.length || 0}</span>
          </button>

          {/* زر التعليق - أيقونة فقط */}
          <button className="group flex items-center gap-1.5 text-gray-500 hover:text-primary transition-all">
            <div className="p-2 rounded-full group-hover:bg-primary/10">
              <FaRegComment size={22} />
            </div>
            <span className="text-sm font-bold">0</span>
          </button>
        </div>

        {/* زر المشاركة - أيقونة فقط */}
        <button className="group text-gray-500 hover:text-success transition-all">
          <div className="p-2 rounded-full group-hover:bg-success/10">
            <FaShareAlt size={20} />
          </div>
        </button>
      </div>

      {/* أدوات التحكم للآدمن (تعديل وحذف) */}
      {user?.role === "admin" && (
        <div className="flex justify-end gap-3 mt-4 pt-3 border-t border-dashed border-base-200">
          <button className="btn btn-ghost btn-sm btn-circle text-info hover:bg-info/10" onClick={() => {
            setEditId(post._id);
            setFormData({ title: post.title, text: post.text, avatar: post.avatar, fileId: post.fileId });
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}>
            <FaEdit size={18} />
          </button>
          <button className="btn btn-ghost btn-sm btn-circle text-error hover:bg-error/10" onClick={() => { setPostToDelete(post); setShowModal(true); }}>
            <FaTrashAlt size={18} />
          </button>
        </div>
      )}
    </div>
  </div>
))}

          </div>
      </div>

      {/* مودال الحذف (كما في كودك) */}
      {showModal && (
        <div className="modal modal-open">
          <div className="modal-box rounded-3xl">
            <h3 className="font-black text-lg text-error flex items-center gap-2">
              <FaExclamationTriangle/> تأكيد الحذف
            </h3>
            <p className="py-4">هل أنت متأكد؟ سيتم حذف الصورة والمنشور نهائياً.</p>
            <div className="modal-action">
              <button className="btn btn-ghost" onClick={() => setShowModal(false)}>إلغاء</button>
              <button className="btn btn-error text-white px-8" onClick={deletePost}>حذف</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Posts;
