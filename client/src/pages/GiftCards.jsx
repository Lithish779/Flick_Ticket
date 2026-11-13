import { useState } from "react";

export default function GiftCards() {
  const [selectedTheme, setSelectedTheme] = useState("classic");
  const [amount, setAmount] = useState(500);
  const [customAmount, setCustomAmount] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [message, setMessage] = useState("");
  const [generatedVoucher, setGeneratedVoucher] = useState(null);

  const cardThemes = [
    {
      id: "classic",
      name: "CineBook Red",
      bg: "bg-gradient-to-r from-[#F84464] to-[#c72844] border-red-400 text-white",
      badge: "🎬 CineBook Official",
    },
    {
      id: "gold",
      name: "VIP Gold",
      bg: "bg-gradient-to-r from-amber-600 to-amber-800 border-amber-400 text-white",
      badge: "👑 VIP Experience",
    },
    {
      id: "birthday",
      name: "Celebration",
      bg: "bg-gradient-to-r from-purple-700 to-indigo-800 border-purple-400 text-white",
      badge: "🎉 Birthday Special",
    },
  ];

  const handlePurchase = (e) => {
    e.preventDefault();
    const finalAmount = customAmount ? Number(customAmount) : amount;
    if (!finalAmount || finalAmount < 100) {
      alert("Minimum gift card value is ₹100");
      return;
    }
    if (!recipientEmail) {
      alert("Please enter recipient email");
      return;
    }

    const code = "CINEGIFT-" + Math.random().toString(36).substring(2, 8).toUpperCase();
    setGeneratedVoucher({
      code,
      amount: finalAmount,
      recipientName: recipientName || "Movie Lover",
      recipientEmail,
      theme: cardThemes.find((t) => t.id === selectedTheme),
    });
  };

  return (
    <div className="bg-[#F5F5FA] min-h-screen text-[#222222] py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <span className="bg-red-50 border border-red-200 text-[#F84464] text-[10px] font-black px-3 py-1 rounded-full uppercase">
            🎁 Gift Movies & Experiences
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold text-[#222222] tracking-tight">
            CineBook Gift Cards
          </h1>
          <p className="text-xs md:text-sm text-gray-500">
            Send digital movie passes & snack vouchers instantly to friends and family
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          
          {/* Card Preview & Selection */}
          <div className="space-y-5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500">
              1. Choose Gift Card Theme
            </h2>

            {/* Live Visual Card Preview */}
            <div
              className={`p-8 rounded-3xl border shadow-md space-y-8 relative overflow-hidden transition-all duration-300 ${
                cardThemes.find((t) => t.id === selectedTheme)?.bg
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full bg-black/20 text-white backdrop-blur-xs">
                    {cardThemes.find((t) => t.id === selectedTheme)?.badge}
                  </span>
                  <h3 className="text-2xl font-black text-white mt-3">CineBook Pass</h3>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-white/80 block uppercase font-bold">Gift Value</span>
                  <span className="text-2xl font-black text-white">
                    ₹{customAmount ? customAmount : amount}
                  </span>
                </div>
              </div>

              <div className="pt-8 border-t border-white/20 flex justify-between items-end text-xs">
                <div>
                  <span className="text-[10px] text-white/80 block uppercase font-bold">To Recipient</span>
                  <span className="font-bold text-white text-sm">
                    {recipientName || "Friend / Family"}
                  </span>
                </div>
                <div className="font-mono text-white font-bold bg-black/20 px-2 py-0.5 rounded">●●●● CODE READY</div>
              </div>
            </div>

            {/* Theme Picker */}
            <div className="grid grid-cols-3 gap-3">
              {cardThemes.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => setSelectedTheme(theme.id)}
                  className={`p-3 rounded-xl border text-xs font-bold text-center transition cursor-pointer ${
                    selectedTheme === theme.id
                      ? "border-[#F84464] bg-red-50 text-[#F84464] shadow-xs"
                      : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                  }`}
                >
                  {theme.name}
                </button>
              ))}
            </div>
          </div>

          {/* Details & Purchase Form */}
          <div className="bg-white border border-gray-200 p-6 md:p-8 rounded-2xl shadow-sm space-y-5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500">
              2. Enter Gift Amount & Details
            </h2>

            <form onSubmit={handlePurchase} className="space-y-4">
              
              {/* Preset Amounts */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
                  Select Amount (₹)
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[250, 500, 1000, 2000].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => {
                        setAmount(val);
                        setCustomAmount("");
                      }}
                      className={`py-2 rounded-xl border text-xs font-bold transition cursor-pointer ${
                        amount === val && !customAmount
                          ? "bg-[#F84464] border-[#F84464] text-white shadow-xs"
                          : "bg-[#F5F5FA] border-gray-200 text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      ₹{val}
                    </button>
                  ))}
                </div>
              </div>

              {/* Recipient Details */}
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Recipient Name"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  className="w-full bg-[#F5F5FA] border border-gray-300 rounded-xl p-2.5 text-xs text-[#222222] placeholder-gray-400 focus:outline-none focus:border-[#F84464] focus:bg-white transition"
                />

                <input
                  type="email"
                  placeholder="Recipient Email Address *"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  required
                  className="w-full bg-[#F5F5FA] border border-gray-300 rounded-xl p-2.5 text-xs text-[#222222] placeholder-gray-400 focus:outline-none focus:border-[#F84464] focus:bg-white transition"
                />

                <textarea
                  rows="2"
                  placeholder="Personal Gift Message (Optional)..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full bg-[#F5F5FA] border border-gray-300 rounded-xl p-2.5 text-xs text-[#222222] placeholder-gray-400 focus:outline-none focus:border-[#F84464] focus:bg-white transition"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#F84464] hover:bg-[#E03252] text-white font-extrabold py-3.5 rounded-xl text-xs transition shadow-xs uppercase tracking-wider cursor-pointer"
              >
                🎁 Purchase Gift Pass Now
              </button>
            </form>
          </div>

        </div>

        {/* Voucher Delivery Modal */}
        {generatedVoucher && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
            <div className="bg-white border border-gray-200 p-8 rounded-3xl text-center space-y-5 max-w-md w-full shadow-2xl relative text-[#222222]">
              <div className="w-14 h-14 bg-emerald-50 border border-emerald-200 rounded-full flex items-center justify-center text-3xl mx-auto">
                🎁
              </div>

              <div className="space-y-1">
                <h3 className="text-xl font-extrabold text-[#222222]">Gift Pass Generated!</h3>
                <p className="text-xs text-gray-500">
                  Sent to <strong className="text-[#222222]">{generatedVoucher.recipientEmail}</strong>
                </p>
              </div>

              <div className="bg-[#F5F5FA] border border-gray-200 p-4 rounded-xl font-mono text-center space-y-1">
                <span className="text-[10px] text-gray-500 uppercase font-bold block">Redeemable Gift Code</span>
                <span className="text-xl font-black text-[#F84464] tracking-wider">
                  {generatedVoucher.code}
                </span>
                <span className="text-xs text-gray-600 block pt-1 font-sans">
                  Value: <strong>₹{generatedVoucher.amount}</strong>
                </span>
              </div>

              <button
                onClick={() => setGeneratedVoucher(null)}
                className="w-full bg-[#F84464] hover:bg-[#E03252] text-white font-bold py-2.5 rounded-xl text-xs transition cursor-pointer"
              >
                Close & Return
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
