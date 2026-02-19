import axios from 'axios'

const API = axios.create({
   baseURL: "http://localhost:8080/api"
});


let isRefreshing = false;
let refreshSubscribers = [];

function subscribeTokenRefresh(cb) {
   refreshSubscribers.push(cb);
}

function onRefreshed(token) {
   refreshSubscribers.forEach(cb => cb(token));
   refreshSubscribers = [];
}

function logout() {
   localStorage.clear();

   // ✅ NO HARD RELOAD
   if(window.location.pathname !== "/login"){
      window.history.pushState({}, "", "/login");
      window.dispatchEvent(new PopStateEvent("popstate"));
   }
}

// ===== REQUEST =====

API.interceptors.request.use(config => {
   const token = localStorage.getItem("accessToken");

   if(token){
      config.headers.Authorization = `Bearer ${token}`;
   }

   return config;
})

// ===== RESPONSE =====

API.interceptors.response.use(
  res => res,
  async error => {

    const originalRequest = error.config;

    // Already retried once → stop
    if (originalRequest._retry) {
      return Promise.reject(error);
    }

    // Skip refresh for auth endpoints
    if (originalRequest.url.includes("/auth")) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401) {

      const refreshToken = localStorage.getItem("refreshToken");

      // 🔥 No refresh token → logout
      if (!refreshToken) {
        logout();
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      try {

        // IMPORTANT → use axios (not API)
        const res = await axios.post(
          "http://localhost:8080/api/auth/refresh",
          { refreshToken }
        );

        const newAccessToken = res.data.accessToken;

        localStorage.setItem("accessToken", newAccessToken);

        originalRequest.headers.Authorization =
          `Bearer ${newAccessToken}`;

        return API(originalRequest);

      } catch (err) {

        // Refresh failed → logout
        logout();
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);


export default API;
