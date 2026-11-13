import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";

export default function Footer() {
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  // Home page has its own dedicated BookMyShow footer matching reference screenshot
  if (location.pathname === "/") {
    return null;
  }

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail("");
      setTimeout(() => setSubscribed(false), 5000);
    }
  };

  return (
    <footer className="bg-[#333545] text-gray-300 font-sans">
      
      {/* 🛎️ BookMyShow Top Customer Support Strip */}
      <div className="border-b border-gray-600/40 py-6 px-4 sm:px-8 bg-[#2F3140]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
          
          <div className="flex items-center justify-center md:justify-start gap-4">
            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-2xl text-[#F84464] shrink-0">
              🎧
            </div>
            <div>
              <h4 className="text-white font-bold text-xs uppercase tracking-wider">24/7 CUSTOMER CARE</h4>
              <p className="text-[11px] text-gray-400">Need help with bookings or tickets?</p>
            </div>
          </div>

          <div className="flex items-center justify-center md:justify-start gap-4">
            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-2xl text-[#F84464] shrink-0">
              🎟️
            </div>
            <div>
              <h4 className="text-white font-bold text-xs uppercase tracking-wider">RESEND CONFIRMATION</h4>
              <p className="text-[11px] text-gray-400">Instant SMS and Email ticket delivery</p>
            </div>
          </div>

          <div className="flex items-center justify-center md:justify-start gap-4">
            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-2xl text-[#F84464] shrink-0">
              📬
            </div>
            <div>
              <h4 className="text-white font-bold text-xs uppercase tracking-wider">NEWSLETTER SUBSCRIBE</h4>
              <p className="text-[11px] text-gray-400">Get early access & secret promo codes</p>
            </div>
          </div>

        </div>
      </div>

      {/* Main Directory Links */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          
          {/* Brand Info */}
          <div className="space-y-3">
            <Link to="/" className="flex items-center gap-2 text-white font-extrabold text-xl tracking-tight">
              <span className="w-8 h-8 rounded-lg bg-[#F84464] flex items-center justify-center text-white text-base">🎬</span>
              <span>Cine<span className="text-[#F84464]">Book</span></span>
            </Link>
            <p className="text-xs text-gray-400 leading-relaxed">
              India's leading entertainment ticketing destination. Book movie tickets, IMAX screenings, gourmet cinema snacks, and VIP experiences seamlessly.
            </p>
            <div className="flex gap-2.5 pt-2">
              {['Facebook', 'Twitter', 'Instagram', 'YouTube'].map((social, idx) => (
                <span
                  key={idx}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-[#F84464] text-white flex items-center justify-center text-xs transition cursor-pointer"
                  title={social}
                >
                  {social.charAt(0)}
                </span>
              ))}
            </div>
          </div>

          {/* Movies in Theatres */}
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-3">
              MOVIES NOW SHOWING
            </h4>
            <ul className="space-y-2 text-xs text-gray-400">
              <li><Link to="/movies" className="hover:text-white transition">Oppenheimer (IMAX 2D)</Link></li>
              <li><Link to="/movies" className="hover:text-white transition">Interstellar</Link></li>
              <li><Link to="/movies" className="hover:text-white transition">Dune: Part Two</Link></li>
              <li><Link to="/movies" className="hover:text-white transition">The Dark Knight</Link></li>
              <li><Link to="/movies" className="hover:text-white transition">Avatar: The Way of Water</Link></li>
            </ul>
          </div>

          {/* Cinemas & Formats */}
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-3">
              CINEMA EXPERIENCES
            </h4>
            <ul className="space-y-2 text-xs text-gray-400">
              <li><Link to="/movies" className="hover:text-white transition">IMAX Laser 3D</Link></li>
              <li><Link to="/movies" className="hover:text-white transition">4DX Dynamic Motion</Link></li>
              <li><Link to="/movies" className="hover:text-white transition">Dolby Atmos Sound</Link></li>
              <li><Link to="/loyalty" className="hover:text-white transition">CineClub VIP Recliner</Link></li>
              <li><Link to="/snacks" className="hover:text-white transition">CinePantry Gourmet F&B</Link></li>
            </ul>
          </div>

          {/* Newsletter Box */}
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-3">
              GET SPECIAL OFFERS
            </h4>
            <p className="text-xs text-gray-400 mb-3">
              Subscribe to unlock 15% off your first gourmet popcorn combo.
            </p>
            {subscribed ? (
              <div className="bg-emerald-900/60 border border-emerald-500 text-emerald-300 text-xs p-2.5 rounded-lg">
                ✓ Thank you for subscribing!
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-2">
                <input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/10 border border-gray-600 text-white rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#F84464]"
                />
                <button
                  type="submit"
                  className="w-full bg-[#F84464] hover:bg-[#E03252] text-white font-bold text-xs py-2 rounded-lg transition"
                >
                  Subscribe
                </button>
              </form>
            )}
          </div>

        </div>
      </div>

      {/* Copyright Bottom Bar */}
      <div className="bg-[#222433] py-5 px-6 border-t border-gray-700/40 text-center text-[11px] text-gray-400">
        <p>Copyright 2026 © CineBook Entertainment Pvt. Ltd. | Built by Lithish Kumar. All Rights Reserved.</p>
        <p className="mt-1 text-gray-500">The content and images used on this site are copyright protected and copyrights vests with the respective owners.</p>
      </div>

    </footer>
  );
}
