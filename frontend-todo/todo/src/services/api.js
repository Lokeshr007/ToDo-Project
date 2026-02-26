import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});


// =======================
// TOKEN REFRESH CONTROL
// =======================

let isRefreshing = false;
let refreshSubscribers = [];

const onRefreshed = (token) => {
  refreshSubscribers.map((cb) => cb(token));
};

const addRefreshSubscriber = (callback) => {
  refreshSubscribers.push(callback);
};


// =======================
// REQUEST INTERCEPTOR
// =======================

api.interceptors.request.use((config) => {

  const token = localStorage.getItem("accessToken");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // workspace id injected from localStorage (temporary)
  // later we upgrade to WorkspaceContext sync

  const workspaceId = localStorage.getItem("currentWorkspaceId");

  if (
    workspaceId &&
    !config.url.includes("/auth") &&
    !config.url.includes("/workspaces")
  ) {
    config.headers["X-Workspace-ID"] = workspaceId;
  }

  return config;
});


// =======================
// RESPONSE INTERCEPTOR
// =======================

api.interceptors.response.use(
  (response) => response,

  async (error) => {

    const originalRequest = error.config;

    if (error.response?.status === 401) {

      if (originalRequest._retry) {
        localStorage.clear();
        window.location.href = "/login";
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
        localStorage.clear();
        window.location.href = "/login";
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