import { useEffect, useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api";
import TrailerModal from "../components/TrailerModal";

function Movies() {
  // Instant cache-first initialization (< 10ms)
  const [movies, setMovies] = useState(() => {
    try {
      const cached = sessionStorage.getItem("cached_movies");
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });
  const [search, setSearch] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("All");
  const [selectedLanguage, setSelectedLanguage] = useState("All");
  const [selectedFormat, setSelectedFormat] = useState("All");
  const [sortBy, setSortBy] = useState("popular");
  const [curatedFilter, setCuratedFilter] = useState("all");
  const [trailerMovie, setTrailerMovie] = useState(null);
  const [loading, setLoading] = useState(() => {
    try {
      return !sessionStorage.getItem("cached_movies");
    } catch {
      return true;
    }
  });
  const [watchlistIds, setWatchlistIds] = useState([]);
  const [toastMsg, setToastMsg] = useState("");
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const [selectedCity, setSelectedCity] = useState(
    () => localStorage.getItem("selectedCity") || "Mumbai"
  );

  /* Sync city changes from Navbar in real-time */
  useEffect(() => {
    const onCityChange = (e) => {
      setSelectedCity(e.detail || localStorage.getItem("selectedCity") || "Mumbai");
    };
    window.addEventListener("cityChange", onCityChange);
    window.addEventListener("storage", onCityChange);
    return () => {
      window.removeEventListener("cityChange", onCityChange);
      window.removeEventListener("storage", onCityChange);
    };
  }, []);

  /* ================= FETCH DATA ================= */
  useEffect(() => {
    API.get(`/api/movies`)
      .then((res) => {
        const data = res.data || [];
        setMovies(data);
        setLoading(false);
        try {
          sessionStorage.setItem("cached_movies", JSON.stringify(data));
        } catch {}
      })
      .catch((err) => {
        console.error("Fetch error:", err);
        setLoading(false);
      });

    if (token) {
      API.get(`/api/users/watchlist`)
        .then((res) => {
          const ids = (res.data || []).map((m) => m._id || m);
          setWatchlistIds(ids);
        })
        .catch(() => {});
    }
  }, [token]);

  /* ================= WATCHLIST TOGGLE ================= */
  const handleToggleWatchlist = async (e, movieId, movieTitle) => {
    e.stopPropagation();
    if (!token) {
      setToastMsg("Please log in to add movies to your watchlist!");
      setTimeout(() => setToastMsg(""), 3500);
      return;
    }
    try {
      const res = await API.post(`/api/users/watchlist/toggle`, { movieId });
      const updatedList = (res.data.watchlist || []).map((m) => m._id || m);
      setWatchlistIds(updatedList);
      const isSaved = updatedList.includes(movieId);
      setToastMsg(
        isSaved
          ? `❤️ Added "${movieTitle}" to your Watchlist!`
          : `Removed "${movieTitle}" from Watchlist`
      );
      setTimeout(() => setToastMsg(""), 3500);
    } catch (err) {
      console.log("Watchlist toggle error:", err);
    }
  };

  /* ================= FILTER OPTIONS ================= */
  const genres = useMemo(() => {
    return [
      "All",
      "Action",
      "Adventure",
      "Animation",
      "Comedy",
      "Crime",
      "Drama",
      "Fantasy",
      "Horror",
      "Mystery",
      "Mythology",
      "Sci-Fi",
      "Thriller",
      "Romance",
    ];
  }, []);

  const languages = useMemo(() => {
    return [
      "All",
      "Hindi",
      "English",
      "Tamil",
      "Telugu",
      "Malayalam",
      "Kannada",
      "Marathi",
      "Punjabi",
      "Bengali",
    ];
  }, []);

  const formats = useMemo(() => {
    return ["All", "IMAX 3D", "IMAX 2D", "4DX", "Dolby Atmos", "3D", "2D"];
  }, []);

  /* ================= FILTER & SORT LOGIC ================= */
  const filteredMovies = useMemo(() => {
    let result = movies.filter((movie) => {
      // Live Search
      const matchSearch =
        movie.title.toLowerCase().includes(search.toLowerCase()) ||
        movie.genre?.toLowerCase().includes(search.toLowerCase()) ||
        (movie.language && movie.language.toLowerCase().includes(search.toLowerCase())) ||
        (Array.isArray(movie.languages) &&
          movie.languages.some((l) => l.toLowerCase().includes(search.toLowerCase())));

      // Genre
      let matchGenre = selectedGenre === "All";
      if (!matchGenre) {
        const selNorm = selectedGenre.toLowerCase().replace(/[^a-z0-9]/g, "");
        const movieGenreStr = [
          movie.genre || "",
          Array.isArray(movie.genres) ? movie.genres.join(" ") : "",
        ].join(" ");
        const movieNorm = movieGenreStr.toLowerCase().replace(/[^a-z0-9]/g, "");
        matchGenre = movieNorm.includes(selNorm);
      }

      // Language
      const matchLang =
        selectedLanguage === "All" ||
        (movie.language &&
          movie.language.toLowerCase() === selectedLanguage.toLowerCase()) ||
        (Array.isArray(movie.languages) &&
          movie.languages.some(
            (l) => l.toLowerCase() === selectedLanguage.toLowerCase()
          ));

      // Format
      const matchFormat =
        selectedFormat === "All" ||
        (movie.format && movie.format.toLowerCase().includes(selectedFormat.toLowerCase())) ||
        (selectedFormat === "IMAX 3D" && (movie.title?.includes("IMAX") || movie.rating >= 8.5)) ||
        (selectedFormat === "3D" && movie.rating >= 8.0) ||
        selectedFormat === "2D";

      // Curated quick pills
      let matchCurated = true;
      if (curatedFilter === "top-rated") {
        matchCurated = (movie.rating || 0) >= 8.5;
      } else if (curatedFilter === "imax") {
        matchCurated =
          (movie.rating || 0) >= 8.0 ||
          movie.genre?.toLowerCase().includes("action") ||
          movie.genre?.toLowerCase().includes("sci-fi");
      } else if (curatedFilter === "trending") {
        matchCurated = true;
      }

      return matchSearch && matchGenre && matchLang && matchFormat && matchCurated;
    });

    // Sorting
    result.sort((a, b) => {
      if (sortBy === "rating") {
        return (b.rating || 0) - (a.rating || 0);
      }
      if (sortBy === "title") {
        return a.title.localeCompare(b.title);
      }
      if (sortBy === "newest") {
        return (b.year || 2025) - (a.year || 2025);
      }
      // default: popularity / id
      return (b.rating || 8) - (a.rating || 8);
    });

    return result;
  }, [movies, search, selectedGenre, selectedLanguage, selectedFormat, curatedFilter, sortBy]);

  const activeFilterCount =
    (search ? 1 : 0) +
    (selectedGenre !== "All" ? 1 : 0) +
    (selectedLanguage !== "All" ? 1 : 0) +
    (selectedFormat !== "All" ? 1 : 0) +
    (curatedFilter !== "all" ? 1 : 0);

  const handleClearFilters = () => {
    setSearch("");
    setSelectedGenre("All");
    setSelectedLanguage("All");
    setSelectedFormat("All");
    setCuratedFilter("all");
    setSortBy("popular");
  };

  if (loading) {
    return (
      <div className="bg-[#F8F9FC] min-h-screen flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-[#F84464] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest animate-pulse">
          Loading Cinema Showtimes...
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[#F8F9FC] text-slate-800 min-h-screen font-sans selection:bg-[#F84464] selection:text-white">
      
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-20 right-6 z-50 bg-white border border-slate-200 text-slate-900 text-xs font-semibold px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 animate-fadeIn">
          <span>✨</span>
          <span>{toastMsg}</span>
        </div>
      )}

      {/* ================= 1. PREMIUM LIGHT CINEMA HEADER ================= */}
      <section className="bg-gradient-to-b from-white via-slate-50 to-slate-100/60 border-b border-slate-200/80 pt-8 pb-6 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto space-y-4">
          
          {/* Breadcrumb & City Pulse */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-500">
              <Link to="/" className="hover:text-[#F84464] font-medium transition">
                Home
              </Link>
              <span>/</span>
              <span className="text-slate-800 font-bold">
                Movies in {selectedCity}
              </span>
            </div>

            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 px-3 py-1 rounded-full text-[11px] font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Live in Multiplexes Today</span>
            </div>
          </div>

          {/* Main Title & Subtitle */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                Now Showing in <span className="text-[#F84464]">{selectedCity}</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
                Discover world premieres, blockbuster releases & immersive IMAX screenings with instant seat selection.
              </p>
            </div>

            {/* Curated Highlight Pills */}
            <div className="flex flex-wrap items-center gap-2">
              {[
                { id: "all", label: "🎬 All Films" },
                { id: "trending", label: "🔥 Trending" },
                { id: "top-rated", label: "⭐ Top Rated (8.5+)" },
                { id: "imax", label: "🚀 IMAX & 3D" },
              ].map((pill) => {
                const isActive = curatedFilter === pill.id;
                return (
                  <button
                    key={pill.id}
                    onClick={() => setCuratedFilter(pill.id)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition shadow-2xs ${
                      isActive
                        ? "bg-slate-900 text-white shadow-sm"
                        : "bg-white hover:bg-slate-50 text-slate-600 border border-slate-200/80"
                    }`}
                  >
                    {pill.label}
                  </button>
                );
              })}
            </div>
          </div>

        </div>
      </section>

      {/* ================= 2. FULL-WIDTH MODERN DISCOVERY HUB ================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 py-6 space-y-4">
        
        {/* Floating Controls Container */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 sm:p-5 space-y-4">
          
          {/* Row 1: Instant Search & Sorting Controls */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            
            {/* Live Search Input */}
            <div className="flex-1 relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                🔍
              </span>
              <input
                type="text"
                placeholder="Search by movie title, star cast, director, or genre..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-9 py-2.5 bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-slate-900 placeholder-slate-400 text-xs sm:text-sm rounded-xl border border-slate-200 focus:border-[#F84464] focus:ring-2 focus:ring-[#F84464]/20 transition outline-none"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs w-5 h-5 rounded-full bg-slate-200/80 flex items-center justify-center transition"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Sort & Count Section */}
            <div className="flex items-center gap-2.5 shrink-0">
              <span className="text-xs font-semibold text-slate-500 hidden md:inline">
                Sort:
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs py-2.5 px-3.5 rounded-xl border border-slate-200 outline-none cursor-pointer transition shadow-2xs"
              >
                <option value="popular">Most Popular</option>
                <option value="rating">Highest Rated ★</option>
                <option value="newest">Newest Releases</option>
                <option value="title">Title (A - Z)</option>
              </select>

              {/* Clear Filters Button (When active) */}
              {activeFilterCount > 0 && (
                <button
                  onClick={handleClearFilters}
                  className="bg-rose-50 hover:bg-rose-100 text-[#F84464] font-bold text-xs px-3.5 py-2.5 rounded-xl border border-rose-200 transition flex items-center gap-1.5 shadow-2xs shrink-0"
                >
                  <span>✕ Clear</span>
                  <span className="w-4 h-4 rounded-full bg-[#F84464] text-white text-[10px] flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                </button>
              )}
            </div>

          </div>

          {/* Row 2: Languages Horizontal Rail */}
          <div className="pt-2 border-t border-slate-100 flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0 pr-1">
              Language:
            </span>
            {languages.map((lang) => {
              const isSelected = selectedLanguage === lang;
              return (
                <button
                  key={lang}
                  onClick={() => setSelectedLanguage(selectedLanguage === lang ? "All" : lang)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition shrink-0 ${
                    isSelected
                      ? "bg-[#F84464] text-white shadow-xs font-bold"
                      : "bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/80"
                  }`}
                >
                  {lang}
                </button>
              );
            })}
          </div>

          {/* Row 3: Genres & Format Quick Filters */}
          <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
            
            {/* Genres Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full custom-scrollbar">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0 pr-1">
                Genre:
              </span>
              {genres.map((g) => {
                const isSelected = selectedGenre === g;
                return (
                  <button
                    key={g}
                    onClick={() => setSelectedGenre(selectedGenre === g ? "All" : g)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition shrink-0 ${
                      isSelected
                        ? "bg-slate-900 text-white font-bold"
                        : "bg-slate-100/80 hover:bg-slate-200/70 text-slate-600"
                    }`}
                  >
                    {g}
                  </button>
                );
              })}
            </div>

            {/* Experience / Format Dropdown Pills */}
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider pr-1">
                Format:
              </span>
              {["All", "IMAX 3D", "4DX", "Dolby Atmos"].map((fmt) => {
                const isSelected = selectedFormat === fmt;
                return (
                  <button
                    key={fmt}
                    onClick={() => setSelectedFormat(selectedFormat === fmt ? "All" : fmt)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                      isSelected
                        ? "bg-slate-900 text-white font-bold"
                        : "bg-slate-100/80 hover:bg-slate-200/70 text-slate-600"
                    }`}
                  >
                    {fmt}
                  </button>
                );
              })}
            </div>

          </div>

        </div>

        {/* Live Filter Results Bar */}
        <div className="flex items-center justify-between px-1 text-xs text-slate-500 font-medium">
          <span>
            Showing <strong className="text-slate-900 font-bold">{filteredMovies.length}</strong> {filteredMovies.length === 1 ? "movie" : "movies"} in {selectedCity}
          </span>
          <span className="text-[11px] text-slate-400">
            Click on any film to preview showtimes & book seats
          </span>
        </div>

        {/* ================= 3. WORLD-CLASS MOVIE CARDS GRID ================= */}
        {filteredMovies.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center shadow-xs space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-rose-50 text-[#F84464] text-3xl flex items-center justify-center mx-auto shadow-xs">
              🎬
            </div>
            <h3 className="font-extrabold text-lg text-slate-900">
              No movies match your filter criteria
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              We couldn't find any films matching the selected language, genre, or search term in {selectedCity}. Try resetting your filters to explore everything currently showing.
            </p>
            <button
              onClick={handleClearFilters}
              className="px-6 py-2.5 bg-[#F84464] hover:bg-[#E03252] text-white font-bold text-xs rounded-xl transition shadow-sm cursor-pointer"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
            {filteredMovies.map((movie) => {
              const isSaved = watchlistIds.includes(movie._id);
              const formatBadge = movie.format || (movie.rating >= 8.5 ? "IMAX 3D" : "4K DOLBY");
              
              return (
                <div
                  key={movie._id}
                  className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between group relative"
                >
                  
                  {/* Poster Container */}
                  <div className="relative aspect-[2/3] bg-slate-100 overflow-hidden">
                    <img
                      src={movie.poster}
                      alt={movie.title}
                      loading="lazy"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Top-Left Floating Format Tag (Glassmorphic) */}
                    <div className="absolute top-2.5 left-2.5 bg-white/90 backdrop-blur-md text-slate-900 font-extrabold text-[10px] px-2.5 py-1 rounded-full shadow-xs border border-white/60">
                      {formatBadge}
                    </div>

                    {/* Top-Right Action Badges (Watchlist + Trailer) */}
                    <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
                      {movie.trailerUrl && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setTrailerMovie(movie);
                          }}
                          className="w-7 h-7 rounded-full bg-slate-900/80 hover:bg-[#F84464] text-white flex items-center justify-center text-[10px] shadow-sm transition backdrop-blur-xs cursor-pointer"
                          title="Watch Trailer"
                        >
                          ▶
                        </button>
                      )}

                      <button
                        onClick={(e) => handleToggleWatchlist(e, movie._id, movie.title)}
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs shadow-sm transition cursor-pointer backdrop-blur-xs ${
                          isSaved
                            ? "bg-white text-[#F84464]"
                            : "bg-white/80 hover:bg-white text-slate-400 hover:text-[#F84464]"
                        }`}
                        title={isSaved ? "Remove from Watchlist" : "Add to Watchlist"}
                      >
                        {isSaved ? "❤️" : "♡"}
                      </button>
                    </div>

                  </div>

                  {/* Card Body Details */}
                  <div className="p-3.5 flex flex-col flex-1 justify-between space-y-3">
                    
                    <div className="space-y-1.5">
                      
                      {/* Rating & Certificate Row */}
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1 font-bold text-slate-900">
                          <span className="text-amber-500 text-sm">★</span>
                          <span>{movie.rating || "8.8"}</span>
                          <span className="text-[10px] font-normal text-slate-400">
                            /10
                          </span>
                        </div>
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200/60">
                          {movie.certificate || "UA 16+"}
                        </span>
                      </div>

                      {/* Movie Title */}
                      <h3 className="font-extrabold text-sm sm:text-base text-slate-900 group-hover:text-[#F84464] transition line-clamp-1 leading-snug">
                        {movie.title}
                      </h3>

                      {/* Genre & Duration */}
                      <p className="text-[11px] text-slate-500 truncate">
                        {movie.genre || "Action, Drama"} • {movie.duration || 142}m
                      </p>

                      {/* Languages Tag Strip */}
                      <div className="flex items-center gap-1 overflow-hidden pt-0.5">
                        <span className="text-[10px] font-bold text-[#F84464] bg-red-50 border border-red-100 px-2 py-0.5 rounded-md truncate">
                          {movie.language || (movie.languages && movie.languages[0]) || "English"}
                        </span>
                        {Array.isArray(movie.languages) && movie.languages.length > 1 && (
                          <span className="text-[10px] text-slate-400 font-medium">
                            +{movie.languages.length - 1} more
                          </span>
                        )}
                      </div>

                    </div>

                    {/* Book Tickets CTA */}
                    <Link
                      to={`/movies/${movie._id}`}
                      className="w-full bg-gradient-to-r from-[#F84464] to-[#FF5E7E] hover:from-[#E03252] hover:to-[#F84464] text-white font-bold text-xs py-2.5 rounded-xl text-center transition flex items-center justify-center gap-1.5 shadow-2xs hover:shadow-md cursor-pointer"
                    >
                      <span>Book Tickets</span>
                      <span>→</span>
                    </Link>

                  </div>

                </div>
              );
            })}
          </div>
        )}

      </section>

      {/* ================= 4. CINEMA GUARANTEE & AMENITIES ================= */}
      <section className="border-t border-slate-200/80 bg-white py-12 px-4 sm:px-8 mt-12">
        <div className="max-w-7xl mx-auto">
          
          <div className="text-center max-w-xl mx-auto mb-8 space-y-1.5">
            <span className="text-xs font-bold text-[#F84464] uppercase tracking-wider">
              The FlickTicket Standard
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              A Cinema Experience Built Around You
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 hover:shadow-sm transition">
              <div className="w-10 h-10 rounded-xl bg-red-50 text-[#F84464] flex items-center justify-center text-xl font-bold">
                🎟️
              </div>
              <h4 className="font-bold text-sm text-slate-900">Zero-Queue QR Entry</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Scan your live digital ticket directly at auditorium gate scanners. No counter printouts needed.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 hover:shadow-sm transition">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-xl font-bold">
                💺
              </div>
              <h4 className="font-bold text-sm text-slate-900">4K Laser Recliners</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Experience crystal-clear IMAX with Laser projection and motorized heated recliners with personal charging ports.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 hover:shadow-sm transition">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center text-xl font-bold">
                🍿
              </div>
              <h4 className="font-bold text-sm text-slate-900">Seat-Delivered Snacks</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Pre-order gourmet cheese caramel popcorn, hot nachos, and artisan beverages delivered right to your seat.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 hover:shadow-sm transition">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl font-bold">
                🛡️
              </div>
              <h4 className="font-bold text-sm text-slate-900">Flexible Cancellation</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Plans changed? Cancel up to 20 minutes prior to showtime for an instant 100% refund into your FlickWallet.
              </p>
            </div>

          </div>

          {/* Author Attribution */}
          <div className="mt-10 pt-6 border-t border-slate-100 text-center text-xs text-slate-400">
            <span>FlickTicket Entertainment • Crafted by <strong>Lithish Kumar</strong></span>
          </div>

        </div>
      </section>

      {/* Trailer Modal */}
      <TrailerModal
        isOpen={!!trailerMovie}
        onClose={() => setTrailerMovie(null)}
        trailerUrl={trailerMovie?.trailerUrl}
        movieTitle={trailerMovie?.title}
      />

    </div>
  );
}

export default Movies;
