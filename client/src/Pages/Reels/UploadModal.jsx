import React from "react";
import { X, Upload } from "lucide-react";

const UploadModal = ({
  isOpen,
  onClose,
  onSubmit,
  formLoading,
  selectedFile,
  setSelectedFile,
  uploadProgress,
  newReel,
  setNewReel
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
      <div className="bg-neutral-900 border border-white/10 text-white w-full max-w-md p-6 rounded-2xl relative shadow-2xl" dir="rtl">
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-1 text-gray-400 hover:text-white rounded-full bg-white/5"
          disabled={formLoading}
        >
          <X size={20} />
        </button>

        <h3 className="text-xl font-bold mb-4 text-center border-b border-white/10 pb-2">إضافة ريل جديد</h3>

        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-xs text-gray-400 block mb-1">ملف الفيديو *</label>
            <label className={`flex flex-col items-center justify-center w-full h-28 border-2 border-dashed rounded-xl cursor-pointer transition-all
              ${selectedFile ? 'border-blue-500 bg-blue-500/10' : 'border-white/20 bg-black/30 hover:border-white/40'}`}
            >
              <input
                type="file"
                accept="video/*"
                className="hidden"
                disabled={formLoading}
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) setSelectedFile(file);
                }}
              />
              {selectedFile ? (
                <div className="text-center px-3">
                  <Upload size={20} className="mx-auto mb-1 text-blue-400" />
                  <p className="text-xs text-blue-300 font-medium truncate max-w-[200px]">{selectedFile.name}</p>
                  <p className="text-xs text-gray-500 mt-1">{(selectedFile.size / (1024 * 1024)).toFixed(1)} MB</p>
                </div>
              ) : (
                <div className="text-center">
                  <Upload size={24} className="mx-auto mb-2 text-gray-500" />
                  <p className="text-xs text-gray-400">اضغط لاختيار فيديو</p>
                  <p className="text-xs text-gray-600 mt-1">MP4, MOV, WebM</p>
                </div>
              )}
            </label>
          </div>

          {uploadProgress > 0 && (
            <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          )}

          <div>
            <label className="text-xs text-gray-400 block mb-1">وصف الفيديو</label>
            <textarea
              rows="2"
              className="w-full bg-black/40 border border-white/10 p-2.5 rounded-xl text-sm text-right focus:outline-none focus:border-blue-500 resize-none"
              value={newReel.description}
              onChange={(e) => setNewReel({ ...newReel, description: e.target.value })}
              disabled={formLoading}
            />
          </div>

          <div>
            <label className="text-xs text-gray-400 block mb-1">اسم الصوت</label>
            <input
              type="text"
              className="w-full bg-black/40 border border-white/10 p-2.5 rounded-xl text-sm text-right focus:outline-none focus:border-blue-500"
              value={newReel.songName}
              placeholder="صوت أصلي (اختياري)"
              onChange={(e) => setNewReel({ ...newReel, songName: e.target.value })}
              disabled={formLoading}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white p-3 rounded-xl font-bold mt-2 flex justify-center items-center gap-2"
            disabled={formLoading || !selectedFile}
          >
            {formLoading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                جاري الرفع... {uploadProgress}%
              </>
            ) : "نشر الفيديو الآن 🚀"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UploadModal;
