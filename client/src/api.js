import axios from "axios";

// ── Smart API Base URL Resolver ──────────────────────────────────────────────
// In cloud production (e.g. Vercel deployment), automatically targets the live Render backend.
// In local development, targets http://localhost:5001.
const getBaseURL = () => {
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  if (
    typeof window !== "undefined" &&
    window.location.hostname !== "localhost" &&
    window.location.hostname !== "127.0.0.1"
  ) {
    return "https://flick-ticket-bt8v.onrender.com";
  }
  return "http://localhost:5001";
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
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default API;
