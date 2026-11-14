import axios from "axios";

// ── Smart API Base URL Resolver ──────────────────────────────────────────────
// Default deployed Render backend:
const DEPLOYED_RENDER_BACKEND = "https://flick-ticket-bt8v.onrender.com";

const getBaseURL = () => {
  // When running in the browser on Vercel (*.vercel.app), use same-origin relative calls ("")
  // This routes through Vercel's serverless /api layer, guaranteeing ZERO CORS blocks and ZERO 502s!
  if (typeof window !== "undefined" && window.location.hostname.endsWith(".vercel.app")) {
    return "";
  }
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
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default API;
