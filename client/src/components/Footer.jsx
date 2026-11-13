import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import FlickLogo from "./FlickLogo";

export default function Footer() {
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  // Home page has its own dedicated light cinematic footer
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
    <footer className="bg-white text-slate-600 font-sans border-t border-slate-200/80">
      
      {/* Top Customer Amenities Strip */}
      <div className="border-b border-slate-200/80 py-8 px-4 sm:px-8 bg-slate-50/80">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
          
          <div className="flex items-center justify-center md:justify-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center text-2xl text-[#F84464] shrink-0 shadow-2xs">
              🎧
            </div>
            <div>
              <h4 className="text-slate-900 font-extrabold text-xs uppercase tracking-wider">
                24/7 Concierge Support
              </h4>
              <p className="text-[11px] text-slate-500">
                Instant assistance with tickets, seat reservations & refunds
              </p>
            </div>
          </div>

          <div className="flex items-center justify-center md:justify-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center text-2xl text-[#F84464] shrink-0 shadow-2xs">
              🎟️
            </div>
            <div>
              <h4 className="text-slate-900 font-extrabold text-xs uppercase tracking-wider">
                Instant Digital QR Pass
              </h4>
              <p className="text-[11px] text-slate-500">
                Direct SMS and WhatsApp delivery for gate scan
              </p>
            </div>
          </div>

          <div className="flex items-center justify-center md:justify-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center text-2xl text-[#F84464] shrink-0 shadow-2xs">
              📬
            </div>
            <div>
              <h4 className="text-slate-900 font-extrabold text-xs uppercase tracking-wider">
                Premiere Invites & Deals
              </h4>
              <p className="text-[11px] text-slate-500">
                Early bird access to IMAX premieres & snack combos
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* Main Directory Links */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          
          {/* Brand Info */}
          <div className="space-y-3">
            <Link to="/" className="inline-block">
              <FlickLogo light={true} size="md" />
            </Link>
            <p className="text-xs text-slate-500 leading-relaxed">
              India's premier digital cinema ticketing destination. Book IMAX Laser screenings, gourmet cinema treats, and premium recliner reservations seamlessly.
            </p>
            <div className="flex gap-2.5 pt-2">
              {['Facebook', 'Twitter', 'Instagram', 'YouTube'].map((social, idx) => (
                <span
                  key={idx}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-[#F84464] hover:text-white text-slate-600 flex items-center justify-center text-xs transition cursor-pointer shadow-2xs"
                  title={social}
                >
                  {social.charAt(0)}
                </span>
              ))}
            </div>
          </div>

          {/* Movies in Theatres */}
          <div>
            <h4 className="text-slate-900 font-extrabold text-xs uppercase tracking-wider mb-3">
              MOVIES NOW SHOWING
            </h4>
            <ul className="space-y-2 text-xs text-slate-500">
              <li><Link to="/movies" className="hover:text-[#F84464] transition">Dune: Part Two (IMAX 3D)</Link></li>
              <li><Link to="/movies" className="hover:text-[#F84464] transition">Ramayana: Part One</Link></li>
              <li><Link to="/movies" className="hover:text-[#F84464] transition">Oppenheimer 70mm</Link></li>
              <li><Link to="/movies" className="hover:text-[#F84464] transition">Interstellar 10th Anniversary</Link></li>
              <li><Link to="/movies" className="hover:text-[#F84464] transition">Avatar: The Way of Water</Link></li>
            </ul>
          </div>

          {/* Cinemas & Formats */}
          <div>
            <h4 className="text-slate-900 font-extrabold text-xs uppercase tracking-wider mb-3">
              CINEMA EXPERIENCES
            </h4>
            <ul className="space-y-2 text-xs text-slate-500">
              <li><Link to="/movies" className="hover:text-[#F84464] transition">IMAX Laser 3D</Link></li>
              <li><Link to="/movies" className="hover:text-[#F84464] transition">4DX Dynamic Motion</Link></li>
              <li><Link to="/movies" className="hover:text-[#F84464] transition">Dolby Atmos 64-Ch</Link></li>
              <li><Link to="/loyalty" className="hover:text-[#F84464] transition">FlickClub VIP Recliner</Link></li>
              <li><Link to="/snacks" className="hover:text-[#F84464] transition">FlickPantry Gourmet F&B</Link></li>
            </ul>
          </div>

          {/* Newsletter Box */}
          <div>
            <h4 className="text-slate-900 font-extrabold text-xs uppercase tracking-wider mb-3">
              EXCLUSIVE OFFERS
            </h4>
            <p className="text-xs text-slate-500 mb-3 leading-relaxed">
              Subscribe to unlock 15% off your first gourmet caramel popcorn combo.
            </p>
            {subscribed ? (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs p-3 rounded-xl">
                ✓ Thank you for subscribing! Check your inbox for your 15% promo code.
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-2">
                <input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#F84464]"
                />
                <button
                  type="submit"
                  className="w-full bg-[#F84464] hover:bg-[#E03252] text-white font-bold text-xs py-2 rounded-xl transition shadow-2xs"
                >
                  Subscribe
                </button>
              </form>
            )}
          </div>

        </div>
      </div>

      {/* Copyright Bottom Bar */}
      <div className="bg-slate-50 py-5 px-6 border-t border-slate-200 text-center text-[11px] text-slate-500">
        <p>Copyright 2026 © FlickTicket Entertainment Pvt. Ltd. | Built by <strong>Lithish Kumar</strong>. All Rights Reserved.</p>
        <p className="mt-1 text-slate-400">The content and images used on this site are copyright protected and copyrights vest with their respective owners.</p>
      </div>

    </footer>
  );
}
