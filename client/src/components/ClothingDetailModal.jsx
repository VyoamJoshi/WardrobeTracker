import React, { useState } from 'react';
import StatusBadge from './StatusBadge.jsx';
import { formatDate, formatShortDate, resolveImageUrl } from '../utils/formatters.js';
import {
  X,
  Plus,
  Sparkles,
  Edit2,
  Trash2,
  Calendar,
  Layers,
  Clock,
  RotateCcw,
  CheckCircle,
} from 'lucide-react';

export function ClothingDetailModal({
  item,
  isOpen,
  onClose,
  onWear,
  onWash,
  onEdit,
  onDelete,
  isOperating,
}) {
  const [activeTab, setActiveTab] = useState('history'); // 'history' | 'details'

  if (!isOpen || !item) return null;

  const imageUrl = resolveImageUrl(item.image_url);
  const wearHistory = item.wearHistory || [];
  const washHistory = item.washHistory || [];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-black/60 backdrop-blur-xs transition-opacity animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl bg-white rounded-3xl shadow-float overflow-hidden border border-slate-200/80 flex flex-col md:flex-row max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white/80 hover:bg-white text-slate-700 shadow-sm backdrop-blur-md transition active:scale-95"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left Column: Large Image */}
        <div className="relative w-full md:w-5/12 bg-slate-100 min-h-[260px] md:min-h-full shrink-0">
          <img
            src={imageUrl}
            alt={item.name}
            className="w-full h-full object-cover object-center max-h-[340px] md:max-h-full"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src =
                'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800&auto=format&fit=crop&q=80';
            }}
          />
          <div className="absolute top-4 left-4">
            <StatusBadge status={item.status} />
          </div>
        </div>

        {/* Right Column: Details & Actions */}
        <div className="flex-1 p-6 sm:p-8 flex flex-col justify-between overflow-y-auto">
          <div>
            {/* Category, Color, Style Subtitle */}
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              <span>{item.category}</span>
              {item.color && (
                <>
                  <span>•</span>
                  <span>{item.color}</span>
                </>
              )}
              {item.style && (
                <>
                  <span>•</span>
                  <span>{item.style}</span>
                </>
              )}
            </div>

            {/* Item Title */}
            <h2 className="text-2xl font-serif font-bold text-slate-900 tracking-tight mb-4">
              {item.name}
            </h2>

            {/* Status & Wear Metric Cards */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1">
                  Wear Status
                </span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-bold text-slate-900">
                    {item.current_wear_count}
                  </span>
                  <span className="text-sm font-medium text-slate-600">
                    / {item.wash_threshold} wears
                  </span>
                </div>
                {/* Progress bar */}
                <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      item.status === 'Wash Required'
                        ? 'bg-rose-500'
                        : item.status === 'Wash Soon'
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{
                      width: `${Math.min(
                        100,
                        (item.current_wear_count / (item.wash_threshold || 1)) * 100
                      )}%`,
                    }}
                  />
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1">
                  Lifetime Wears
                </span>
                <span className="text-2xl font-bold text-slate-900">
                  {item.lifetime_wear_count}
                </span>
                <span className="block text-[11px] text-slate-600 mt-1">
                  All-time usage
                </span>
              </div>
            </div>

            {/* Last Worn & Last Washed Dates */}
            <div className="space-y-2.5 text-xs text-slate-600 mb-6 pb-6 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-slate-600 font-medium">
                  <Calendar className="w-4 h-4 text-slate-500" />
                  Last Worn
                </span>
                <span className="font-semibold text-slate-900">
                  {formatDate(item.last_worn)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-slate-600 font-medium">
                  <RotateCcw className="w-4 h-4 text-slate-500" />
                  Last Washed
                </span>
                <span className="font-semibold text-slate-900">
                  {formatDate(item.last_washed)}
                </span>
              </div>
              {item.material && (
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-slate-600 font-medium">
                    <Layers className="w-4 h-4 text-slate-500" />
                    Material
                  </span>
                  <span className="font-semibold text-slate-900">
                    {item.material}
                  </span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <button
                disabled={isOperating}
                onClick={() => onWear(item)}
                className="py-3 px-4 rounded-xl bg-slate-900 text-white font-medium text-sm flex items-center justify-center gap-2 hover:bg-black active:scale-98 transition shadow-xs disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
                <span>I Wore This</span>
              </button>

              <button
                disabled={isOperating}
                onClick={() => onWash(item)}
                className="py-3 px-4 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200/80 font-medium text-sm flex items-center justify-center gap-2 hover:bg-emerald-100 active:scale-98 transition disabled:opacity-50"
              >
                <span>🧺</span>
                <span>Mark as Washed</span>
              </button>
            </div>

            {/* History Timelines */}
            <div className="space-y-4">
              <div className="flex border-b border-slate-100 text-xs font-semibold">
                <button
                  onClick={() => setActiveTab('history')}
                  className={`pb-2 px-1 border-b-2 transition ${
                    activeTab === 'history'
                      ? 'border-slate-900 text-slate-900'
                      : 'border-transparent text-slate-600 hover:text-slate-700'
                  }`}
                >
                  Activity History
                </button>
              </div>

              {activeTab === 'history' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-40 overflow-y-auto pr-1">
                  {/* Wear History */}
                  <div>
                    <h4 className="text-[11px] uppercase tracking-wider font-semibold text-slate-600 mb-2">
                      Wear History ({wearHistory.length})
                    </h4>
                    {wearHistory.length === 0 ? (
                      <p className="text-xs text-slate-600 italic">No wear logs recorded yet.</p>
                    ) : (
                      <ul className="space-y-1.5 text-xs text-slate-600">
                        {wearHistory.slice(0, 6).map((w, idx) => (
                          <li key={w.wear_id || idx} className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                            <span>{formatDate(w.worn_date)} — <strong className="text-slate-800 font-medium">Worn</strong></span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {/* Wash History */}
                  <div>
                    <h4 className="text-[11px] uppercase tracking-wider font-semibold text-slate-600 mb-2">
                      Wash History ({washHistory.length})
                    </h4>
                    {washHistory.length === 0 ? (
                      <p className="text-xs text-slate-600 italic">No washes logged yet.</p>
                    ) : (
                      <ul className="space-y-1.5 text-xs text-slate-600">
                        {washHistory.slice(0, 6).map((w, idx) => (
                          <li key={w.wash_id || idx} className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            <span>{formatDate(w.wash_date)} — <strong className="text-emerald-700 font-medium">Washed</strong></span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer Management Actions: Edit / Delete */}
          <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={() => onEdit(item)}
              className="text-xs font-medium text-slate-600 hover:text-slate-900 flex items-center gap-1.5 transition"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Edit Details</span>
            </button>

            <button
              onClick={() => onDelete(item)}
              className="text-xs font-medium text-rose-500 hover:text-rose-700 flex items-center gap-1.5 transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Item</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ClothingDetailModal;
