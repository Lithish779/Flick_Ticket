import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api";

export default function Seats() {
  const { showId } = useParams();
  const navigate = useNavigate();

  const [show, setShow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [hoveredSeat, setHoveredSeat] = useState(null);
  const [holdTimer, setHoldTimer] = useState(null);
  const [holdExpiresAt, setHoldExpiresAt] = useState(null);
  const [holdMessage, setHoldMessage] = useState("");

  const userString = localStorage.getItem("user");
  const user = userString ? JSON.parse(userString) : null;
  const rawUserId = user?._id || user?.id || localStorage.getItem("userId");
  const currentUserId =
    rawUserId === "cust_assessment_01"
      ? "6af71e5df7cbd9c87a1b6537"
      : rawUserId === "admin_assessment_01"
      ? "6af71e5df7cbd9c87a1b652b"
      : rawUserId === "staff_assessment_01"
      ? "6af71e5df7cbd9c87a1b6531"
      : rawUserId || "6af71e5df7cbd9c87a1b6537";
  if (rawUserId === "cust_assessment_01") {
    localStorage.setItem("userId", "6af71e5df7cbd9c87a1b6537");
  }

  const fetchShow = async () => {
    try {
      const { data } = await API.get(`/api/shows/single/${showId}`);
      setShow(data);
    } catch {
      setError("Failed to load seat data. Please go back and try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShow();
    // Poll seats every 15s to sync live availability
    const pollInterval = setInterval(fetchShow, 15000);
    return () => clearInterval(pollInterval);
  }, [showId]);

  // Hold Timer countdown
  useEffect(() => {
    if (!holdExpiresAt) {
      setHoldTimer(null);
      return;
    }

    const interval = setInterval(() => {
      const remainingMs = new Date(holdExpiresAt) - new Date();
      if (remainingMs <= 0) {
        clearInterval(interval);
        setHoldTimer(null);
        setHoldExpiresAt(null);
        setSelectedSeats([]);
        setHoldMessage("⚠️ Seat hold expired. Seats have been released back to the floor.");
        fetchShow();
      } else {
        const totalSeconds = Math.floor(remainingMs / 1000);
        const mins = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
        const secs = String(totalSeconds % 60).padStart(2, "0");
        setHoldTimer(`${mins}:${secs}`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [holdExpiresAt]);

  // Cleanup hold on unmount
  const selectedSeatsRef = useRef(selectedSeats);
  selectedSeatsRef.current = selectedSeats;
  useEffect(() => {
    return () => {
      if (selectedSeatsRef.current.length > 0) {
        API.post("/api/bookings/release-hold", {
          showId,
          seats: selectedSeatsRef.current,
          userId: currentUserId,
        }).catch(() => {});
      }
    };
  }, [showId, currentUserId]);

  const requestHold = async (seatsToHold) => {
    if (seatsToHold.length === 0) {
      if (selectedSeats.length > 0) {
        await API.post("/api/bookings/release-hold", {
          showId,
          seats: selectedSeats,
          userId: currentUserId,
        }).catch(() => {});
      }
      setHoldExpiresAt(null);
      setHoldMessage("");
      return;
    }

    try {
      const res = await API.post("/api/bookings/hold", {
        showId,
        seats: seatsToHold,
        userId: currentUserId,
        holdMinutes: 5,
      });

      if (res.data.holdExpiresAt) {
        setHoldExpiresAt(res.data.holdExpiresAt);
        setHoldMessage("⏳ Seats temporarily held for your reservation (5-minute lock).");
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to hold selected seats. Another guest may have reserved them.";
      setHoldMessage(`❌ ${msg}`);
      fetchShow();
    }
  };

  const toggleSeat = async (seat) => {
    if (seat.isBooked) return;
    
    // Check if locked by someone else
    const now = new Date();
    if (
      seat.lockedUntil &&
      new Date(seat.lockedUntil) > now &&
      seat.lockedBy &&
      seat.lockedBy.toString() !== currentUserId.toString()
    ) {
      alert(`Seat ${seat.seatNumber} is temporarily held by another customer. Please choose an alternative seat.`);
      return;
    }

    const updated = selectedSeats.includes(seat.seatNumber)
      ? selectedSeats.filter((s) => s !== seat.seatNumber)
      : [...selectedSeats, seat.seatNumber];

    setSelectedSeats(updated);
    await requestHold(updated);
  };

  /* Quick auto-select contiguous available seats */
  const autoSelectSeats = async (count) => {
    if (!show) return;
    const now = new Date();
    const available = show.seats
      .filter((s) => {
        if (s.isBooked) return false;
        if (s.lockedUntil && new Date(s.lockedUntil) > now && s.lockedBy && s.lockedBy.toString() !== currentUserId.toString()) {
          return false;
        }
        return true;
      })
      .map((s) => s.seatNumber);

    if (available.length >= count) {
      const picked = available.slice(0, count);
      setSelectedSeats(picked);
      await requestHold(picked);
    } else {
      alert(`Only ${available.length} seats currently available.`);
    }
  };

  const calculateTotal = () => {
    if (!show) return 0;
    return show.seats
      .filter((s) => selectedSeats.includes(s.seatNumber))
      .reduce((acc, s) => acc + s.price, 0);
  };

  const handleProceed = () => {
    if (selectedSeats.length === 0) return;
    navigate(`/addons/${showId}`, {
      state: { selectedSeats, totalPrice: calculateTotal(), show, holdExpiresAt },
    });
  };

  // Group seats by Category, and then by Row
  const getGroupedLayout = () => {
    if (!show || !show.seats) return {};
    
    const categoryMap = {};
    show.seats.forEach((seat) => {
      const cat = seat.category || "Standard";
      if (!categoryMap[cat]) categoryMap[cat] = {};
      
      const rowMatch = seat.seatNumber.match(/^[A-Za-z]+/);
      const row = rowMatch ? rowMatch[0].toUpperCase() : "R";
      
      if (!categoryMap[cat][row]) categoryMap[cat][row] = [];
      categoryMap[cat][row].push(seat);
    });

    return categoryMap;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F5FA] text-[#222222] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-[#F84464] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">
            Loading Cinema Seating Layout...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F5F5FA] text-[#222222] flex items-center justify-center p-4">
        <div className="bg-white border border-gray-200 text-gray-800 rounded-3xl p-8 text-center max-w-md shadow-md space-y-4">
          <span className="text-3xl">⚠️</span>
          <p className="text-sm font-semibold">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="bg-[#F84464] hover:bg-[#E03252] text-white font-bold text-xs px-6 py-3 rounded-xl transition"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const categoryMap = getGroupedLayout();
  const now = new Date();

  return (
    <div className="min-h-screen bg-[#F5F5FA] text-[#222222] pb-36 font-sans relative">
      
      {/* 🎬 HEADER BAR */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40 py-4 px-4 sm:px-8 shadow-xs">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-xl flex items-center justify-center text-gray-700 transition cursor-pointer"
              title="Go Back"
            >
              ←
            </button>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-[#222222] tracking-tight flex items-center gap-2">
                <span>{show?.theatre}</span>
                <span className="text-xs bg-red-50 text-[#F84464] border border-red-200 px-2.5 py-0.5 rounded-full font-bold">
                  AUDI 1
                </span>
              </h1>
              <p className="text-xs text-gray-500 font-medium mt-0.5">
                📅 {show?.date} &nbsp;•&nbsp; ⏰ {show?.time} &nbsp;•&nbsp; {show?.movieId?.title || "Movie"}
              </p>
            </div>
          </div>

          {/* Quick Seat Selection Chips & Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                const url = window.location.href;
                navigator.clipboard.writeText(url);
                alert("🎟️ Group Booking Link copied! Send it to your friends so they can pick adjacent seats.");
              }}
              className="bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 font-bold text-xs px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 shadow-2xs"
              title="Share Booking Link with Friends"
            >
              <span>🤝</span> Share Seats
            </button>

            <button
              onClick={() => {
                const query = encodeURIComponent(`${show?.theatre || "PVR Cinema"}`);
                window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, "_blank");
              }}
              className="bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 font-bold text-xs px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 shadow-2xs"
              title="Get GPS Directions"
            >
              <span>🗺️</span> Directions
            </button>

            <span className="text-[11px] font-bold text-gray-400 uppercase hidden sm:inline ml-2">Quick Select:</span>
            {[1, 2, 3, 4, 6].map((count) => (
              <button
                key={count}
                onClick={() => autoSelectSeats(count)}
                className="bg-white hover:bg-gray-100 border border-gray-300 hover:border-[#F84464] hover:text-[#F84464] text-gray-700 font-bold text-xs px-3 py-1.5 rounded-xl transition shadow-2xs"
              >
                {count} {count === 1 ? "Seat" : "Seats"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ⏳ SEAT HOLD TIMER BANNER */}
      {holdTimer && (
        <div className="bg-amber-50 border-b border-amber-200 py-2.5 px-4 sticky top-[73px] z-30 animate-fadeIn">
          <div className="max-w-4xl mx-auto flex items-center justify-between text-xs">
            <span className="text-amber-900 font-semibold flex items-center gap-2">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
              Seats temporarily held for your reservation. Complete checkout before timer expires.
            </span>
            <span className="font-mono font-extrabold text-amber-900 bg-amber-100 border border-amber-300 px-3 py-1 rounded-xl text-sm">
              ⏳ {holdTimer}
            </span>
          </div>
        </div>
      )}

      {/* Hold notification error / alert */}
      {holdMessage && !holdTimer && (
        <div className="max-w-4xl mx-auto mt-4 px-4">
          <div className="bg-white border border-gray-200 text-gray-700 text-xs px-4 py-2.5 rounded-xl flex items-center justify-between shadow-xs">
            <span>{holdMessage}</span>
            <button onClick={() => setHoldMessage("")} className="text-gray-400 hover:text-gray-700 font-bold ml-2">✕</button>
          </div>
        </div>
      )}

      {/* 🍿 BMS SCREEN CANVAS */}
      <div className="max-w-4xl mx-auto mt-8 mb-8 px-4">
        <div className="relative text-center">
          {/* Subtle curved projection line */}
          <div className="h-2.5 bg-gradient-to-r from-gray-200 via-gray-400 to-gray-200 rounded-full shadow-inner border border-gray-300" />
          <p className="text-[11px] text-gray-400 font-bold tracking-[0.3em] uppercase mt-2.5">
            All eyes this way please • SCREEN THIS WAY
          </p>
        </div>
      </div>

      {/* 💺 AUDITORIUM SEATING CONTAINER */}
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-10 shadow-sm space-y-8">
          
          {Object.entries(categoryMap).map(([category, rows]) => {
            const firstSeatPrice = Object.values(rows)[0]?.[0]?.price || 250;

            return (
              <div key={category} className="space-y-4">
                
                {/* Category Divider Header */}
                <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black uppercase tracking-wider text-[#222222]">
                      {category}
                    </span>
                    <span className="text-xs font-semibold text-gray-500">
                      — ₹{firstSeatPrice}
                    </span>
                  </div>
                </div>

                {/* Rows Grid */}
                <div className="space-y-2.5">
                  {Object.entries(rows).map(([rowLabel, seats]) => {
                    const half = Math.ceil(seats.length / 2);
                    const leftBlock = seats.slice(0, half);
                    const rightBlock = seats.slice(half);

                    return (
                      <div key={rowLabel} className="flex items-center justify-center gap-3 sm:gap-6">
                        
                        {/* Left Row Letter Marker */}
                        <span className="w-5 text-center text-xs font-bold text-gray-400 select-none">
                          {rowLabel}
                        </span>

                        {/* Left Seating Block */}
                        <div className="flex items-center gap-1.5 sm:gap-2">
                          {leftBlock.map((seat) => {
                            const isSelected = selectedSeats.includes(seat.seatNumber);
                            const isLockedByOther =
                              !seat.isBooked &&
                              seat.lockedUntil &&
                              new Date(seat.lockedUntil) > now &&
                              seat.lockedBy &&
                              seat.lockedBy.toString() !== currentUserId.toString();
                            
                            let btnStyle = "w-8 h-8 sm:w-9 sm:h-9 rounded-lg text-[11px] font-bold transition-all duration-150 flex items-center justify-center select-none ";
                            
                            if (seat.isBooked) {
                              btnStyle += "bg-gray-100 border border-gray-200 text-gray-400 cursor-not-allowed";
                            } else if (isLockedByOther) {
                              btnStyle += "bg-amber-100 border border-amber-300 text-amber-800 cursor-not-allowed";
                            } else if (isSelected) {
                              btnStyle += "bg-emerald-600 border border-emerald-600 text-white shadow-md shadow-emerald-600/30 scale-105";
                            } else {
                              btnStyle += "bg-white border border-emerald-500 text-emerald-700 hover:bg-emerald-600 hover:text-white hover:scale-105 shadow-2xs";
                            }

                            return (
                              <button
                                key={seat.seatNumber}
                                onClick={() => toggleSeat(seat)}
                                onMouseEnter={() => setHoveredSeat(seat)}
                                onMouseLeave={() => setHoveredSeat(null)}
                                disabled={seat.isBooked || isLockedByOther}
                                className={btnStyle}
                                title={
                                  seat.isBooked
                                    ? "Booked"
                                    : isLockedByOther
                                    ? "Temporarily Held by Another Customer"
                                    : `${seat.seatNumber} - ₹${seat.price}`
                                }
                              >
                                {isLockedByOther ? "🔒" : seat.seatNumber}
                              </button>
                            );
                          })}
                        </div>

                        {/* Center Walkway Aisle Spacer */}
                        <div className="w-4 sm:w-8 border-t border-dashed border-gray-200 my-auto text-[8px] text-gray-400 font-bold uppercase tracking-wider text-center hidden sm:block">
                          Aisle
                        </div>

                        {/* Right Seating Block */}
                        <div className="flex items-center gap-1.5 sm:gap-2">
                          {rightBlock.map((seat) => {
                            const isSelected = selectedSeats.includes(seat.seatNumber);
                            const isLockedByOther =
                              !seat.isBooked &&
                              seat.lockedUntil &&
                              new Date(seat.lockedUntil) > now &&
                              seat.lockedBy &&
                              seat.lockedBy.toString() !== currentUserId.toString();
                            
                            let btnStyle = "w-8 h-8 sm:w-9 sm:h-9 rounded-lg text-[11px] font-bold transition-all duration-150 flex items-center justify-center select-none ";
                            
                            if (seat.isBooked) {
                              btnStyle += "bg-gray-100 border border-gray-200 text-gray-400 cursor-not-allowed";
                            } else if (isLockedByOther) {
                              btnStyle += "bg-amber-100 border border-amber-300 text-amber-800 cursor-not-allowed";
                            } else if (isSelected) {
                              btnStyle += "bg-emerald-600 border border-emerald-600 text-white shadow-md shadow-emerald-600/30 scale-105";
                            } else {
                              btnStyle += "bg-white border border-emerald-500 text-emerald-700 hover:bg-emerald-600 hover:text-white hover:scale-105 shadow-2xs";
                            }

                            return (
                              <button
                                key={seat.seatNumber}
                                onClick={() => toggleSeat(seat)}
                                onMouseEnter={() => setHoveredSeat(seat)}
                                onMouseLeave={() => setHoveredSeat(null)}
                                disabled={seat.isBooked || isLockedByOther}
                                className={btnStyle}
                                title={
                                  seat.isBooked
                                    ? "Booked"
                                    : isLockedByOther
                                    ? "Temporarily Held by Another Customer"
                                    : `${seat.seatNumber} - ₹${seat.price}`
                                }
                              >
                                {isLockedByOther ? "🔒" : seat.seatNumber}
                              </button>
                            );
                          })}
                        </div>

                        {/* Right Row Letter Marker */}
                        <span className="w-5 text-center text-xs font-bold text-gray-400 select-none">
                          {rowLabel}
                        </span>

                      </div>
                    );
                  })}
                </div>

              </div>
            );
          })}

        </div>
      </div>

      {/* 📌 LEGEND & HOVER DETAILS */}
      <div className="max-w-xl mx-auto px-4 mt-8 space-y-3">
        {hoveredSeat && (
          <div className="bg-white border border-emerald-300 rounded-xl p-2.5 text-center text-xs text-gray-700 shadow-xs animate-fadeIn">
            <span className="font-bold text-emerald-700">Seat {hoveredSeat.seatNumber}</span> ({hoveredSeat.category}) — <span className="font-extrabold text-[#222222]">₹{hoveredSeat.price}</span> {hoveredSeat.isBooked ? "• ❌ Booked" : "• ✅ Available"}
          </div>
        )}

        <div className="flex items-center justify-around bg-white border border-gray-200 rounded-xl p-3.5 text-xs text-gray-600 shadow-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded border border-emerald-500 bg-white" />
            <span>Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-emerald-600 border border-emerald-600" />
            <span>Selected ({selectedSeats.length})</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-amber-100 border border-amber-400 flex items-center justify-center text-[9px]">🔒</div>
            <span>Held (5m)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-gray-100 border border-gray-300" />
            <span>Booked</span>
          </div>
        </div>
      </div>

      {/* 💳 STICKY BOTTOM CHECKOUT DRAWER */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 sm:p-5 shadow-2xl z-40">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-red-50 border border-red-200 rounded-xl flex items-center justify-center text-[#F84464] font-black text-2xl">
              🎟️
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">
                Selected Seats ({selectedSeats.length}):{" "}
                <span className="text-[#222222] font-bold">
                  {selectedSeats.length > 0 ? selectedSeats.join(", ") : "None"}
                </span>
                {holdTimer && (
                  <span className="text-amber-600 font-bold ml-2">
                    (Held for {holdTimer})
                  </span>
                )}
              </p>
              <p className="text-lg font-bold text-[#222222]">
                Total: <span className="text-[#F84464] text-2xl font-black">₹{calculateTotal()}</span>
              </p>
            </div>
          </div>

          <button
            onClick={handleProceed}
            disabled={selectedSeats.length === 0}
            className="w-full sm:w-auto bg-[#F84464] hover:bg-[#E03252] disabled:opacity-40 text-white font-extrabold px-8 py-3.5 rounded-xl shadow-md transition text-sm flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer"
          >
            {selectedSeats.length === 0
              ? "Select Seats to Proceed"
              : `Proceed to F&B Addons (₹${calculateTotal()}) →`}
          </button>
        </div>
      </div>

    </div>
  );
}
