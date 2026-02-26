// frontend/src/pages/GoogleSuccess.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import { CheckCircle, Loader } from "lucide-react";

function GoogleSuccess() {
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading'); // loading, success, error
  const [error, setError] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (token) {
      // Save access token
      localStorage.setItem("accessToken", token);
      loadWorkspace();
    } else {
      setStatus('error');
      setError('No token received from Google login');
      setTimeout(() => navigate('/login'), 3000);
    }
  }, []);

  async function loadWorkspace() {
    try {
      const res = await API.get("/workspaces");
      
      if (res.data && res.data.length > 0) {
        const workspaceId = res.data[0].id;
        localStorage.setItem("workspaceId", workspaceId);
        setStatus('success');
        
        // Redirect to dashboard after short delay
        setTimeout(() => navigate('/app/dashboard'), 1500);
      } else {
        setStatus('error');
        setError('No workspaces found for this user');
        setTimeout(() => navigate('/app/projects'), 2000);
      }
    } catch (err) {
      console.error("Failed to load workspaces:", err);
      setStatus('error');
      setError(err.response?.data?.message || 'Failed to load workspace');
      setTimeout(() => navigate('/login'), 3000);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
        {status === 'loading' && (
          <>
            <div className="w-20 h-20 mx-auto mb-6 relative">
              <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Logging you in...
            </h2>
            <p className="text-gray-600 mb-6">
              Please wait while we set up your workspace
            </p>
            <div className="flex items-center justify-center gap-2 text-blue-600">
              <Loader size={18} className="animate-spin" />
              <span>Loading your data</span>
            </div>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-20 h-20 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle size={40} className="text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Login Successful!
            </h2>
            <p className="text-gray-600 mb-6">
              Redirecting you to dashboard...
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-green-600 h-2 rounded-full animate-progress"></div>
            </div>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-20 h-20 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
              <span className="text-4xl">😕</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Something went wrong
            </h2>
            <p className="text-red-600 mb-4">{error}</p>
            <p className="text-gray-500 text-sm">
              Redirecting to login page...
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default GoogleSuccess;