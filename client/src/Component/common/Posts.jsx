import { io } from "socket.io-client";
import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useToast } from '../ui/PopUp/ToastContext';
import { useConfirm } from "../ui/PopUp/ConfirmContext";
import Loader from "../common/Loader";
import API from "../../api/axiosInstance"; 
import { FaHeart, FaRegHeart, FaEdit, FaTrashAlt, FaPlus, FaSearch, FaExclamationTriangle, FaRegComment, FaShareAlt,FaCheckCircle} from 'react-icons/fa';
const socket = io(import.meta.env.VITE_API_URL, {
  transports: ["websocket"],
  withCredentials: true
});

//عرض المزيد من النص
const ExpandableText = ({ text, maxLength = 150 }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  if (!text) return null;
  if (text.length <= maxLength) {
    return <p className="text-base-content/70 leading-relaxed whitespace-pre-wrap break-words">{text}</p>;
  }
  const displayedText = isExpanded ? text : text.slice(0, maxLength) + "...";
  return (
    <div className="text-right">
      <p className="text-base-content/70 leading-relaxed whitespace-pre-wrap break-words">{displayedText}</p>
      <button onClick={() => setIsExpanded(!isExpanded)} className="text-primary hover:underline text-sm font-bold mt-2 focus:outline-none">
        {isExpanded ? "عرض أقل" : "قراءة المزيد"}
      </button>
    </div>
  );
};

function Posts() {
  const { user } = useContext(AuthContext);
  const askConfirm = useConfirm();
  const showToast = useToast();
  
  const [posts, setPosts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null); 
  const [file, setFile] = useState(null);
  const [formData, setFormData] = useState({ title: "", avatar: "", text: "", fileId: "" });

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
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
    socket.on("newPost", (newPostFromServer) => {
      setPosts((prev) => prev.some(post => post._id === newPostFromServer._id) ? prev : [newPostFromServer, ...prev]);
    });
    socket.on("post_deleted", (deletedId) => {
      setPosts((prev) => prev.filter(post => post._id !== deletedId));
    });
    return () => {
      socket.off("newPost");
      socket.off("post_deleted");
    };
  }, []);

  const resetForm = () => {
    setEditId(null);
    setFile(null);
    setPreview(null);
    setFormData({ title: "", avatar: "", text: "", fileId: "" });
  };

  const handleDeleteClick = (post) => {
    askConfirm(
      "تأكيد الحذف", 
      `هل أنت متأكد من حذف المنشور "${post.title}"؟ لا يمكن التراجع عن هذا الإجراء.`, 
      async () => {
        try {
          await API.delete(`/deletePost/${post._id}`);
          setPosts(prev => prev.filter(u => u._id !== post._id));
          showToast("تم الحذف بنجاح", "success");
        } catch (err) {
          showToast("خطأ في عملية الحذف", "error");
        }
      }
    );
  };

  const submitData = async () => {
    const { title, text } = formData;
    if (!title || !text) return showToast("يرجى ملء جميع الحقول المطلوبة", "error");
    setLoading(true);
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
        const res = await API.put(`/UpdatePost/${editId}`, postData);
        setPosts(posts.map(u => u._id === editId ? res.data : u));
        showToast("تم التعديل بنجاح", "success");
      } else {
        await API.post("/newpost", postData);
        showToast("تم النشر بنجاح", "success");
      }
      resetForm();
    } catch (err) {
      showToast(err.message || "حدث خطأ ما", "error");
    } finally {
      setLoading(false);
    }
  };

  const filtered = posts.filter(u => 
    u.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.text?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div dir="rtl" className="min-h-screen bg-base-200 pb-24 font-sans w-full">
      {/* ===== اضافة منشور ===== */}
      {user?.role === "admin" && (
        <div className="bg-base-100 border-b border-base-300 px-4 py-6 shadow-sm">
          <div className="max-w-2xl mx-auto space-y-4">
            <h2 className="text-xl font-black flex items-center gap-2">
              {editId ? <FaEdit className="text-warning" /> : <FaPlus className="text-success" />}
              {editId ? "تعديل المنشور" : "إضافة منشور جديد"}
            </h2>
            <input className="input input-bordered w-full" type="text" placeholder="عنوان المنشور" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
            <textarea className="textarea textarea-bordered w-full" placeholder="المحتوى..." value={formData.text} onChange={e => setFormData({...formData, text: e.target.value})}></textarea>
            <div className="flex flex-col gap-4 w-full">
              {(preview || formData.avatar) && (
                <div className="relative w-32 h-32 self-center group">
                  <img src={preview || formData.avatar} alt="Preview" className="w-full h-full object-cover rounded-2xl shadow-md border-2 border-base-300 transition-transform group-hover:scale-105" />
                  <button type="button" onClick={() => { setFile(null); setPreview(null); setFormData({...formData, avatar: "", fileId: ""}); }} className="btn btn-circle btn-error btn-xs absolute -top-2 -left-2 shadow-lg">✕</button>
                </div>
              )}
              <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-base-300 rounded-2xl cursor-pointer hover:bg-base-200 transition-all group">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-2 rounded-full group-hover:scale-110 transition-transform"><FaPlus className="text-primary" /></div>
                  <p className="text-sm text-base-content/60 font-bold">{(preview || formData.avatar) ? "تغيير الصورة المختارة" : "إضافة صورة للمنشور"}</p>
                </div>
                <input type="file" className="hidden" onChange={handleFileChange} accept="image/*"/>
              </label>
            </div>
            <div className="flex gap-2 pt-2">
              <button className={`btn flex-1 ${editId ? "btn-warning" : "btn-success text-white"}`} onClick={submitData} disabled={loading}>
                {loading ? <Loader size="small"/> : (editId ? "تأكيد التعديل" : "حفظ المنشور")}
              </button>
              {editId && <button className="btn btn-ghost" onClick={resetForm}>إلغاء</button>}
            </div>
          </div>
        </div>
      )}
      
      <div className="max-w-4xl mx-auto px-0 mt-4">
        {/* ===== البحث عن منشور ===== */}
        <div className="px-4 mb-4">
          <div className="relative">
            <FaSearch className="absolute right-3 top-3.5 text-base-content/40" />
            <input type="text" placeholder="ابحث عن منشور..." className="input input-bordered w-full pr-10 rounded-xl" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
        </div>
        {/* ===== عرض المنشورات ===== */}
        {loading?(<Loader/>):(
        <div className="flex flex-col gap-3 items-center">
          {filtered.map((post) => (
            <div key={post._id} className="card w-full bg-base-100 shadow-sm border border-base-200 rounded-2xl overflow-hidden mb-1">
              <div className="flex flex-row-reverse justify-end items-center p-3 gap-3">
                
                
<div className="flex flex-col gap-0.5 text-right">
  {/* الاسم مع علامة التوثيق */}
  <div className="flex items-center gap-1.5 justify-end">
    
    {/* أيقونة التوثيق */}
    <svg 
      className="w-[18px] h-[18px] text-[#1d9bf0] fill-current flex-shrink-0" 
      viewBox="0 0 24 24" 
      aria-label="Verified account"
    >
      <g>
        <path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.99-3.818-3.99-.48 0-.94.1-1.348.27C14.825 2.515 13.512 1.5 12 1.5s-2.825 1.015-3.422 2.28c-.406-.17-.866-.27-1.348-.27-2.108 0-3.818 1.78-3.818 3.99 0 .495.084.965.238 1.4-1.273.65-2.148 2.02-2.148 3.6 0 1.58.875 2.95 2.148 3.6-.154.435-.238.905-.238 1.4 0 2.21 1.71 3.99 3.818 3.99.48 0 .94-.1 1.348-.27.597 1.265 1.91 2.28 3.422 2.28s2.825-1.015 3.422-2.28c.406.17.866.27 1.348.27 2.108 0 3.818-1.78 3.818-3.99 0-.495-.084-.965-.238-1.4 1.273-.65 2.148-2.02 2.148-3.6zm-12.5 4l-4.25-4.25 1.4-1.4 2.85 2.85 6.65-6.65 1.4 1.4-8.05 8.05z"></path>
      </g>
    </svg>
    
    <h3 className="text-lg font-bold text-base-content leading-none">𝙼𝚄𝚂𝚃𝙰𝙵𝙰</h3>
  </div>
  
  {/*user/admin */}
  <span className="text-xs opacity-60 font-medium tracking-wide pr-1">admin</span>
</div>


                
                <div className="avatar online">
                  <div className="w-12 h-12 rounded-full border-1 border-primary overflow-hidden shadow-lg mt-2">
                    <img src="https://ik.imagekit.io/2vom8qfmg/images/profile.jpg" alt="Admin" />
                  </div>
                </div>
              </div>
              <hr className="border-base-200" />
              <figure className="w-full h-72 overflow-hidden bg-base-300">
                <img className="w-full h-full object-cover" src={post.avatar || "https://ui-avatars.com/api/?name=" + post.title} alt="post" />
              </figure>
              <div className="card-body p-4">
                <h2 className="card-title text-xl font-black mb-1">{post.title}</h2>
                <div className="mb-4">
                  <ExpandableText text={post.text} maxLength={120} />
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-base-200">
                  <div className="flex items-center gap-4">
                    <button className="group flex items-center gap-1.5 text-gray-500 hover:text-error transition-all">
                      <div className="p-2 rounded-full group-hover:bg-error/10"><FaRegHeart size={22} /></div>
                      <span className="text-sm font-bold">{post.likes?.length || 0}</span>
                    </button>
                    <button className="group flex items-center gap-1.5 text-gray-500 hover:text-primary transition-all">
                      <div className="p-2 rounded-full group-hover:bg-primary/10"><FaRegComment size={22} /></div>
                      <span className="text-sm font-bold">0</span>
                    </button>
                  </div>
                  <button className="group text-gray-500 hover:text-success transition-all">
                    <div className="p-2 rounded-full group-hover:bg-success/10"><FaShareAlt size={20} /></div>
                  </button>
                </div>
                {user?.role === "admin" && (
                  <div className="flex justify-end gap-3 mt-4 pt-3 border-t border-dashed border-base-200">
                    <button className="btn btn-ghost btn-sm btn-circle text-info hover:bg-info/10" onClick={() => {
                      setEditId(post._id);
                      setFormData({ title: post.title, text: post.text, avatar: post.avatar, fileId: post.fileId });
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}>
                      <FaEdit size={18} />
                    </button>
                    
                    <button className="btn btn-ghost btn-sm btn-circle text-error hover:bg-error/10" onClick={() => handleDeleteClick(post)}>
                      <FaTrashAlt size={18} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>)}
      </div>
    </div>
  );
}

export default Posts;
