import React from 'react';
import { Heart, Eye, ArrowUpRight, ShieldCheck, MapPin, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { Ad } from '../types';

interface AdCardProps {
  key?: React.Key;
  ad: Ad;
  isFavorited: boolean;
  onToggleFavorite: (adId: string) => void | Promise<void>;
  onAdClick: (adId: string) => void;
}

export default function AdCard({ 
  ad, 
  isFavorited, 
  onToggleFavorite, 
  onAdClick 
}: AdCardProps) {
  // Check if ad has a premium/paid boost package
  const isPaidPremium = ['Featured', 'Premium', 'Highlight', 'Top'].includes(ad.packageType);

  const getPackageBadgeColor = (pkg: string) => {
    switch (pkg) {
      case 'Premium': return 'bg-gradient-to-r from-amber-500 to-orange-500 text-white';
      case 'Featured': return 'bg-blue-600 text-white';
      case 'Top': return 'bg-purple-600 text-white';
      case 'Highlight': return 'bg-emerald-600 text-white';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getConditionColor = (cond: string) => {
    switch (cond) {
      case 'New': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Like New': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Excellent': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.25, cubicBezier: [0.16, 1, 0.3, 1] }}
      className={`relative flex flex-col h-full rounded-2xl bg-white border overflow-hidden cursor-pointer select-none group transition-all duration-300 ${isPaidPremium ? 'border-orange-200 shadow-md shadow-orange-500/5 hover:border-orange-400' : 'border-gray-150 hover:border-gray-300 hover:shadow-lg hover:shadow-gray-100'}`}
    >
      {/* Premium glowing indicators */}
      {ad.packageType === 'Premium' && (
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500" />
      )}

      {/* Image Gallery Slot */}
      <div className="relative aspect-[4/3] bg-gray-50 overflow-hidden" onClick={() => onAdClick(ad.id)}>
        <img 
          src={ad.images[0]} 
          alt={ad.title} 
          className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
          loading="lazy"
        />

        {/* Favorite Heart Toggle */}
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(ad.id);
          }}
          className="absolute top-3.5 right-3.5 z-10 p-2.5 rounded-full backdrop-blur-md bg-white/80 hover:bg-white text-gray-600 hover:text-red-500 transition-all active:scale-90 shadow-sm"
          title="Add to wishlist"
        >
          <Heart className={`w-4.5 h-4.5 transition-colors ${isFavorited ? 'fill-red-500 text-red-500' : ''}`} />
        </button>

        {/* Dynamic Package Badges */}
        <div className="absolute bottom-3.5 left-3.5 flex flex-wrap gap-1.5">
          {isPaidPremium && (
            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-widest flex items-center space-x-1 shadow-sm ${getPackageBadgeColor(ad.packageType)}`}>
              <Sparkles className="w-3 h-3 text-white animate-spin-slow" />
              <span>{ad.packageType}</span>
            </span>
          )}
          
          <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border ${getConditionColor(ad.condition)}`}>
            {ad.condition}
          </span>
        </div>
      </div>

      {/* Body specifications */}
      <div className="flex flex-col flex-grow p-4.5" onClick={() => onAdClick(ad.id)}>
        
        {/* Category path & Location info */}
        <div className="flex items-center justify-between text-[11px] text-gray-400 font-medium mb-1.5">
          <span className="uppercase tracking-wider font-semibold text-blue-600">{ad.subcategory}</span>
          <div className="flex items-center space-x-1">
            <MapPin className="w-3.5 h-3.5 text-gray-400" />
            <span className="line-clamp-1">{ad.city}</span>
          </div>
        </div>

        {/* Title */}
        <h3 className="font-display font-extrabold text-base text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug mb-2.5">
          {ad.title}
        </h3>

        {/* Tags Row */}
        {ad.tags && ad.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {ad.tags.slice(0, 3).map((tag, idx) => (
              <span key={idx} className="text-[9px] font-mono font-semibold px-2 py-0.5 bg-gray-50 text-gray-500 rounded-md">
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Footer info: price & views stat */}
        <div className="mt-auto pt-3 border-t border-gray-100 flex items-center justify-between">
          <div>
            <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">Asking Capital</span>
            <span className="font-display font-extrabold text-lg text-gray-900">
              {ad.price.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })}
            </span>
          </div>
          
          <div className="flex items-center space-x-1.5 text-gray-400 text-[11px] font-mono font-medium">
            <Eye className="w-3.5 h-3.5" />
            <span>{ad.views}</span>
          </div>
        </div>

      </div>
    </motion.div>
  );
}
