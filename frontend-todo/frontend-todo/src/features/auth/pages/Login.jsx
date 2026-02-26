import { useState } from "react";
import API from "@/services/api";
import { useNavigate, Link } from "react-router-dom";
import { LogIn, Mail, Lock, ArrowRight, ShieldCheck } from "lucide-react";
import { useAuth } from "@/app/providers/AuthContext";
import toast from 'react-hot-toast';

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  
  // State Management
  const [loginMode, setLoginMode] = useState("password"); // "password" or "otp"
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear error when user types
    if (error) setError("");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    // Validate inputs
    if (!formData.email || !formData.password) {
      setError("Please enter both email and password");
      return;
    }
    
    try {
      setLoading(true);
      setError("");
      
      // Traditional Login
      const response = await API.post("/auth/login", formData);
      
      if (response.data.success) {
        // Login with the response data
        login(response.data);
        toast.success("Login successful!");
      } else {
        setError(response.data.message || "Invalid credentials");
      }
    } catch (err) {
      console.error("Login error:", err);
      const errorMessage = err.response?.data?.message || "Invalid credentials. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const sendOtp = async () => {
    if (!formData.email) {
      setError("Please enter your email first.");
      toast.error("Please enter your email first.");
      return;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address");
      toast.error("Please enter a valid email address");
      return;
    }
    
    try {
      setLoading(true);
      await API.post("/auth/login-otp/send", { email: formData.email });
      toast.success("OTP sent to your email");
      navigate("/verify-otp", { state: { email: formData.email } });
    } catch (err) {
      console.error("OTP send error:", err);
      const errorMessage = err.response?.data?.message || "Failed to send OTP. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:8080/oauth2/authorization/google";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decorative Blobs */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
      <div className="absolute top-0 -right-4 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>

      <div className="relative w-full max-w-md">
        <div className="bg-white/90 backdrop-blur-xl border border-white/50 shadow-2xl rounded-3xl p-10">
          
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl mb-4 shadow-lg shadow-blue-200">
              <LogIn className="text-white w-8 h-8" />
            </div>
            <h1 className="text-3xl font-extrabold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent tracking-tight">
              Welcome Back
            </h1>
            <p className="text-gray-500 mt-2">Access your secure workspace</p>
          </div>

          {/* Professional Toggle Switch */}
          <div className="flex p-1 bg-gray-100 rounded-xl mb-8">
            <button
              onClick={() => setLoginMode("password")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                loginMode === "password" 
                  ? "bg-white text-blue-600 shadow-sm border border-gray-200" 
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Lock className="w-4 h-4" /> Password
            </button>
            <button
              onClick={() => setLoginMode("otp")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                loginMode === "otp" 
                  ? "bg-white text-blue-600 shadow-sm border border-gray-200" 
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <ShieldCheck className="w-4 h-4" /> OTP
            </button>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm mb-6 border border-red-100 text-center font-medium animate-shake">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email Input */}
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 text-gray-400 w-5 h-5" />
              <input
                name="email"
                type="email"
                required
                placeholder="Email Address"
                value={formData.email}
                className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition outline-none"
                onChange={handleChange}
                disabled={loading}
              />
            </div>

            {/* Conditional Rendering: Password or Send OTP */}
            {loginMode === "password" ? (
              <>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 text-gray-400 w-5 h-5" />
                  <input
                    name="password"
                    type="password"
                    required
                    placeholder="Password"
                    value={formData.password}
                    className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition outline-none"
                    onChange={handleChange}
                    disabled={loading}
                  />
                </div>
                <div className="text-right">
                  <Link 
                    to="/forgot-password" 
                    className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline underline-offset-4 transition-all"
                  >
                    Forgot Password?
                  </Link>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="group relative w-full bg-gradient-to-r from-gray-900 to-gray-800 hover:from-gray-800 hover:to-gray-700 text-white font-semibold py-3.5 rounded-xl transition-all duration-200 shadow-lg shadow-gray-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={sendOtp}
                disabled={loading}
                className="group w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3.5 rounded-xl transition-all duration-200 shadow-lg shadow-blue-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <span>Send Verification Code</span>
                    <ShieldCheck className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  </>
                )}
              </button>
            )}
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-200"></span>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-4 text-gray-400 font-medium">Or continue with</span>
            </div>
          </div>

          {/* OAuth */}
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="flex items-center justify-center gap-3 border border-gray-200 w-full py-3 rounded-xl hover:bg-gray-50 transition-colors font-semibold text-gray-700 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            <img 
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" 
              alt="Google" 
              className="w-5 h-5"
            />
            Continue with Google
          </button>

          {/* Register Link */}
          <p className="text-center text-gray-500 mt-8 text-sm">
            Don't have an account?{" "}
            <Link 
              to="/register" 
              className="text-blue-600 font-semibold hover:text-blue-700 hover:underline underline-offset-4 transition-all"
            >
              Create free account
            </Link>
          </p>
        </div>
      </div>

      {/* Add custom animations */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-2px); }
          20%, 40%, 60%, 80% { transform: translateX(2px); }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
}

export default Login;