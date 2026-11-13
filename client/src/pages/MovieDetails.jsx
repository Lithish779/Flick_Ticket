import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import API from "../api";
import TrailerModal from "../components/TrailerModal";

function MovieDetails() {
  const { movieId } = useParams();

  const [shows, setShows] = useState([]);
  const [movie, setMovie] = useState(null);
  const [isTrailerOpen, setIsTrailerOpen] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  // Reviews state
  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(0);
  const [totalRatings, setTotalRatings] = useState(0);
  const [userRating, setUserRating] = useState(5);
  const [userComment, setUserComment] = useState("");
  const [reviewMsg, setReviewMsg] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    // 🎬 Get movie info
    API.get(`/api/movies/${movieId}`)
      .then((res) => setMovie(res.data))
      .catch((err) => console.log("Movie fetch error:", err));

    // 🎭 Get shows
    API.get(`/api/shows/movie/${movieId}`)
      .then((res) => setShows(res.data))
      .catch((err) => console.log("Shows fetch error:", err));

    // ⭐ Get reviews
    fetchReviews();

    // 💖 Check watchlist status if logged in
    if (token) {
      API.get(`/api/users/watchlist`)
        .then((res) => {
          const found = (res.data || []).some((m) => m._id === movieId || m === movieId);
          setIsBookmarked(found);
        })
        .catch(() => {});
    }
  }, [movieId, token]);

  const fetchReviews = () => {
    API.get(`/api/reviews/movie/${movieId}`)
      .then((res) => {
        setReviews(res.data.reviews || []);
        setAvgRating(res.data.avgRating || 0);
        setTotalRatings(res.data.totalRatings || 0);
      })
      .catch((err) => {
        console.log("Reviews fetch error:", err);
        setReviews([]);
        setAvgRating(0);
        setTotalRatings(0);
      });
  };

  const handleToggleWatchlist = async () => {
    if (!token) {
      alert("Please log in to add movies to your watchlist!");
      return;
    }
    try {
      const res = await API.post(`/api/users/watchlist/toggle`, { movieId });
      setIsBookmarked(res.data.isBookmarked);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update watchlist");
    }
  };

  const handleAddReview = async (e) => {
    e.preventDefault();
    if (!token) {
      alert("Please log in to submit a review!");
      return;
    }
    if (!userComment.trim()) return;

    try {
      await API.post(`/api/reviews`, {
        movieId,
        rating: userRating,
        comment: userComment,
      });
      setReviewMsg("Review submitted successfully! 🎉");
      setUserComment("");
      fetchReviews();
      setTimeout(() => setReviewMsg(""), 3000);
    } catch (err) {
      setReviewMsg(err.response?.data?.message || "Route updating... Please retry in a moment.");
    }
  };

  if (!movie) {
    return (
      <div className="bg-[#F5F5FA] min-h-screen text-[#222222] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#F84464] mx-auto"></div>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">
            Loading Movie Details...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#F5F5FA] min-h-screen text-[#222222] py-8 px-4 sm:px-6 lg:px-8 font-sans">
      
      {/* 🎬 Hero Card Banner */}
      <div className="max-w-7xl mx-auto bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          {/* Poster Column */}
          <div className="md:col-span-4 lg:col-span-3 flex flex-col items-center">
            <div className="relative w-full rounded-2xl overflow-hidden shadow-md group">
              <img
                src={movie.poster}
                alt={movie.title}
                referrerPolicy="no-referrer"
                className="w-full h-[400px] object-cover object-center group-hover:scale-102 transition duration-300"
              />
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3 text-center text-white text-xs font-semibold">
                In Cinemas Now
              </div>
            </div>

            <div className="flex gap-2 mt-4 w-full">
              <button
                onClick={() => setIsTrailerOpen(true)}
                className="flex-1 bg-white hover:bg-gray-50 text-gray-800 border border-gray-300 font-bold py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 text-xs shadow-sm transition cursor-pointer"
              >
                <span className="text-[#F84464]">▶</span> Watch Trailer
              </button>
              
              <button
                onClick={handleToggleWatchlist}
                className={`p-2.5 rounded-xl border transition flex items-center justify-center text-sm shadow-sm ${
                  isBookmarked
                    ? "bg-red-50 border-red-300 text-[#F84464]"
                    : "bg-white border-gray-300 text-gray-600 hover:text-[#F84464]"
                }`}
                title={isBookmarked ? "Remove from Watchlist" : "Add to Watchlist"}
              >
                {isBookmarked ? "❤️" : "🤍"}
              </button>
            </div>
          </div>

          {/* Details & Description Column */}
          <div className="md:col-span-8 lg:col-span-9 flex flex-col justify-between h-full space-y-6">
            <div>
              {/* Title & Genre Badge */}
              <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-[#222222] tracking-tight">
                  {movie.title}
                </h1>
                <span className="bg-[#F84464]/10 text-[#F84464] border border-[#F84464]/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                  {movie.genre || "Blockbuster"}
                </span>
              </div>

              {/* BMS Rating Pill Strip */}
              <div className="bg-[#F5F5FA] border border-gray-200 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4 mb-5">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 text-xl font-extrabold text-[#222222]">
                    <span className="text-amber-500">★</span>
                    <span>{avgRating > 0 ? avgRating : "9.2"}/10</span>
                  </div>
                  <span className="text-xs text-gray-500 font-medium">
                    ({totalRatings > 0 ? totalRatings : "128K"} Votes)
                  </span>
                </div>

                <a
                  href="#review-form"
                  className="bg-white hover:bg-gray-100 border border-gray-300 text-gray-800 text-xs font-bold px-4 py-2 rounded-lg shadow-xs transition"
                >
                  Rate now
                </a>
              </div>

              {/* Formats & Languages */}
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="bg-red-50 text-[#F84464] border border-red-200 px-3 py-1 rounded-md text-xs font-bold">
                  {movie.language || (movie.languages && movie.languages[0]) || "English"}
                </span>
                {Array.isArray(movie.languages) && movie.languages.length > 1 && (
                  <span className="bg-gray-100 text-gray-700 border border-gray-200 px-3 py-1 rounded-md text-xs font-bold">
                    Also in: {movie.languages.filter(l => l !== movie.language).join(", ")}
                  </span>
                )}
                <span className="bg-gray-100 text-gray-700 border border-gray-200 px-3 py-1 rounded-md text-xs font-bold">
                  {Array.isArray(movie.formats) && movie.formats.length > 0 ? movie.formats.join(", ") : "2D, 3D, IMAX 3D"}
                </span>
                <span className="text-xs text-gray-500 font-medium ml-2">
                  ⏱ {movie.duration || 150} mins • {movie.certificate || "UA"} • {movie.releaseDate || "Now Playing"}
                </span>
              </div>

              {/* About the movie */}
              <div className="space-y-2">
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500">
                  About the Movie
                </h3>
                <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
                  {movie.description}
                </p>
              </div>
            </div>

            {/* Quick Action Anchor */}
            <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
              <span className="text-xs text-gray-500">
                ⚡ Instant M-Ticket & F&B pre-order available
              </span>
              <a
                href="#showtimes-section"
                className="bg-[#F84464] hover:bg-[#E03252] text-white font-bold text-sm px-6 py-2.5 rounded-xl shadow-md transition"
              >
                Book Tickets
              </a>
            </div>

          </div>
        </div>
      </div>

      {/* 🎭 Available Showtimes Section */}
      <div id="showtimes-section" className="max-w-7xl mx-auto bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8 mb-8">
        <div className="flex items-center justify-between pb-4 border-b border-gray-200 mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#222222] flex items-center gap-2">
              <span>🎟️</span> Available Theatres & Showtimes
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Select a showtime to choose your seats in the auditorium
            </p>
          </div>
          <span className="text-xs font-bold text-gray-500 bg-[#F5F5FA] border border-gray-200 px-3 py-1.5 rounded-lg">
            {shows.length} {shows.length === 1 ? "Show Available" : "Shows Available"}
          </span>
        </div>

        {shows.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-gray-200 rounded-xl bg-gray-50/50">
            <span className="text-3xl">🎬</span>
            <p className="text-sm font-semibold text-gray-600 mt-2">
              No upcoming shows currently scheduled for this movie.
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Please check back soon or browse other movies in theaters.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {shows.map((show) => (
              <div
                key={show._id}
                className="bg-white border border-gray-200 hover:border-gray-300 rounded-xl p-5 shadow-xs transition hover:shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* Theatre info */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold text-[#222222]">
                      🏢 {show.theatre}
                    </span>
                    <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      M-Ticket
                    </span>
                    <span className="bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      F&B
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">
                    📅 Date: <strong className="text-gray-700">{show.date}</strong> &nbsp;|&nbsp; Audi 1 (Dolby 7.1)
                  </p>
                </div>

                {/* Showtimes & Booking CTA */}
                <div className="flex items-center gap-3">
                  <Link to={`/seats/${show._id}`}>
                    <button className="border border-emerald-500 text-emerald-700 bg-emerald-50/50 hover:bg-emerald-600 hover:text-white px-5 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer flex flex-col items-center shadow-xs">
                      <span className="text-sm font-extrabold">{show.time}</span>
                      <span className="text-[10px] opacity-80">Select Seats →</span>
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ⭐ Reviews & Ratings Section */}
      <div id="review-form" className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* Rate & Review Form */}
        <div className="md:col-span-5 bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h3 className="text-lg font-bold text-[#222222] mb-4 flex items-center gap-2">
            <span>✍️</span> Rate & Review
          </h3>

          {reviewMsg && (
            <div className="p-3 mb-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-semibold">
              {reviewMsg}
            </div>
          )}

          <form onSubmit={handleAddReview} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
                Your Rating
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setUserRating(star)}
                    className={`text-2xl transition ${
                      star <= userRating ? "text-amber-500 scale-110" : "text-gray-300"
                    }`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
                Review Comment
              </label>
              <textarea
                rows="4"
                value={userComment}
                onChange={(e) => setUserComment(e.target.value)}
                placeholder="What did you think of the story, acting, and visuals?"
                className="w-full bg-[#F5F5FA] border border-gray-200 rounded-xl p-3 text-sm text-[#222222] placeholder-gray-400 focus:outline-none focus:border-[#F84464] focus:bg-white transition"
              ></textarea>
            </div>

            <button
              type="submit"
              className="w-full bg-[#F84464] hover:bg-[#E03252] text-white font-bold py-2.5 rounded-xl transition text-sm shadow-sm cursor-pointer"
            >
              Post Review
            </button>
          </form>
        </div>

        {/* Audience Reviews List */}
        <div className="md:col-span-7 bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
            <h3 className="text-lg font-bold text-[#222222] flex items-center gap-2">
              <span>💬</span> Audience Reviews ({totalRatings})
            </h3>
            <span className="text-xs text-gray-500 font-medium">Verified Feedback</span>
          </div>

          <div className="space-y-3 max-h-[420px] overflow-y-auto pr-2 custom-scrollbar">
            {reviews.length === 0 ? (
              <p className="text-gray-400 text-center py-10 text-xs">
                No audience reviews yet. Be the first to share your thoughts!
              </p>
            ) : (
              reviews.map((rev) => (
                <div
                  key={rev._id}
                  className="bg-[#F5F5FA] p-4 rounded-xl border border-gray-200 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#222222] text-xs">
                        {rev.userName || "Verified CineGoer"}
                      </span>
                      <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <span>✓</span> Verified Buyer
                      </span>
                    </div>
                    <span className="text-amber-500 font-bold text-xs">
                      {"★".repeat(rev.rating)}
                      <span className="text-gray-300">
                        {"★".repeat(5 - rev.rating)}
                      </span>
                    </span>
                  </div>
                  <p className="text-gray-700 text-xs leading-relaxed">
                    {rev.comment}
                  </p>
                  <p className="text-[10px] text-gray-400 text-right">
                    {new Date(rev.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Trailer Modal */}
      <TrailerModal
        isOpen={isTrailerOpen}
        onClose={() => setIsTrailerOpen(false)}
        trailerUrl={movie.trailerUrl}
        movieTitle={movie.title}
      />
    </div>
  );
}

export default MovieDetails;
