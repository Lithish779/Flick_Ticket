import { useState } from "react";

export default function LoyaltyWallet() {
  const [points, setPoints] = useState(380);
  const [redeemedCode, setRedeemedCode] = useState(null);

  const rewardVouchers = [
    {
      id: 1,
      title: "🍿 Free Large Cheese Popcorn",
      cost: 150,
      code: "POPCORN-FREE150",
      desc: "Redeem for 1 tub of gourmet cheese popcorn at any theater pantry.",
      badge: "Snack Perk",
    },
    {
      id: 2,
      title: "🎟️ ₹100 Ticket Discount Voucher",
      cost: 200,
      code: "CINE100-POINT",
      desc: "Get ₹100 instant discount on any movie ticket checkout.",
      badge: "Ticket Pass",
    },
    {
      id: 3,
      title: "👑 Free VIP Recliner Upgrade",
      cost: 300,
      code: "VIP-UPGRADE300",
      desc: "Upgrade standard executive seats to plush VIP recliners.",
      badge: "Luxury Perk",
    },
  ];

  const handleRedeem = (voucher) => {
    if (points < voucher.cost) {
      alert(`You need ${voucher.cost - points} more CinePoints to unlock this perk.`);
      return;
    }

    setPoints(points - voucher.cost);
    setRedeemedCode({
      title: voucher.title,
      code: voucher.code,
    });
  };

  return (
    <div className="bg-[#F5F5FA] min-h-screen text-[#222222] py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Top Header Card */}
        <div className="bg-white border border-gray-200 p-8 rounded-3xl shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <span className="bg-red-50 border border-red-200 text-[#F84464] text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
              👑 CineClub Member Tier
            </span>
            <h1 className="text-3xl md:text-4xl font-extrabold text-[#222222] tracking-tight">
              CinePoints Rewards Wallet
            </h1>
            <p className="text-xs text-gray-500">
              Earn 10 CinePoints for every ₹100 spent on movie tickets and snacks
            </p>
          </div>

          {/* Points Balance Badge */}
          <div className="bg-[#F5F5FA] border border-gray-200 p-6 rounded-2xl text-center min-w-[200px] shadow-2xs">
            <span className="text-[10px] text-gray-500 uppercase font-black tracking-widest block">
              Available Balance
            </span>
            <span className="text-4xl font-black text-[#F84464] tracking-tight">
              {points} <span className="text-sm font-normal text-gray-600">pts</span>
            </span>
          </div>
        </div>

        {/* Redeem Rewards Section */}
        <div className="space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500">
            Available Reward Vouchers
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {rewardVouchers.map((v) => {
              const canAfford = points >= v.cost;

              return (
                <div
                  key={v.id}
                  className="bg-white border border-gray-200 p-6 rounded-2xl shadow-xs space-y-4 flex flex-col justify-between hover:border-gray-300 transition"
                >
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-red-50 text-[#F84464] border border-red-200">
                        {v.badge}
                      </span>
                      <span className="text-xs font-extrabold text-gray-700 font-mono">
                        {v.cost} PTS
                      </span>
                    </div>

                    <h3 className="font-extrabold text-base text-[#222222]">{v.title}</h3>
                    <p className="text-xs text-gray-500 leading-relaxed">{v.desc}</p>
                  </div>

                  <button
                    onClick={() => handleRedeem(v)}
                    disabled={!canAfford}
                    className={`w-full font-bold py-2.5 rounded-xl text-xs transition shadow-2xs cursor-pointer ${
                      canAfford
                        ? "bg-[#F84464] hover:bg-[#E03252] text-white"
                        : "bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed"
                    }`}
                  >
                    {canAfford ? "🎁 Redeem Reward Code" : `Need ${v.cost - points} More Pts`}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Redeemed Voucher Alert Modal */}
        {redeemedCode && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
            <div className="bg-white border border-gray-200 p-8 rounded-3xl text-center space-y-5 max-w-sm w-full shadow-2xl text-[#222222]">
              <div className="w-14 h-14 bg-amber-50 border border-amber-200 rounded-full flex items-center justify-center text-3xl mx-auto">
                🎉
              </div>

              <div className="space-y-1">
                <h3 className="text-base font-extrabold text-[#222222]">{redeemedCode.title}</h3>
                <p className="text-xs text-gray-500">Use this voucher promo code at checkout</p>
              </div>

              <div className="bg-[#F5F5FA] border border-gray-200 p-4 rounded-xl font-mono text-[#F84464] font-black text-lg tracking-wider">
                {redeemedCode.code}
              </div>

              <button
                onClick={() => setRedeemedCode(null)}
                className="w-full bg-[#F84464] hover:bg-[#E03252] text-white font-bold py-2.5 rounded-xl text-xs transition cursor-pointer"
              >
                Got It
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
