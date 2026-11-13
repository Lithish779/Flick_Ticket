import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";

export default function SpotlightSearch({ isOpen, onClose }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [movies, setMovies] = useState([]);
  const [snacks, setSnacks] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      Promise.all([
        API.get("/api/movies").catch(() => ({ data: [] })),
        API.get("/api/snacks").catch(() => ({ data: [] })),
      ]).then(([resMovies, resSnacks]) => {
        setMovies(resMovies.data || []);
        setSnacks(resSnacks.data || []);
        setLoading(false);
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredMovies = movies.filter(
    (m) =>
      m.title.toLowerCase().includes(query.toLowerCase()) ||
      m.genre?.toLowerCase().includes(query.toLowerCase()) ||
      (m.language && m.language.toLowerCase().includes(query.toLowerCase())) ||
      (Array.isArray(m.languages) && m.languages.some((l) => l.toLowerCase().includes(query.toLowerCase())))
  );

  const filteredSnacks = snacks.filter(
    (s) =>
      s.name.toLowerCase().includes(query.toLowerCase()) ||
      (s.category && s.category.toLowerCase().includes(query.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-xs flex items-start justify-center pt-16 sm:pt-20 p-4 animate-fadeIn font-sans">
      <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl space-y-0 text-[#222222]">
        
        {/* Search Header */}
        <div className="p-3.5 border-b border-gray-200 flex items-center gap-3 bg-[#F5F5FA]">
          <span className="text-lg text-gray-400">🔍</span>
          <input
            autoFocus
            placeholder="Search movies, genres, popcorn, snacks..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-[#222222] placeholder-gray-400 text-sm focus:outline-none"
          />
          <button
            onClick={onClose}
            className="text-xs font-bold bg-white hover:bg-gray-100 border border-gray-300 text-gray-600 px-2.5 py-1 rounded-lg transition shadow-2xs cursor-pointer"
          >
            ESC
          </button>
        </div>

        {/* Results Body */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-5 custom-scrollbar">
          {loading ? (
            <div className="py-8 text-center text-xs text-gray-400">Searching FlickTicket directory...</div>
          ) : (
            <>
              {/* Movies Section */}
              <div>
                <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-[#F84464] mb-2.5">
                  🎬 Movies ({filteredMovies.length})
                </h4>
                {filteredMovies.length === 0 ? (
                  <p className="text-xs text-gray-400 italic">No matching movies found.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {filteredMovies.slice(0, 4).map((m) => (
                      <div
                        key={m._id}
                        onClick={() => {
                          onClose();
                          navigate(`/movie/${m._id}`);
                        }}
                        className="bg-[#F5F5FA] hover:bg-red-50 border border-gray-200 hover:border-red-200 p-2.5 rounded-xl flex items-center gap-3 cursor-pointer transition shadow-2xs"
                      >
                        <img
                          src={m.poster}
                          alt={m.title}
                          referrerPolicy="no-referrer"
                          className="w-10 h-14 object-cover rounded-lg border border-gray-200"
                        />
                        <div className="overflow-hidden">
                          <h5 className="text-xs font-bold text-[#222222] truncate">{m.title}</h5>
                          <span className="text-[10px] text-[#F84464] font-semibold">{m.genre}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Snacks Section */}
              <div>
                <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-amber-700 mb-2.5">
                  🍿 CinePantry Snacks ({filteredSnacks.length})
                </h4>
                {filteredSnacks.length === 0 ? (
                  <p className="text-xs text-gray-400 italic">No matching snacks found.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {filteredSnacks.slice(0, 4).map((s) => (
                      <div
                        key={s._id}
                        onClick={() => {
                          onClose();
                          navigate("/snacks");
                        }}
                        className="bg-[#F5F5FA] hover:bg-amber-50/50 border border-gray-200 hover:border-amber-200 p-2.5 rounded-xl flex items-center justify-between cursor-pointer transition shadow-2xs"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-lg">🍿</span>
                          <div>
                            <h5 className="text-xs font-bold text-[#222222]">{s.name}</h5>
                            <span className="text-[10px] text-gray-500">{s.category || "Snacks"}</span>
                          </div>
                        </div>
                        <span className="text-xs font-black text-gray-800">₹{s.price}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-2.5 bg-[#F5F5FA] border-t border-gray-200 text-center text-[10px] text-gray-500">
          Tip: Press <kbd className="bg-white border border-gray-300 text-gray-700 px-1.5 py-0.5 rounded font-mono">⌘K</kbd> anywhere to search movies & theaters
        </div>

      </div>
    </div>
  );
}
