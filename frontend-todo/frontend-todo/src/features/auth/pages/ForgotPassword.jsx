import { useState } from "react";
import API from "@/services/api";
import { useNavigate, Link } from "react-router-dom";
import { KeyRound, Mail, Lock, ShieldCheck, ArrowRight, ArrowLeft } from "lucide-react";

function ForgotPassword() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const sendOtp = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");
      await API.post("/auth/forgot-password-send", { email });
      setStep(2);
    } catch (err) {
      setError("Failed to send OTP. Please check your email.");
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");
      await API.post("/auth/forgot-password-verify", { email, otp });
      setStep(3);
    } catch (err) {
      setError("Invalid OTP code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");
      await API.post("/auth/reset-password", { email, newPassword: password });
      navigate("/login", { state: { message: "Password reset successful!" } });
    } catch (err) {
      setError("Reset failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Shared Background Blobs */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
      <div className="absolute top-0 -right-4 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>

      <div className="relative w-full max-w-md">
        <div className="bg-white/80 backdrop-blur-lg border border-white shadow-2xl rounded-3xl p-10">
          
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4 shadow-lg shadow-blue-200">
              <KeyRound className="text-white w-8 h-8" />
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {step === 1 && "Reset Password"}
              {step === 2 && "Verify OTP"}
              {step === 3 && "New Password"}
            </h1>
            <p className="text-slate-500 mt-2 text-sm">
              {step === 1 && "Enter your email to receive a recovery code."}
              {step === 2 && `We've sent a 6-digit code to ${email}`}
              {step === 3 && "Please choose a strong new password."}
            </p>
          </div>

          {/* Progress Stepper */}
          <div className="flex items-center justify-center gap-2 mb-8">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-1.5 w-12 rounded-full transition-all duration-300 ${
                  step >= s ? "bg-blue-600" : "bg-slate-200"
                }`}
              />
            ))}
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm mb-6 border border-red-100 text-center font-medium animate-shake">
              {error}
            </div>
          )}

          {/* STEP 1: Email */}
          {step === 1 && (
            <form onSubmit={sendOtp} className="space-y-5">
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 text-slate-400 w-5 h-5" />
                <input
                  type="email"
                  required
                  placeholder="Email Address"
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 transition outline-none"
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <button
                disabled={loading}
                className="group w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3.5 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {loading ? "Sending..." : "Send Reset Code"}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </form>
          )}

          {/* STEP 2: OTP */}
          {step === 2 && (
            <form onSubmit={verifyOtp} className="space-y-5">
              <div className="relative">
                <ShieldCheck className="absolute left-3.5 top-3.5 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  required
                  placeholder="6-Digit Code"
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 transition outline-none tracking-[0.5em] font-bold"
                  onChange={(e) => setOtp(e.target.value)}
                />
              </div>
              <button
                disabled={loading}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3.5 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
              >
                {loading ? "Verifying..." : "Verify Code"}
              </button>
            </form>
          )}

          {/* STEP 3: New Password */}
          {step === 3 && (
            <form onSubmit={resetPassword} className="space-y-5">
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 text-slate-400 w-5 h-5" />
                <input
                  type="password"
                  required
                  placeholder="New Password"
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 transition outline-none"
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <button
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
              >
                {loading ? "Updating..." : "Update Password"}
              </button>
            </form>
          )}

          {/* Footer Navigation */}
          <div className="mt-8 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-blue-600 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Login
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;