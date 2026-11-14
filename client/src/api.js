import axios from "axios";

// ── Smart API Base URL Resolver ──────────────────────────────────────────────
// Target the live deployed Render backend: https://flick-ticket-bt8v.onrender.com
const DEPLOYED_RENDER_BACKEND = "https://flick-ticket-bt8v.onrender.com";

const getBaseURL = () => {
  return process.env.REACT_APP_API_URL || DEPLOYED_RENDER_BACKEND;
};

const API = axios.create({
  baseURL: getBaseURL(),
});

// ── Attach JWT token or Bypass token to every request automatically ──
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    const bypass = sessionStorage.getItem("admin_bypass");

    // Prioritize bypass password for admin actions
    if (bypass === "true") {
      config.headers.Authorization = `Bypass 123456`;
    } else if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Handle 401 globally (token expired / invalid) ──
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("userId");
      localStorage.removeItem("role");
      localStorage.removeItem("userName");
      if (typeof window !== "undefined" && window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default API;
