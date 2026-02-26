import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/app/providers/AuthContext";
import { CheckCircle, Loader, XCircle } from "lucide-react";
import toast from 'react-hot-toast';

function GoogleSuccess() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [status, setStatus] = useState('loading'); // loading, success, error
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    const email = params.get("email");
    const name = params.get("name");

    if (token) {
      handleLogin(token, email, name);
      
      // Progress animation
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 2;
        });
      }, 50);
      
      return () => clearInterval(interval);
    } else {
      setStatus('error');
      setError('No authentication token received');
      toast.error('Google login failed');
      setTimeout(() => navigate('/login'), 3000);
    }
  }, [location, navigate]);

  async function handleLogin(token, email, name) {
    try {
      // Create user data object
      const userData = {
        accessToken: token,
        user: {
          email: email || '',
          name: name || email?.split('@')[0] || 'User'
        },
        workspaces: [],
        success: true
      };
      
      // Login with the token
      await login(userData, "/app/dashboard");
      setStatus('success');
      toast.success('Google login successful!');
    } catch (err) {
      console.error("Google login finalization failed:", err);
      setStatus('error');
      setError(err.response?.data?.message || 'Failed to complete Google login');
      toast.error('Google login failed');
      setTimeout(() => navigate('/login'), 3000);
    }
  }

  const getInitials = (name, email) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    if (email) {
      return email[0].toUpperCase();
    }
    return 'U';
  };

  const params = new URLSearchParams(location.search);
  const email = params.get("email") || '';
  const name = params.get("name") || '';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 flex items-center justify-center p-4">
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 max-w-md w-full text-center relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400"></div>
        
        {status === 'loading' && (
          <>
            <div className="w-24 h-24 mx-auto mb-6 relative">
              <div className="absolute inset-0 border-4 border-blue-100 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                {name || email ? (
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                    {getInitials(name, email)}
                  </div>
                ) : (
                  <Loader size={32} className="text-blue-600 animate-spin" />
                )}
              </div>
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Welcome{name ? `, ${name.split(' ')[0]}` : ''}!
            </h2>
            <p className="text-gray-600 mb-6">
              Setting up your workspace...
            </p>
            
            {/* Progress bar */}
            <div className="w-full bg-gray-100 rounded-full h-2 mb-4">
              <div 
                className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            
            <div className="flex items-center justify-center gap-2 text-blue-600">
              <Loader size={18} className="animate-spin" />
              <span className="text-sm font-medium">
                {progress < 30 && "Verifying..."}
                {progress >= 30 && progress < 60 && "Loading your data..."}
                {progress >= 60 && progress < 90 && "Almost there..."}
                {progress >= 90 && "Redirecting..."}
              </span>
            </div>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-24 h-24 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center animate-bounce">
              <CheckCircle size={48} className="text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Login Successful!
            </h2>
            <p className="text-gray-600 mb-6">
              Redirecting you to dashboard...
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-600 h-2 rounded-full transition-all duration-300 animate-pulse"
                style={{ width: '100%' }}
              ></div>
            </div>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-24 h-24 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
              <XCircle size={48} className="text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Something went wrong
            </h2>
            <p className="text-red-600 mb-4 font-medium">{error}</p>
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