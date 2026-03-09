// frontend/src/app/providers/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import API from "@/services/api";
import { useNavigate, useLocation } from "react-router-dom";
import { taskToast } from '@/shared/components/QuantumToaster';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const redirectToHome = (reason = 'user_not_found') => {
    console.warn(`Redirecting to home: ${reason}`);
    localStorage.clear();
    delete API.defaults.headers.common['Authorization'];
    setUser(null);
    setProfile(null);
    navigate(`/?reason=${reason}`);
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const reason = params.get('reason');
    
    if (reason === 'user_not_found') {
      taskToast.error('Session expired. Please login again.');
      localStorage.clear();
      setUser(null);
      setProfile(null);
    } else if (reason === 'refresh_failed') {
      taskToast.error('Session expired. Please login again.');
      localStorage.clear();
      setUser(null);
      setProfile(null);
    }
  }, [location]);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const savedUser = localStorage.getItem("user");
        
        if (!token || !savedUser) {
          setLoading(false);
          return;
        }

        API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        let parsedUser;
        try {
          parsedUser = JSON.parse(savedUser);
        } catch {
          redirectToHome('invalid_user_data');
          setLoading(false);
          return;
        }
        
        try {
          const workspacesResponse = await API.get("/workspaces");
          const workspaces = workspacesResponse.data || [];
          
          const updatedUser = {
            ...parsedUser,
            workspaces: workspaces
          };
          
          setUser(updatedUser);
          setProfile(updatedUser);
          localStorage.setItem("user", JSON.stringify(updatedUser));
          
          // Set current workspace if available
          const savedWorkspaceId = localStorage.getItem("currentWorkspaceId");
          if (savedWorkspaceId && savedWorkspaceId !== 'undefined' && savedWorkspaceId !== 'null') {
            const workspace = workspaces.find(w => w.id.toString() === savedWorkspaceId);
            if (workspace) {
              localStorage.setItem("currentWorkspaceId", workspace.id.toString());
            } else if (workspaces.length > 0) {
              localStorage.setItem("currentWorkspaceId", workspaces[0].id.toString());
            }
          } else if (workspaces.length > 0) {
            localStorage.setItem("currentWorkspaceId", workspaces[0].id.toString());
          }
          
        } catch (error) {
          console.error("Failed to fetch workspaces:", error);
          
          if (error.response?.status === 400 || error.response?.status === 401) {
            redirectToHome('user_not_found');
          } else {
            setUser(parsedUser);
            setProfile(parsedUser);
          }
        }
      } catch (error) {
        console.error("Error loading user:", error);
        redirectToHome('load_error');
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

 // In the login function, after setting user data:
const login = async (data, redirectTo = "/app/dashboard") => {
  try {
    const userData = {
      accessToken: data.accessToken,
      id: data.user?.id,
      email: data.user?.email || data.email,
      name: data.user?.name || data.name,
      workspaces: data.workspaces || []
    };
    
    localStorage.setItem("accessToken", data.accessToken);
    localStorage.setItem("user", JSON.stringify(userData));
    
    API.defaults.headers.common['Authorization'] = `Bearer ${data.accessToken}`;
    
    // Set current workspace
    if (userData.workspaces && userData.workspaces.length > 0) {
      const workspaceId = userData.workspaces[0].id.toString();
      localStorage.setItem("currentWorkspaceId", workspaceId);
      localStorage.setItem("currentWorkspace", JSON.stringify(userData.workspaces[0]));
    }
    
    setUser(userData);
    setProfile(userData);
    
    navigate(redirectTo);
    taskToast.success('Login successful!');
    return true;
  } catch (error) {
    console.error("Login error:", error);
    taskToast.error("Login failed");
    throw error;
  }
};

    const logout = async () => {
      try {
        await API.post("/auth/logout");
      } catch (error) {
        console.error("Logout API error:", error);
      } finally {
        // Clear all storage
        localStorage.clear();
        sessionStorage.clear();
        
        // Clear axios headers
        delete API.defaults.headers.common['Authorization'];
        delete API.defaults.headers.common['X-Workspace-ID'];
        
        // Reset state
        setUser(null);
        setProfile(null);
        
        // Navigate to home
        navigate('/');
        taskToast.success('Logged out successfully');
      }
    };

  const updateProfile = async (profileData) => {
    try {
      const response = await API.put('/users/profile', profileData);
      setProfile(response.data);
      setUser(prev => ({ ...prev, ...response.data }));
      
      const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
      const updatedUser = { ...storedUser, ...response.data };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      
      taskToast.success('Profile updated successfully');
      return response.data;
    } catch (error) {
      console.error('Update profile error:', error);
      
      if (error.response?.status === 400) {
        redirectToHome('user_not_found');
      }
      
      taskToast.error(error.response?.data?.message || 'Failed to update profile');
      throw error;
    }
  };

  const refreshUser = async () => {
    try {
      const response = await API.get('/auth/me');
      setUser(response.data);
      setProfile(response.data);
      localStorage.setItem("user", JSON.stringify(response.data));
      return response.data;
    } catch (error) {
      console.error('Failed to refresh user:', error);
      if (error.response?.status === 400) {
        redirectToHome('user_not_found');
      }
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      login,
      logout,
      updateProfile,
      loading,
      refreshUser,
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
