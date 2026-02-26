// frontend/src/features/public/pages/ComingSoon.jsx
import { Construction, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

function ComingSoon() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 flex items-center justify-center">
      <div className="text-center">
        <Construction size={64} className="mx-auto text-yellow-400 mb-4 animate-bounce" />
        <h2 className="text-2xl font-bold text-white mb-2">Coming Soon</h2>
        <p className="text-slate-400 mb-6">This page is under construction</p>
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
        >
          <ArrowLeft size={16} />
          Go Back
        </button>
      </div>
    </div>
  );
}

export default ComingSoon;