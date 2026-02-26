import { useState } from "react";
import API from "@/services/api";
import { useNavigate, Link } from "react-router-dom";
import { UserPlus, Mail, Lock, User, ArrowRight } from "lucide-react";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await API.post("/auth/register", {
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });

      // Navigate to OTP page and pass email in state
      navigate("/verify-otp", { state: { email: formData.email } });
    } catch (err) {
      const data = err.response?.data;
      setError(
        typeof data === "string"
          ? data
          : data?.message || data?.error || "Registration failed. Try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Animated Blobs */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
      <div className="absolute top-0 -right-4 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>

      <div className="relative w-full max-w-md">
        <div className="bg-white/80 backdrop-blur-lg border border-white shadow-2xl rounded-3xl p-10">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4 shadow-lg shadow-blue-200">
              <UserPlus className="text-white w-8 h-8" />
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Create Account</h1>
            <p className="text-slate-500 mt-2">Join Todo Enterprise today.</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm border border-red-100 text-center font-medium animate-shake">
                {error}
              </div>
            )}

            {/* Name Input */}
            <div className="relative">
              <User className="absolute left-3.5 top-3.5 text-slate-400 w-5 h-5" />
              <input
                name="name"
                required
                placeholder="Full Name"
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition outline-none"
                onChange={handleChange}
              />
            </div>

            {/* Email Input */}
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 text-slate-400 w-5 h-5" />
              <input
                name="email"
                type="email"
                required
                placeholder="Email Address"
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition outline-none"
                onChange={handleChange}
              />
            </div>

            {/* Password Input */}
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 text-slate-400 w-5 h-5" />
              <input
                name="password"
                type="password"
                required
                placeholder="Create Password"
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition outline-none"
                onChange={handleChange}
              />
            </div>

            {/* Confirm Password Input */}
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 text-slate-400 w-5 h-5" />
              <input
                name="confirmPassword"
                type="password"
                required
                placeholder="Confirm Password"
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition outline-none"
                onChange={handleChange}
              />
            </div>

            <button
              disabled={loading}
              className="group relative w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3.5 rounded-xl transition-all duration-200 shadow-lg flex items-center justify-center gap-2 disabled:opacity-70 mt-4"
            >
              {loading ? "Processing..." : "Sign Up"}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <p className="text-center text-slate-600 mt-8 text-sm">
              Already have an account?{" "}
              <Link to="/login" className="text-blue-600 font-bold hover:underline underline-offset-4">
                Sign In
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Register;