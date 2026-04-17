import axios from "axios";

// ✅ Fallback if .env not found
const API_URL = process.env.REACT_APP_BACKEND_URL || "http://127.0.0.1:8000";

// ✅ Create instance
const api = axios.create({
  baseURL: API_URL,
});

// ================= REQUEST INTERCEPTOR =================
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");

    // ✅ Attach token if exists
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ================= RESPONSE INTERCEPTOR =================
api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    // ✅ If token expired (401)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refresh_token");

        // ❌ If no refresh token → logout
        if (!refreshToken) {
          throw new Error("No refresh token");
        }

        // ✅ Call refresh API
        const { data } = await axios.post(
          `${API_URL}/api/auth/refresh/`,
          {
            refresh: refreshToken,
          }
        );

        // ✅ Save new token
        localStorage.setItem("access_token", data.access);

        // ✅ Retry original request
        originalRequest.headers.Authorization = `Bearer ${data.access}`;
        return api(originalRequest);

      } catch (refreshError) {
        // ❌ Refresh failed → logout user
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");

        window.location.href = "/login";

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;