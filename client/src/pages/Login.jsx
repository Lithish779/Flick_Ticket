import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api";
import FlickLogo from "../components/FlickLogo";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [customGoogleEmail, setCustomGoogleEmail] = useState("");

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  /* STANDARD LOGIN */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await API.post("/api/auth/login", form);
      localStorage.setItem("token", data.token);
      localStorage.setItem("userId", data._id);
      localStorage.setItem("role", data.role || "user");
      localStorage.setItem("userName", data.name);

      const userRole = (data.role || "").toLowerCase();
      if (userRole === "admin" || userRole === "theaterowner") {
        navigate("/admin/dashboard");
      } else if (userRole === "staff") {
        navigate("/scanner");
      } else {
        navigate("/movies");
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Invalid credentials. Please check your details."
      );
    } finally {
      setLoading(false);
    }
  };

  /* GOOGLE 1-CLICK AUTH */
  const handleGoogleAuth = async (googleName, googleEmail) => {
    setError("");
    setGoogleLoading(true);
    try {
      const { data } = await API.post("/api/auth/google", {
        name: googleName,
        email: googleEmail,
      });
      localStorage.setItem("token", data.token);
      localStorage.setItem("userId", data._id);
      localStorage.setItem("role", data.role || "user");
      localStorage.setItem("userName", data.name);
      setShowGoogleModal(false);

      const userRole = (data.role || "").toLowerCase();
      if (userRole === "admin" || userRole === "theaterowner") {
        navigate("/admin/dashboard");
      } else if (userRole === "staff") {
        navigate("/scanner");
      } else {
        navigate("/movies");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Google registration failed.");
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5FA] text-[#222222] flex items-center justify-center p-4 md:p-8 font-sans">
      <div className="w-full max-w-5xl bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm grid grid-cols-1 lg:grid-cols-12">
        
        {/* Left Hero Section (Premium Charcoal Panel) */}
        <div className="lg:col-span-5 relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-8 md:p-10 flex flex-col justify-between hidden lg:flex">
          <div>
            <Link to="/" className="inline-block mb-10">
              <FlickLogo light={false} size="md" />
            </Link>

            <div className="space-y-4">
              <span className="bg-[#F84464]/20 border border-[#F84464]/30 text-[#F84464] text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                🍿 FlickPass Exclusive
              </span>
              <h2 className="text-3xl font-extrabold leading-tight text-white">
                It All Starts Here.
              </h2>
              <p className="text-xs text-gray-300 leading-relaxed">
                Sign in to manage your tickets, access instant M-Ticket passes, pre-order snacks, and unlock member rewards.
              </p>
            </div>
          </div>

          <div className="space-y-3 pt-6 border-t border-gray-600/40 text-xs">
            <div className="flex items-center gap-2.5 text-gray-200">
              <span className="text-[#F84464] font-bold">✓</span> Fast & Secure 5-minute Seat Locks
            </div>
            <div className="flex items-center gap-2.5 text-gray-200">
              <span className="text-[#F84464] font-bold">✓</span> Express Counter F&B Pickup
            </div>
            <div className="flex items-center gap-2.5 text-gray-200">
              <span className="text-[#F84464] font-bold">✓</span> 100% Instant Refund on Cancellations
            </div>
          </div>
        </div>

        {/* Right Form Card */}
        <div className="lg:col-span-7 p-8 md:p-12 flex flex-col justify-center bg-white">
          
          {/* Header */}
          <div className="mb-6">
            <div className="lg:hidden flex items-center gap-2 mb-4">
              <FlickLogo light={true} size="sm" />
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-[#222222]">Welcome Back</h1>
            <p className="text-xs md:text-sm text-gray-500 mt-1">
              Sign in with your email, select a demo profile, or continue with Google ID
            </p>
          </div>

          {/* 🔑 1-Click Quick Demo Credentials */}
          <div className="mb-5 p-3.5 bg-[#F5F5FA] border border-gray-200 rounded-2xl">
            <span className="text-[10px] font-black uppercase tracking-wider text-gray-500 block mb-2">
              ⚡ 1-Click Assessment Credentials
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setForm({ email: "admin@cinebook.com", password: "admin123" })}
                className="p-2.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl text-left transition cursor-pointer"
                title="Fill Admin: admin@cinebook.com / admin123"
              >
                <div className="text-xs font-bold text-amber-900 flex items-center gap-1">👑 Admin</div>
                <div className="text-[10px] text-amber-700 truncate font-mono">admin123</div>
              </button>

              <button
                type="button"
                onClick={() => setForm({ email: "staff@cinebook.com", password: "staff123" })}
                className="p-2.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl text-left transition cursor-pointer"
                title="Fill Gate Staff: staff@cinebook.com / staff123"
              >
                <div className="text-xs font-bold text-emerald-900 flex items-center gap-1">🎟️ Staff</div>
                <div className="text-[10px] text-emerald-700 truncate font-mono">staff123</div>
              </button>

              <button
                type="button"
                onClick={() => setForm({ email: "customer@cinebook.com", password: "password123" })}
                className="p-2.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl text-left transition cursor-pointer"
                title="Fill Customer: customer@cinebook.com / password123"
              >
                <div className="text-xs font-bold text-rose-900 flex items-center gap-1">🍿 User</div>
                <div className="text-[10px] text-rose-700 truncate font-mono">password123</div>
              </button>
            </div>
          </div>

          {/* 🔴 Error Alert */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-[#F84464] rounded-xl px-4 py-3 mb-5 text-xs flex items-center justify-between animate-fadeIn">
              <span>⚠️ {error}</span>
              <button onClick={() => setError("")} className="text-[#F84464] hover:text-[#E03252] font-bold text-sm cursor-pointer">✕</button>
            </div>
          )}

          {/* 🌐 GOOGLE 1-CLICK SIGN IN BUTTON */}
          <button
            type="button"
            disabled={googleLoading}
            onClick={() => setShowGoogleModal(true)}
            className="w-full bg-white hover:bg-gray-50 text-gray-700 font-bold py-3 px-4 rounded-xl transition flex items-center justify-center gap-3 shadow-2xs text-xs sm:text-sm mb-5 border border-gray-300 cursor-pointer"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            {googleLoading ? "Signing in with Google..." : "Continue with Google ID"}
          </button>

          {/* Divider */}
          <div className="relative flex items-center justify-center mb-5">
            <div className="border-t border-gray-200 w-full" />
            <span className="bg-white px-4 text-[10px] font-bold uppercase text-gray-400 whitespace-nowrap">
              Or Sign In With Email
            </span>
            <div className="border-t border-gray-200 w-full" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-3 text-gray-400 text-sm">📧</span>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  placeholder="name@example.com"
                  className="w-full bg-[#F5F5FA] border border-gray-300 text-[#222222] rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-[#F84464] focus:bg-white transition placeholder-gray-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                Password
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-3 text-gray-400 text-sm">🔒</span>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  placeholder="••••••••"
                  className="w-full bg-[#F5F5FA] border border-gray-300 text-[#222222] rounded-xl pl-10 pr-10 py-2.5 text-sm focus:outline-none focus:border-[#F84464] focus:bg-white transition placeholder-gray-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-xs text-gray-400 hover:text-gray-700 transition cursor-pointer"
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#F84464] hover:bg-[#E03252] disabled:opacity-50 text-white font-extrabold py-3 rounded-xl transition shadow-xs text-sm flex items-center justify-center gap-2 mt-2 cursor-pointer"
            >
              {loading ? "Authenticating..." : "Sign In to FlickTicket"}
            </button>
          </form>

          {/* Footer link */}
          <p className="text-center text-xs text-gray-500 mt-6">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-[#F84464] hover:text-[#E03252] font-bold transition underline underline-offset-4"
            >
              Create Account Fast
            </Link>
          </p>

        </div>
      </div>

      {/* 🌐 GOOGLE ACCOUNT SELECTOR MODAL */}
      {showGoogleModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white border border-gray-200 p-6 md:p-8 rounded-3xl max-w-md w-full text-center space-y-5 shadow-2xl relative">
            <button
              onClick={() => setShowGoogleModal(false)}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-700 text-sm cursor-pointer"
            >
              ✕
            </button>

            <div className="w-12 h-12 bg-gray-50 border border-gray-200 rounded-2xl flex items-center justify-center mx-auto shadow-2xs">
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
            </div>

            <div>
              <h3 className="text-lg font-bold text-[#222222]">Sign in with Google</h3>
              <p className="text-xs text-gray-500 mt-1">Select a verified Google profile or type your email</p>
            </div>

            {/* Quick Demo Google Accounts */}
            <div className="space-y-2 text-left">
              <button
                onClick={() => handleGoogleAuth("Lithish Kumar", "lithish.google@gmail.com")}
                className="w-full bg-[#F5F5FA] hover:bg-gray-100 border border-gray-200 p-3 rounded-xl flex items-center gap-3 transition cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full bg-[#F84464] flex items-center justify-center font-bold text-xs text-white">L</div>
                <div>
                  <div className="text-xs font-bold text-[#222222]">Lithish Kumar</div>
                  <div className="text-[10px] text-gray-500">lithish.google@gmail.com</div>
                </div>
              </button>

              <button
                onClick={() => handleGoogleAuth("Cinema Enthusiast", "cine.user@gmail.com")}
                className="w-full bg-[#F5F5FA] hover:bg-gray-100 border border-gray-200 p-3 rounded-xl flex items-center gap-3 transition cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center font-bold text-xs text-white">C</div>
                <div>
                  <div className="text-xs font-bold text-[#222222]">Cinema Enthusiast</div>
                  <div className="text-[10px] text-gray-500">cine.user@gmail.com</div>
                </div>
              </button>
            </div>

            {/* Custom Google Email Input */}
            <div className="pt-2 border-t border-gray-100 space-y-2.5">
              <input
                type="email"
                placeholder="Or type any Google Email..."
                value={customGoogleEmail}
                onChange={(e) => setCustomGoogleEmail(e.target.value)}
                className="w-full bg-[#F5F5FA] border border-gray-300 text-[#222222] rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-[#F84464] transition"
              />
              <button
                disabled={!customGoogleEmail.includes("@")}
                onClick={() => handleGoogleAuth(customGoogleEmail.split("@")[0], customGoogleEmail)}
                className="w-full bg-[#F84464] hover:bg-[#E03252] disabled:opacity-40 text-white font-bold text-xs py-2.5 rounded-xl transition cursor-pointer"
              >
                Continue with custom Google ID
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
