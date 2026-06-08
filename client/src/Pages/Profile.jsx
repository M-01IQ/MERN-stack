import React, { useContext, useState, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import Loader from "../Component/common/Loader";
import { FaIdBadge, FaEnvelope, FaCalendarAlt, FaShieldAlt, FaEdit, FaPlus, FaUser, FaLock } from "react-icons/fa"; 
import API from '../api/axiosInstance'; 

// استيراد الـ Hooks من مكتبة react-query
import { useQuery, useQueryClient } from '@tanstack/react-query';

const Profile = () => {
  const { user } = useContext(AuthContext);
  const queryClient = useQueryClient(); // محرك التحكم في كاش التطبيق

  // حالات النافذة المنبثقة وتعديل البيانات
  const [isOpen, setIsOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [age, setAge] = useState("");
  const [password, setPassword] = useState("");
  const [formLoading, setFormLoading] = useState(false);
  const [preview, setPreview] = useState(null); 
  const [file, setFile] = useState(null);
  const [formData, setFormData] = useState({ avatar: "", fileId: "" });

  // جلب بيانات الملف الشخصي وحفظها في الكاش
  const { data: profileData, isLoading } = useQuery({
    queryKey: ['myProfile', user?._id || user?.userID || user?.id], 
    queryFn: async () => {
      const res = await API.get("/me");
      return res.data;
    },
    enabled: !!user, 
  });

  // تعبئة البيانات الافتراضية في الفورم
  useEffect(() => {
    const currentData = profileData || user;
    if (currentData) {
      setUsername(currentData.username || "");
      setEmail(currentData.email || "");
      setAge(currentData.age || "");
      setPreview(currentData.avatar || null);
      setFormData({ avatar: currentData.avatar || "", fileId: currentData.fileId || "" });
    }
    // تصفير حقل كلمة المرور عند فتح/إغلاق المودال
    setPassword("");
  }, [profileData, user, isOpen]);

  // دالة معالجة تغيير الصورة وتحضير المعاينة
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  // دالة تفريغ المودال وإغلاقه
  const resetForm = () => {
    setFile(null);
    setPassword("");
    setIsOpen(false);
  };

  // دالة معالجة إرسال البيانات ورفع الصورة إلى ImageKit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      let finalAvatarUrl = formData.avatar;
      let imageKitFileId = formData.fileId;

      // إذا اختار المستخدم ملف صورة جديد، يتم رفعه أولاً إلى ImageKit
      if (file) {
        const authRes = await API.get('/imagekitRoutes');
        const authData = authRes.data;
        const uploadData = new FormData();
        uploadData.append("file", file);
        uploadData.append("fileName", file.name);
        uploadData.append("folder", "/profiles"); // حفظها في مجلد خاص بالملفات الشخصية
        uploadData.append("publicKey", "public_8blKLRTsq6BkdVQ5OMD+OGPzNSM=");
        uploadData.append("signature", authData.signature);
        uploadData.append("expire", authData.expire.toString());
        uploadData.append("token", authData.token);

        const imgResponse = await fetch('https://upload.imagekit.io/api/v1/files/upload', { 
          method: 'POST', 
          body: uploadData 
        });
        const imgResult = await imgResponse.json();
        
        if (!imgResponse.ok) throw new Error("فشل رفع الصورة الحسابية");
        
        finalAvatarUrl = imgResult.url;
        imageKitFileId = imgResult.fileId; 
      }

      // تجهيز الكائن النهائي لإرساله إلى روت التعديل بالسيرفر كـ JSON
      const updateData = { 
        username,
        email,
        age: Number(age), 
        avatar: finalAvatarUrl, 
        fileId: imageKitFileId 
      };

      // لا نرسل كلمة المرور للسيرفر إلا إذا قام المستخدم بكتابة شيء في الحقل
      if (password.trim() !== "") {
        updateData.password = password;
      }
      
      const currentUserId = user?._id || user?.userID || user?.id || profileData?._id;
      
      // إرسال طلب التحديث إلى السيرفر (روت التعديل سيقوم بحذف القديم تلقائياً إذا وجده)
      await API.put(`/UpdateUser/${currentUserId}`, updateData);

      //تحديث الكاش لتحديث البيانات في الصفحة فوراً
      queryClient.invalidateQueries(['myProfile', currentUserId]);
      
      resetForm();
    } catch (err) {
      console.error(err);
      alert(err.message || "حدث خطأ ما أثناء حفظ التغييرات");
    } finally {
      setFormLoading(false);
    }
  };

  // قراءة البيانات من الكاش لعرضها
  const displayedUsername = profileData?.username || user?.username || "مستخدم";
  const displayedEmail = profileData?.email || user?.email || "لا يوجد بريد";
  const userAvatar = profileData?.avatar || null;
  const userAge = profileData?.age || user?.age || "غير محدد";

  // يعرض لمرة واحدة Loader
  if (!user || (isLoading && !profileData)) {
    return <Loader />;
  }

  return (
    <div dir="rtl" className="min-h-screen bg-base-200 p-0 pb-24 font-sans">
      <div className="max-w-md mx-auto mt-0">
        
        <div className="card bg-base-100 shadow-xl border border-base-300">
          <div className="h-36 bg-gradient-to-l from-success to-green-600 rounded-t-2xl"></div>
          
          <div className="card-body items-center text-center -mt-22">
            
            {/* عرض الصورة المجلوبة */}
            <div className="avatar">
              <div className="bg-neutral text-neutral-content rounded-full w-34 h-34 ring ring-base-100 ring-offset-base-100 ring-offset-2 flex items-center justify-center overflow-hidden">
                {userAvatar ? (
                  <img 
                    src={userAvatar} 
                    alt={displayedUsername} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-5xl font-black uppercase select-none">
                    {displayedUsername?.charAt(0)}
                  </span>
                )}
              </div>
            </div>

            <h2 className="card-title text-2xl font-black mt-2">
              {displayedUsername}
            </h2>
            
            <div className={`badge ${user.role === 'admin' ? 'badge-info' : 'badge-ghost'} gap-2 p-3 font-bold`}>
              {user.role === 'admin' ? <FaShieldAlt /> : <FaIdBadge />}
              {user.role === 'admin' ? 'مسؤول' : 'مستخدم'}
            </div>

            <div className="divider w-full">المعلومات الشخصية</div>

            <div className="w-full space-y-4 text-right">
              {/* العمر */}
              <div className="flex items-center gap-4 bg-base-200 p-3 rounded-lg">
                <div className="bg-success/10 p-2 rounded-full text-success">
                  <FaCalendarAlt />
                </div>
                <div>
                  <p className="text-xs text-gray-500">العمر</p>
                  <p className="font-bold">{userAge} {userAge !== "غير محدد" && "سنة"}</p>
                </div>
              </div>

              {/* البريد الإلكتروني */}
              <div className="flex items-center gap-4 bg-base-200 p-3 rounded-lg">
                <div className="bg-success/10 p-2 rounded-full text-success">
                  <FaEnvelope />
                </div>
                <div>
                  <p className="text-xs text-gray-500">البريد الإلكتروني</p>
                  <p className="font-bold truncate max-w-[240px]">{displayedEmail}</p>
                </div>
              </div>
            </div>

            <div className="card-actions mt-6 w-full">
              <button onClick={() => setIsOpen(true)} className="btn btn-success btn-outline w-full rounded-xl">
                تعديل الملف الشخصي
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 4️⃣ نافذة الفورم العائمة للتعديل (Modal) الشامل لكافة الحقول */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-base-100 rounded-2xl shadow-2xl max-w-md w-full max-h-[92vh] overflow-y-auto border border-base-300 relative text-right p-6" dir="rtl">
            <button type="button" onClick={resetForm} className="btn btn-sm btn-circle btn-ghost absolute left-4 top-4 z-10">✕</button>

            <h2 className="text-xl font-black flex items-center gap-2 mb-4 justify-start">
              <FaEdit className="text-success" />
              تعديل الحساب الشخصي
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* حقل تعديل اسم المستخدم */}
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-bold">اسم المستخدم</span>
                </label>
                <div className="relative">
                  <FaUser className="absolute right-3 top-3.5 text-base-content/40" />
                  <input 
                    type="text" 
                    placeholder="اسم المستخدم الجديد" 
                    className="input input-bordered w-full pr-10 text-right" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* حقل تعديل البريد الإلكتروني */}
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-bold">البريد الإلكتروني</span>
                </label>
                <div className="relative">
                  <FaEnvelope className="absolute right-3 top-3.5 text-base-content/40" />
                  <input 
                    type="email" 
                    placeholder="البريد الإلكتروني الجديد" 
                    className="input input-bordered w-full pr-10 text-right" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* حقل تعديل العمر */}
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-bold">العمر</span>
                </label>
                <div className="relative">
                  <FaCalendarAlt className="absolute right-3 top-3.5 text-base-content/40" />
                  <input 
                    type="number" 
                    placeholder="أدخل عمرك" 
                    className="input input-bordered w-full pr-10 text-right" 
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* حقل تعديل كلمة المرور (اختياري) */}
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-bold">كلمة المرور الجديدة</span>
                </label>
                <div className="relative">
                  <FaLock className="absolute right-3 top-3.5 text-base-content/40" />
                  <input 
                    type="password" 
                    placeholder="اتركها فارغة إذا لا تريد تغييرها" 
                    className="input input-bordered w-full pr-10 text-right" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              {/* معاينة الصورة الشخصية والرفع من خلال ImageKit */}
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-bold">الصورة الشخصية</span>
                </label>
                
                <div className="flex flex-col gap-4 w-full">
                  {preview && (
                    <div className="relative w-28 h-28 self-center group">
                      <img 
                        src={preview} 
                        alt="Preview" 
                        className="w-full h-full object-cover rounded-2xl shadow-md border-2 border-base-300 transition-transform group-hover:scale-105" 
                      />
                      <button 
                        type="button" 
                        onClick={() => { setFile(null); setPreview(null); setFormData({...formData, avatar: "", fileId: ""}); }} 
                        className="btn btn-circle btn-error btn-xs absolute -top-2 -left-2 shadow-lg"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                  
                  <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-base-300 rounded-2xl cursor-pointer hover:bg-base-200 transition-all group">
                    <div className="flex items-center gap-3">
                      <div className="bg-success/10 p-2 rounded-full group-hover:scale-110 transition-transform">
                        <FaPlus className="text-success" />
                      </div>
                      <p className="text-sm text-base-content/60 font-bold">
                        {preview ? "تغيير الصورة الشخصية" : "إضافة صورة للملف الشخصي"}
                      </p>
                    </div>
                    <input type="file" className="hidden" onChange={handleFileChange} accept="image/*"/>
                  </label>
                </div>
              </div>

              {/* أزرار التحكم وحالة التحميل الفردية */}
              <div className="flex gap-2 pt-2">
                <button 
                  type="submit"
                  className="btn btn-success text-white flex-1" 
                  disabled={formLoading}
                >
                  {formLoading ? <Loader size="small"/> : "حفظ التغييرات"}
                </button>
                <button type="button" className="btn btn-ghost" onClick={resetForm}>
                  إلغاء
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
