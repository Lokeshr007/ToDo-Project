import { useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import API from "../services/api";
import { ShieldCheck, ArrowRight, Mail } from "lucide-react";

function VerifyOtp() {
  const navigate = useNavigate();
  const location = useLocation();

  // Get email from location state or URL params as fallback
  const email = location.state?.email || new URLSearchParams(location.search).get("email");

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const inputsRef = useRef([]);

  const handleChange = (value, index) => {
    if (!/^[0-9]*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Move to next input if value is entered
    if (value && index < 5) {
      inputsRef.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    // Move to previous input on backspace
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputsRef.current[index - 1].focus();
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    const finalOtp = otp.join("");

    if (finalOtp.length < 6) {
      setError("Please enter the full 6-digit code");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await API.post("/auth/verify-otp", {
        email,
        otp: finalOtp,
      });

      // You could use a toast here instead of alert for better UI
      navigate("/login", { state: { message: "Account verified! Please login." } });
    } catch (err) {
      setError("Invalid or expired OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Blobs - Same as Register/Login */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
      <div className="absolute top-0 -right-4 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>

      <div className="relative w-full max-w-md">
        <div className="bg-white/80 backdrop-blur-lg border border-white shadow-2xl rounded-3xl p-10 text-center">
          {/* Header */}
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4 shadow-lg shadow-blue-200">
              <ShieldCheck className="text-white w-8 h-8" />
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Verify Email</h1>
            <div className="flex items-center justify-center gap-2 text-slate-500 mt-2 text-sm">
              <Mail className="w-4 h-4" />
              <span>Code sent to <span className="font-semibold text-slate-700">{email}</span></span>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm mb-6 border border-red-100 font-medium animate-shake">
              {error}
            </div>
          )}

          <form onSubmit={handleVerify}>
            {/* OTP Boxes */}
            <div className="flex justify-between gap-2 mb-8">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  type="text"
                  maxLength={1}
                  value={digit}
                  ref={(el) => (inputsRef.current[index] = el)}
                  onChange={(e) => handleChange(e.target.value, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  className="w-12 h-14 text-center text-2xl font-bold bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition outline-none shadow-sm"
                />
              ))}
            </div>

            <button
              disabled={loading}
              className="group w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3.5 rounded-xl transition-all duration-200 shadow-lg flex justify-center items-center gap-2 disabled:opacity-70"
            >
              {loading ? "Verifying..." : "Verify & Continue"}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <div className="mt-8">
              <p className="text-sm text-slate-500">
                Didn't receive a code?{" "}
                <button type="button" className="text-blue-600 font-bold hover:underline">
                  Resend Code
                </button>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default VerifyOtp;