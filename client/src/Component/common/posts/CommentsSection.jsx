import React, { useState, useEffect } from 'react';
import { FaPaperPlane, FaTrashAlt, FaEdit, FaTimes, FaCheck } from 'react-icons/fa';
import API from '../../../api/axiosInstance';
import { useConfirm } from "../../ui/PopUp/ConfirmContext"; 
import io from 'socket.io-client';

// 🌐 دالة مساعدة لتحويل المسارات النسبية إلى روابط كاملة إذا لزم الأمر
const getFullImageUrl = (path) => {
  if (!path) return null;
  // إذا كان الرابط يبدأ بـ http أو https أو base64 فهو جاهز للاستخدام
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
    return path;
  }
  // إذا كان مساراً نسبياً مخزناً على السيرفر، يتم ربطه بـ Origin أو البورت الخاص بالسيرفر
  const SERVER_URL = 'http://localhost:8080'; // ⚠️ قم بتغييره إلى رابط السيرفر الخاص بك إن كان مختلفاً
  const cleanPath = path.startsWith('/') ? path.substring(1) : path;
  return `${SERVER_URL}/${cleanPath}`;
};

function CommentsSection({ postId, initialComments = [], user, formatPostTime }) {
  const [comments, setComments] = useState(initialComments);
  const [newComment, setNewComment] = useState('');
  const [isCommentLoading, setIsCommentLoading] = useState(false);

  const confirm = useConfirm(); 

  const [editingCommentId, setEditingCommentId] = useState(null); 
  const [editingText, setEditingText] = useState('');

  // 🔄 الاستماع للتحديثات الفورية عبر Socket.io
  useEffect(() => {
    const socket = io(window.location.origin || 'http://localhost:8080'); 

    socket.on('post_comments_updated', (data) => {
      if (data.postId === postId) {
        setComments(data.comments);
      }
    });

    return () => {
      socket.off('post_comments_updated');
      socket.disconnect();
    };
  }, [postId]);

  // استخراج صورة المستخدم الحالي بشكل آمن
  const currentUserAvatar = getFullImageUrl(
    user?.avatar || user?.profileImage || user?.data?.avatar || user?.data?.profileImage
  );
  const currentUsername = user?.username || user?.data?.username || 'أ';

  // 1. إضافة تعليق جديد
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || isCommentLoading) return;

    setIsCommentLoading(true);
    try {
      const res = await API.post(`/commentpost/${postId}`, { text: newComment });
      // السيرفر يعيد المنشور المحدث بالكامل وعملنا له populate
      if (res.data && res.data.comments) {
        setComments(res.data.comments);
      }
      setNewComment('');
    } catch (error) {
      console.error("خطأ في إضافة التعليق:", error);
    } finally {
      setIsCommentLoading(false);
    }
  };

  // 2. إرسال التعديل إلى السيرفر
  const handleEditSubmit = async (commentId) => {
    if (!editingText.trim()) return;
    try {
      const res = await API.put(`/posts/${postId}/comments/${commentId}`, { text: editingText });
      if (res.data && res.data.comments) {
        setComments(res.data.comments);
      }
      setEditingCommentId(null); 
      setEditingText('');
    } catch (error) {
      console.error("خطأ في تعديل التعليق:", error);
    }
  };

  // 3. حذف التعليق من السيرفر
  const handleDeleteComment = (commentId) => {
    confirm("حذف التعليق", "هل أنت متأكد من حذف هذا التعليق نهائياً؟", async () => {
      try {
        const res = await API.delete(`/posts/${postId}/comments/${commentId}`);
        if (res.data && res.data.comments) {
          setComments(res.data.comments);
        }
      } catch (error) {
        console.error("خطأ في حذف التعليق:", error);
      }
    });
  };

  return (
    <div className="mt-4 pt-4 border-t border-base-200" dir="rtl">
      {/* حقل إدخال تعليق جديد */}
      <form onSubmit={handleCommentSubmit} className="flex items-center gap-2 mb-4">
        <div className="avatar">
          <div className="w-8 h-8 rounded-full overflow-hidden bg-neutral text-neutral-content flex items-center justify-center">
            {currentUserAvatar ? (
              <img src={currentUserAvatar} alt="profile" className="w-full h-full object-cover" />
            ) : (
              <span className="text-xs uppercase font-bold">{currentUsername.charAt(0)}</span>
            )}
          </div>
        </div>
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="اكتب تعليقاً..."
            className="input input-sm input-bordered w-full pr-3 pl-10 text-right rounded-xl focus:outline-none focus:border-primary text-sm"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            disabled={isCommentLoading}
          />
          <button 
            type="submit" 
            className="absolute left-2 top-1/2 -translate-y-1/2 text-primary hover:text-primary-focus transition-colors disabled:opacity-50 p-1"
            disabled={!newComment.trim() || isCommentLoading}
          >
            <FaPaperPlane size={14} className="rotate-180" />
          </button>
        </div>
      </form>

      {/* قائمة عرض التعليقات */}
      <div className="flex flex-col gap-3 max-h-60 overflow-y-auto pl-1">
        {comments && comments.length > 0 ? (
          comments.map((comment) => {
            const commentAuthorId = comment.userId?._id || comment.userId?.id || comment.userId;
            const currentUserId = user?._id || user?.id || user?.data?._id || user?.data?.id;

            const isOwner = currentUserId && commentAuthorId && (String(commentAuthorId) === String(currentUserId));
            const isAdmin = user?.role === 'admin' || user?.data?.role === 'admin';

            const commentAuthorName = comment.userId?.username || "مستخدم غير معروف";
            
            // تمرير الصورة للدالة المساعدة لضمان الحصول على رابط متاح وصحيح
            const commentAuthorAvatar = getFullImageUrl(comment.userId?.avatar || comment.userId?.profileImage);

            return (
              <div key={comment._id} className="flex gap-2 items-start text-right">
                <div className="avatar mt-0.5">
                  <div className="w-7 h-7 rounded-full overflow-hidden bg-base-300 flex items-center justify-center">
                    {commentAuthorAvatar ? (
                      <img src={commentAuthorAvatar} alt={commentAuthorName} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xs font-bold uppercase select-none text-neutral-content bg-neutral w-full h-full flex items-center justify-center">
                        {commentAuthorName.charAt(0)}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex-1 bg-base-200 p-2 rounded-2xl rounded-tr-none text-sm relative pb-6">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <span className="font-bold text-base-content text-xs">{commentAuthorName}</span>
                    <span className="text-[9px] opacity-50">
                      {formatPostTime ? formatPostTime(comment.createdAt) : ''}
                    </span>
                  </div>

                  {/* وضع التعديل النشط */}
                  {editingCommentId === comment._id ? (
                    <div className="flex items-center gap-1 mt-1">
                      <input
                        type="text"
                        className="input input-xs input-bordered flex-1 text-right text-xs"
                        value={editingText}
                        onChange={(e) => setEditingText(e.target.value)}
                        autoFocus
                      />
                      <button onClick={() => handleEditSubmit(comment._id)} className="text-success p-1 hover:opacity-80">
                        <FaCheck size={12} />
                      </button>
                      <button onClick={() => setEditingCommentId(null)} className="text-error p-1 hover:opacity-80">
                        <FaTimes size={12} />
                      </button>
                    </div>
                  ) : (
                    <p className="text-base-content/90 leading-relaxed text-xs break-words">{comment.text}</p>
                  )}

                  {/* أزرار الإدارة */}
                  {editingCommentId !== comment._id && (isOwner || isAdmin) && (
                    <div className="absolute left-2 bottom-1 flex items-center gap-2 bg-base-300/80 px-1.5 py-0.5 rounded-md backdrop-blur-sm">
                      {isOwner && (
                        <button 
                          onClick={() => { setEditingCommentId(comment._id); setEditingText(comment.text); }}
                          className="text-info hover:text-info-focus transition-colors" 
                          title="تعديل"
                        >
                          <FaEdit size={11} />
                        </button>
                      )}
                      <button 
                        onClick={() => handleDeleteComment(comment._id)}
                        className="text-error hover:text-error-focus transition-colors" 
                        title="حذف"
                      >
                        <FaTrashAlt size={11} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-center text-xs opacity-50 my-2">لا توجد تعليقات بعد، كن أول من يعلق!</p>
        )}
      </div>
    </div>
  );
}

export default CommentsSection;
