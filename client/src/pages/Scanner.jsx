import { useEffect, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import API from "../api";

function Scanner() {
  const [inputTicketId, setInputTicketId] = useState("");
  const [scannedTicket, setScannedTicket] = useState(null);
  const [statusMessage, setStatusMessage] = useState({ text: "", type: "" });
  const [loading, setLoading] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);

  /* Start Camera Scanner */
  useEffect(() => {
    let qrCodeScanner = null;

    if (cameraActive) {
      qrCodeScanner = new Html5Qrcode("reader");
      qrCodeScanner
        .start(
          { facingMode: "environment" },
          { fps: 10, qrbox: 250 },
          async (decodedText) => {
            const id = decodedText.split("/").pop();
            verifyTicketId(id);
          },
          () => {}
        )
        .catch((err) => {
          console.log("Camera access error:", err);
        });
    }

    return () => {
      if (qrCodeScanner) {
        qrCodeScanner.stop().catch(() => {});
      }
    };
  }, [cameraActive]);

  /* Verify & Process Ticket */
  const verifyTicketId = async (idToVerify) => {
    const id = (idToVerify || inputTicketId || "").trim();
    if (!id) return;

    setLoading(true);
    setStatusMessage({ text: "", type: "" });
    setScannedTicket(null);

    try {
      // 1. Check ticket validity against backend gate verification API
      const res = await API.get(`/api/bookings/verify/${id}`);
      const ticket = res.data.booking;
      setScannedTicket(ticket);

      // 2. Mark as used for single-use enforcement
      await API.put(`/api/bookings/use/${id}`);
      setStatusMessage({
        text: "✅ TICKET VALID - GATE ADMITTED SUCCESSFULLY",
        type: "success",
      });
    } catch (err) {
      const errData = err.response?.data;
      if (errData?.booking) {
        setScannedTicket(errData.booking);
      }
      
      if (errData?.status === "CANCELLED") {
        setStatusMessage({
          text: "⛔ TICKET CANCELLED & REFUNDED - ENTRY STRICTLY DENIED",
          type: "cancelled",
        });
      } else if (errData?.status === "ALREADY_USED") {
        setStatusMessage({
          text: "⚠️ TICKET ALREADY USED - DOUBLE ENTRY ATTEMPT REJECTED",
          type: "used",
        });
      } else {
        setStatusMessage({
          text: `❌ ${errData?.message || "INVALID TICKET - REFERENCE NOT FOUND"}`,
          type: "error",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#F5F5FA] min-h-screen text-[#222222] py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <span className="bg-red-50 border border-red-200 text-[#F84464] text-[10px] font-black px-3 py-1 rounded-full uppercase">
            🎟️ Gate Verification Portal
          </span>
          <h1 className="text-3xl font-extrabold text-[#222222] tracking-tight">
            Theater Entry Scanner
          </h1>
          <p className="text-xs text-gray-500">
            Scan customer QR pass or enter ticket booking ID to verify admission
          </p>
        </div>

        {/* Action Toggle Bar */}
        <div className="bg-white border border-gray-200 p-2 rounded-2xl flex justify-center gap-3 shadow-xs">
          <button
            onClick={() => setCameraActive(!cameraActive)}
            className={`flex-1 py-3 rounded-xl font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer ${
              cameraActive
                ? "bg-[#F84464] text-white shadow-xs"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <span>📷</span> {cameraActive ? "Stop Camera" : "Launch Camera Scanner"}
          </button>
        </div>

        {/* Camera Feed */}
        {cameraActive && (
          <div className="bg-white border border-red-200 p-4 rounded-2xl overflow-hidden shadow-sm text-center space-y-3">
            <div id="reader" className="w-full max-w-sm mx-auto rounded-xl overflow-hidden" />
            <p className="text-[11px] text-gray-500">Point device camera at customer ticket QR code</p>
          </div>
        )}

        {/* Manual Ticket ID Lookup */}
        <div className="bg-white border border-gray-200 p-6 rounded-2xl space-y-4 shadow-sm">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
            Manual Ticket ID Lookup
          </h3>
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Enter Reference (e.g. CB-2026-X89F2A) or Booking ID"
              value={inputTicketId}
              onChange={(e) => setInputTicketId(e.target.value)}
              className="flex-1 bg-[#F5F5FA] border border-gray-300 text-[#222222] rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-[#F84464] font-mono transition"
            />
            <button
              onClick={() => verifyTicketId()}
              disabled={loading}
              className="bg-[#F84464] hover:bg-[#E03252] text-white font-extrabold px-6 py-2.5 rounded-xl text-xs transition shadow-xs whitespace-nowrap cursor-pointer"
            >
              {loading ? "Checking..." : "Verify Entry"}
            </button>
          </div>
        </div>

        {/* Verification Status Alert Badge */}
        {statusMessage.text && (
          <div
            className={`p-4 rounded-xl border text-center font-extrabold text-xs uppercase tracking-wider shadow-xs animate-fadeIn ${
              statusMessage.type === "success"
                ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                : statusMessage.type === "used"
                ? "bg-amber-50 border-amber-300 text-amber-800"
                : "bg-red-50 border-red-300 text-[#F84464]"
            }`}
          >
            {statusMessage.text}
          </div>
        )}

        {/* Scanned Ticket Details Card */}
        {scannedTicket && (
          <div className="bg-white border border-gray-200 p-6 rounded-2xl space-y-4 shadow-sm">
            <div className="flex justify-between items-center pb-3 border-b border-gray-100">
              <span className="text-xs font-bold text-gray-500">Verified Ticket Details</span>
              <span className="text-xs font-mono font-bold text-gray-800 bg-gray-100 border border-gray-200 px-2 py-0.5 rounded-lg">
                Ref: {scannedTicket.bookingReference || scannedTicket._id}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-gray-400 block">Movie Title</span>
                <span className="font-bold text-[#222222] text-sm">{scannedTicket.showId?.movieId?.title || "Cinema Movie"}</span>
              </div>
              <div>
                <span className="text-gray-400 block">Theater</span>
                <span className="font-bold text-[#222222] text-sm">{scannedTicket.showId?.theatre}</span>
              </div>
              <div>
                <span className="text-gray-400 block">Date & Time</span>
                <span className="font-bold text-gray-700">{scannedTicket.showId?.date} • {scannedTicket.showId?.time}</span>
              </div>
              <div>
                <span className="text-gray-400 block">Reserved Seats</span>
                <span className="font-extrabold text-emerald-700 text-sm">{scannedTicket.seats?.join(", ")}</span>
              </div>
              <div>
                <span className="text-gray-400 block">Ticket Status</span>
                <span className={`font-black text-xs ${
                  scannedTicket.status === "CANCELLED"
                    ? "text-[#F84464]"
                    : scannedTicket.used || scannedTicket.status === "USED"
                    ? "text-amber-800"
                    : "text-emerald-700"
                }`}>
                  {scannedTicket.status === "CANCELLED" ? "⛔ CANCELLED & REFUNDED" : scannedTicket.used ? "ADMITTED (USED)" : "VALID"}
                </span>
              </div>
              <div>
                <span className="text-gray-400 block">Paid Amount</span>
                <span className="font-extrabold text-[#222222] text-sm">₹{scannedTicket.totalPrice}</span>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default Scanner;
