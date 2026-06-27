import React from "react";
import { FaEdit, FaUser, FaEnvelope, FaCalendarAlt, FaLock, FaPlus } from "react-icons/fa";
import Loader from "../../Component/common/Loader/Loader"; // تأكد من المسار الصحيح

const EditProfileModal = ({ formState, formLoading, handleFileChange, resetForm, handleSubmit }) => {
  const { 
    username, setUsername, 
    email, setEmail, 
    age, setAge, 
    password, setPassword, 
    preview, setPreview, 
    setFile, setFormData, formData 
  } = formState;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-base-100 rounded-2xl shadow-2xl max-w-md w-full max-h-[92vh] overflow-y-auto border border-base-300 relative text-right p-6" dir="rtl">
        <button type="button" onClick={resetForm} className="btn btn-sm btn-circle btn-ghost absolute left-4 top-4 z-10">✕</button>

        <h2 className="text-xl font-black flex items-center gap-2 mb-4 justify-start">
          <FaEdit className="text-success" />
          تعديل الحساب الشخصي
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-control w-full">
            <label className="label"><span className="label-text font-bold">اسم المستخدم</span></label>
            <div className="relative">
              <FaUser className="absolute right-3 top-3.5 text-base-content/40" />
              <input type="text" className="input input-bordered w-full pr-10 text-right" value={username} onChange={(e) => setUsername(e.target.value)} required />
            </div>
          </div>

          <div className="form-control w-full">
            <label className="label"><span className="label-text font-bold">البريد الإلكتروني</span></label>
            <div className="relative">
              <FaEnvelope className="absolute right-3 top-3.5 text-base-content/40" />
              <input type="email" className="input input-bordered w-full pr-10 text-right" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
          </div>

          <div className="form-control w-full">
            <label className="label"><span className="label-text font-bold">العمر</span></label>
            <div className="relative">
              <FaCalendarAlt className="absolute right-3 top-3.5 text-base-content/40" />
              <input type="number" className="input input-bordered w-full pr-10 text-right" value={age} onChange={(e) => setAge(e.target.value)} required />
            </div>
          </div>

          <div className="form-control w-full">
            <label className="label"><span className="label-text font-bold">كلمة المرور الجديدة</span></label>
            <div className="relative">
              <FaLock className="absolute right-3 top-3.5 text-base-content/40" />
              <input type="password" placeholder="اتركها فارغة إذا لا تريد تغييرها" className="input input-bordered w-full pr-10 text-right" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
          </div>

          <div className="form-control w-full">
            <label className="label"><span className="label-text font-bold">الصورة الشخصية</span></label>
            <div className="flex flex-col gap-4 w-full">
              {preview && (
                <div className="relative w-28 h-28 self-center group">
                  <img src={preview} alt="Preview" className="w-full h-full object-cover rounded-2xl shadow-md border-2 border-base-300 transition-transform group-hover:scale-105" />
                  <button type="button" onClick={() => { setFile(null); setPreview(null); setFormData({...formData, avatar: "", fileId: ""}); }} className="btn btn-circle btn-error btn-xs absolute -top-2 -left-2 shadow-lg">✕</button>
                </div>
              )}
              <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-base-300 rounded-2xl cursor-pointer hover:bg-base-200 transition-all group">
                <div className="flex items-center gap-3">
                  <div className="bg-success/10 p-2 rounded-full group-hover:scale-110 transition-transform"><FaPlus className="text-success" /></div>
                  <p className="text-sm text-base-content/60 font-bold">{preview ? "تغيير الصورة الشخصية" : "إضافة صورة للملف الشخصي"}</p>
                </div>
                <input type="file" className="hidden" onChange={handleFileChange} accept="image/*"/>
              </label>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button type="submit" className="btn btn-success text-white flex-1" disabled={formLoading}>
              {formLoading ? <Loader size="small"/> : "حفظ التغييرات"}
            </button>
            <button type="button" className="btn btn-ghost" onClick={resetForm}>إلغاء</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal;
