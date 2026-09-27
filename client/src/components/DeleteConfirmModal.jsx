import React from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';

export function DeleteConfirmModal({ isOpen, onClose, onConfirm, itemName, isDeleting }) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs transition-opacity animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white rounded-3xl shadow-float p-6 sm:p-7 border border-slate-200/80"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
          <AlertTriangle className="w-6 h-6" />
        </div>

        <h3 className="text-lg font-serif font-bold text-slate-900 mb-2">
          Remove from Wardrobe?
        </h3>
        <p className="text-sm text-slate-600 mb-6 leading-relaxed">
          Are you sure you want to remove <strong className="text-slate-900 font-semibold">{itemName || 'this item'}</strong> from your wardrobe? All associated wear and wash logs will be permanently deleted.
        </p>

        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            disabled={isDeleting}
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isDeleting}
            onClick={onConfirm}
            className="px-5 py-2.5 rounded-xl text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 active:scale-98 transition shadow-xs flex items-center gap-2 disabled:opacity-50"
          >
            {isDeleting && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>Delete</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeleteConfirmModal;
