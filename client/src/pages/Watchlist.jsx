import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api";

export default function Watchlist() {
  const navigate = useNavigate();
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchWatchlist = () => {
    API.get("/api/users/watchlist")
      .then((res) => {
        setWatchlist(res.data || []);
      })
      .catch((err) => {
        console.log("Error loading watchlist:", err);
        setWatchlist([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchWatchlist();
  }, []);

  const removeMovie = (movieId) => {
    API.post("/api/users/watchlist", { movieId })
      .then(() => {
        fetchWatchlist();
      })
      .catch((err) => {
        alert("Error updating watchlist: " + (err.response?.data?.message || err.message));
      });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F5FA] text-[#222222] flex items-center justify-center font-sans">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-[#F84464] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">
            Loading Saved Movies...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#F5F5FA] min-h-screen text-[#222222] py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-gray-200 p-6 rounded-2xl shadow-xs">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-red-50 text-[#F84464] border border-red-200 text-[10px] font-black px-3 py-0.5 rounded-full uppercase">
                ❤️ My Personal Watchlist
              </span>
              <span className="text-[10px] text-gray-500 font-mono">
                {watchlist.length} Saved Movie{watchlist.length === 1 ? "" : "s"}
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-[#222222] tracking-tight">
              Saved Movies Gallery
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              Keep track of movies you plan to watch and book tickets in one click
            </p>
          </div>

          <Link
            to="/movies"
            className="bg-[#F84464] hover:bg-[#E03252] text-white font-extrabold text-xs px-6 py-2.5 rounded-xl transition shadow-xs w-fit"
          >
            + Discover More Movies
          </Link>
        </div>

        {/* Watchlist Grid */}
        {watchlist.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center space-y-3 max-w-md mx-auto shadow-xs">
            <div className="w-16 h-16 bg-red-50 border border-red-200 rounded-full flex items-center justify-center text-3xl mx-auto text-[#F84464]">
              ❤️
            </div>
            <h2 className="text-base font-extrabold text-[#222222]">Your Watchlist is Empty</h2>
            <p className="text-xs text-gray-500">
              Click the heart icon on any movie poster while browsing to save it to your personal collection!
            </p>
            <Link
              to="/movies"
              className="inline-block bg-[#F84464] hover:bg-[#E03252] text-white font-bold text-xs px-6 py-2.5 rounded-xl transition shadow-xs"
            >
              Browse Movies Now →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
            {watchlist.map((item) => {
              const movieObj = item._id ? item : { _id: item, title: "Saved Movie" };

              return (
                <div
                  key={movieObj._id}
                  className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition group flex flex-col justify-between"
                >
                  <div className="relative aspect-[2/3] overflow-hidden bg-gray-100">
                    {movieObj.poster ? (
                      <img
                        src={movieObj.poster}
                        alt={movieObj.title}
                        className="w-full h-full object-cover group-hover:scale-103 transition duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl text-gray-400">
                        🎬
                      </div>
                    )}

                    {/* Quick remove button */}
                    <button
                      onClick={() => removeMovie(movieObj._id)}
                      className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/90 border border-gray-200 text-[#F84464] hover:bg-white transition flex items-center justify-center text-xs shadow-xs cursor-pointer"
                      title="Remove from Watchlist"
                    >
                      ❤️
                    </button>
                  </div>

                  <div className="p-3.5 space-y-2 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-sm text-[#222222] truncate">
                        {movieObj.title}
                      </h3>
                      <p className="text-[11px] text-gray-500">
                        {movieObj.genre || "Action / Drama"}
                      </p>
                    </div>

                    <button
                      onClick={() => navigate(`/movies/${movieObj._id}`)}
                      className="w-full bg-[#F84464] hover:bg-[#E03252] text-white font-bold text-xs py-2 rounded-xl transition shadow-xs text-center cursor-pointer"
                    >
                      Book Tickets →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
