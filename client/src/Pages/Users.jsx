import { useState, useEffect } from "react";
import { useToast } from '../Component/ui/ToastContext';
import API from "../api/axiosInstance"; 
import { FaUserPlus, FaEdit, FaTrash, FaSearch, FaUser, FaShieldAlt } from "react-icons/fa";

function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editId, setEditId] = useState(null);
  
  // متوافق مع الـ Schema الخاص بك
  const [formData, setFormData] = useState({ username: "", age: "", email: "", role: "user" });
  
  const showToast = useToast();
  const [showModal, setShowModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  // جلب المستخدمين
  const fetchUsers = () => {
    setLoading(true);
    API.get("/users") 
      .then(res => setUsers(res.data))
      .catch(() => showToast("خطأ في جلب المستخدمين", "error"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // دالة البحث وتصفية البيانات (يجب أن تكون قبل الـ return)
  const filtered = users.filter(u => 
    u.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const resetForm = () => {
    setEditId(null);
    setFormData({ username: "", age: "", email: "", role: "user" });
  };

  const submitData = async () => {
    const { username, age, email, role } = formData;
    if (!username || !age || !email) return showToast("يرجى ملء جميع الحقول", "error");
    
    try {
      if (editId) {
        const res = await API.put(`/UpdateUser/${editId}`, formData);
        setUsers(users.map(u => u._id === editId ? res.data : u));
        showToast("تم تعديل المستخدم بنجاح", "success");
      } else {
        // إضافة مستخدم جديد (Register)
        const res = await API.post("/register", { ...formData, password: "123" }); // كلمة مرور افتراضية عند الإضافة اليدوية
        setUsers([...users, res.data]);
        showToast("تم إضافة المستخدم بنجاح", "success");
      }
      resetForm();
    } catch (err) {
      showToast(err.response?.data?.message || "حدث خطأ ما", "error");
    }
  };

  const deleteUser = () => {
    if (!userToDelete) return;
    API.delete(`/deleteUser/${userToDelete._id}`)
      .then(() => {
        setUsers(users.filter(u => u._id !== userToDelete._id));
        showToast(`تم حذف ${userToDelete.username} بنجاح`, "success");
        setShowModal(false);
        setUserToDelete(null);
      })
      .catch(() => showToast("حدث خطأ أثناء حذف المستخدم", "error"));
  };

  return (
    <div dir="rtl" className="min-h-screen bg-base-200 pb-24">
      {/* ===== فورم الإضافة / التعديل ===== */}
      <div className="bg-base-100 border-b border-base-300 px-4 py-6 shadow-sm">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-xl font-black text-base-content mb-4 flex items-center gap-2">
            {editId ? <><FaEdit className="text-warning" /> تعديل المستخدم</> 
                    : <><FaUserPlus className="text-success" /> إضافة مستخدم جديد</>}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <input className="input input-bordered w-full focus:input-success" type="text" placeholder="اسم المستخدم" 
              value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} />
            <input className="input input-bordered w-full focus:input-success" type="email" placeholder="الايميل" 
              value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
            <input className="input input-bordered w-full focus:input-success" type="number" placeholder="العمر" 
              value={formData.age} onChange={e => setFormData({...formData, age: e.target.value})} />
            <select className="select select-bordered w-full" value={formData.role} 
              onChange={e => setFormData({...formData, role: e.target.value})}>
              <option value="user">مستخدم عادي</option>
              <option value="admin">مسؤول (Admin)</option>
            </select>
          </div>

          <div className="flex gap-2">
            <button className={`btn flex-1 ${editId ? "btn-warning" : "btn-success"}`} onClick={submitData}>
              {editId ? "تأكيد التعديل" : "حفظ المستخدم"}
            </button>
            {editId && <button className="btn btn-ghost" onClick={resetForm}>إلغاء</button>}
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

        {/* ===== قائمة المستخدمين ===== */}
        {loading ? (
          <div className="flex justify-center py-20"><span className="loading loading-spinner loading-lg text-success"></span></div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((user) => (
              <div key={user._id} className="card bg-base-100 shadow-sm hover:shadow-md transition-shadow border border-base-200">
                <div className="card-body p-4 flex-row items-center gap-4">
                  
                  <div className="avatar placeholder">
                    <div className="bg-neutral text-neutral-content rounded-full w-12 border-2 border-base-200 flex items-center justify-center">
                      <span className="text-2xl font-bold uppercase select-none">
                        {user.username?.charAt(0)}
                      </span>
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
            ))}
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