import { useEffect, useState, useMemo, lazy, Suspense } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import API from "../api";
import FlickLogo from "../components/FlickLogo";

const TrailerModal = lazy(() => import("../components/TrailerModal"));

export default function Home() {
  const navigate = useNavigate();
  const [movies, setMovies] = useState([]);
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeHero, setActiveHero] = useState(0);
  const [trailerMovie, setTrailerMovie] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState("All");
  const [visibleCount, setVisibleCount] = useState(8);
  const [watchlistIds, setWatchlistIds] = useState([]);
  const [toastMsg, setToastMsg] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    Promise.all([
      API.get("/api/movies").catch(() => ({ data: [] })),
      API.get("/api/shows").catch(() => ({ data: [] })),
    ])
      .then(([resMovies, resShows]) => {
        const rawMovies = resMovies.data || [];
        // Ensure "After the Hunt" is first if present
        const sorted = [...rawMovies];
        const afterHuntIdx = sorted.findIndex((m) =>
          m.title?.toLowerCase().includes("after the hunt")
        );
        if (afterHuntIdx > 0) {
          const [ath] = sorted.splice(afterHuntIdx, 1);
          sorted.unshift(ath);
        }
        setMovies(sorted);
        setShows(resShows.data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Home data fetch error:", err);
        setLoading(false);
      });

    if (token) {
      API.get("/api/users/watchlist")
        .then((res) => {
          const ids = (res.data || []).map((m) => m._id || m);
          setWatchlistIds(ids);
        })
        .catch(() => {});
    }
  }, [token]);

  // Auto-rotate hero every 8 seconds
  useEffect(() => {
    if (!movies.length) return;
    const heroCount = Math.min(movies.length, 7);
    const timer = setInterval(() => {
      setActiveHero((prev) => (prev + 1) % heroCount);
    }, 8000);
    return () => clearInterval(timer);
  }, [movies]);

  const languages = useMemo(() => {
    return [
      "All",
      "English",
      "Hindi",
      "Tamil",
      "Telugu",
      "Malayalam",
      "Kannada",
      "Marathi",
      "Punjabi",
      "Bengali",
    ];
  }, []);

  const filteredMovies = useMemo(() => {
    return movies.filter((movie) => {
      const matchLang =
        selectedLanguage === "All" ||
        (movie.language &&
          movie.language.toLowerCase() === selectedLanguage.toLowerCase()) ||
        (Array.isArray(movie.languages) &&
          movie.languages.some(
            (l) => l.toLowerCase() === selectedLanguage.toLowerCase()
          ));
      return matchLang;
    });
  }, [movies, selectedLanguage]);

  const displayedMovies = useMemo(() => {
    return filteredMovies.slice(0, visibleCount);
  }, [filteredMovies, visibleCount]);

  const currentHero = movies[activeHero] || {
    title: "After the Hunt",
    genre: "Drama",
    year: "2025",
    description:
      "A college professor finds herself at a personal and professional crossroads when a star pupil levels an accusation against one of her colleagues, and a dark secret from her own past threatens to come to light.",
    poster:
      "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=1200&q=80",
    rating: 8.5,
  };

  const handleToggleWatchlist = async (e, movieId, movieTitle) => {
    e.stopPropagation();
    if (!token) {
      setToastMsg("Please log in to save movies to your watchlist!");
      setTimeout(() => setToastMsg(""), 3500);
      return;
    }
    try {
      const res = await API.post("/api/users/watchlist/toggle", { movieId });
      const updated = (res.data.watchlist || []).map((m) => m._id || m);
      setWatchlistIds(updated);
      const isAdded = updated.includes(movieId);
      setToastMsg(
        isAdded
          ? `❤️ Added "${movieTitle}" to Watchlist!`
          : `Removed "${movieTitle}" from Watchlist`
      );
      setTimeout(() => setToastMsg(""), 3500);
    } catch (err) {
      console.error("Watchlist error:", err);
    }
  };

  // Trailers collection for the Trailers section
  const trailerList = useMemo(() => {
    return movies
      .filter((m) => m.trailerUrl || m.poster)
      .slice(0, 5)
      .map((m) => ({
        id: m._id,
        title: m.title,
        genre: m.genre,
        poster: m.poster,
        trailerUrl:
          m.trailerUrl || "https://www.youtube.com/watch?v=uYPbbksJxIg",
      }));
  }, [movies]);

  return (
    <div className="bg-[#050508] text-white min-h-screen font-sans selection:bg-[#F84464] selection:text-white relative overflow-x-hidden">
      
      {/* Top Silver-to-Dark Ambient Background matching screenshot */}
      <div className="absolute top-0 inset-x-0 h-[380px] bg-gradient-to-b from-[#EAEBED] via-[#181922] to-transparent pointer-events-none opacity-90" />

      {/* Toast Notification */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 right-6 z-50 bg-[#1F2533] border border-gray-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2"
          >
            <span>✨</span>
            <span>{toastMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Subtle Ambient Red Spots on Sides (matching screenshot) */}
      <div className="absolute top-[480px] right-0 w-96 h-96 bg-[#F84464]/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-[850px] right-10 w-96 h-96 bg-[#F84464]/10 rounded-full blur-[160px] pointer-events-none" />

      {/* ================= 1. CINEMATIC HERO CAROUSEL BANNER ================= */}
      <section className="relative w-full pt-4 pb-6 px-4 sm:px-8 max-w-7xl mx-auto">
        {loading ? (
          <div className="h-[380px] sm:h-[440px] rounded-3xl bg-gray-900 animate-pulse flex items-center justify-center text-gray-500">
            Loading Cinematic Premiere...
          </div>
        ) : (
          <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-[#0D0D12] border border-white/10 min-h-[380px] sm:min-h-[440px] flex items-center">
            
            {/* Background Backdrop Image with smooth dark vignette */}
            <div className="absolute inset-0">
              <img
                src={currentHero.poster}
                alt={currentHero.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center filter brightness-[0.38] blur-xs sm:blur-none"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black via-black/85 to-black/30" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050508] via-transparent to-black/40" />
            </div>

            {/* Hero Main Content */}
            <div className="relative z-10 w-full p-6 sm:p-12 lg:p-16 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              {/* Left Column: Title, Metadata, Synopsis, CTA */}
              <div className="lg:col-span-7 space-y-4">
                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
                  {currentHero.title}
                </h1>

                <div className="flex items-center gap-3 text-xs sm:text-sm text-gray-300 font-medium">
                  <span>{currentHero.genre || "Drama"}</span>
                  <span>•</span>
                  <span>{currentHero.year || "2025"}</span>
                  {currentHero.rating && (
                    <>
                      <span>•</span>
                      <span className="text-amber-400 font-bold flex items-center gap-1">
                        ★ {currentHero.rating}
                      </span>
                    </>
                  )}
                </div>

                <p className="text-xs sm:text-sm text-gray-300/90 leading-relaxed max-w-xl line-clamp-3">
                  {currentHero.description}
                </p>

                <div className="pt-2">
                  <button
                    onClick={() => {
                      const el = document.getElementById("now-showing-section");
                      if (el) el.scrollIntoView({ behavior: "smooth" });
                      else navigate("/movies");
                    }}
                    className="bg-[#F84464] hover:bg-[#E03252] text-white font-bold text-xs sm:text-sm px-7 py-3 rounded-full transition shadow-lg shadow-[#F84464]/30 flex items-center gap-2 cursor-pointer group"
                  >
                    <span>Explore Movies</span>
                    <span className="group-hover:translate-x-1 transition transform">→</span>
                  </button>
                </div>
              </div>

              {/* Right Column: Character Montage / Cast Collage (as in screenshot) */}
              <div className="lg:col-span-5 hidden sm:flex justify-end items-center gap-2">
                <div className="relative w-full max-w-md h-64 sm:h-80 flex items-center justify-end overflow-hidden">
                  
                  {/* Angled Cast Collage Layout (Matching screenshot of After the Hunt) */}
                  <div className="flex items-center gap-2.5 transform -rotate-1 hover:rotate-0 transition duration-500">
                    <div className="relative w-32 h-56 sm:w-36 sm:h-64 rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl">
                      <img
                        src={
                          currentHero.title === "After the Hunt"
                            ? "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80"
                            : currentHero.poster
                        }
                        alt="Featured Cast 1"
                        className="w-full h-full object-cover filter brightness-95"
                      />
                    </div>
                    <div className="relative w-28 h-48 sm:w-32 sm:h-56 rounded-2xl overflow-hidden border-2 border-white/15 shadow-xl hidden sm:block">
                      <img
                        src="https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=600&q=80"
                        alt="Featured Cast 2"
                        className="w-full h-full object-cover filter brightness-90"
                      />
                    </div>
                    <div className="relative w-24 h-40 sm:w-28 sm:h-48 rounded-2xl overflow-hidden border-2 border-white/10 shadow-lg hidden md:block">
                      <img
                        src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=600&q=80"
                        alt="Featured Cast 3"
                        className="w-full h-full object-cover filter brightness-80"
                      />
                    </div>
                  </div>

                </div>
              </div>

            </div>
          </div>
        )}

        {/* Carousel Pagination Dots (Center Bottom, matching screenshot) */}
        <div className="flex items-center justify-center gap-2 pt-4">
          {movies.slice(0, 7).map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveHero(idx)}
              className={`transition-all duration-300 rounded-full cursor-pointer ${
                activeHero === idx
                  ? "w-6 h-1.5 bg-[#F84464]"
                  : "w-1.5 h-1.5 bg-gray-600 hover:bg-gray-400"
              }`}
              title={`Slide ${idx + 1}`}
            />
          ))}
        </div>
      </section>

      {/* ================= 2. NOW SHOWING SECTION ================= */}
      <section id="now-showing-section" className="max-w-7xl mx-auto px-4 sm:px-8 pt-10 pb-16">
        
        {/* Section Header: "Now Showing" + "View All >" */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Now Showing
          </h2>
          <Link
            to="/movies"
            className="text-xs sm:text-sm font-semibold text-gray-400 hover:text-[#F84464] transition flex items-center gap-1"
          >
            <span>View All</span>
            <span>›</span>
          </Link>
        </div>

        {/* Language Filter Chips Strip (BookMyShow Multi-Language Support) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 custom-scrollbar">
          {languages.map((lang) => {
            const isSelected = selectedLanguage === lang;
            return (
              <button
                key={lang}
                onClick={() => setSelectedLanguage(lang)}
                className={`px-3.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer border ${
                  isSelected
                    ? "bg-[#F84464] text-white border-[#F84464] shadow-sm font-bold"
                    : "bg-[#121218] border-gray-800 text-gray-400 hover:text-white hover:border-gray-700"
                }`}
              >
                {lang}
              </button>
            );
          })}
        </div>

        {/* Movies Grid (Exact Match to Screenshot Card Style) */}
        {displayedMovies.length === 0 ? (
          <div className="bg-[#101016] border border-gray-800 rounded-2xl p-12 text-center text-gray-400">
            <span className="text-3xl block mb-2">🎬</span>
            <p className="font-semibold text-sm">No movies found in this language.</p>
            <button
              onClick={() => setSelectedLanguage("All")}
              className="mt-3 text-xs text-[#F84464] font-bold hover:underline"
            >
              Reset to All Languages
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4 sm:gap-6">
            {displayedMovies.map((movie) => {
              const isSaved = watchlistIds.includes(movie._id);
              return (
                <div
                  key={movie._id}
                  className="bg-[#121217] border border-gray-800/80 rounded-2xl overflow-hidden shadow-lg hover:border-gray-700 hover:scale-[1.02] transition duration-300 flex flex-col justify-between group"
                >
                  {/* Poster Thumbnail */}
                  <div className="relative aspect-[2/3] bg-gray-900 overflow-hidden">
                    <img
                      src={movie.poster}
                      alt={movie.title}
                      loading="lazy"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />

                    {/* Heart Watchlist Button */}
                    <button
                      onClick={(e) =>
                        handleToggleWatchlist(e, movie._id, movie.title)
                      }
                      className={`absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center text-xs backdrop-blur-xs transition ${
                        isSaved
                          ? "bg-black/70 text-[#F84464]"
                          : "bg-black/50 text-white/70 hover:text-[#F84464]"
                      }`}
                      title={isSaved ? "Remove from Watchlist" : "Save to Watchlist"}
                    >
                      {isSaved ? "❤️" : "♡"}
                    </button>
                  </div>

                  {/* Card Info & Bottom Action */}
                  <div className="p-3.5 space-y-2 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-sm text-white group-hover:text-[#F84464] transition truncate">
                        {movie.title}
                      </h3>
                      <p className="text-[11px] text-gray-400 truncate mt-0.5">
                        {movie.year || "2025"} • {movie.genre || "Action | Comedy"} •{" "}
                        {Math.floor((movie.duration || 120) / 60)}h{" "}
                        {(movie.duration || 120) % 60}m
                      </p>
                    </div>

                    {/* Bottom Action Row: "Buy Tickets" pill + "★ rating" */}
                    <div className="flex items-center justify-between pt-2">
                      <Link
                        to={`/movies/${movie._id}`}
                        className="bg-[#F84464] hover:bg-[#E03252] text-white font-bold text-[11px] px-3.5 py-1.5 rounded-full transition shadow-xs"
                      >
                        Buy Tickets
                      </Link>

                      <div className="flex items-center gap-1 text-[#F84464] text-xs font-bold">
                        <span>★</span>
                        <span>{movie.rating || "6.5"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Centered "Show More" Button (matching screenshot) */}
        {filteredMovies.length > visibleCount && (
          <div className="text-center mt-10">
            <button
              onClick={() => setVisibleCount((prev) => prev + 8)}
              className="bg-[#F84464] hover:bg-[#E03252] text-white font-bold text-xs px-7 py-2.5 rounded-lg shadow-md transition cursor-pointer"
            >
              Show More
            </button>
          </div>
        )}
      </section>

      {/* ================= 3. TRAILERS SECTION ================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 pb-20">
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight mb-6">
          Trailers
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {trailerList.map((t) => (
            <div
              key={t.id}
              onClick={() => setTrailerMovie(t)}
              className="group relative aspect-video rounded-xl overflow-hidden bg-gray-900 border border-gray-800 cursor-pointer shadow-lg hover:border-gray-700 transition duration-300"
            >
              {/* Thumbnail Image */}
              <img
                src={t.poster}
                alt={t.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition duration-500 filter brightness-90"
              />

              {/* Dark Vignette Overlay */}
              <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition" />

              {/* Centered Circular Play Icon (as in screenshot) */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-10 h-10 rounded-full border border-white/60 bg-black/40 backdrop-blur-xs flex items-center justify-center text-white text-sm group-hover:scale-115 group-hover:bg-[#F84464] group-hover:border-[#F84464] transition transform shadow-xl">
                  ▶
                </div>
              </div>

              {/* Bottom Title Label */}
              <div className="absolute bottom-0 inset-x-0 p-2 bg-gradient-to-t from-black/90 via-black/50 to-transparent">
                <p className="text-[10px] sm:text-xs font-semibold text-white truncate">
                  {t.title}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ================= 4. CINEMATIC FOOTER (MATCHING SCREENSHOT) ================= */}
      <footer className="bg-[#020204] border-t border-gray-900/80 pt-12 pb-8 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 pb-12 border-b border-gray-900">
          
          {/* Left: Logo & Mission Description & App Badges */}
          <div className="md:col-span-6 space-y-4">
            <FlickLogo light={false} size="lg" />

            <p className="text-xs text-gray-400 leading-relaxed max-w-md">
              Experience seamless movie ticket booking with real-time seat
              selection, secure payments, and instant confirmations. Discover the
              latest movies and book your favourite seats effortlessly.
            </p>

            {/* App Store & Google Play Badges (matching screenshot) */}
            <div className="flex items-center gap-3 pt-2">
              <div className="flex items-center gap-2 bg-[#121218] border border-gray-800 rounded-lg px-3 py-1.5 cursor-pointer hover:border-gray-700 transition">
                <span className="text-lg">▶</span>
                <div className="text-[9px] leading-tight">
                  <span className="text-gray-400 block uppercase">GET IT ON</span>
                  <span className="text-white font-bold block text-[11px]">Google Play</span>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-[#121218] border border-gray-800 rounded-lg px-3 py-1.5 cursor-pointer hover:border-gray-700 transition">
                <span className="text-lg"></span>
                <div className="text-[9px] leading-tight">
                  <span className="text-gray-400 block uppercase">Download on the</span>
                  <span className="text-white font-bold block text-[11px]">App Store</span>
                </div>
              </div>
            </div>
          </div>

          {/* Middle: Company Links */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Company
            </h4>
            <ul className="space-y-2 text-xs text-gray-400">
              <li>
                <Link to="/" className="hover:text-white transition">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/movies" className="hover:text-white transition">
                  About us
                </Link>
              </li>
              <li>
                <Link to="/movies" className="hover:text-white transition">
                  Contact us
                </Link>
              </li>
              <li>
                <span className="hover:text-white transition cursor-pointer">
                  Privacy policy
                </span>
              </li>
            </ul>
          </div>

          {/* Right: Get in Touch */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Get in touch
            </h4>
            <div className="space-y-2 text-xs text-gray-400">
              <p>+1-234-567-890</p>
              <p>contact@example.com</p>
            </div>
          </div>

        </div>

        {/* Bottom Copyright Strip (matching screenshot) */}
        <div className="max-w-7xl mx-auto pt-6 text-center text-xs text-gray-500">
          © 2026 FlickTicket — Developed by Lithish Kumar. All Rights Reserved.
        </div>
      </footer>

      {/* Trailer Video Player Modal */}
      {trailerMovie && (
        <Suspense fallback={null}>
          <TrailerModal
            isOpen={!!trailerMovie}
            onClose={() => setTrailerMovie(null)}
            trailerUrl={trailerMovie.trailerUrl}
            movieTitle={trailerMovie.title}
          />
        </Suspense>
      )}

    </div>
  );
}
