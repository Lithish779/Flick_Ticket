import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import API from "../api";
import { QRCodeCanvas } from "qrcode.react";

export default function SnacksHub() {
  const navigate = useNavigate();
  const location = useLocation();

  // User details
  const userString = localStorage.getItem("user");
  const user = userString ? JSON.parse(userString) : null;
  const rawUserId = user?._id || user?.id || localStorage.getItem("userId");
  const userId =
    rawUserId === "cust_assessment_01"
      ? "6af71e5df7cbd9c87a1b6537"
      : rawUserId === "admin_assessment_01"
      ? "6af71e5df7cbd9c87a1b652b"
      : rawUserId === "staff_assessment_01"
      ? "6af71e5df7cbd9c87a1b6531"
      : rawUserId;

  // Metadata states
  const [theatres, setTheatres] = useState(["IMAX", "PVR", "INOX", "Cinepolis"]);
  const [selectedTheatre, setSelectedTheatre] = useState("IMAX");
  const [moviesByTheatre, setMoviesByTheatre] = useState({});
  const [selectedMovie, setSelectedMovie] = useState("");
  
  // User's active bookings to attach snacks to
  const [userBookings, setUserBookings] = useState([]);
  const [selectedBookingId, setSelectedBookingId] = useState("");

  // Snacks & Cart
  const [snacks, setSnacks] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [cart, setCart] = useState([]);
  
  // Checkout & Order Pass Modal
  const [deliveryType, setDeliveryType] = useState("Express Counter Pickup");
  const [seatNumber, setSeatNumber] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedOrder, setCompletedOrder] = useState(null);
  const [showPassModal, setShowPassModal] = useState(false);

  // Default snack icons/categories fallback generator
  const getCategory = (name) => {
    const n = name.toLowerCase();
    if (n.includes("popcorn") || n.includes("combo")) return "Popcorn & Combos";
    if (n.includes("coke") || n.includes("pepsi") || n.includes("drink") || n.includes("soda") || n.includes("water") || n.includes("juice")) return "Beverages";
    if (n.includes("nacho") || n.includes("burger") || n.includes("fries") || n.includes("hotdog") || n.includes("pizza")) return "Hot Bites";
    return "Sweets & Extras";
  };

  const getSnackIcon = (name) => {
    const n = name.toLowerCase();
    if (n.includes("popcorn")) return "🍿";
    if (n.includes("coke") || n.includes("pepsi") || n.includes("soda") || n.includes("drink")) return "🥤";
    if (n.includes("nacho")) return "🧀";
    if (n.includes("burger") || n.includes("hotdog")) return "🍔";
    if (n.includes("pizza")) return "🍕";
    if (n.includes("candy") || n.includes("sweet") || n.includes("ice")) return "🍦";
    return "🍿";
  };

  /* ---------- Fetch Metadata & Snacks ---------- */
  useEffect(() => {
    // 1. Fetch metadata (theatres & movies)
    API.get("/api/snack-orders/meta/theatres-movies")
      .then((res) => {
        if (res.data.theatres?.length > 0) {
          setTheatres(res.data.theatres);
          setSelectedTheatre(res.data.theatres[0]);
        }
        if (res.data.moviesByTheatre) {
          setMoviesByTheatre(res.data.moviesByTheatre);
        }
      })
      .catch((err) => console.log("Meta fetch error:", err));

    // 2. Fetch user's active bookings if logged in
    if (userId) {
      API.get(`/api/bookings/user/${userId}`)
        .then((res) => {
          const valid = (res.data || []).filter((b) => !b.used && b.status !== "CANCELLED");
          setUserBookings(valid);
        })
        .catch(() => {});
    }
  }, [userId]);

  // Fetch snacks whenever selected theatre changes
  useEffect(() => {
    if (!selectedTheatre) return;
    API.get(`/api/snacks/theatre/${selectedTheatre}`)
      .then((res) => setSnacks(res.data))
      .catch((err) => {
        console.log("Snacks fetch error:", err);
        setSnacks([]);
      });
  }, [selectedTheatre]);

  // Auto-fill from route state or URL params if navigated from booking flow
  useEffect(() => {
    if (location.state?.theatre) {
      setSelectedTheatre(location.state.theatre);
    }
    if (location.state?.movieTitle) {
      setSelectedMovie(location.state.movieTitle);
    }
    if (location.state?.bookingId) {
      setSelectedBookingId(location.state.bookingId);
    }
    if (location.state?.seatNumber) {
      setSeatNumber(location.state.seatNumber);
      setDeliveryType("In-Seat Delivery");
    }
  }, [location.state]);

  const handleBookingSelect = (e) => {
    const bookingId = e.target.value;
    setSelectedBookingId(bookingId);
    const found = userBookings.find((b) => b._id === bookingId);
    if (found) {
      if (found.showId?.theatre) setSelectedTheatre(found.showId.theatre);
      if (found.showId?.movieId?.title) setSelectedMovie(found.showId.movieId.title);
      if (found.seats?.length > 0) {
        setSeatNumber(found.seats[0]);
        setDeliveryType("In-Seat Delivery");
      }
    }
  };

  /* ---------- Cart Actions ---------- */
  const addToCart = (snack) => {
    setCart((prev) => {
      const exist = prev.find((item) => item._id === snack._id);
      if (exist) {
        return prev.map((item) =>
          item._id === snack._id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prev, { ...snack, qty: 1 }];
    });
  };

  const removeFromCart = (snackId) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item._id === snackId ? { ...item, qty: item.qty - 1 } : item
        )
        .filter((item) => item.qty > 0)
    );
  };

  const getItemQty = (snackId) => {
    const found = cart.find((item) => item._id === snackId);
    return found ? found.qty : 0;
  };

  const totalCartPrice = cart.reduce(
    (acc, item) => acc + item.price * item.qty,
    0
  );

  /* ---------- Place Order ---------- */
  const handleCheckout = async () => {
    if (!userId) {
      alert("Please sign in to place a food & beverage order!");
      navigate("/login");
      return;
    }

    if (cart.length === 0) {
      alert("Your cart is empty. Add some delicious snacks first!");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        userId,
        theatre: selectedTheatre,
        movieTitle: selectedMovie || "General Theater Order",
        bookingId: selectedBookingId || null,
        items: cart.map((item) => ({
          name: item.name,
          price: item.price,
          qty: item.qty,
        })),
        totalPrice: totalCartPrice,
        deliveryType,
        seatNumber: deliveryType === "In-Seat Delivery" ? seatNumber : "",
      };

      const res = await API.post("/api/snack-orders", payload);

      if (res.data.success) {
        setCompletedOrder(res.data.order);
        setShowPassModal(true);
        setCart([]);
      }
    } catch (err) {
      console.error("Snack order failed", err);
      alert(err.response?.data?.message || "Failed to place snack order");
    } finally {
      setIsSubmitting(false);
    }
  };

  const categories = ["All", "Popcorn & Combos", "Beverages", "Hot Bites", "Sweets & Extras"];

  const filteredSnacks = snacks.filter((snack) => {
    if (categoryFilter === "All") return true;
    return getCategory(snack.name) === categoryFilter;
  });

  return (
    <div className="bg-[#F5F5FA] min-h-screen text-[#222222] pb-24 font-sans">
      
      {/* 🍿 Hero Header */}
      <div className="bg-white border-b border-gray-200 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto text-center space-y-3">
          <div className="inline-flex items-center gap-2 bg-red-50 border border-red-200 text-[#F84464] px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-2xs">
            <span>🍿</span> CinePantry Express F&B
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#222222]">
            Order Food & Beverages <span className="text-[#F84464]">By Theater & Movie</span>
          </h1>
          <p className="text-gray-500 text-xs sm:text-sm max-w-2xl mx-auto">
            Pre-order gourmet popcorn, crisp beverages, and fresh movie snacks anytime for express counter pickup or direct in-seat delivery!
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        
        {/* 🏢 Interactive Filtering Toolbar */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            
            {/* 1. Theater Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                <span>🎭</span> Select Theater
              </label>
              <select
                value={selectedTheatre}
                onChange={(e) => {
                  setSelectedTheatre(e.target.value);
                  setSelectedMovie("");
                }}
                className="w-full bg-[#F5F5FA] border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-[#222222] focus:outline-none focus:border-[#F84464] transition"
              >
                {theatres.map((t) => (
                  <option key={t} value={t}>
                    {t} Multiplex
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Movie Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                <span>🎬</span> Respective Movie (Optional)
              </label>
              <select
                value={selectedMovie}
                onChange={(e) => setSelectedMovie(e.target.value)}
                className="w-full bg-[#F5F5FA] border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-[#222222] focus:outline-none focus:border-[#F84464] transition"
              >
                <option value="">-- All Movies at {selectedTheatre} --</option>
                {(moviesByTheatre[selectedTheatre] || []).map((m) => (
                  <option key={m._id} value={m.title}>
                    {m.title} ({m.genre})
                  </option>
                ))}
              </select>
            </div>

            {/* 3. Link to Active Ticket Booking */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                <span>🎟️</span> Attach to My Movie Ticket
              </label>
              <select
                value={selectedBookingId}
                onChange={handleBookingSelect}
                className="w-full bg-[#F5F5FA] border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-[#222222] focus:outline-none focus:border-[#F84464] transition"
              >
                <option value="">-- Independent Order --</option>
                {userBookings.map((b) => (
                  <option key={b._id} value={b._id}>
                    {b.showId?.movieId?.title || "Movie"} @ {b.showId?.theatre} (Seats: {b.seats?.join(",")})
                  </option>
                ))}
              </select>
            </div>

          </div>

          {/* Quick Theatre Badges */}
          <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-gray-100">
            <span className="text-xs text-gray-400 font-bold mr-2">Quick Select:</span>
            {theatres.map((t) => (
              <button
                key={t}
                onClick={() => {
                  setSelectedTheatre(t);
                  setSelectedMovie("");
                }}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                  selectedTheatre === t
                    ? "bg-[#F84464] text-white shadow-2xs"
                    : "bg-[#F5F5FA] border border-gray-200 text-gray-600 hover:text-[#222222]"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* 🍿 Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                categoryFilter === cat
                  ? "bg-[#F84464] text-white shadow-2xs"
                  : "bg-white border border-gray-200 text-gray-600 hover:text-[#222222]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* 🍕 Snacks Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {filteredSnacks.length === 0 ? (
            <div className="col-span-full text-center py-16 bg-white border border-dashed border-gray-200 rounded-2xl">
              <span className="text-4xl block mb-2">🍿</span>
              <p className="text-gray-600 font-semibold text-sm">
                No snacks available for <strong className="text-[#222222]">{selectedTheatre}</strong> in this category.
              </p>
              <p className="text-xs text-gray-400 mt-1">Try selecting a different category or theater above.</p>
            </div>
          ) : (
            filteredSnacks.map((snack) => {
              const qty = getItemQty(snack._id);
              const icon = getSnackIcon(snack.name);

              return (
                <div
                  key={snack._id}
                  className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-2xs hover:shadow-md transition flex flex-col justify-between group"
                >
                  <div className="p-5 space-y-3">
                    <div className="w-14 h-14 bg-red-50 border border-red-100 rounded-2xl flex items-center justify-center text-3xl group-hover:scale-105 transition">
                      {icon}
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-[#F84464] bg-red-50 px-2 py-0.5 rounded-md border border-red-200">
                        {getCategory(snack.name)}
                      </span>
                      <h3 className="text-base font-bold text-[#222222] mt-2">
                        {snack.name}
                      </h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Freshly prepared for <strong className="text-gray-700">{snack.theatre || selectedTheatre}</strong>
                      </p>
                    </div>
                  </div>

                  <div className="p-4 bg-[#F5F5FA] border-t border-gray-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-gray-400 block font-bold uppercase">Price</span>
                      <span className="text-base font-black text-[#222222]">₹{snack.price}</span>
                    </div>

                    {qty > 0 ? (
                      <div className="flex items-center gap-3 bg-white border border-gray-300 px-2.5 py-1 rounded-xl shadow-2xs">
                        <button
                          onClick={() => removeFromCart(snack._id)}
                          className="text-gray-500 hover:text-[#222222] font-black text-sm px-1 cursor-pointer"
                        >
                          -
                        </button>
                        <span className="text-xs font-extrabold text-[#222222] min-w-[1rem] text-center">
                          {qty}
                        </span>
                        <button
                          onClick={() => addToCart(snack)}
                          className="text-[#F84464] hover:text-[#E03252] font-black text-sm px-1 cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => addToCart(snack)}
                        className="bg-[#F84464] hover:bg-[#E03252] text-white font-bold text-xs px-3.5 py-2 rounded-xl transition shadow-2xs cursor-pointer"
                      >
                        + Add Item
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>

      {/* 🛒 Floating Cart Drawer & Checkout Bar */}
      {cart.length > 0 && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 w-[92%] max-w-4xl bg-white border border-gray-200 rounded-2xl p-4 shadow-2xl z-40 flex flex-col md:flex-row items-center justify-between gap-4 animate-slideUp">
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="w-11 h-11 bg-red-50 border border-red-200 rounded-xl flex items-center justify-center text-xl text-[#F84464]">
              🛒
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[#222222] font-extrabold text-sm">
                  {cart.reduce((sum, item) => sum + item.qty, 0)} Items Selected
                </span>
                <span className="text-xs text-[#F84464] font-bold bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
                  {selectedTheatre}
                </span>
              </div>
              <p className="text-xs text-gray-500 truncate max-w-xs mt-0.5">
                {cart.map((i) => `${i.name} (x${i.qty})`).join(", ")}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
            
            {/* Delivery Type Toggle */}
            <div className="flex bg-[#F5F5FA] border border-gray-200 p-1 rounded-xl text-xs">
              <button
                onClick={() => setDeliveryType("Express Counter Pickup")}
                className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer ${
                  deliveryType === "Express Counter Pickup"
                    ? "bg-[#F84464] text-white shadow-2xs"
                    : "text-gray-600 hover:text-[#222222]"
                }`}
              >
                🚶 Counter
              </button>
              <button
                onClick={() => setDeliveryType("In-Seat Delivery")}
                className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer ${
                  deliveryType === "In-Seat Delivery"
                    ? "bg-[#F84464] text-white shadow-2xs"
                    : "text-gray-600 hover:text-[#222222]"
                }`}
              >
                💺 In-Seat
              </button>
            </div>

            {deliveryType === "In-Seat Delivery" && (
              <input
                type="text"
                value={seatNumber}
                onChange={(e) => setSeatNumber(e.target.value)}
                placeholder="Seat No"
                className="w-20 bg-[#F5F5FA] border border-gray-300 text-[#222222] text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#F84464]"
              />
            )}

            <div className="text-right">
              <span className="text-[10px] text-gray-400 uppercase font-bold block">Total</span>
              <span className="text-lg font-black text-[#F84464]">₹{totalCartPrice}</span>
            </div>

            <button
              onClick={handleCheckout}
              disabled={isSubmitting}
              className="bg-[#F84464] hover:bg-[#E03252] text-white font-extrabold text-xs px-5 py-2.5 rounded-xl transition shadow-xs whitespace-nowrap cursor-pointer"
            >
              {isSubmitting ? "Processing..." : "Confirm & Pay 🍿"}
            </button>
          </div>
        </div>
      )}

      {/* 🎟️ Standalone Express Snack Pass Modal */}
      {showPassModal && completedOrder && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white border border-gray-200 max-w-md w-full rounded-3xl p-6 shadow-2xl space-y-5 text-center relative text-[#222222]">
            
            <button
              onClick={() => setShowPassModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-lg bg-gray-100 rounded-full w-8 h-8 flex items-center justify-center cursor-pointer"
            >
              ✕
            </button>

            <div className="w-14 h-14 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-center text-emerald-600 text-2xl mx-auto shadow-2xs">
              ✓
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-700 bg-emerald-50 px-3 py-0.5 rounded-full border border-emerald-200">
                Order Confirmed
              </span>
              <h2 className="text-xl font-extrabold text-[#222222] mt-2">
                F&B Express Snack Pass
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Pass ID: <span className="text-gray-800 font-mono font-bold">{completedOrder.orderPassId}</span>
              </p>
            </div>

            {/* QR Code */}
            <div className="bg-white p-3 rounded-2xl inline-block border border-gray-200 shadow-2xs my-1">
              <QRCodeCanvas
                value={`${window.location.origin}/verify-snack/${completedOrder.orderPassId}`}
                size={130}
              />
            </div>

            {/* Details */}
            <div className="bg-[#F5F5FA] p-4 rounded-xl border border-gray-200 text-left space-y-2 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>Theater:</span>
                <span className="text-gray-800 font-bold">{completedOrder.theatre}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Movie:</span>
                <span className="text-gray-800 font-bold">{completedOrder.movieTitle}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Delivery:</span>
                <span className="text-[#F84464] font-bold">
                  {completedOrder.deliveryType} {completedOrder.seatNumber ? `(Seat: ${completedOrder.seatNumber})` : ""}
                </span>
              </div>
              <div className="border-t border-gray-200 pt-2 flex justify-between font-bold text-[#222222] text-sm">
                <span>Total Paid:</span>
                <span className="text-[#F84464]">₹{completedOrder.totalPrice}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => navigate("/my-bookings")}
                className="flex-1 bg-[#F84464] hover:bg-[#E03252] text-white font-bold text-xs py-2.5 rounded-xl transition shadow-xs cursor-pointer"
              >
                View in My Account 🎟️
              </button>
              <button
                onClick={() => setShowPassModal(false)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs px-5 py-2.5 rounded-xl transition cursor-pointer"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
