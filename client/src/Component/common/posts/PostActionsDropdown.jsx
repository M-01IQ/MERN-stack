import React from 'react';
import { FaEllipsisV, FaEdit, FaTrashAlt } from 'react-icons/fa';

function PostActionsDropdown({ post, user, onEdit, onDelete }) {
  // استخراج معرف كاتب المنشور ومعرف المستخدم الحالي بشكل آمن
  const postAuthorId = post.userId?._id || post.userId?.id || post.userId;
  const currentUserId = user?._id || user?.id || user?.data?._id || user?.data?.id;

  // التحقق من الصلاحية: هل المستخدم أدمن؟ أو هل هو صاحب المنشور؟
  const isOwner = currentUserId && postAuthorId && (String(postAuthorId) === String(currentUserId));
  const isAdmin = user?.role === 'admin' || user?.data?.role === 'admin';

  // إذا لم يكن أدمن أو صاحب المنشور، لا تعرض الأيقونة مطلقاً
  if (!isAdmin && !isOwner) return null;

  return (
    <div className="dropdown dropdown-end" dir="rtl">
      {/* زر الثلاث نقاط */}
      <div 
        tabIndex={0} 
        role="button" 
        className="btn btn-ghost btn-sm btn-circle text-base-content opacity-70 hover:opacity-100 transition-opacity m-2"
      >
        <FaEllipsisV size={18} />
      </div>

      {/* القائمة المنسدلة عند النقر */}
      <ul 
        tabIndex={0} 
        className="dropdown-content menu p-2 shadow-lg bg-base-100 rounded-xl w-36 border border-base-200 z-[50] mt-1"
      >
        <li>
          <button 
            onClick={() => {
              // إغلاق القائمة برمجياً عن طريق سحب التركيز
              document.activeElement.blur();
              onEdit(post);
            }} 
            className="text-info gap-2 flex items-center py-2"
          >
            <FaEdit size={14} />
            <span className="text-xs font-bold">تعديل منشور</span>
          </button>
        </li>
        <hr className="border-base-200 my-1" />
        <li>
          <button 
            onClick={() => {
              document.activeElement.blur();
              onDelete(post);
            }} 
            className="text-error gap-2 flex items-center py-2"
          >
            <FaTrashAlt size={14} />
            <span className="text-xs font-bold">حذف منشور</span>
          </button>
        </li>
      </ul>
    </div>
  );
}

export default PostActionsDropdown;
