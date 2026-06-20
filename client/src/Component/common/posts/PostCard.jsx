import React, { useState, useRef, useEffect } from 'react';
import { FaRegHeart, FaHeart, FaRegComment, FaShareAlt, FaPause, FaPlay } from 'react-icons/fa';
import { Volume2, VolumeX } from 'lucide-react';
import ExpandableText from './ExpandableText';
import API from '../../../api/axiosInstance';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';

import CommentsSection from './CommentsSection'; 
import PostActionsDropdown from './PostActionsDropdown'; 

function PostCard({ post, user, onEdit, onDelete, isAllMuted, setIsAllMuted, activePostId, setActivePostId }) {
  const postTime = post.createdAt;

  const formatPostTime = (timeString) => {
    if (!timeString) return "الآن";
    try {
      return formatDistanceToNow(new Date(timeString), {
        addSuffix: true,
        locale: ar,
      }).replace(/تقريباً\s?/g, "").trim();
    } catch {
      return "منذ فترة";
    }
  };

  const initialLikes = Array.isArray(post.likes) ? post.likes.length : (post.likes || 0);
  const hasUserLiked = Array.isArray(post.likes) && user
    ? post.likes.includes(user.id || user._id)
    : false;

  const [isliked, setIsliked] = useState(hasUserLiked);
  const [lnlikes, setLnlikes] = useState(initialLikes);
  const [isLikeLoading, setIsLikeLoading] = useState(false);
  const [showComments, setShowComments] = useState(false);

  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const isManuallyPaused = useRef(false); 

  const isVideo = post.mediaType === "video" || (post.videoUrl && !post.avatar);
  const mediaUrl = isVideo ? post.videoUrl : (post.avatar);
  const hasMedia = !!mediaUrl;

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isAllMuted;
    }
  }, [isAllMuted]);

  useEffect(() => {
    if (!isVideo || !videoRef.current) return;

    if (activePostId === post._id) {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  }, [activePostId, post._id, isVideo]);

  useEffect(() => {
    if (!isVideo || !videoRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!videoRef.current) return;
          if (entry.isIntersecting) {
            if (!isManuallyPaused.current && activePostId !== post._id) {
              if (typeof setActivePostId === 'function') {
                setActivePostId(post._id);
              }
            }
          } else {
            isManuallyPaused.current = false; 
            if (activePostId === post._id) {
              if (typeof setActivePostId === 'function') {
                setActivePostId(null);
              }
            }
          }
        });
      },
      { threshold: 0.6 }
    );

    observer.observe(videoRef.current);
    return () => {
      if (videoRef.current) observer.unobserve(videoRef.current);
    };
  }, [isVideo, post._id, activePostId, setActivePostId]);

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
    } catch {
      setIsliked(previousIsLiked);
      setLnlikes(previousLikesCount);
    } finally {
      setIsLikeLoading(false);
    }
  };

  const togglePlay = (e) => {
    if (e) e.stopPropagation();
    if (!videoRef.current) return;

    if (typeof setActivePostId === 'function') {
      if (isPlaying) {
        isManuallyPaused.current = true; 
        setActivePostId(null);
      } else {
        isManuallyPaused.current = false; 
        setActivePostId(post._id);
      }
    }
  };

  const toggleMute = (e) => {
    e.stopPropagation();
    if (typeof setIsAllMuted === 'function') {
      setIsAllMuted(!isAllMuted); 
    }
  };

  const authorName = post.userId?.username || "مستخدم غير معروف";
  const authorAvatar = post.userId?.avatar || post.userId?.profileImage || post.userId?.img;
  const authorRole = post.userId?.role || "user";

  const commentsCount = Array.isArray(post.comments) ? post.comments.length : 0;

  return (
    /* 1️⃣ إضافة dir="rtl" و text-right هنا يضمن ثبات التصميم لليمين للكل */
    <div className="card w-full bg-base-100 shadow-sm border border-base-200 rounded-2xl overflow-hidden mb-1 text-right" dir="rtl">
      
      {/* الجزء العلوي للكارت */}
      {/* 2️⃣ تعديل التموضع ليعتمد على التوزيع المرن الطبيعي المقروء من اليمين (flex-row) */}
      <div className="flex flex-row items-center justify-between pt-2 border-t border-base-200 px-3">
        
        {/* معلومات كاتب المنشور (تأتي أولاً جهة اليمين) */}
        <div className="flex flex-row justify-start items-center gap-3 py-2">
          <div className="avatar online">
            <div className="w-12 h-12 rounded-full overflow-hidden shadow-lg flex items-center justify-center bg-neutral text-neutral-content">
              {authorAvatar ? (
                <img src={authorAvatar} alt={authorName} className="w-full h-full object-cover" />
              ) : (
                <span className="text-xl font-black uppercase select-none">{authorName.charAt(0)}</span>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-0.5 text-right">
            <div className="flex items-center gap-1.5 justify-start">
              <h3 className="text-lg font-bold text-base-content leading-none">{authorName}</h3>
              {authorRole === "admin" && (
                <svg className="w-[18px] h-[18px] text-[#1d9bf0] fill-current flex-shrink-0" viewBox="0 0 24 24">
                  <path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.99-3.818-3.99-.48 0-.94.1-1.348.27C14.825 2.515 13.512 1.5 12 1.5s-2.825 1.015-3.422 2.28c-.406-.17-.866-.27-1.348-.27-2.108 0-3.818 1.78-3.818 3.99 0 .495.084.965.238 1.4-1.273.65-2.148 2.02-2.148 3.6 0 1.58.875 2.95 2.148 3.6-.154.435-.238.905-.238 1.4 0 2.21 1.71 3.99 3.818 3.99.48 0 .94-.1 1.348-.27.597 1.265 1.91 2.28 3.422 2.28s2.825-1.015 3.422-2.28c.406.17.866.27 1.348.27 2.108 0 3.818-1.78 3.818-3.99 0-.495-.084-.965-.238-1.4 1.273-.65 2.148-2.02 2.148-3.6zm-12.5 4l-4.25-4.25 1.4-1.4 2.85 2.85 6.65-6.65 1.4 1.4-8.05 8.05z" />
                </svg>
              )}
            </div>
            <span className="text-[11px] font-medium cursor-help opacity-60 mt-1" title={postTime ? new Date(postTime).toLocaleString('ar-EG') : "الآن"}>
              {formatPostTime(postTime)}
            </span>
          </div>
        </div>

        {/* زر الثلاث نقاط المنسدل (يأتي أوتوماتيكياً أقصى اليسار) */}
        <PostActionsDropdown 
          post={post}
          user={user}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      </div>
      <hr className="border-base-200" />

      <div className="card-body p-0">
        <div className="px-3">
          <div className="my-1">
            <ExpandableText text={post.text} maxLength={120} />
          </div>
        </div>

        {hasMedia && (
          <figure className="w-full overflow-hidden bg-base-300 relative">
            {isVideo ? (
              <div className="relative w-full cursor-pointer" style={{ maxHeight: "480px" }} onClick={togglePlay}>
                <video
                  ref={videoRef}
                  src={mediaUrl}
                  className="w-full object-cover"
                  style={{ maxHeight: "480px" }}
                  loop
                  muted={isAllMuted}
                  playsInline
                />
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between z-20">
                  <button onClick={toggleMute} className="p-2 bg-black/50 rounded-full text-white backdrop-blur-sm hover:bg-black/70 transition-all">
                    {isAllMuted ? <VolumeX size={18} /> : <Volume2 size={18} />} 
                  </button>
                  <button onClick={togglePlay} className="p-2 bg-black/50 rounded-full text-white backdrop-blur-sm hover:bg-black/70 transition-all">
                    {isPlaying ? <FaPause size={16} /> : <FaPlay size={16} />}
                  </button>
                </div>
                {/* تعديل مكان شارة الفيديو لتظهر في موضع مناسب متوافق مع الاتجاه الجديد */}
                <div className="absolute top-2 left-2 z-20 bg-black/60 text-white text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-sm">
                  فيديو
                </div>
              </div>
            ) : (
              <img className="w-full h-full object-cover" src={mediaUrl} alt="post" onError={(e) => { e.target.style.display = 'none'; }} />
            )}
          </figure>
        )}

        <div className="p-3">
          <div className="flex items-center justify-between pt-2 border-t border-base-200">
            <div className="flex items-center gap-4">
              <button className={`group flex items-center gap-1.5 text-gray-500 hover:text-error transition-all ${isLikeLoading ? 'opacity-70 pointer-events-none' : ''}`} onClick={handleLikeClick} disabled={isLikeLoading}>
                <div className="p-2 rounded-full group-hover:bg-error/10">
                  {isliked ? <FaHeart size={24} className="text-error" /> : <FaRegHeart size={24} />}
                </div>
                <span className="text-sm font-bold">{lnlikes}</span>
              </button>
              
              <button 
                onClick={() => setShowComments(!showComments)}
                className={`group flex items-center gap-1.5 transition-all ${showComments ? 'text-primary' : 'text-gray-500 hover:text-primary'}`}
              >
                <div className="p-2 rounded-full group-hover:bg-primary/10">
                  <FaRegComment size={22} />
                </div>
                <span className="text-sm font-bold">{commentsCount}</span>
              </button>

              <button className="group text-gray-500 hover:text-success transition-all">
                <div className="p-2 rounded-full group-hover:bg-success/10">
                  <FaShareAlt size={24} />
                </div>
              </button>
            </div>
          </div>

          {showComments && (
            <CommentsSection 
              postId={post._id}
              initialComments={post.comments}
              user={user}
              formatPostTime={formatPostTime}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default PostCard;
