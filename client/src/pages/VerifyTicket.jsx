import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import API from "../api";

function VerifyTicket() {
  const { bookingId } = useParams();

  const [booking, setBooking] = useState(undefined);
  const [status, setStatus] = useState("");

  useEffect(() => {
    if (!bookingId) {
      setBooking(null);
      return;
    }

    const verifyTicket = async () => {
      try {
        const res = await API.get(`/api/bookings/verify/${bookingId}`);

        if (!res.data) {
          setBooking(null);
          return;
        }

        const ticketData = res.data.booking || res.data;
        setBooking(ticketData);

        if (ticketData.status === "CANCELLED") {
          setStatus("CANCELLED");
        } else if (ticketData.used) {
          setStatus("USED");
        } else {
          await API.put(`/api/bookings/use/${bookingId}`);
          setStatus("VALID");
        }
      } catch (err) {
        console.log("Verification error:", err);
        setBooking(null);
      }
    };

    verifyTicket();
  }, [bookingId]);

  /* ---------- Loading ---------- */
  if (booking === undefined) {
    return (
      <div className="bg-[#F5F5FA] min-h-screen flex flex-col justify-center items-center text-[#222222] font-sans">
        <div className="w-12 h-12 border-4 border-[#F84464] border-t-transparent rounded-full animate-spin mb-4" />
        <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">
          Verifying Admission Ticket...
        </span>
      </div>
    );
  }

  /* ---------- Invalid ---------- */
  if (!booking) {
    return (
      <div className="bg-[#F5F5FA] min-h-screen flex justify-center items-center p-4 font-sans">
        <div className="bg-white border border-red-200 rounded-3xl p-8 max-w-sm w-full text-center shadow-md space-y-4">
          <div className="w-16 h-16 bg-red-50 text-[#F84464] rounded-full flex items-center justify-center text-3xl mx-auto">
            ✕
          </div>
          <h2 className="text-xl font-extrabold text-[#222222]">
            Invalid Ticket Pass
          </h2>
          <p className="text-xs text-gray-500">
            This booking reference was not recognized by the CineBook gate database.
          </p>
          <Link
            to="/"
            className="inline-block bg-[#F84464] hover:bg-[#E03252] text-white font-bold text-xs px-6 py-2.5 rounded-xl transition shadow-xs"
          >
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  const snacks =
    booking.snacks?.length > 0
      ? booking.snacks.map((s) => `${s.name} x${s.qty}`).join(", ")
      : "None";

  const parking = booking.parking ? `${booking.parking.type}` : "None";

  return (
    <div className="bg-[#F5F5FA] min-h-screen flex justify-center items-center p-4 sm:p-6 font-sans">
      <div className="bg-white border border-gray-200 rounded-3xl shadow-sm w-full max-w-md overflow-hidden relative">
        
        {/* Top Header Badge */}
        <div className="bg-[#333545] text-white py-3 px-6 flex justify-between items-center text-xs">
          <span className="font-extrabold tracking-wider uppercase text-gray-300">
            CineBook Admission Pass
          </span>
          <span className="font-mono text-[#F84464] font-bold bg-white/10 px-2 py-0.5 rounded">
            {booking.bookingReference || booking._id}
          </span>
        </div>

        {/* Movie Poster */}
        {booking.showId?.movieId?.poster && (
          <img
            src={booking.showId?.movieId?.poster}
            alt="poster"
            className="w-full h-48 object-cover"
          />
        )}

        <div className="p-6 text-[#222222]">
          {/* Movie Title */}
          <h1 className="text-xl font-extrabold text-center text-[#222222]">
            {booking.showId?.movieId?.title}
          </h1>

          <p className="text-[#F84464] text-xs font-bold text-center mb-5">
            {booking.showId?.movieId?.genre || "Blockbuster"}
          </p>

          {/* Ticket Divider */}
          <div className="border-t border-dashed border-gray-200 mb-5"></div>

          {/* Ticket Info */}
          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between text-gray-500">
              <span>🎭 Theatre</span>
              <span className="font-bold text-gray-800">{booking.showId?.theatre}</span>
            </div>

            <div className="flex justify-between text-gray-500">
              <span>📅 Date</span>
              <span className="font-bold text-gray-800">{booking.showId?.date}</span>
            </div>

            <div className="flex justify-between text-gray-500">
              <span>⏰ Time</span>
              <span className="font-bold text-gray-800">{booking.showId?.time}</span>
            </div>

            <div className="flex justify-between text-gray-500">
              <span>💺 Seats</span>
              <span className="text-emerald-700 font-extrabold text-sm">
                {booking.seats?.join(", ")}
              </span>
            </div>

            <div className="flex justify-between text-gray-500">
              <span>🍿 Snacks</span>
              <span className="font-semibold text-gray-700">{snacks}</span>
            </div>

            <div className="flex justify-between text-gray-500">
              <span>🚗 Parking</span>
              <span className="font-semibold text-gray-700">{parking}</span>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-dashed border-gray-200 my-5"></div>

          {/* Price */}
          <div className="text-center mb-6">
            <p className="text-gray-400 text-xs font-semibold">
              Total Amount Paid
            </p>
            <h2 className="text-3xl font-black text-[#222222]">
              ₹{booking.totalPrice}
            </h2>
          </div>

          {/* Status */}
          <div className="text-center">
            {status === "VALID" && (
              <div className="bg-emerald-600 text-white py-3 rounded-xl text-sm font-extrabold shadow-sm">
                ✅ ENTRY ALLOWED (TICKET ADMITTED)
              </div>
            )}

            {status === "USED" && (
              <div className="bg-amber-600 text-white py-3 rounded-xl text-sm font-extrabold shadow-sm">
                ⚠️ TICKET ALREADY USED
              </div>
            )}

            {status === "CANCELLED" && (
              <div className="bg-red-600 text-white py-3 rounded-xl text-sm font-extrabold shadow-sm">
                ⛔ TICKET CANCELLED & REFUNDED
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}

export default VerifyTicket;
