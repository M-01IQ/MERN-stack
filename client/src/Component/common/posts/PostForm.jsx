import React from 'react';
import { FaPlus, FaEdit } from 'react-icons/fa';
import Loader from '../../common/Loader';

function PostForm({ editId, formData, setFormData, preview, setPreview, setFile, loading, onSubmit, onReset }) {
  
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  return (
    <div className="bg-base-100 p-6 w-full text-right" dir="rtl">
      <h2 className="text-xl font-black flex items-center gap-2 mb-4 justify-start">
        {editId ? <FaEdit className="text-warning" /> : <FaPlus className="text-success" />}
        {editId ? "تعديل المنشور" : "إضافة منشور جديد"}
      </h2>
      
      <div className="space-y-4">
        {/* نص المحتوى */}
        <textarea 
          className="textarea textarea-bordered w-full text-right min-h-[120px]" 
          placeholder="المحتوى..." 
          value={formData.text} 
          onChange={e => setFormData({...formData, text: e.target.value})}
        ></textarea>
        
        {/* معاينة الصورة والرفع */}
        <div className="flex flex-col gap-4 w-full">
          {(preview || formData.avatar) && (
            <div className="relative w-32 h-32 self-center group">
              <img 
                src={preview || formData.avatar} 
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
              <div className="bg-primary/10 p-2 rounded-full group-hover:scale-110 transition-transform">
                <FaPlus className="text-primary" />
              </div>
              <p className="text-sm text-base-content/60 font-bold">
                {(preview || formData.avatar) ? "تغيير الصورة المختارة" : "إضافة صورة للمنشور"}
              </p>
            </div>
            <input type="file" className="hidden" onChange={handleFileChange} accept="image/*"/>
          </label>
        </div>
        
        {/* أزرار التحكم */}
        <div className="flex gap-2 pt-2">
          <button 
            className={`btn flex-1 ${editId ? "btn-warning" : "btn-success text-white"}`} 
            onClick={onSubmit} 
            disabled={loading}
          >
            {loading ? <Loader size="small"/> : (editId ? "تأكيد التعديلات" : "نشر")}
          </button>
          <button className="btn btn-ghost" onClick={onReset}>
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
}

export default PostForm;
