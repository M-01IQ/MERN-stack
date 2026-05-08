import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { FaUserCircle, FaIdBadge, FaEnvelope, FaCalendarAlt, FaShieldAlt } from "react-icons/fa";

const Profile = () => {
  const { user } = useContext(AuthContext);

  // إذا لم يتم تحميل بيانات المستخدم بعد
  if (!user) {
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <span className="loading loading-spinner loading-lg text-success"></span>
      </div>
    );
  }

  return (
    <div dir="rtl" className="min-h-screen bg-base-200 p-4 pb-24">
      <div className="max-w-md mx-auto mt-10">
        
        {/* بطاقة البروفايل الرئيسية */}
        <div className="card bg-base-100 shadow-xl border border-base-300">
          
          {/* خلفية علوية جمالية */}
          <div className="h-24 bg-gradient-to-l from-success to-green-600 rounded-t-2xl"></div>
          
          <div className="card-body items-center text-center -mt-12">
            {/* الصورة الرمزية */}
            <div className="avatar placeholder">
              <div className="bg-neutral text-neutral-content rounded-full w-24 ring ring-base-100 ring-offset-base-100 ring-offset-2 flex items-center justify-center">
                <span className="text-5xl font-black uppercase select-none">
                  {user.username?.charAt(0)}
                </span>
              </div>
            </div>

            <h2 className="card-title text-2xl font-black mt-2">
              {user.username}
            </h2>
            
            {/* عرض الـ Role بشكل شارة (Badge) */}
            <div className={`badge ${user.role === 'admin' ? 'badge-info' : 'badge-ghost'} gap-2 p-3 font-bold`}>
              {user.role === 'admin' ? <FaShieldAlt /> : <FaIdBadge />}
              {user.role === 'admin' ? 'مسؤول النظام' : 'مستخدم'}
            </div>

            <div className="divider w-full">المعلومات الشخصية</div>

            {/* تفاصيل البيانات */}
            <div className="w-full space-y-4">
              
              {/* العمر */}
              <div className="flex items-center gap-4 bg-base-200 p-3 rounded-lg">
                <div className="bg-success/10 p-2 rounded-full text-success">
                  <FaCalendarAlt />
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">العمر</p>
                  <p className="font-bold">{user.age || "غير محدد"} سنة</p>
                </div>
              </div>

              {/* البريد الإلكتروني (إذا كان متوفراً في الـ Context) */}
              <div className="flex items-center gap-4 bg-base-200 p-3 rounded-lg">
                <div className="bg-success/10 p-2 rounded-full text-success">
                  <FaEnvelope />
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">البريد الإلكتروني</p>
                  <p className="font-bold truncate max-w-[200px]">{user.email || "لا يوجد بريد"}</p>
                </div>
              </div>

            </div>

            <div className="card-actions mt-6 w-full">
              <button className="btn btn-success btn-outline w-full rounded-xl">
                تعديل البيانات
              </button>
            </div>
          </div>
        </div>
        
        {/* ملاحظة بسيطة أسفل البطاقة */}
        <p className="text-center text-gray-400 text-xs mt-6 px-10">
          هذه البيانات خاصة بحسابك الشخصي ولا تظهر للمستخدمين الآخرين إلا بموافقتك.
        </p>
      </div>
    </div>
  );
};

export default Profile;
