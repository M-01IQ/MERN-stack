import { useState } from "react";
import { useToast } from '../../Component/ui/PopUp/ToastContext';
import Loader from '../../Component/common/Loader/Loader';
import API from "../../api/axiosInstance"; 
import { FaUserPlus, FaEdit, FaTrash, FaSearch, FaUser, FaShieldAlt } from "react-icons/fa";

// استيراد الـ Hooks الخاصة بإدارة الكاش من React Query
import { useQuery, useQueryClient } from '@tanstack/react-query';

const API_URL = import.meta.env.VITE_API_URL || "";

// 🌐 دالة مساعدة لتحويل مسارات الصور الشخصية لروابط كاملة وصحيحة
const getFullImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
    return path;
  }
  const cleanPath = path.startsWith('/') ? path.substring(1) : path;
  return `${API_URL}/${cleanPath}`;
};

function Users() {
  const queryClient = useQueryClient(); // محرك التحكم في كاش التطبيق
  const showToast = useToast();

  const [searchTerm, setSearchTerm] = useState("");
  const [editId, setEditId] = useState(null);
  const [formLoading, setFormLoading] = useState(false); // لودينج خاص بحالة الأزرار فقط لعدم قفل الصفحة
  const [formData, setFormData] = useState({ username: "", age: "", email: "", role: "user" });
  const [showModal, setShowModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  // جلب المستخدمين وحفظهم في الكاش تلقائياً
  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users'], // المعرف الفريد لكاش المستخدمين
    queryFn: async () => {
      const res = await API.get("/users");
      return res.data;
    }
  });

  // تصفية البيانات بناءً على الكاش المجلوب
  const filtered = users.filter(u => 
    u.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const resetForm = () => {
    setEditId(null);
    setFormData({ username: "", age: "", email: "", role: "user" });
  };

  // دالة إضافة وتعديل المستخدم مع تحديث الكاش ذكياً
  const submitData = async () => {
    const { username, age, email, role } = formData;
    if (!username || !age || !email) return showToast("يرجى ملء جميع الحقول", "error");
    
    setFormLoading(true);
    try {
      if (editId) {
        const res = await API.put(`/UpdateUser/${editId}`, formData);
        
        // 🟢 تحديث الكاش محلياً فوراً للتعديل بدون ريفريش
        queryClient.setQueryData(['users'], (oldUsers = []) =>
          oldUsers.map(u => u._id === editId ? res.data : u)
        );
        showToast("تم تعديل الحساب بنجاح", "success");
      } else {
        // إضافة مستخدم جديد
        const res = await API.post("/register", { ...formData, password: "123" });
        
        // 🟢 تحديث الكاش محلياً فوراً للمستخدم الجديد
        queryClient.setQueryData(['users'], (oldUsers = []) => [...oldUsers, res.data]);
        showToast("تم إضافة المستخدم بنجاح", "success");
      }
      
      // عمل مزامنة وتحديث صامت في الخلفية للتأكد من تطابق البيانات مع السيرفر
      queryClient.invalidateQueries(['users']);
      resetForm();
    } catch (err) {
      showToast(err.response?.data?.message || "حدث خطأ ما", "error");
    } finally {
      setFormLoading(false);
    }
  };

  // دالة الحذف وتحديث الكاش
  const deleteUser = () => {
    if (!userToDelete) return;
    
    API.delete(`/deleteUser/${userToDelete._id}`)
      .then(() => {
        // 🟢 حذف المستخدم من الكاش فوراً لتختفي البطاقة من الشاشة بسرعة وسلاسة
        queryClient.setQueryData(['users'], (oldUsers = []) => 
          oldUsers.filter(u => u._id !== userToDelete._id)
        );
        
        showToast(`تم حذف ${userToDelete.username} بنجاح`, "success");
        setShowModal(false);
        setUserToDelete(null);
        
        // مزامنة صامتة في الخلفية
        queryClient.invalidateQueries(['users']);
      })
      .catch(() => showToast("حدث خطأ أثناء حذف المستخدم", "error"));
  };

  return (
    <div dir="rtl" className="min-h-screen bg-base-200 pb-24">
      {/* ===== فورم الإضافة / التعديل ===== */}
      <div className="bg-base-100 border-b border-base-300 px-4 py-6 shadow-sm">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-xl font-black text-base-content mb-4 flex items-center gap-2">
            {editId ? <><FaEdit className="text-warning" /> تعديل الحساب</> 
                    : <><FaUserPlus className="text-success" /> إضافة حساب جديد</>}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <input className="input input-bordered w-full focus:input-success" type="text" placeholder="الاسم" 
              value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} disabled={formLoading} />
            <input className="input input-bordered w-full focus:input-success" type="email" placeholder="الايميل" 
              value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} disabled={formLoading} />
            <input className="input input-bordered w-full focus:input-success" type="number" placeholder="العمر" 
              value={formData.age} onChange={e => setFormData({...formData, age: e.target.value})} disabled={formLoading} />
            
            {/* 📻 أزرار الراديو (Radio Buttons) المحدثة لنوع المستخدم */}
            <div className="flex items-center justify-around border border-base-300 rounded-xl p-2 bg-base-50 select-none">
              <span className="text-sm font-bold text-base-content/70">نوع المستخدم:</span>
              
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  name="userRole" 
                  value="user" 
                  className="radio radio-success radio-sm"
                  checked={formData.role === "user"}
                  onChange={e => setFormData({...formData, role: e.target.value})}
                  disabled={formLoading}
                />
                <span className="text-sm font-medium">مستخدم</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  name="userRole" 
                  value="admin" 
                  className="radio radio-info radio-sm"
                  checked={formData.role === "admin"}
                  onChange={e => setFormData({...formData, role: e.target.value})}
                  disabled={formLoading}
                />
                <span className="text-sm font-bold text-info">مسؤول</span>
              </label>
            </div>
          </div>

          <div className="flex gap-2">
            <button className={`btn flex-1 ${editId ? "btn-warning" : "btn-success"} ${formLoading ? "loading" : ""}`} onClick={submitData} disabled={formLoading}>
              {editId ? "تأكيد التعديل" : "اضافة الحساب"}
            </button>
            {editId && <button className="btn btn-ghost" onClick={resetForm} disabled={formLoading}>إلغاء</button>}
          </div>
        </div>
      </div>

      {/* ===== شريط البحث والإحصائيات ===== */}
      <div className="max-w-4xl mx-auto px-4 mt-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
          <div className="stats shadow bg-base-100 w-full sm:w-auto">
            <div className="stat py-2 px-4">
              <div className="stat-title text-xs">إجمالي المسجلين</div>
              <div className="stat-value text-success text-2xl">{filtered.length}</div>
              <div className="stat-desc">بناءً على نتائج البحث</div>
            </div>
          </div>

          <div className="relative w-full sm:w-64">
            <FaSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="بحث بالاسم أو الإيميل..." 
              className="input input-bordered w-full pr-10 focus:input-success transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* ===== قائمة المستخدمين الذكية بـ React Query ===== */}
        {isLoading && users.length === 0 ? (<Loader/>) :
        filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((user) => {
              const avatarUrl = getFullImageUrl(user.avatar);

              return (
                <div key={user._id} className="card bg-base-100 shadow-sm hover:shadow-md transition-shadow border border-base-200">
                  <div className="card-body p-4 flex-row items-center gap-4">
                    
                    {/* 🖼️ عرض الصورة الشخصية ديناميكياً هنا */}
                    <div className="avatar">
                      <div className="bg-neutral text-neutral-content rounded-full w-12 h-12 border-2 border-base-200 flex items-center justify-center overflow-hidden">
                        {avatarUrl ? (
                          <img src={avatarUrl} alt={user.username} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-2xl font-bold uppercase select-none">
                            {user.username?.charAt(0)}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex-1 overflow-hidden">
                      <h3 className="font-bold truncate flex items-center gap-2">
                        {user.username}
                        {user.role === 'admin' && <FaShieldAlt className="text-info text-xs" title="Admin" />}
                      </h3>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      <div className="flex gap-2 mt-1">
                         <span className="badge badge-ghost badge-sm">{user.age} سنة</span>
                         <span className={`badge badge-sm ${user.role === 'admin' ? 'badge-info' : 'badge-ghost'}`}>{user.role}</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <button className="btn btn-ghost btn-xs text-warning" onClick={() => {
                          setEditId(user._id);
                          setFormData({ username: user.username, age: user.age, email: user.email, role: user.role });
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}><FaEdit /></button>
                      <button className="btn btn-ghost btn-xs text-error" onClick={() => {
                          setUserToDelete(user);
                          setShowModal(true);
                        }}><FaTrash /></button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20 bg-base-100 rounded-box border-2 border-dashed border-base-300">
            <FaUser className="mx-auto text-4xl text-gray-200 mb-2" />
            <p className="text-gray-400 font-medium">لا يوجد بيانات للعرض</p>
          </div>
        )}
      </div>

      {/* ===== مودال الحذف ===== */}
      {showModal && (
        <div className="modal modal-open modal-bottom sm:modal-middle">
          <div className="modal-box">
            <h3 className="font-bold text-lg text-error flex items-center gap-2"><FaTrash /> تأكيد الحذف</h3>
            <p className="py-4">هل أنت متأكد من حذف المستخدم <span className="font-bold text-primary">"{userToDelete?.username}"</span>؟</p>
            <div className="modal-action">
              <button className="btn btn-ghost btn-sm" onClick={() => setShowModal(false)}>إلغاء</button>
              <button className="btn btn-error btn-sm" onClick={deleteUser}>حذف نهائي</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Users;
