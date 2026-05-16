import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useToast } from "../Component/ui/PopUp/ToastContext";
import { Link } from "react-router-dom"; 
import API from "../api/axiosInstance";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  
  const { login } = useContext(AuthContext);
  const showToast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!username || !password) {
      return showToast("يرجى إدخال اسم المستخدم وكلمة المرور", "error");
    }

    try {
      setLoading(true);
      const res = await API.post("/login", { username, password });
      
      //LOGIN
      login({ 
        id: res.data.userID, 
        username: res.data.username,
        email: res.data.email,
        age: res.data.age,
        role: res.data.role 
      }, res.data.token);
      
      showToast("تم تسجيل الدخول بنجاح", "success");
    } catch (err) {
      const errorMsg = err.response?.data?.message || "فشل تسجيل الدخول، تحقق من البيانات";
      showToast(errorMsg, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-start justify-center p-4 bg-base-200">
      <div className="card w-full max-w-md bg-base-100 shadow-2xl border border-success/20 mt-10">
        <div className="card-body">
          <h2 className="card-title justify-center text-2xl font-black mb-4 text-success">
             تسجيل الدخول
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div className="form-control">
              <label className="label">
                <span className="label-text font-bold">اسم المستخدم</span>
              </label>
              <input 
                className="input input-bordered focus:input-success transition-all bg-base-200/50" 
                type="text" 
                placeholder="أدخل اسم المستخدم" 
                value={username} 
                onChange={e => setUsername(e.target.value)} 
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-bold">كلمة المرور</span>
              </label>
              <input 
                className="input input-bordered focus:input-success transition-all bg-base-200/50" 
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
                className="btn btn-success w-full text-white font-bold shadow-lg"
              >
                {loading ? (
                  <span className="loading loading-spinner loading-sm"></span>
                ) : (
                  "تسجيل الدخول"
                )}
              </button>

              <div className="mt-6 text-center text-sm border-t border-base-200 pt-4">
                <span className="text-gray-500">ليس لديك حساب؟ </span>
                <Link to="/register" className="text-success font-black hover:underline">
                  أنشئ حساباً جديداً
                </Link>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
