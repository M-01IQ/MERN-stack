import React, { useState } from 'react';
import { FaEllipsisV, FaEdit, FaTrashAlt, FaRegHeart, FaHeart, FaRegComment, FaShareAlt } from 'react-icons/fa';
import ExpandableText from './ExpandableText'; 
import API from '../../../api/axiosInstance'; 
// استيراد أدوات التنسيق الزمني
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';

function PostCard({ post, user, onEdit, onDelete }) {
  // جلب الوقت من المنشور
  const postTime = post.createdAt; 
  
  //دالة تنسيق الوقت
  const formatPostTime = (timeString) => {
    if (!timeString) return "الآن";
    try {
      const timeFormatted = formatDistanceToNow(new Date(timeString), { 
        addSuffix: true, 
        locale: ar      
      });
      
      return timeFormatted.replace(/تقريباً\s?/g, "").trim();
    } catch (e) {
      return "منذ فترة";
    }
  };


  
  // حساب عدد اللايكات وفحص تفاعل المستخدم الحالي
  const initialLikes = Array.isArray(post.likes) ? post.likes.length : (post.likes || 0);
  const hasUserLiked = Array.isArray(post.likes) && user ? post.likes.includes(user.id || user._id) : false;

  const [isliked, setIsliked] = useState(hasUserLiked);
  const [lnlikes, setLnlikes] = useState(initialLikes);
  const [isLikeLoading, setIsLikeLoading] = useState(false); 

  // دالة التعامل مع الضغط وإرسال البيانات للباكيند
  const handleLikeClick = async () => {
    if (isLikeLoading) return;

    const previousIsLiked = isliked;
    const previousLikesCount = lnlikes;

    setIsliked(!previousIsLiked);
    setLnlikes(prev => previousIsLiked ? prev - 1 : prev + 1);
    setIsLikeLoading(true);

    try {
      const res = await API.put(`/likepost/${post._id}`);
      
      if (res.data && res.data.likes) {
        setLnlikes(res.data.likes.length);
        if (user) setIsliked(res.data.likes.includes(user.id || user._id));
      }
    } catch (err) {
      setIsliked(previousIsLiked);
      setLnlikes(previousLikesCount);
      console.error("فشل حفظ الإعجاب في قاعدة البيانات", err);
    } finally {
      setIsLikeLoading(false);
    }
  };

  // استخراج بيانات كاتب المنشور late
  const authorName = post.userId?.username || "مستخدم غير معروف";
  const authorAvatar = post.userId?.avatar || post.userId?.profileImage || post.userId?.img;
  const authorRole = post.userId?.role || "user";

  return (
    <div className="card w-full bg-base-100 shadow-sm border border-base-200 rounded-2xl overflow-hidden mb-1">
      {/* ===== رأس الكارد ===== */}
      <div className="flex flex-row-reverse items-center justify-between pt-2 border-t border-base-200">
        
        <button className="border-none bg-transparent cursor-pointer text-[20px] flex items-center justify-center p-1 hover:opacity-80 transition-opacity m-4">
          <FaEllipsisV />
        </button>
        
        <div className="flex flex-row-reverse justify-end items-center p-3 gap-3">
          <div className="flex flex-col gap-0.5 text-right">
            <div className="flex items-center gap-1.5 justify-end">
        {/* ===== علامة التوثيق ===== */}
              {authorRole === "admin" && (
                <svg 
                  className="w-[18px] h-[18px] text-[#1d9bf0] fill-current flex-shrink-0" 
                  viewBox="0 0 24 24" 
                  aria-label="Verified account"
                >
                  <g>
                    <path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.99-3.818-3.99-.48 0-.94.1-1.348.27C14.825 2.515 13.512 1.5 12 1.5s-2.825 1.015-3.422 2.28c-.406-.17-.866-.27-1.348-.27-2.108 0-3.818 1.78-3.818 3.99 0 .495.084.965.238 1.4-1.273.65-2.148 2.02-2.148 3.6 0 1.58.875 2.95 2.148 3.6-.154.435-.238.905-.238 1.4 0 2.21 1.71 3.99 3.818 3.99.48 0 .94-.1 1.348-.27.597 1.265 1.91 2.28 3.422 2.28s2.825-1.015 3.422-2.28c.406.17.866.27 1.348.27 2.108 0 3.818-1.78 3.818-3.99 0-.495-.084-.965-.238-1.4 1.273-.65 2.148-2.02 2.148-3.6zm-12.5 4l-4.25-4.25 1.4-1.4 2.85 2.85 6.65-6.65 1.4 1.4-8.05 8.05z"></path>
                  </g>
                </svg>
              )}
        {/* ===== اسم صاحب المنشور ===== */}
              <h3 className="text-lg font-bold text-base-content leading-none">{authorName}</h3>
            </div>
              {/* ===== وقت النشر ===== */}
            <span 
                className="text-[11px] font-medium cursor-help pr-1 opacity-60 mt-2"
                title={postTime ? new Date(postTime).toLocaleString('ar-EG') : "الآن"}
              >
                {formatPostTime(postTime)}
              </span>
          </div>
          
  {/* ===== صورة صاحب المنشور ===== */}
          <div className="avatar online">
            <div className="w-12 h-12 rounded-full overflow-hidden shadow-lg mt-2 flex items-center justify-center bg-neutral text-neutral-content">
              {authorAvatar ? (
                <img src={authorAvatar} alt={authorName} className="w-full h-full object-cover" />
              ) : (
                <span className="text-xl font-black uppercase select-none">
                  {authorName.charAt(0)}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
      <hr className="border-base-200" />

      {/* ===== محتوى المنشور ===== */}
      <div className="card-body p-0">
        <div className="px-3">
          <div className="my-1">
            <ExpandableText text={post.text} maxLength={120} />
          </div>
        </div>
        
        {/* ===== صور المنشور ===== */}
        <figure className="w-full h-auto overflow-hidden bg-base-300">
          <img className="w-full h-full object-cover" src={post.avatar || "https://ui-avatars.com/api/?name="} alt="post" />
        </figure>
        
        {/* ===== التفاعلات ===== */}
        <div className="p-3">
          <div className="flex items-center justify-between pt-2 border-t border-base-200">
            <div className="flex items-center gap-4">
              {/* ===== زر الاعجاب ===== */}
              <button 
                className={`group flex items-center gap-1.5 text-gray-500 hover:text-error transition-all ${isLikeLoading ? 'opacity-70 pointer-events-none' : ''}`} 
                onClick={handleLikeClick}
                disabled={isLikeLoading}
              >
                <div className="p-2 rounded-full group-hover:bg-error/10">
                  {isliked ? <FaHeart size={24} className="text-error" /> : <FaRegHeart size={24} />}
                </div>
                <span className="text-sm font-bold">{lnlikes}</span>
              </button>
            {/* ===== زر التعليقات ===== */}
              <button className="group flex items-center gap-1.5 text-gray-500 hover:text-primary transition-all">
                <div className="p-2 rounded-full group-hover:bg-primary/10"><FaRegComment size={22} /></div>
                <span className="text-sm font-bold">0</span>
              </button>
              
              <button className="group text-gray-500 hover:text-success transition-all">
                <div className="p-2 rounded-full group-hover:bg-success/10"><FaShareAlt size={24} /></div>
              </button>
            </div>
          </div>

          {/* ===== ازرار الادمن ===== */}
          {user?.role === "admin" && (
            <div className="flex justify-end gap-3 mt-4 pt-3 border-t border-dashed border-base-200">
              <button className="btn btn-ghost btn-sm btn-circle text-info hover:bg-info/10" onClick={() => onEdit(post)}>
                <FaEdit size={18} />
              </button>
              <button className="btn btn-ghost btn-sm btn-circle text-error hover:bg-error/10" onClick={() => onDelete(post)}>
                <FaTrashAlt size={18} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PostCard;
