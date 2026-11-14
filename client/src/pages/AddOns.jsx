import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import API from "../api";
import axios from "axios";

const PRESET_COMBOS = [
  {
    id: "combo-1",
    name: "🎬 Movie Night Duo",
    items: [
      { name: "Jumbo Butter Popcorn", price: 220, qty: 1 },
      { name: "Cold Beverage (Large)", price: 120, qty: 2 },
    ],
    originalPrice: 460,
    comboPrice: 380,
    savings: 80,
    badge: "🔥 Best Seller",
  },
  {
    id: "combo-2",
    name: "🎉 VIP Gourmet Feast",
    items: [
      { name: "Extra Large Popcorn", price: 260, qty: 1 },
      { name: "Loaded Cheese Nachos", price: 180, qty: 1 },
      { name: "Cold Beverage (Large)", price: 120, qty: 2 },
    ],
    originalPrice: 680,
    comboPrice: 550,
    savings: 130,
    badge: "⭐ 20% OFF",
  },
];

function AddOns() {
  const { showId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const selectedSeats = location.state?.selectedSeats || [];
  const initialShow = location.state?.show;

  const [snacks, setSnacks] = useState([]);
  const [parking, setParking] = useState(null);
  const [selectedSnacks, setSelectedSnacks] = useState([]);
  const [selectedParking, setSelectedParking] = useState(null);
  const [show, setShow] = useState(initialShow || null);

  // Promo code state
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponMsg, setCouponMsg] = useState({ text: "", type: "" });
  const [activeCoupons, setActiveCoupons] = useState([]);

  const userString = localStorage.getItem("user");
  const user = userString ? JSON.parse(userString) : null;
  const userId = user?._id || user?.id || localStorage.getItem("userId");
  const API_URL = process.env.REACT_APP_API_URL || "https://flick-ticket-bt8v.onrender.com";

  /* Protect Refresh */
  useEffect(() => {
    if (!showId || selectedSeats.length === 0) {
      navigate("/");
    }
  }, [showId, selectedSeats, navigate]);

  /* Fetch Show + AddOns + Coupons */
  useEffect(() => {
    if (!showId) return;

    const loadData = async () => {
      try {
        let currentShow = show;
        if (!currentShow) {
          const res = await API.get(`/api/shows/single/${showId}`);
          currentShow = res.data;
          setShow(currentShow);
        }

        const theatre = currentShow.theatre;

        // Fetch Snacks
        API.get(`/api/snacks/theatre/${theatre}`)
          .then((r) => setSnacks(r.data))
          .catch(() => setSnacks([]));

        // Fetch Parking
        API.get(`/api/parking/theatre/${theatre}`)
          .then((r) => setParking(r.data))
          .catch(() => setParking(null));

        // Fetch available coupons
        axios
          .get(`${API_URL}/api/coupons/active`)
          .then((r) => setActiveCoupons(r.data))
          .catch(() => {});
      } catch (err) {
        console.error("Data load error", err);
      }
    };

    loadData();
  }, [showId]);

  /* Snack Add & Remove */
  const addSnack = (snack) => {
    setSelectedSnacks((prev) => {
      const exist = prev.find((s) => s._id === snack._id || s.name === snack.name);
      if (exist) {
        return prev.map((s) =>
          s._id === snack._id || s.name === snack.name ? { ...s, qty: s.qty + 1 } : s
        );
      }
      return [...prev, { ...snack, qty: 1 }];
    });
  };

  const addComboToCart = (combo) => {
    combo.items.forEach((item) => {
      setSelectedSnacks((prev) => {
        const exist = prev.find((s) => s.name === item.name);
        if (exist) {
          return prev.map((s) => (s.name === item.name ? { ...s, qty: s.qty + item.qty } : s));
        }
        return [...prev, { _id: item.name, name: item.name, price: item.price, qty: item.qty }];
      });
    });
  };

  const removeSnack = (snack) => {
    setSelectedSnacks((prev) =>
      prev
        .map((s) => (s.name === snack.name ? { ...s, qty: s.qty - 1 } : s))
        .filter((s) => s.qty > 0)
    );
  };

  const calculateSubtotal = () => {
    if (!show) return 0;
    const seatTotal = show.seats
      .filter((s) => selectedSeats.includes(s.seatNumber))
      .reduce((acc, s) => acc + s.price, 0);

    const snackTotal = selectedSnacks.reduce(
      (acc, s) => acc + s.price * s.qty,
      0
    );

    const parkingTotal = selectedParking?.price || 0;
    return seatTotal + snackTotal + parkingTotal;
  };

  const subtotal = calculateSubtotal();
  const finalTotal = Math.max(0, subtotal - discountAmount);

  /* Apply Coupon */
  const handleApplyCoupon = async (codeToApply) => {
    const code = codeToApply || couponCode;
    if (!code.trim()) return;

    try {
      const res = await axios.post(`${API_URL}/api/coupons/validate`, {
        code,
        totalAmount: subtotal,
      });

      if (res.data.success) {
        setAppliedCoupon(res.data.code);
        setDiscountAmount(res.data.discountAmount);
        setCouponMsg({ text: res.data.message, type: "success" });
      }
    } catch (err) {
      setAppliedCoupon(null);
      setDiscountAmount(0);
      setCouponMsg({
        text: err.response?.data?.message || "Invalid coupon code",
        type: "error",
      });
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setDiscountAmount(0);
    setCouponCode("");
    setCouponMsg({ text: "Coupon removed", type: "info" });
    setTimeout(() => setCouponMsg({ text: "", type: "" }), 2000);
  };

  /* Confirm Booking */
  const confirmBooking = async () => {
    try {
      await API.post(`/api/bookings`, {
        showId,
        seats: selectedSeats,
        userId,
        snacks: selectedSnacks,
        parking: selectedParking,
        totalPrice: finalTotal,
      });
      navigate("/my-bookings");
    } catch (err) {
      console.error("Booking failed", err);
      alert("Booking failed");
    }
  };

  const skipBooking = async () => {
    try {
      await API.post(`/api/bookings`, {
        showId,
        seats: selectedSeats,
        userId,
        totalPrice: finalTotal,
      });
      navigate("/my-bookings");
    } catch (err) {
      console.error("Booking failed", err);
      alert("Booking failed");
    }
  };

  if (!show) {
    return (
      <div className="min-h-screen bg-[#F5F5FA] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-[#F84464] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">
            Loading Checkout...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#F5F5FA] min-h-screen text-[#222222] py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto bg-white border border-gray-200 p-6 md:p-8 rounded-2xl shadow-sm space-y-8">
        
        {/* Header summary */}
        <div className="border-b border-gray-200 pb-5 text-center">
          <span className="bg-red-50 text-[#F84464] border border-red-200 text-[10px] font-black px-3 py-1 rounded-full uppercase">
            Step 2 of 2: Extras & Checkout
          </span>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#222222] mt-2">
            Customize Refreshments & Parking
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Theater: <strong className="text-[#222222]">{show.theatre}</strong> &nbsp;•&nbsp; Seats: <strong className="text-[#F84464]">{selectedSeats.join(", ")}</strong>
          </p>
        </div>

        {/* 🍿 PRE-PACKAGED COMBOS */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-extrabold text-[#222222] uppercase tracking-wider flex items-center gap-2">
              <span>⚡</span> Recommended Cinema Combos
            </h2>
            <span className="text-xs text-emerald-600 font-bold">Save up to ₹130</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {PRESET_COMBOS.map((combo) => (
              <div
                key={combo.id}
                className="bg-amber-50/40 border border-amber-200/80 p-4 rounded-xl flex flex-col justify-between space-y-3 group hover:border-amber-400 transition"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">
                      {combo.badge}
                    </span>
                    <h3 className="font-bold text-[#222222] text-sm mt-1.5">{combo.name}</h3>
                    <p className="text-xs text-gray-600 mt-0.5">
                      {combo.items.map((i) => `${i.name} x${i.qty}`).join(" + ")}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-amber-200/60">
                  <div>
                    <span className="text-xs text-gray-400 line-through mr-1">₹{combo.originalPrice}</span>
                    <span className="text-sm font-extrabold text-amber-900">₹{combo.comboPrice}</span>
                  </div>
                  <button
                    onClick={() => addComboToCart(combo)}
                    className="bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs px-3.5 py-1.5 rounded-lg transition shadow-xs cursor-pointer"
                  >
                    + Add Combo
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 🍿 SINGLE SNACKS */}
        <div>
          <h2 className="text-sm font-extrabold text-[#222222] uppercase tracking-wider mb-3 flex items-center gap-2">
            <span>🍿</span> À La Carte Food & Beverages
          </h2>

          {snacks.length === 0 ? (
            <p className="text-gray-400 text-xs italic py-4 text-center border border-dashed border-gray-200 rounded-xl">
              No snacks available for this theater.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {snacks.map((snack) => {
                const qty = selectedSnacks.find((s) => s.name === snack.name)?.qty || 0;
                return (
                  <div
                    key={snack._id}
                    className="flex justify-between items-center bg-[#F5F5FA] p-3.5 rounded-xl border border-gray-200"
                  >
                    <div>
                      <span className="font-bold text-[#222222] text-xs block">{snack.name}</span>
                      <span className="text-xs text-[#F84464] font-extrabold">₹{snack.price}</span>
                    </div>

                    <div className="flex items-center gap-3 bg-white border border-gray-300 px-3 py-1 rounded-lg shadow-2xs">
                      <button
                        onClick={() => removeSnack(snack)}
                        className="text-gray-500 hover:text-[#222222] font-bold text-base cursor-pointer"
                      >
                        -
                      </button>
                      <span className="text-xs font-bold text-[#222222] min-w-[1rem] text-center">{qty}</span>
                      <button
                        onClick={() => addSnack(snack)}
                        className="text-[#F84464] hover:text-[#E03252] font-bold text-base cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 🚗 PARKING */}
        {parking && (
          <div>
            <h2 className="text-sm font-extrabold text-[#222222] uppercase tracking-wider mb-3 flex items-center gap-2">
              <span>🚗</span> Reserved Vehicle Parking
            </h2>

            <div className="flex gap-3">
              <button
                onClick={() =>
                  setSelectedParking(
                    selectedParking?.type === "Bike"
                      ? null
                      : { type: "Bike", price: parking.priceBike }
                  )
                }
                className={`flex-1 p-3.5 rounded-xl border transition text-center font-bold text-xs cursor-pointer ${
                  selectedParking?.type === "Bike"
                    ? "bg-red-50 border-[#F84464] text-[#F84464] shadow-xs"
                    : "bg-[#F5F5FA] border-gray-200 text-gray-600 hover:border-gray-300"
                }`}
              >
                🏍 Bike Parking (₹{parking.priceBike})
              </button>

              <button
                onClick={() =>
                  setSelectedParking(
                    selectedParking?.type === "Car"
                      ? null
                      : { type: "Car", price: parking.priceCar }
                  )
                }
                className={`flex-1 p-3.5 rounded-xl border transition text-center font-bold text-xs cursor-pointer ${
                  selectedParking?.type === "Car"
                    ? "bg-red-50 border-[#F84464] text-[#F84464] shadow-xs"
                    : "bg-[#F5F5FA] border-gray-200 text-gray-600 hover:border-gray-300"
                }`}
              >
                🚗 Car Parking (₹{parking.priceCar})
              </button>
            </div>
          </div>
        )}

        {/* 🏷️ PROMO DISCOUNT */}
        <div className="bg-[#F5F5FA] p-5 rounded-xl border border-gray-200 space-y-3">
          <h2 className="text-xs font-bold uppercase text-gray-500 tracking-wider">
            🏷️ Apply Promo Code or Gift Voucher
          </h2>

          <div className="flex gap-2">
            <input
              type="text"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              placeholder="Enter promo code (e.g. CINE50)"
              className="flex-1 bg-white border border-gray-300 rounded-xl px-4 py-2 text-xs text-[#222222] uppercase font-mono focus:outline-none focus:border-[#F84464] transition"
              disabled={!!appliedCoupon}
            />
            {appliedCoupon ? (
              <button
                onClick={handleRemoveCoupon}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold px-4 py-2 rounded-xl text-xs transition cursor-pointer"
              >
                Remove
              </button>
            ) : (
              <button
                onClick={() => handleApplyCoupon()}
                className="bg-[#F84464] hover:bg-[#E03252] text-white font-bold px-5 py-2 rounded-xl text-xs transition cursor-pointer shadow-xs"
              >
                Apply
              </button>
            )}
          </div>

          {couponMsg.text && (
            <p className={`text-xs font-bold ${couponMsg.type === "success" ? "text-emerald-600" : "text-[#F84464]"}`}>
              {couponMsg.text}
            </p>
          )}

          {activeCoupons.length > 0 && !appliedCoupon && (
            <div className="pt-1 flex flex-wrap gap-2">
              {activeCoupons.map((c) => (
                <button
                  key={c.code}
                  onClick={() => {
                    setCouponCode(c.code);
                    handleApplyCoupon(c.code);
                  }}
                  className="text-[11px] bg-white border border-red-200 text-[#F84464] px-3 py-1 rounded-lg hover:bg-red-50 transition cursor-pointer font-bold shadow-2xs"
                >
                  🏷️ {c.code}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 💳 SUMMARY & TOTAL */}
        <div className="bg-[#F5F5FA] p-5 rounded-xl border border-gray-200 space-y-2">
          <div className="flex justify-between text-xs text-gray-500">
            <span>Subtotal (Tickets & Extras):</span>
            <span className="font-bold text-[#222222]">₹{subtotal}</span>
          </div>

          {discountAmount > 0 && (
            <div className="flex justify-between text-xs text-emerald-600 font-bold">
              <span>Discount ({appliedCoupon}):</span>
              <span>- ₹{discountAmount}</span>
            </div>
          )}

          <div className="flex justify-between text-base font-extrabold text-[#222222] border-t border-gray-200 pt-3">
            <span>Total Payable:</span>
            <span className="text-[#F84464] text-2xl font-black">₹{finalTotal}</span>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={confirmBooking}
            className="flex-1 bg-[#F84464] hover:bg-[#E03252] text-white font-extrabold py-3.5 rounded-xl transition text-center text-sm shadow-md cursor-pointer"
          >
            Confirm & Pay (₹{finalTotal})
          </button>
          <button
            onClick={skipBooking}
            className="bg-white hover:bg-gray-100 text-gray-700 font-bold py-3.5 px-6 rounded-xl transition text-center text-xs border border-gray-300 shadow-2xs cursor-pointer"
          >
            Skip Extras & Checkout
          </button>
        </div>

      </div>
    </div>
  );
}

export default AddOns;
