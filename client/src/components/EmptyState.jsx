import React from 'react';
import { Shirt, SearchX, Plus, RefreshCw } from 'lucide-react';

export function EmptyState({ type = 'wardrobe', onAction }) {
  if (type === 'filter') {
    return (
      <div className="py-16 px-4 text-center max-w-md mx-auto">
        <div className="w-16 h-16 mx-auto rounded-3xl bg-slate-100 flex items-center justify-center text-slate-500 mb-4">
          <SearchX className="w-8 h-8 stroke-[1.5]" />
        </div>
        <h3 className="text-xl font-serif font-bold text-slate-900 mb-1.5">
          No clothing found
        </h3>
        <p className="text-sm text-slate-500 mb-6">
          Try changing your search or adjusting your active filters.
        </p>
        {onAction && (
          <button
            onClick={onAction}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-100 transition active:scale-95 shadow-xs"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reset Filters</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="py-20 px-4 text-center max-w-md mx-auto animate-fade-in">
      <div className="w-20 h-20 mx-auto rounded-3xl bg-slate-100 flex items-center justify-center text-slate-800 mb-5 shadow-inner">
        <Shirt className="w-10 h-10 stroke-[1.5]" />
      </div>
      <h3 className="text-2xl font-serif font-bold text-slate-900 mb-2">
        Your wardrobe is empty
      </h3>
      <p className="text-sm text-slate-500 mb-8 leading-relaxed">
        Start building your digital wardrobe by adding your first clothing item.
      </p>
      {onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 text-white text-sm font-medium hover:bg-black transition shadow-float active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Clothing</span>
        </button>
      )}
    </div>
  );
}

export default EmptyState;
