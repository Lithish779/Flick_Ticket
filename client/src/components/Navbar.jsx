import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import API from "../api";
import SpotlightSearch from "./SpotlightSearch";
import FlickLogo from "./FlickLogo";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  // Modal State Controls (All render directly IN FRONT OF SCREEN in center)
  const [menuOpen, setMenuOpen] = useState(false);
  const [cityOpen, setCityOpen] = useState(false);
  const [watchlistOpen, setWatchlistOpen] = useState(false);
  const [spotlightOpen, setSpotlightOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // City Search Filter
  const [citySearchQuery, setCitySearchQuery] = useState("");

  const allCities = [
    { name: "Mumbai", state: "Maharashtra", popular: true, icon: "🌆" },
    { name: "Delhi NCR", state: "Delhi", popular: true, icon: "🏛️" },
    { name: "Bengaluru", state: "Karnataka", popular: true, icon: "🌳" },
    { name: "Chennai", state: "Tamil Nadu", popular: true, icon: "🌊" },
    { name: "Hyderabad", state: "Telangana", popular: true, icon: "🏰" },
    { name: "Kochi", state: "Kerala", popular: true, icon: "⛵" },
    { name: "Pune", state: "Maharashtra", popular: false, icon: "🎓" },
    { name: "Kolkata", state: "West Bengal", popular: false, icon: "🌉" },
    { name: "Ahmedabad", state: "Gujarat", popular: false, icon: "🪁" },
    { name: "Jaipur", state: "Rajasthan", popular: false, icon: "👑" },
    { name: "Goa", state: "Goa", popular: false, icon: "🏖️" },
    { name: "Chandigarh", state: "Punjab/Haryana", popular: false, icon: "🌹" },
  ];

  const [selectedCity, setSelectedCity] = useState(
    localStorage.getItem("selectedCity") || "Mumbai"
  );

  const [watchlistItems, setWatchlistItems] = useState([]);

  const userId = localStorage.getItem("userId");
  const userName = localStorage.getItem("userName");
  const role = localStorage.getItem("role");
  const token = localStorage.getItem("token");
  const isLoggedIn = !!userId;

  const isAdmin =
    role === "admin" ||
    role === "theaterOwner" ||
    sessionStorage.getItem("admin_bypass") === "true";

  // Web Audio Synthesizer for tactile feedback
  const playAudioFeedback = (type = "pop") => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === "pop") {
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.08);
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
        osc.start();
        osc.stop(ctx.currentTime + 0.08);
      } else if (type === "close") {
        osc.frequency.setValueAtTime(600, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
        osc.start();
        osc.stop(ctx.currentTime + 0.1);
      }
    } catch (e) {
      // Audio context fallbacks ignored if muted by browser policy
    }
  };

  // Global Keybindings (Ctrl+K for Spotlight, Esc to close centered modals)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        playAudioFeedback("pop");
        setSpotlightOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        closeAllModals();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Fetch Watchlist Items
  useEffect(() => {
    if (token) {
      API.get("/api/users/watchlist")
        .then((res) => setWatchlistItems(res.data || []))
        .catch(() => {});
    }
  }, [token, location.pathname]);

  const closeAllModals = () => {
    playAudioFeedback("close");
    setCityOpen(false);
    setWatchlistOpen(false);
    setUserMenuOpen(false);
    setMenuOpen(false);
    setSpotlightOpen(false);
  };

  const handleCitySelect = (cityName) => {
    playAudioFeedback("pop");
    setSelectedCity(cityName);
    localStorage.setItem("selectedCity", cityName);
    setCityOpen(false);
  };

  const handleRemoveFromWatchlist = async (e, movieId) => {
    e.stopPropagation();
    playAudioFeedback("pop");
    try {
      const res = await API.post("/api/users/watchlist/toggle", { movieId });
      setWatchlistItems(res.data.watchlist || []);
    } catch (err) {
      console.error("Remove watchlist error:", err);
    }
  };

  const handleLogout = () => {
    playAudioFeedback("close");
    localStorage.clear();
    sessionStorage.removeItem("admin_bypass");
    setWatchlistItems([]);
    setUserMenuOpen(false);
    setMenuOpen(false);
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  const filteredCities = allCities.filter(
    (c) =>
      c.name.toLowerCase().includes(citySearchQuery.toLowerCase()) ||
      c.state.toLowerCase().includes(citySearchQuery.toLowerCase())
  );

  const isHomePage = location.pathname === "/";

  return (
    <>
      {/* 🎬 FlickTicket Premium Light Navigation Bar */}
      <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs text-slate-800 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between gap-4">
          
          {/* Left: FlickTicket Brand Logo & City Selector */}
          <div className="flex items-center gap-3 sm:gap-5 shrink-0">
            <Link
              to="/"
              onClick={closeAllModals}
              className="flex items-center shrink-0"
            >
              <FlickLogo light={true} size="md" />
            </Link>

            {/* 📍 City Selector Pill */}
            <button
              onClick={() => {
                playAudioFeedback("pop");
                setCityOpen(true);
              }}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200/80 text-slate-700 hover:text-slate-900 border border-slate-200/80 transition cursor-pointer shadow-2xs"
              title="Select City"
            >
              <span className="text-[#F84464] text-xs">📍</span>
              <span className="truncate max-w-[85px] sm:max-w-[120px] font-bold">{selectedCity}</span>
              <span className="text-[10px] text-slate-400">▾</span>
            </button>
          </div>

          {/* Center: Navigation Links */}
          <nav className="hidden md:flex items-center gap-7 lg:gap-9 text-xs sm:text-sm font-semibold">
            <Link
              to="/"
              className={`transition pb-1.5 relative ${
                location.pathname === "/"
                  ? "text-slate-950 font-extrabold after:absolute after:bottom-0 after:inset-x-0 after:h-0.5 after:bg-[#F84464] after:rounded-full"
                  : "text-slate-600 hover:text-slate-950"
              }`}
            >
              Home
            </Link>

            <Link
              to="/movies"
              className={`transition pb-1.5 relative ${
                location.pathname === "/movies" && !location.search
                  ? "text-[#F84464] font-extrabold after:absolute after:bottom-0 after:inset-x-0 after:h-0.5 after:bg-[#F84464] after:rounded-full"
                  : "text-slate-600 hover:text-slate-950"
              }`}
            >
              Movies
            </Link>

            <Link
              to="/movies"
              className="text-slate-600 hover:text-slate-950 transition pb-1.5"
            >
              Theatres
            </Link>

            <Link
              to="/movies"
              className="text-slate-600 hover:text-slate-950 transition pb-1.5"
            >
              Releases
            </Link>

            <Link
              to="/snacks"
              className={`transition pb-1.5 relative ${
                location.pathname === "/snacks"
                  ? "text-[#F84464] font-extrabold after:absolute after:bottom-0 after:inset-x-0 after:h-0.5 after:bg-[#F84464] after:rounded-full"
                  : "text-slate-600 hover:text-slate-950"
              }`}
            >
              Snacks & F&B
            </Link>
          </nav>

          {/* Right Action Icons: Search Icon + Watchlist + Profile Avatar */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            {/* 🔍 Search Icon Button (opens Spotlight) */}
            <button
              onClick={() => {
                playAudioFeedback("pop");
                setSpotlightOpen(true);
              }}
              className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200/80 text-slate-700 hover:text-slate-900 border border-slate-200/80 flex items-center justify-center text-sm transition shadow-2xs cursor-pointer"
              title="Search Movies, Genres, Snacks (⌘K)"
            >
              🔍
            </button>

            {/* Watchlist Heart Button */}
            <button
              onClick={() => {
                playAudioFeedback("pop");
                setWatchlistOpen(true);
              }}
              className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200/80 text-[#F84464] border border-slate-200/80 flex items-center justify-center relative transition shadow-2xs cursor-pointer"
              title="Saved Watchlist"
            >
              <span className="text-sm font-bold">♡</span>
              {watchlistItems.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#F84464] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                  {watchlistItems.length}
                </span>
              )}
            </button>

            {/* 👤 Circular Profile Avatar */}
            {isLoggedIn ? (
              <button
                onClick={() => {
                  playAudioFeedback("pop");
                  setUserMenuOpen(true);
                }}
                className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#1877F2] to-[#38BDF8] text-white flex items-center justify-center font-bold text-sm shadow-sm transition transform hover:scale-105 shrink-0 cursor-pointer ring-2 ring-blue-100"
                title={userName || "Account"}
              >
                {userName ? userName.charAt(0).toUpperCase() : "U"}
              </button>
            ) : (
              <button
                onClick={() => {
                  playAudioFeedback("pop");
                  setUserMenuOpen(true);
                }}
                className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#1877F2] to-[#38BDF8] text-white flex items-center justify-center font-bold text-sm shadow-sm transition transform hover:scale-105 shrink-0 cursor-pointer ring-2 ring-blue-100"
                title="Account / Sign In"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
                </svg>
              </button>
            )}

            {/* Mobile Menu Trigger */}
            <button
              onClick={() => {
                playAudioFeedback("pop");
                setMenuOpen(true);
              }}
              className="md:hidden p-2 rounded-lg text-slate-700 hover:bg-slate-100 transition"
              aria-label="Menu"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

        </div>
      </header>

      {/* ========================================================================= */}
      {/* 📍 CENTERED CITY SELECTION OVERLAY MODAL (DIRECTLY IN FRONT OF SCREEN)     */}
      {/* ========================================================================= */}
      {cityOpen && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-modalScaleIn flex flex-col max-h-[85vh] text-gray-800">
            
            {/* Header */}
            <div className="p-5 border-b border-gray-200 flex items-center justify-between bg-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-xl text-[#F84464]">
                  📍
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900 tracking-tight">Select Your City</h3>
                  <p className="text-xs text-gray-500">Choose city to explore showtimes and cinemas near you</p>
                </div>
              </div>
              <button
                onClick={() => setCityOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 flex items-center justify-center text-sm font-bold transition"
              >
                ✕
              </button>
            </div>

            {/* City Search Bar */}
            <div className="p-3 bg-gray-50 border-b border-gray-200 flex items-center gap-3">
              <span className="text-gray-400 text-sm pl-2">🔍</span>
              <input
                type="text"
                autoFocus
                placeholder="Search city (e.g. Mumbai, Delhi, Bengaluru)..."
                value={citySearchQuery}
                onChange={(e) => setCitySearchQuery(e.target.value)}
                className="w-full bg-transparent text-gray-800 placeholder-gray-400 text-xs focus:outline-none"
              />
              <button
                onClick={() => handleCitySelect(selectedCity)}
                className="shrink-0 bg-red-50 hover:bg-red-100 border border-red-200 text-[#F84464] px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1"
              >
                🎯 Auto-Detect
              </button>
            </div>

            {/* City Grid */}
            <div className="p-5 overflow-y-auto space-y-4 custom-scrollbar flex-1 bg-white">
              <div>
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-3 flex items-center gap-2">
                  <span>🔥</span> Popular Cities
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {filteredCities.map((city) => {
                    const isSelected = selectedCity === city.name;
                    return (
                      <button
                        key={city.name}
                        onClick={() => handleCitySelect(city.name)}
                        className={`p-3 rounded-xl border text-left transition flex flex-col justify-between h-20 ${
                          isSelected
                            ? "bg-red-50 border-[#F84464] text-[#F84464] font-bold shadow-sm"
                            : "bg-white hover:bg-gray-50 border-gray-200 text-gray-700"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xl">{city.icon}</span>
                          {isSelected && <span className="text-[#F84464] font-bold text-xs">✓</span>}
                        </div>
                        <div>
                          <div className="text-xs font-bold truncate">{city.name}</div>
                          <div className="text-[10px] text-gray-400">{city.state}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-3.5 bg-gray-50 border-t border-gray-200 text-center text-xs text-gray-600 flex items-center justify-between">
              <span>Selected: <strong className="text-[#F84464]">{selectedCity}</strong></span>
              <button
                onClick={() => setCityOpen(false)}
                className="bg-[#F84464] hover:bg-[#E03252] text-white font-bold px-4 py-1.5 rounded-lg text-xs transition"
              >
                Confirm
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ❤️ CENTERED WATCHLIST OVERLAY MODAL (DIRECTLY IN FRONT OF SCREEN)          */}
      {/* ========================================================================= */}
      {watchlistOpen && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-modalScaleIn flex flex-col max-h-[85vh] text-gray-800">
            
            {/* Header */}
            <div className="p-5 border-b border-gray-200 flex items-center justify-between bg-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-xl text-[#F84464]">
                  ❤️
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900 tracking-tight">
                    My Watchlist ({watchlistItems.length})
                  </h3>
                  <p className="text-xs text-gray-500">Your bookmarked movies ready for showtime</p>
                </div>
              </div>
              <button
                onClick={() => setWatchlistOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 flex items-center justify-center text-sm font-bold transition"
              >
                ✕
              </button>
            </div>

            {/* Watchlist Movie List */}
            <div className="p-5 overflow-y-auto space-y-3 custom-scrollbar flex-1 bg-white">
              {watchlistItems.length === 0 ? (
                <div className="text-center py-12 space-y-3">
                  <div className="text-4xl">🎬</div>
                  <h4 className="text-sm font-bold text-gray-800">Your Watchlist is Empty</h4>
                  <p className="text-xs text-gray-500 max-w-sm mx-auto">
                    Click the ❤️ icon on any movie card to save it for quick booking.
                  </p>
                  <button
                    onClick={() => {
                      setWatchlistOpen(false);
                      navigate("/movies");
                    }}
                    className="px-5 py-2.5 bg-[#F84464] hover:bg-[#E03252] text-white font-bold text-xs rounded-lg transition shadow"
                  >
                    Explore Movies →
                  </button>
                </div>
              ) : (
                watchlistItems.map((item) => {
                  const movieObj = item._id ? item : { _id: item, title: "Saved Movie" };
                  return (
                    <div
                      key={movieObj._id}
                      className="p-3 bg-white border border-gray-200 hover:border-red-300 rounded-xl flex items-center justify-between gap-4 transition shadow-sm"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {movieObj.poster ? (
                          <img
                            src={movieObj.poster}
                            alt=""
                            referrerPolicy="no-referrer"
                            className="w-12 h-16 object-cover rounded-lg border border-gray-200 shrink-0"
                          />
                        ) : (
                          <div className="w-12 h-16 bg-gray-100 rounded-lg flex items-center justify-center text-xl shrink-0">
                            🎬
                          </div>
                        )}
                        <div className="min-w-0">
                          <h4 className="text-sm font-bold text-gray-900 truncate">{movieObj.title}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] font-bold text-[#F84464] bg-red-50 px-2 py-0.5 rounded border border-red-100">
                              {movieObj.genre || "Action"}
                            </span>
                            <span className="text-xs text-amber-500 font-bold">
                              ★ {movieObj.rating || "4.8"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => {
                            setWatchlistOpen(false);
                            navigate(`/movies/${movieObj._id}`);
                          }}
                          className="px-3.5 py-1.5 bg-[#F84464] hover:bg-[#E03252] text-white font-bold text-xs rounded-lg transition shadow-sm"
                        >
                          Book
                        </button>
                        <button
                          onClick={(e) => handleRemoveFromWatchlist(e, movieObj._id)}
                          className="p-1.5 bg-gray-100 hover:bg-red-50 text-gray-500 hover:text-red-600 rounded-lg text-xs transition"
                          title="Remove"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="p-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between text-xs text-gray-600">
              <span>Saved Items: <strong className="text-gray-900">{watchlistItems.length}</strong></span>
              <button
                onClick={() => setWatchlistOpen(false)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold px-4 py-1.5 rounded-lg text-xs"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 👤 CENTERED USER ACCOUNT COMMAND CENTER (DIRECTLY IN FRONT OF SCREEN)    */}
      {/* ========================================================================= */}
      {userMenuOpen && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-modalScaleIn flex flex-col text-gray-800">
            
            {/* User Profile Banner */}
            <div className="p-6 bg-gradient-to-r from-[#F84464] to-[#FF5E7E] text-white relative shadow-sm">
              <button
                onClick={() => setUserMenuOpen(false)}
                className="absolute top-4 right-4 w-7 h-7 rounded-full bg-black/20 hover:bg-black/35 text-white flex items-center justify-center text-xs font-bold transition"
              >
                ✕
              </button>

              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-full bg-white text-[#F84464] flex items-center justify-center font-black text-xl shadow-md">
                  {userName ? userName.charAt(0).toUpperCase() : "U"}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">{userName || "FlickTicket User"}</h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[10px] font-bold text-white bg-white/20 px-2 py-0.5 rounded-full border border-white/30">
                      👑 FlickClub Member
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Menu Links */}
            <div className="p-3 space-y-1.5 bg-white">
              <button
                onClick={() => {
                  setUserMenuOpen(false);
                  navigate("/my-bookings");
                }}
                className="w-full p-3 hover:bg-gray-50 border border-transparent hover:border-gray-200 rounded-xl text-left flex items-center justify-between text-xs font-semibold text-gray-700 transition"
              >
                <span className="flex items-center gap-2.5">
                  <span className="text-base">🎟️</span> My Bookings & Tickets
                </span>
                <span className="text-gray-400">›</span>
              </button>

              <button
                onClick={() => {
                  setUserMenuOpen(false);
                  navigate("/loyalty");
                }}
                className="w-full p-3 hover:bg-gray-50 border border-transparent hover:border-gray-200 rounded-xl text-left flex items-center justify-between text-xs font-semibold text-gray-700 transition"
              >
                <span className="flex items-center gap-2.5">
                  <span className="text-base">👑</span> FlickClub VIP Rewards
                </span>
                <span className="text-gray-400">›</span>
              </button>

              <button
                onClick={() => {
                  setUserMenuOpen(false);
                  navigate("/gift-cards");
                }}
                className="w-full p-3 hover:bg-gray-50 border border-transparent hover:border-gray-200 rounded-xl text-left flex items-center justify-between text-xs font-semibold text-gray-700 transition"
              >
                <span className="flex items-center gap-2.5">
                  <span className="text-base">🎁</span> Gift Cards & Vouchers
                </span>
                <span className="text-gray-400">›</span>
              </button>

              <button
                onClick={() => {
                  setUserMenuOpen(false);
                  navigate("/admin/dashboard");
                }}
                className="w-full p-3 bg-amber-50 hover:bg-amber-100/80 border border-amber-200 rounded-xl text-left flex items-center justify-between text-xs font-bold text-amber-800 transition"
              >
                <span className="flex items-center gap-2.5">
                  <span className="text-base">⚙️</span> Admin Operational Console
                </span>
                <span className="text-amber-500">›</span>
              </button>

              <button
                onClick={() => {
                  setUserMenuOpen(false);
                  navigate("/scanner");
                }}
                className="w-full p-3 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 rounded-xl text-left flex items-center justify-between text-xs font-bold text-emerald-800 transition"
              >
                <span className="flex items-center gap-2.5">
                  <span className="text-base">🎟️</span> Gate Staff QR Scanner
                </span>
                <span className="text-emerald-500">›</span>
              </button>
            </div>

            {/* Logout Button */}
            <div className="p-3.5 bg-gray-50 border-t border-gray-200">
              <button
                onClick={handleLogout}
                className="w-full py-2.5 bg-white hover:bg-red-50 border border-red-200 text-[#F84464] font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5"
              >
                <span>🚪</span> Sign Out
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ☰ CENTERED FULL NAVIGATION HUB MODAL (FOR MOBILE & TABLET SCREENS) */}
      {menuOpen && (
        <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-modalScaleIn flex flex-col max-h-[90vh] text-slate-800">
            
            {/* Header */}
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#F84464] flex items-center justify-center text-white text-base font-black shadow-sm">
                  🎬
                </div>
                <span className="text-slate-900 font-extrabold text-base">Navigation Hub</span>
              </div>
              <button
                onClick={() => setMenuOpen(false)}
                className="w-8 h-8 rounded-xl bg-slate-200/80 hover:bg-slate-300 text-slate-600 flex items-center justify-center text-xs font-bold transition"
              >
                ✕
              </button>
            </div>

            {/* Navigation Grid Tiles */}
            <div className="p-6 overflow-y-auto space-y-4 custom-scrollbar flex-1 bg-white">
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    navigate("/");
                  }}
                  className="p-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl text-left flex flex-col justify-between h-24 transition group"
                >
                  <span className="text-2xl group-hover:scale-110 transition-transform">🏠</span>
                  <span className="text-xs font-bold text-slate-900">Home</span>
                </button>

                <button
                  onClick={() => {
                    setMenuOpen(false);
                    navigate("/movies");
                  }}
                  className="p-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl text-left flex flex-col justify-between h-24 transition group"
                >
                  <span className="text-2xl group-hover:scale-110 transition-transform">🎬</span>
                  <span className="text-xs font-bold text-slate-900">Movies & Shows</span>
                </button>

                <button
                  onClick={() => {
                    setMenuOpen(false);
                    navigate("/snacks");
                  }}
                  className="p-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl text-left flex flex-col justify-between h-24 transition group"
                >
                  <span className="text-2xl group-hover:scale-110 transition-transform">🍿</span>
                  <span className="text-xs font-bold text-slate-900">Snacks Pantry</span>
                </button>

                <button
                  onClick={() => {
                    setMenuOpen(false);
                    setWatchlistOpen(true);
                  }}
                  className="p-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl text-left flex flex-col justify-between h-24 transition group"
                >
                  <span className="text-2xl group-hover:scale-110 transition-transform">❤️</span>
                  <span className="text-xs font-bold text-slate-900">Watchlist ({watchlistItems.length})</span>
                </button>

                <button
                  onClick={() => {
                    setMenuOpen(false);
                    navigate("/gift-cards");
                  }}
                  className="p-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl text-left flex flex-col justify-between h-24 transition group"
                >
                  <span className="text-2xl group-hover:scale-110 transition-transform">🎁</span>
                  <span className="text-xs font-bold text-slate-900">Gift Cards</span>
                </button>

                <button
                  onClick={() => {
                    setMenuOpen(false);
                    navigate("/loyalty");
                  }}
                  className="p-4 bg-rose-50 hover:bg-rose-100/70 border border-rose-200 rounded-2xl text-left flex flex-col justify-between h-24 transition group"
                >
                  <span className="text-2xl group-hover:scale-110 transition-transform">👑</span>
                  <span className="text-xs font-bold text-[#F84464]">FlickClub VIP</span>
                </button>

                <button
                  onClick={() => {
                    setMenuOpen(false);
                    navigate("/admin/dashboard");
                  }}
                  className="p-4 bg-amber-50 hover:bg-amber-100/70 border border-amber-200 rounded-2xl text-left flex flex-col justify-between h-24 transition group"
                >
                  <span className="text-2xl group-hover:scale-110 transition-transform">⚙️</span>
                  <span className="text-xs font-bold text-amber-700">Admin Portal</span>
                </button>
              </div>

              {isLoggedIn && (
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    navigate("/my-bookings");
                  }}
                  className="w-full mt-3 p-3.5 bg-rose-50 hover:bg-rose-100/80 border border-rose-200 rounded-2xl text-left flex items-center justify-between text-xs font-bold text-[#F84464] transition"
                >
                  <span className="flex items-center gap-2.5">
                    <span className="text-lg">🎟️</span> My Digital Tickets & QR Pass
                  </span>
                  <span>→</span>
                </button>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
              <span>Location: <strong className="text-slate-900">{selectedCity}</strong></span>
              <button
                onClick={() => setMenuOpen(false)}
                className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold px-4 py-2 rounded-xl text-xs transition"
              >
                Close Hub
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 🔍 Global Spotlight Search Modal */}
      <SpotlightSearch
        isOpen={spotlightOpen}
        onClose={() => setSpotlightOpen(false)}
      />
    </>
  );
}