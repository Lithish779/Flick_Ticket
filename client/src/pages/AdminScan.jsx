import { useState } from "react";
import API from "../api";
import AdminNavbar from "../components/AdminNavbar";

export default function AdminScan() {
  const [bookingId, setBookingId] = useState("");
  const [booking, setBooking] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const verifyTicket = () => {
    if (!bookingId.trim()) return;
    setLoading(true);
    setMessage("");
    
    API.get(`/api/bookings/verify/${bookingId.trim()}`)
      .then((res) => {
        setBooking(res.data?.booking || res.data);
        if (res.data?.message) {
          setMessage(res.data.message);
        }
      })
      .catch(() => {
        setBooking(null);
        setMessage("❌ Invalid Ticket ID or Ticket not found in system database.");
      })
      .finally(() => setLoading(false));
  };

  const markUsed = () => {
    if (!bookingId.trim()) return;
    API.put(`/api/bookings/use/${bookingId.trim()}`)
      .then((res) => {
        setMessage("✅ " + (res.data?.message || "Ticket marked as redeemed successfully!"));
      })
      .catch((err) => {
        setMessage("❌ Error: " + (err.response?.data?.message || err.message));
      });
  };

  return (
    <div className="bg-[#F5F5FA] min-h-screen text-[#222222] font-sans pb-16">
      <AdminNavbar />

      <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-6">
        
        {/* Header */}
        <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-xs text-center space-y-2">
          <span className="bg-red-50 text-[#F84464] border border-red-200 text-[10px] font-black px-3 py-0.5 rounded-full uppercase inline-block">
            🎟️ Gate QR & Digital Verification
          </span>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#222222]">
            Ticket Entry Scanner & Validator
          </h1>
          <p className="text-xs text-gray-500 max-w-lg mx-auto">
            Scan user mobile QR pass or enter booking reference ID to permit cinema hall entry
          </p>
        </div>

        {/* Input Card */}
        <div className="bg-white border border-gray-200 p-6 md:p-8 rounded-2xl shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              value={bookingId}
              onChange={(e) => setBookingId(e.target.value)}
              placeholder="Enter Booking Reference or ID (e.g. CB-2026-X89F2A)"
              className="flex-1 bg-[#F5F5FA] border border-gray-300 text-[#222222] font-mono text-xs px-4 py-3 rounded-xl focus:outline-none focus:border-[#F84464] transition"
            />

            <button
              onClick={verifyTicket}
              disabled={loading}
              className="bg-[#F84464] hover:bg-[#E03252] text-white font-extrabold text-xs px-6 py-3 rounded-xl transition shadow-xs whitespace-nowrap disabled:opacity-50 cursor-pointer"
            >
              {loading ? "Verifying..." : "⚡ Verify Pass"}
            </button>
          </div>

          {message && (
            <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200 text-center font-bold text-xs text-gray-700 animate-fadeIn">
              {message}
            </div>
          )}

          {booking && (
            <div className="border border-gray-200 rounded-2xl p-6 bg-[#F5F5FA] space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                <span className="text-xs font-bold text-gray-500">Booking Reference</span>
                <span className="font-mono text-xs text-[#F84464] font-bold bg-white px-2 py-0.5 rounded border border-gray-200">
                  {booking.bookingReference || booking._id}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-gray-400 block">Theatre</span>
                  <span className="font-bold text-[#222222]">{booking.showId?.theatre || "PVR Cinema"}</span>
                </div>
                <div>
                  <span className="text-gray-400 block">Date & Time</span>
                  <span className="font-bold text-[#222222]">{booking.showId?.date} • {booking.showId?.time}</span>
                </div>
                <div>
                  <span className="text-gray-400 block">Reserved Seats</span>
                  <span className="font-extrabold text-emerald-700 text-sm">{booking.seats?.join(", ")}</span>
                </div>
                <div>
                  <span className="text-gray-400 block">Paid Amount</span>
                  <span className="font-extrabold text-[#222222] text-sm">₹{booking.totalPrice}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-200 flex gap-3">
                <button
                  onClick={markUsed}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs py-3 rounded-xl transition shadow-xs cursor-pointer"
                >
                  ✓ Admit & Mark Used
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
