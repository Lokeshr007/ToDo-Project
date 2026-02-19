import { useState } from "react";
import API from "../services/api";
import { useNavigate, Link } from "react-router-dom";
import { LogIn, Mail, Lock, ArrowRight, ShieldCheck } from "lucide-react";
import {useAuth} from "../context/AuthContext";
function Login() {
  const {login} = useAuth();
  const navigate = useNavigate();
  
  // State Management
  const [loginMode, setLoginMode] = useState("password"); // "password" or "otp"
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");
      
      // Traditional Login
      const res = await API.post("/auth/login", formData);
      login(res.data)
      navigate("/");
    } catch (err) {
      setError("Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const sendOtp = async () => {
    if (!formData.email) {
      return setError("Please enter your email first.");
    }
    try {
      setLoading(true);
      await API.post("/auth/login-otp/send", { email: formData.email });
      navigate("/login-otp", { state: { email: formData.email } });
    } catch (err) {
      setError("Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decorative Blobs */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
      <div className="absolute top-0 -right-4 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>

      <div className="relative w-full max-w-md">
        <div className="bg-white/80 backdrop-blur-lg border border-white shadow-2xl rounded-3xl p-10">
          
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4 shadow-lg shadow-blue-200">
              <LogIn className="text-white w-8 h-8" />
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Welcome Back</h1>
            <p className="text-slate-500 mt-2">Access your secure workspace.</p>
          </div>

          {/* Professional Toggle Switch */}
          <div className="flex p-1 bg-slate-100 rounded-xl mb-8">
            <button
              onClick={() => setLoginMode("password")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                loginMode === "password" 
                ? "bg-white text-blue-600 shadow-sm" 
                : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <Lock className="w-4 h-4" /> Password
            </button>
            <button
              onClick={() => setLoginMode("otp")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                loginMode === "otp" 
                ? "bg-white text-blue-600 shadow-sm" 
                : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <ShieldCheck className="w-4 h-4" /> OTP
            </button>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm mb-6 border border-red-100 text-center font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email Input */}
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 text-slate-400 w-5 h-5" />
              <input
                name="email"
                type="email"
                required
                placeholder="Email Address"
                className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition outline-none"
                onChange={handleChange}
              />
            </div>

            {/* Conditional Rendering: Password or Send OTP */}
            {loginMode === "password" ? (
              <>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 text-slate-400 w-5 h-5" />
                  <input
                    name="password"
                    type="password"
                    required
                    placeholder="Password"
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition outline-none"
                    onChange={handleChange}
                  />
                </div>
                <div className="text-right">
                  <Link to="/forgot-password" className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline underline-offset-4 transition-all">
                    Forgot Password?
                  </Link>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="group relative w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3.5 rounded-xl transition-all duration-200 shadow-lg flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {loading ? "Verifying..." : "Sign In"}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={sendOtp}
                disabled={loading}
                className="group w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 rounded-xl transition-all duration-200 shadow-lg shadow-blue-100 flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {loading ? "Sending..." : "Send Verification Code"}
                <ShieldCheck className="w-4 h-4 group-hover:scale-110 transition-transform" />
              </button>
            )}
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-100"></span></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-slate-400 font-medium">Or continue with</span></div>
          </div>

          {/* OAuth */}
          <button
            onClick={() => window.location.href = "http://localhost:8080/oauth2/authorization/google"}
            className="flex items-center justify-center gap-3 border border-slate-200 w-full py-3 rounded-xl hover:bg-slate-50 transition-colors font-semibold text-slate-700"
          >
            <img src="https://developers.google.com/identity/images/g-logo.png" alt="google" className="w-5 h-5" />
            Google Account
          </button>

          {/* Register Link */}
          <p className="text-center text-slate-500 mt-8 text-sm">
            Don't have an account?{" "}
            <Link to="/register" className="text-blue-600 font-bold hover:underline underline-offset-4">
              Join for free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;