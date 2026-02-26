// frontend/src/services/api.js
import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

let isRefreshing = false;
let refreshSubscribers = [];

const onRefreshed = (token) => {
  refreshSubscribers.map((cb) => cb(token));
};

const addRefreshSubscriber = (callback) => {
  refreshSubscribers.push(callback);
};

const isValidUser = () => {
  const token = localStorage.getItem("accessToken");
  const user = localStorage.getItem("user");
  
  if (!token || !user) {
    return false;
  }
  
  try {
    const parsedUser = JSON.parse(user);
    return parsedUser && parsedUser.email;
  } catch {
    return false;
  }
};

const redirectToHome = (reason) => {
  if (window.location.pathname !== '/' && !window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
    console.warn(`Redirecting to home: ${reason}`);
    localStorage.clear();
    window.location.href = `/?reason=${reason}`;
  }
};

const isAuthUrl = (url) => {
  return url.includes('/auth/') || 
         url.includes('/login') || 
         url.includes('/register') || 
         url.includes('/verify-otp') ||
         url.includes('/forgot-password') ||
         url.includes('/google-success');
};

const isPublicUrl = (url) => {
  return url.includes('/workspaces') || isAuthUrl(url);
};

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  const user = localStorage.getItem("user");
  
  // For public routes, don't require auth
  if (isPublicUrl(config.url)) {
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  }
  
  // For protected routes, require auth
  if (!token || !user) {
    redirectToHome('no_auth');
    return Promise.reject(new Error("No authentication token"));
  }
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Add workspace header for workspace-specific routes
  const needsWorkspace = !config.url.includes("/auth") && 
                        !config.url.includes("/workspaces") &&
                        !config.url.includes("/users/profile") &&
                        !config.url.includes("/users/stats") &&
                        !config.url.includes("/users/avatar") &&
                        !config.url.includes("/users/cover") &&
                        !config.url.includes("/users/sessions") &&
                        !config.url.includes("/users/activity");
  
  if (needsWorkspace) {
    const workspaceId = localStorage.getItem("currentWorkspaceId");
    
    if (workspaceId && workspaceId !== 'undefined' && workspaceId !== 'null') {
      try {
        const parsedId = parseInt(workspaceId);
        if (!isNaN(parsedId)) {
          config.headers["X-Workspace-ID"] = parsedId.toString();
        }
      } catch (e) {
        console.error("Invalid workspace ID format:", workspaceId);
      }
    }
  }

  // Clean up params
  if (config.params) {
    Object.keys(config.params).forEach(key => {
      if (config.params[key] === undefined || config.params[key] === null || config.params[key] === '') {
        delete config.params[key];
      }
    });
  }

  return config;
}, (error) => {
  return Promise.reject(error);
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Don't redirect for auth or public URLs
    if (originalRequest && (isAuthUrl(originalRequest.url) || isPublicUrl(originalRequest.url))) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401) {
      if (!isValidUser()) {
        redirectToHome('invalid_user');
        return Promise.reject(error);
      }

      if (originalRequest._retry) {
        redirectToHome('refresh_failed');
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve) => {
          addRefreshSubscriber((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(api(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const res = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        const newToken = res.data.accessToken;
        localStorage.setItem("accessToken", newToken);

        isRefreshing = false;
        onRefreshed(newToken);
        refreshSubscribers = [];

        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (err) {
        isRefreshing = false;
        redirectToHome('refresh_failed');
        return Promise.reject(err);
      }
    }

    if (error.response?.status === 403) {
      window.dispatchEvent(
        new CustomEvent("showNotification", {
          detail: {
            message: "Access denied",
            type: "error",
          },
        })
      );
    }

    return Promise.reject(error);
  }
);

export default api;