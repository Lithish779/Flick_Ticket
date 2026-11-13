import { useEffect, useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api";
import TrailerModal from "../components/TrailerModal";

function Movies() {
  const [movies, setMovies] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("All");
  const [selectedLanguage, setSelectedLanguage] = useState("All");
  const [trailerMovie, setTrailerMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [watchlistIds, setWatchlistIds] = useState([]);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const selectedCity = localStorage.getItem("selectedCity") || "Delhi NCR";

  /* ================= FETCH DATA ================= */
  useEffect(() => {
    API.get(`/api/movies`)
      .then((res) => {
        setMovies(res.data || []);
        setLoading(false);
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
  const handleToggleWatchlist = async (e, movieId) => {
    e.stopPropagation();
    if (!token) {
      alert("Please log in to add movies to your watchlist!");
      return;
    }
    try {
      const res = await API.post(`/api/users/watchlist/toggle`, { movieId });
      const updatedList = (res.data.watchlist || []).map((m) => m._id || m);
      setWatchlistIds(updatedList);
    } catch (err) {
      console.log("Watchlist toggle error:", err);
    }
  };

  /* ================= GENRES & LANGUAGES ================= */
  const genres = useMemo(() => {
    return ["All", "Action", "Drama", "Sci-Fi", "Comedy", "Thriller", "Horror"];
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
      "Bengali"
    ];
  }, []);

  /* ================= FILTER LOGIC ================= */
  const filteredMovies = useMemo(() => {
    return movies.filter((movie) => {
      const matchSearch =
        movie.title.toLowerCase().includes(search.toLowerCase()) ||
        movie.genre?.toLowerCase().includes(search.toLowerCase()) ||
        (movie.language && movie.language.toLowerCase().includes(search.toLowerCase()));
      const matchGenre = selectedGenre === "All" || movie.genre?.toLowerCase().includes(selectedGenre.toLowerCase());
      const matchLang =
        selectedLanguage === "All" ||
        (movie.language && movie.language.toLowerCase() === selectedLanguage.toLowerCase()) ||
        (Array.isArray(movie.languages) && movie.languages.some(l => l.toLowerCase() === selectedLanguage.toLowerCase()));
      return matchSearch && matchGenre && matchLang;
    });
  }, [movies, search, selectedGenre, selectedLanguage]);

  if (loading) {
    return (
      <div className="bg-[#F5F5FA] min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#F84464] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-[#F5F5FA] text-gray-800 min-h-screen font-sans selection:bg-[#F84464] selection:text-white">
      
      {/* Top Breadcrumb & Page Header */}
      <div className="bg-white border-b border-gray-200 py-6 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="text-xs text-gray-500 mb-1 flex items-center gap-1.5">
              <Link to="/" className="hover:text-[#F84464]">Home</Link>
              <span>/</span>
              <span className="text-gray-800 font-semibold">Movies in {selectedCity}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
              Movies in {selectedCity}
            </h1>
          </div>

          {/* Quick Language Pills Strip */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 custom-scrollbar">
            {languages.map((lang) => {
              const isSelected = selectedLanguage === lang;
              return (
                <button
                  key={lang}
                  onClick={() => setSelectedLanguage(lang)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition shrink-0 border ${
                    isSelected
                      ? "bg-[#F84464] text-white border-[#F84464] shadow-sm font-bold"
                      : "bg-white text-gray-700 border-gray-200 hover:border-gray-400"
                  }`}
                >
                  {lang}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main 2-Column Content Layout (BookMyShow Style) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* ================= LEFT FILTERS SIDEBAR ================= */}
          <aside className="w-full lg:w-64 shrink-0 space-y-4">
            
            {/* Filter Container */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <h3 className="font-bold text-sm text-gray-900">Filters</h3>
                <button
                  onClick={() => {
                    setSearch("");
                    setSelectedGenre("All");
                    setSelectedLanguage("All");
                  }}
                  className="text-xs text-[#F84464] font-semibold hover:underline"
                >
                  Clear All
                </button>
              </div>

              {/* Languages Filter Section */}
              <div>
                <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-2.5">
                  Languages
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {languages.map((lang) => {
                    const isSelected = selectedLanguage === lang;
                    return (
                      <button
                        key={lang}
                        onClick={() => setSelectedLanguage(lang)}
                        className={`px-2.5 py-1 rounded-md text-xs font-medium border transition ${
                          isSelected
                            ? "bg-red-50 text-[#F84464] border-[#F84464] font-bold"
                            : "bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200"
                        }`}
                      >
                        {lang}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Genres Filter Section */}
              <div className="pt-3 border-t border-gray-100">
                <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-2.5">
                  Genres
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {genres.map((g) => {
                    const isSelected = selectedGenre === g;
                    return (
                      <button
                        key={g}
                        onClick={() => setSelectedGenre(g)}
                        className={`px-2.5 py-1 rounded-md text-xs font-medium border transition ${
                          isSelected
                            ? "bg-red-50 text-[#F84464] border-[#F84464] font-bold"
                            : "bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200"
                        }`}
                      >
                        {g}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Format Filter Section */}
              <div className="pt-3 border-t border-gray-100">
                <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-2.5">
                  Format
                </h4>
                <div className="flex flex-wrap gap-1.5 text-xs text-gray-600">
                  {["2D", "3D", "IMAX 2D", "4DX", "ICE"].map((fmt) => (
                    <span
                      key={fmt}
                      className="px-2.5 py-1 rounded-md border border-gray-200 bg-gray-50 font-medium"
                    >
                      {fmt}
                    </span>
                  ))}
                </div>
              </div>

            </div>

            {/* CineClub Promo Box */}
            <div className="bg-gradient-to-br from-red-50 to-pink-50 border border-red-200 rounded-xl p-4 text-xs space-y-2">
              <span className="bg-[#F84464] text-white text-[10px] font-bold px-2 py-0.5 rounded">
                CineClub VIP
              </span>
              <h4 className="font-bold text-gray-900 text-sm">Save 15% on Popcorn</h4>
              <p className="text-gray-600 leading-relaxed">
                Join CineClub rewards for free ticket upgrades & snack passes.
              </p>
              <Link to="/loyalty" className="inline-block text-[#F84464] font-bold hover:underline">
                Explore CineClub →
              </Link>
            </div>

          </aside>

          {/* ================= RIGHT MOVIE CARDS GRID ================= */}
          <main className="flex-1 w-full space-y-6">
            
            {/* Search Input Bar */}
            <div className="bg-white rounded-xl border border-gray-200 p-3 shadow-sm flex items-center gap-3">
              <span className="text-gray-400 pl-2">🔍</span>
              <input
                type="text"
                placeholder="Search movies by title, actor, or genre..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-transparent text-gray-800 placeholder-gray-400 text-xs focus:outline-none"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="text-gray-400 hover:text-gray-600 text-xs pr-2"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Movie Count Header */}
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Showing <strong>{filteredMovies.length}</strong> movies</span>
              <span>Sorted by Popularity</span>
            </div>

            {/* Movies Grid */}
            {filteredMovies.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 p-16 text-center shadow-sm space-y-3">
                <span className="text-4xl block">🎬</span>
                <h3 className="font-bold text-base text-gray-900">No movies match your filters</h3>
                <p className="text-xs text-gray-500">Try adjusting your language or genre filter options</p>
                <button
                  onClick={() => {
                    setSearch("");
                    setSelectedGenre("All");
                    setSelectedLanguage("All");
                  }}
                  className="px-4 py-2 bg-[#F84464] text-white font-bold text-xs rounded-lg hover:bg-[#E03252] transition shadow-sm"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {filteredMovies.map((movie) => {
                  const isSaved = watchlistIds.includes(movie._id);
                  return (
                    <div
                      key={movie._id}
                      className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition duration-200 flex flex-col justify-between group"
                    >
                      {/* Poster Container */}
                      <div className="relative aspect-[2/3] bg-gray-100 overflow-hidden">
                        <img
                          src={movie.poster}
                          alt={movie.title}
                          loading="lazy"
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        />

                        {/* Bottom Rating Bar (BookMyShow signature) */}
                        <div className="absolute bottom-0 inset-x-0 bg-[#1A1A1A]/90 backdrop-blur-xs text-white px-2.5 py-1.5 flex items-center justify-between text-[11px] font-bold">
                          <div className="flex items-center gap-1">
                            <span className="text-[#F84464]">★</span>
                            <span>{movie.rating || "9.0"}/10</span>
                          </div>
                          <span className="text-[10px] text-gray-300 font-normal">
                            120K Votes
                          </span>
                        </div>

                        {/* Watchlist Toggle */}
                        <button
                          onClick={(e) => handleToggleWatchlist(e, movie._id)}
                          className={`absolute top-2.5 left-2.5 w-7 h-7 rounded-full flex items-center justify-center text-xs shadow transition ${
                            isSaved ? "bg-white text-[#F84464]" : "bg-white/80 text-gray-400 hover:text-[#F84464]"
                          }`}
                          title={isSaved ? "Remove from Watchlist" : "Add to Watchlist"}
                        >
                          {isSaved ? "❤️" : "♡"}
                        </button>

                        {/* Trailer Play Trigger */}
                        {movie.trailerUrl && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setTrailerMovie(movie);
                            }}
                            className="absolute top-2.5 right-2.5 bg-black/60 hover:bg-[#F84464] text-white p-1.5 rounded-full transition text-[11px]"
                            title="Watch Trailer"
                          >
                            ▶
                          </button>
                        )}
                      </div>

                      {/* Movie Card Meta Details */}
                      <div className="p-3 flex flex-col flex-1 justify-between">
                        <div>
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className="text-[10px] font-bold text-[#F84464] bg-red-50 border border-red-200 px-2 py-0.5 rounded">
                              {movie.language || (movie.languages && movie.languages[0]) || "English"}
                            </span>
                            <span className="text-[10px] text-gray-500 font-medium">
                              {movie.certificate || "UA"}
                            </span>
                          </div>
                          <h3 className="font-bold text-sm text-gray-900 group-hover:text-[#F84464] transition truncate">
                            {movie.title}
                          </h3>
                          <p className="text-[11px] text-gray-500 truncate mt-0.5">
                            {movie.genre || "Action"} • {movie.duration || 140}m
                          </p>
                        </div>

                        <Link
                          to={`/movies/${movie._id}`}
                          className="mt-3 w-full bg-[#F84464] hover:bg-[#E03252] text-white font-bold text-xs py-2 rounded-lg text-center transition block shadow-sm"
                        >
                          Book Tickets
                        </Link>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}

          </main>

        </div>
      </div>

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
