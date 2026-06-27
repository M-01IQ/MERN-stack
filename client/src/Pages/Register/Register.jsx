import { Link, useNavigate } from "react-router-dom";
import { useState, useContext } from "react";
import API from "../../api/axiosInstance"; 
import { useToast } from '../../Component/ui/PopUp/ToastContext';
import { AuthContext } from "../../context/AuthContext";

const Register = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState(""); 
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const showToast = useToast();
  const navigate = useNavigate();
  
  // 1. استخراج دالة login من الـ Context
  const { login } = useContext(AuthContext);

  const onSubmit = async (e) => {
    e.preventDefault();
    
    if (!username || !password || !email) {
      return showToast("يرجى إدخال كافة البيانات", "error");
    }

    try {
      setLoading(true);
      // 2. إرسال الطلب للسيرفر
      const response = await API.post("/register", { username, password, email, isAdmin });
      
      const { token, userID, role } = response.data;

      login({ userID, username, role }, token);
      
      showToast("تم إنشاء الحساب والدخول بنجاح", "success");
      
      navigate("/"); 

    } catch (error) {
      const errorMsg = error.response?.data?.message || "فشل انشاء الحساب";
      showToast(errorMsg, "error");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-[100vh] flex items-center justify-center p-4">
      <div className="card w-full max-w-md bg-base-100 shadow-2xl border border-success/20">
        <div className="card-body">
          <h2 className="card-title justify-center text-2xl font-bold mb-4 text-success">إنشاء حساب</h2>
          <form onSubmit={onSubmit} className="space-y-4">
            
            <div className="form-control flex flex-col">
              <label className="label m-2"><span className="label-text font-medium">اسم المستخدم</span></label>
              <input 
                className="input input-bordered w-full focus:input-success transition-all" 
                type="text" 
                placeholder="أدخل اسم المستخدم" 
                value={username} 
                onChange={e => setUsername(e.target.value)} 
              />
            </div>

            <div className="form-control flex flex-col">
              <label className="label m-2"><span className="label-text font-medium">البريد الإلكتروني</span></label>
              <input 
                className="input input-bordered w-full focus:input-success transition-all" 
                type="email" 
                placeholder="email@example.com" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
              />
            </div>

            <div className="form-control flex flex-col">
              <label className="label m-2"><span className="label-text font-medium">كلمة المرور</span></label>
              <input 
                className="input input-bordered w-full focus:input-success transition-all" 
                type="password" 
                placeholder="••••••••" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
              />
            </div>

            <div className="form-control mt-6">
              <button 
                type="submit" 
                disabled={loading}
                className="btn btn-success w-full flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    <span>جاري الإنشاء...</span>
                  </>
                ) : ("تسجيل مستخدم جديد")}
              </button>

              <div className="mt-4 text-center text-sm">
                <span>لديك حساب بالفعل؟ </span>
                <Link to="/login" className="text-success font-bold hover:underline">
                  سجل دخولك من هنا
                </Link>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
