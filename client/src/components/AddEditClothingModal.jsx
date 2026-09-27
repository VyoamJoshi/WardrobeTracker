import React, { useState, useEffect, useRef } from 'react';
import { CATEGORIES, DEFAULT_THRESHOLDS } from '../utils/constants.js';
import { resolveImageUrl } from '../utils/formatters.js';
import { X, UploadCloud, Image as ImageIcon, Loader2 } from 'lucide-react';

export function AddEditClothingModal({ isOpen, onClose, onSave, item = null }) {
  const isEditing = Boolean(item);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: '',
    category: 'T-Shirts',
    color: '',
    style: '',
    material: '',
    wash_threshold: 2,
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Populate form if editing
  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name || '',
        category: item.category || 'T-Shirts',
        color: item.color || '',
        style: item.style || '',
        material: item.material || '',
        wash_threshold: item.wash_threshold || 2,
      });
      setImagePreview(item.image_url ? resolveImageUrl(item.image_url) : '');
      setImageFile(null);
    } else {
      setFormData({
        name: '',
        category: 'T-Shirts',
        color: '',
        style: '',
        material: '',
        wash_threshold: DEFAULT_THRESHOLDS['T-Shirts'] || 2,
      });
      setImagePreview('');
      setImageFile(null);
    }
    setErrorMsg('');
  }, [item, isOpen]);

  if (!isOpen) return null;

  const handleCategoryChange = (e) => {
    const newCategory = e.target.value;
    // Auto-update threshold only if user hasn't heavily customized or if adding new item
    const suggestedThreshold = DEFAULT_THRESHOLDS[newCategory] || 3;
    setFormData((prev) => ({
      ...prev,
      category: newCategory,
      wash_threshold: !isEditing ? suggestedThreshold : prev.wash_threshold,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setErrorMsg('The selected image exceeds 10MB limit.');
        return;
      }
      setImageFile(file);
      const objectUrl = URL.createObjectURL(file);
      setImagePreview(objectUrl);
      setErrorMsg('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setErrorMsg('Please enter a clothing name.');
      return;
    }
    if (!formData.category) {
      setErrorMsg('Please select a category.');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg('');

      const submissionData = new FormData();
      submissionData.append('name', formData.name.trim());
      submissionData.append('category', formData.category);
      submissionData.append('color', formData.color.trim());
      submissionData.append('style', formData.style.trim());
      submissionData.append('material', formData.material.trim());
      submissionData.append('wash_threshold', formData.wash_threshold);

      if (imageFile) {
        submissionData.append('image', imageFile);
      }

      await onSave(submissionData, item?.clothing_id);
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Unable to save clothing item. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs transition-opacity animate-fade-in overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-float p-6 sm:p-8 border border-slate-200/80 my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-serif font-bold text-slate-900">
              {isEditing ? 'Edit Clothing' : 'Add to Wardrobe'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {isEditing
                ? 'Update specifications or image for this piece'
                : 'Digitally register a new piece in your collection'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-medium text-rose-700">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Image Upload Area with live preview */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Clothing Photo
            </label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="relative aspect-video sm:aspect-[21/9] w-full rounded-2xl border-2 border-dashed border-slate-300 hover:border-slate-800 transition cursor-pointer overflow-hidden bg-slate-50 flex flex-col items-center justify-center group"
            >
              {imagePreview ? (
                <>
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover object-center"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-xs font-medium gap-2">
                    <UploadCloud className="w-4 h-4" />
                    <span>Change Photo</span>
                  </div>
                </>
              ) : (
                <div className="text-center p-4">
                  <div className="w-10 h-10 mx-auto rounded-full bg-slate-200/80 flex items-center justify-center text-slate-600 mb-2 group-hover:scale-110 transition">
                    <ImageIcon className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-medium text-slate-700 block">
                    Click to upload a picture
                  </span>
                  <span className="text-[11px] text-slate-400 block mt-0.5">
                    PNG, JPG, WEBP up to 10MB
                  </span>
                </div>
              )}
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
          </div>

          {/* Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Clothing Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Black Oversized T-Shirt"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm text-slate-900 bg-slate-50/50"
            />
          </div>

          {/* Category & Wash Threshold */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={handleCategoryChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm text-slate-900 bg-slate-50/50"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Wash Threshold (wears) *
              </label>
              <input
                type="number"
                min="1"
                max="100"
                required
                value={formData.wash_threshold}
                onChange={(e) =>
                  setFormData({ ...formData, wash_threshold: parseInt(e.target.value, 10) || 1 })
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm text-slate-900 bg-slate-50/50"
              />
            </div>
          </div>

          {/* Color & Style */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Color
              </label>
              <input
                type="text"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                placeholder="e.g. Black, Navy, Sand"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm text-slate-900 bg-slate-50/50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Style / Fit
              </label>
              <input
                type="text"
                value={formData.style}
                onChange={(e) => setFormData({ ...formData, style: e.target.value })}
                placeholder="e.g. Oversized, Slim, Relaxed"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm text-slate-900 bg-slate-50/50"
              />
            </div>
          </div>

          {/* Material */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Material / Fabric
            </label>
            <input
              type="text"
              value={formData.material}
              onChange={(e) => setFormData({ ...formData, material: e.target.value })}
              placeholder="e.g. 100% Organic Cotton, Raw Denim, Fleece"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm text-slate-900 bg-slate-50/50"
            />
          </div>

          {/* Actions */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl text-sm font-medium text-white bg-slate-900 hover:bg-black active:scale-98 transition shadow-xs flex items-center gap-2 disabled:opacity-50"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{isEditing ? 'Save Changes' : 'Add to Wardrobe'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddEditClothingModal;
