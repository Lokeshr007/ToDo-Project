import { createContext, useContext, useState, useEffect } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [currentWorkspace, setCurrentWorkspace] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem("accessToken");
      const savedWorkspace = localStorage.getItem("currentWorkspace");

      if (token) {
        try {
          // Set default auth header
          API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          // Fetch user's workspaces
          const response = await API.get("/workspaces");
          console.log("Workspaces fetched:", response.data);
          
          const workspaces = response.data;
          
          // Set current workspace (saved or first)
          let workspace = null;
          if (savedWorkspace) {
            workspace = JSON.parse(savedWorkspace);
            // Verify workspace still exists
            if (!workspaces.find(w => w.id === workspace.id)) {
              workspace = workspaces[0] || null;
            }
          } else {
            workspace = workspaces[0] || null;
          }
          
          setCurrentWorkspace(workspace);
          if (workspace) {
            localStorage.setItem("currentWorkspace", JSON.stringify(workspace));
          }
          
          setUser({ 
            accessToken: token,
            workspaces: workspaces 
          });
        } catch (error) {
          console.error("Token validation failed:", error);
          localStorage.removeItem("accessToken");
          localStorage.removeItem("currentWorkspace");
          delete API.defaults.headers.common['Authorization'];
        }
      }

      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (data) => {
    localStorage.setItem("accessToken", data.accessToken);
    API.defaults.headers.common['Authorization'] = `Bearer ${data.accessToken}`;
    
    try {
      // Fetch user's workspaces after login
      const workspacesResponse = await API.get("/workspaces");
      console.log("Workspaces after login:", workspacesResponse.data);
      
      const workspaces = workspacesResponse.data;
      const defaultWorkspace = workspaces[0] || null;
      
      setCurrentWorkspace(defaultWorkspace);
      if (defaultWorkspace) {
        localStorage.setItem("currentWorkspace", JSON.stringify(defaultWorkspace));
      }
      
      setUser({
        accessToken: data.accessToken,
        workspaces: workspaces
      });
      
      navigate("/app/dashboard");
    } catch (error) {
      console.error("Failed to fetch workspaces:", error);
      setUser({ accessToken: data.accessToken });
      navigate("/app/dashboard");
    }
  };

  const logout = async () => {
    try {
      // Optional: Call logout endpoint
      await API.post("/auth/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.clear();
      delete API.defaults.headers.common['Authorization'];
      setUser(null);
      setCurrentWorkspace(null);
      navigate("/");
    }
  };

  const switchWorkspace = (workspace) => {
    setCurrentWorkspace(workspace);
    localStorage.setItem("currentWorkspace", JSON.stringify(workspace));
  };

  return (
    <AuthContext.Provider value={{
      user,
      currentWorkspace,
      login,
      logout,
      switchWorkspace,
      loading
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);