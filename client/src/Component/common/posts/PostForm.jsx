import React, { useState } from 'react';
import { FaPlus, FaEdit, FaPhotoVideo } from 'react-icons/fa';
import { Upload, X, Film, Image } from 'lucide-react';
import Loader from '../../common/Loader/Loader';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const BUCKET_NAME = "vd"; // نفس الـ bucket المستخدم في الريلز

function PostForm({ editId, formData, setFormData, preview, setPreview, setFile, loading, onSubmit, onReset }) {
  const [mediaType, setMediaType] = useState("image"); // "image" | "video"
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    if (mediaType === "image") {
      // رفع الصورة بالطريقة العادية (يتولاه الـ parent)
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    } else {
      // رفع الفيديو مباشرة لـ Supabase
      handleVideoUpload(selectedFile);
    }
  };

  const handleVideoUpload = async (file) => {
    setIsUploading(true);
    setUploadProgress(10);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `post_video_${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type,
        });

      if (uploadError) throw new Error(`فشل رفع الفيديو: ${uploadError.message}`);

      setUploadProgress(80);

      const { data: urlData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(fileName);

      // حفظ رابط الفيديو في formData
      setFormData(prev => ({
        ...prev,
        videoUrl: urlData.publicUrl,
        mediaType: "video",
        avatar: "", // نظّف الصورة لو كانت موجودة
      }));
      setPreview(URL.createObjectURL(file)); // معاينة محلية
      setUploadProgress(100);
    } catch (err) {
      console.error(err);
      alert(`حدث خطأ أثناء رفع الفيديو: ${err.message}`);
      setUploadProgress(0);
    } finally {
      setIsUploading(false);
    }
  };

  const handleReset = () => {
    setMediaType("image");
    setUploadProgress(0);
    setIsUploading(false);
    onReset();
  };

  const hasMedia = preview || formData.avatar || formData.videoUrl;
  const currentIsVideo = mediaType === "video" || formData.mediaType === "video";
  const isFormDisabled = loading || isUploading;

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
          onChange={e => setFormData({ ...formData, text: e.target.value })}
          disabled={isFormDisabled}
        />

        {/* اختيار نوع الميديا */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              setMediaType("image");
              // لو كان فيديو محدد، امسحه
              if (formData.mediaType === "video") {
                setFormData(prev => ({ ...prev, videoUrl: "", mediaType: "image" }));
                setPreview(null);
              }
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border-2 transition-all
              ${mediaType === "image" ? "border-primary bg-primary/10 text-primary" : "border-base-300 text-base-content/50 hover:border-base-400"}`}
            disabled={isFormDisabled}
          >
            <Image size={16} />
            صورة
          </button>

          <button
            type="button"
            onClick={() => {
              setMediaType("video");
              // لو كانت صورة محددة، امسحها
              if (formData.mediaType !== "video") {
                setFormData(prev => ({ ...prev, avatar: "", fileId: "" }));
                setFile(null);
                setPreview(null);
              }
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border-2 transition-all
              ${mediaType === "video" ? "border-secondary bg-secondary/10 text-secondary" : "border-base-300 text-base-content/50 hover:border-base-400"}`}
            disabled={isFormDisabled}
          >
            <Film size={16} />
            فيديو
          </button>
        </div>

        {/* منطقة الميديا */}
        <div className="flex flex-col gap-4 w-full">

          {/* معاينة المحتوى المختار */}
          {hasMedia && (
            <div className="relative self-center group">
              {currentIsVideo && (formData.videoUrl || preview) ? (
                <div className="relative w-full rounded-2xl overflow-hidden shadow-md border-2 border-base-300" style={{ maxWidth: "220px" }}>
                  <video
                    src={formData.videoUrl || preview}
                    className="w-full object-cover rounded-2xl"
                    style={{ maxHeight: "160px" }}
                    muted
                    loop
                    autoPlay
                    playsInline
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-2xl">
                    <Film size={28} className="text-white/80" />
                  </div>
                </div>
              ) : (
                <img
                  src={preview || formData.avatar}
                  alt="Preview"
                  className="w-32 h-32 object-cover rounded-2xl shadow-md border-2 border-base-300 transition-transform group-hover:scale-105"
                />
              )}

              {/* زر المسح */}
              <button
                type="button"
                onClick={() => {
                  setFile(null);
                  setPreview(null);
                  setUploadProgress(0);
                  setFormData({ ...formData, avatar: "", fileId: "", videoUrl: "", mediaType: "image" });
                }}
                className="btn btn-circle btn-error btn-xs absolute -top-2 -left-2 shadow-lg"
                disabled={isFormDisabled}
              >
                ✕
              </button>
            </div>
          )}

          {/* شريط تقدم رفع الفيديو */}
          {isUploading && uploadProgress > 0 && (
            <div className="w-full">
              <div className="flex justify-between text-xs text-base-content/60 mb-1">
                <span>جاري رفع الفيديو...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-base-300 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-secondary h-2 rounded-full transition-all duration-500"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* منطقة اختيار الملف */}
          {!isUploading && (
            <label className={`flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-2xl cursor-pointer hover:bg-base-200 transition-all group
              ${isFormDisabled ? "opacity-50 pointer-events-none" : ""}
              ${currentIsVideo ? "border-secondary/40 hover:border-secondary/70" : "border-base-300"}`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full group-hover:scale-110 transition-transform
                  ${currentIsVideo ? "bg-secondary/10" : "bg-primary/10"}`}
                >
                  {currentIsVideo ? <Film className="text-secondary" size={18} /> : <FaPlus className="text-primary" />}
                </div>
                <p className="text-sm text-base-content/60 font-bold">
                  {hasMedia
                    ? (currentIsVideo ? "تغيير الفيديو المختار" : "تغيير الصورة المختارة")
                    : (currentIsVideo ? "اضغط لاختيار فيديو" : "إضافة صورة للمنشور")}
                </p>
              </div>
              {currentIsVideo && (
                <p className="text-xs text-base-content/40 mt-1">MP4, MOV, WebM</p>
              )}
              <input
                type="file"
                className="hidden"
                onChange={handleFileChange}
                accept={currentIsVideo ? "video/*" : "image/*"}
                disabled={isFormDisabled}
              />
            </label>
          )}
        </div>

        {/* أزرار التحكم */}
        <div className="flex gap-2 pt-2">
          <button
            className={`btn flex-1 ${editId ? "btn-warning" : "btn-success text-white"}`}
            onClick={onSubmit}
            disabled={isFormDisabled}
          >
            {(loading || isUploading)
              ? <Loader size="small" />
              : (editId ? "تأكيد التعديلات" : "نشر")}
          </button>
          <button className="btn btn-ghost" onClick={handleReset} disabled={isFormDisabled}>
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
}

export default PostForm;
