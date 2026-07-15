import React from 'react';
import { Shield, Sparkles, Mail, Phone, MapPin, ExternalLink, Globe } from 'lucide-react';

interface FooterProps {
  onViewChange: (view: string) => void;
}

export default function Footer({ onViewChange }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer id="app-footer" className="bg-slate-900 text-slate-300 border-t border-white/5 pt-16 pb-8 mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-white/5">
        
        {/* Brand Information */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white font-extrabold text-lg shadow-lg shadow-blue-200">
              V
            </div>
            <span className="font-display font-black text-xl tracking-tight text-white">
              VELO<span className="text-blue-500">SaaS</span>
            </span>
          </div>
          <p className="text-xs text-gray-400 leading-relaxed">
            The world's premium, fully-verified classified ads marketplace. Designed to trade high-end vehicles, luxury real estate, prime electronics, and high-quality services with absolute trust.
          </p>
          <div className="flex items-center space-x-3 pt-2">
            <span className="px-2.5 py-1 rounded bg-gray-800 text-[10px] font-bold text-blue-400 uppercase tracking-widest border border-gray-700">
              verified secure
            </span>
            <span className="px-2.5 py-1 rounded bg-gray-800 text-[10px] font-bold text-orange-400 uppercase tracking-widest border border-gray-700">
              95+ SEO RATED
            </span>
          </div>
        </div>

        {/* Categories Quick Links */}
        <div>
          <h4 className="font-display font-bold text-sm text-white uppercase tracking-wider mb-4">Popular Spheres</h4>
          <ul className="space-y-2 text-xs text-gray-400">
            <li><button onClick={() => onViewChange('home')} className="hover:text-blue-400 transition-colors">Vehicles & Supercars</button></li>
            <li><button onClick={() => onViewChange('home')} className="hover:text-blue-400 transition-colors">Premium Real Estate</button></li>
            <li><button onClick={() => onViewChange('home')} className="hover:text-blue-400 transition-colors">Phones & Audio Devices</button></li>
            <li><button onClick={() => onViewChange('home')} className="hover:text-blue-400 transition-colors">High-End Laptops</button></li>
            <li><button onClick={() => onViewChange('home')} className="hover:text-blue-400 transition-colors">Luxury Apparel & Watches</button></li>
          </ul>
        </div>

        {/* Resources / Sitemap */}
        <div>
          <h4 className="font-display font-bold text-sm text-white uppercase tracking-wider mb-4">Sitemap Index</h4>
          <ul className="space-y-2 text-xs text-gray-400">
            <li><button onClick={() => onViewChange('blogs')} className="hover:text-blue-400 transition-colors">SaaS Marketing Blog</button></li>
            <li><a href="/sitemap.xml" target="_blank" rel="noreferrer" className="hover:text-blue-400 transition-colors flex items-center space-x-1"><span>XML Sitemap</span><ExternalLink className="w-3 h-3" /></a></li>
            <li><a href="/robots.txt" target="_blank" rel="noreferrer" className="hover:text-blue-400 transition-colors flex items-center space-x-1"><span>Robots.txt</span><ExternalLink className="w-3 h-3" /></a></li>
            <li><button onClick={() => onViewChange('home')} className="hover:text-blue-400 transition-colors">Anti-Scam Measures</button></li>
            <li><button onClick={() => onViewChange('home')} className="hover:text-blue-400 transition-colors">Terms of Service</button></li>
          </ul>
        </div>

        {/* Secure Contact Desk */}
        <div className="space-y-4">
          <h4 className="font-display font-bold text-sm text-white uppercase tracking-wider mb-2">Velo Central Desk</h4>
          <div className="space-y-2.5 text-xs text-gray-400">
            <div className="flex items-center space-x-2">
              <Mail className="w-4 h-4 text-blue-500" />
              <span>companyexpertbacklink@gmail.com</span>
            </div>
            <div className="flex items-center space-x-2">
              <Phone className="w-4 h-4 text-blue-500" />
              <span>+92 329 3779295</span>
            </div>
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-blue-500" />
              <span>Manhattan Plaza, Floor 44, NY</span>
            </div>
          </div>
          <div className="p-3.5 bg-gray-950 rounded-xl border border-gray-800 flex items-start space-x-2">
            <Shield className="w-4.5 h-4.5 text-orange-400 shrink-0 mt-0.5" />
            <div className="text-[10px] leading-relaxed text-gray-500">
              <span className="font-bold text-gray-300 block mb-0.5">Note on Security</span>
              Do not transfer capital outside the secure checkout flow or share sensitive passwords. Flag unverified sellers immediately.
            </div>
          </div>
        </div>

      </div>

      {/* Copy & Status */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 flex flex-col md:flex-row items-center justify-between text-slate-400 text-[11px] font-semibold gap-4 border-t border-white/5">
        <div className="flex items-center gap-6">
          <span>&copy; {currentYear} VELOSaaS Classifieds. All Rights Reserved.</span>
          <div className="flex gap-4">
            <button onClick={() => onViewChange('home')} className="hover:text-white transition-colors">Terms</button>
            <button onClick={() => onViewChange('home')} className="hover:text-white transition-colors">Privacy Policy</button>
            <button onClick={() => onViewChange('home')} className="hover:text-white transition-colors">Ad Policy</button>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400"></div>
            <span>12,482 Active Listings</span>
          </div>
          <div className="h-4 w-[1px] bg-white/10"></div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-400"></div>
            <span>System Status: Online</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
