import React from 'react';
import StatusBadge from './StatusBadge.jsx';
import { resolveImageUrl } from '../utils/formatters.js';
import { Shirt, Sparkles, Plus } from 'lucide-react';

export function ClothingCard({ item, onClick, onQuickWear }) {
  const imageUrl = resolveImageUrl(item.image_url);

  return (
    <div
      onClick={() => onClick(item)}
      className="group relative bg-white rounded-2xl overflow-hidden border border-slate-200/80 shadow-xs hover:shadow-float hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col"
    >
      {/* Image Container with aspect ratio */}
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-slate-100">
        <img
          src={imageUrl}
          alt={item.name}
          loading="lazy"
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src =
              'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800&auto=format&fit=crop&q=80';
          }}
        />

        {/* Gradient Overlay for contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
          <StatusBadge status={item.status} size="sm" />
          {item.style && (
            <span className="hidden sm:inline-block text-[11px] font-medium tracking-wide uppercase px-2.5 py-0.5 rounded-full bg-white/90 backdrop-blur-md text-slate-700 shadow-xs">
              {item.style}
            </span>
          )}
        </div>

        {/* Quick Wear Floating Button */}
        {onQuickWear && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onQuickWear(item);
            }}
            title="Log wear today"
            className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 px-3 py-1.5 rounded-xl bg-slate-900/95 text-white text-xs font-medium flex items-center gap-1.5 shadow-float hover:bg-black active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Wore</span>
          </button>
        )}
      </div>

      {/* Card Details */}
      <div className="p-4 flex flex-col flex-1 justify-between gap-2">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-600">
            {item.category} {item.color ? `• ${item.color}` : ''}
          </span>
          <h3 className="font-semibold text-slate-900 text-sm sm:text-base leading-snug line-clamp-1 group-hover:text-slate-700 transition">
            {item.name}
          </h3>
        </div>

        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span className="font-medium text-slate-800">
            {item.current_wear_count} / {item.wash_threshold} wears
          </span>
          <span className="text-slate-600 text-[11px]">
            {item.lifetime_wear_count} lifetime
          </span>
        </div>
      </div>
    </div>
  );
}

export default ClothingCard;
