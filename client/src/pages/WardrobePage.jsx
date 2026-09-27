import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import clothingService from '../services/clothingService.js';
import ClothingCard from '../components/ClothingCard.jsx';
import ClothingDetailModal from '../components/ClothingDetailModal.jsx';
import AddEditClothingModal from '../components/AddEditClothingModal.jsx';
import DeleteConfirmModal from '../components/DeleteConfirmModal.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { CATEGORIES, STATUS_OPTIONS, SORT_OPTIONS } from '../utils/constants.js';
import { useToast } from '../context/ToastContext.jsx';
import {
  Search,
  Filter,
  SlidersHorizontal,
  Plus,
  Loader2,
  X,
  Sparkles,
} from 'lucide-react';

export function WardrobePage() {
  const outletContext = useOutletContext();
  const { success, error } = useToast();

  const [clothes, setClothes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter, Search, and Sort state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedSort, setSelectedSort] = useState('recently_added');

  // Modal states
  const [selectedItem, setSelectedItem] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [deletingItem, setDeletingItem] = useState(null);
  const [operating, setOperating] = useState(false);

  const fetchClothes = useCallback(async () => {
    try {
      setLoading(true);
      const res = await clothingService.getClothes({
        search: searchQuery,
        category: selectedCategory,
        status: selectedStatus,
        sort: selectedSort,
      });
      if (res.success && res.data) {
        setClothes(res.data);
      }
    } catch (err) {
      error('Failed to load wardrobe items.');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedCategory, selectedStatus, selectedSort, error]);

  // Fetch with debounced search query or on filter changes
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchClothes();
    }, 200);

    return () => clearTimeout(timer);
  }, [fetchClothes]);

  // Listen to global updates (e.g. from Add Clothing modal in layout)
  useEffect(() => {
    const handleUpdate = () => fetchClothes();
    window.addEventListener('wardrobe:updated', handleUpdate);
    return () => window.removeEventListener('wardrobe:updated', handleUpdate);
  }, [fetchClothes]);

  // Log Wear Action
  const handleWear = async (item) => {
    try {
      setOperating(true);
      const res = await clothingService.recordWear(item.clothing_id);
      success('Wear count updated');
      setSelectedItem(res.data);
      // Immediately update in-memory list
      setClothes((prev) =>
        prev.map((c) => (c.clothing_id === item.clothing_id ? res.data : c))
      );
    } catch (err) {
      error('Unable to update wear count.');
    } finally {
      setOperating(false);
    }
  };

  // Log Wash Action
  const handleWash = async (item) => {
    try {
      setOperating(true);
      const res = await clothingService.recordWash(item.clothing_id);
      success('Marked as washed');
      setSelectedItem(res.data);
      setClothes((prev) =>
        prev.map((c) => (c.clothing_id === item.clothing_id ? res.data : c))
      );
    } catch (err) {
      error('Unable to mark as washed.');
    } finally {
      setOperating(false);
    }
  };

  // Save Edit
  const handleEditSave = async (formData, id) => {
    try {
      setOperating(true);
      const res = await clothingService.updateClothing(id, formData);
      success('Clothing updated');
      setEditingItem(null);
      setSelectedItem(res.data);
      fetchClothes();
    } catch (err) {
      error(err.message || 'Unable to update clothing.');
      throw err;
    } finally {
      setOperating(false);
    }
  };

  // Delete Item
  const handleDeleteConfirm = async () => {
    if (!deletingItem) return;
    try {
      setOperating(true);
      await clothingService.deleteClothing(deletingItem.clothing_id);
      success('Clothing deleted');
      setDeletingItem(null);
      setSelectedItem(null);
      fetchClothes();
    } catch (err) {
      error('Unable to delete item.');
    } finally {
      setOperating(false);
    }
  };

  const handleCardClick = async (item) => {
    try {
      const res = await clothingService.getClothingById(item.clothing_id);
      setSelectedItem(res.data);
    } catch {
      setSelectedItem(item);
    }
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedStatus('All');
    setSelectedSort('recently_added');
  };

  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    selectedCategory !== 'All' ||
    selectedStatus !== 'All' ||
    selectedSort !== 'recently_added';

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto w-full space-y-6 animate-fade-in">
      {/* Title & Add Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-slate-900 tracking-tight">
            My Wardrobe
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {clothes.length} {clothes.length === 1 ? 'piece' : 'pieces'} in your curated collection
          </p>
        </div>

        <button
          onClick={() => outletContext?.onOpenAddModal?.()}
          className="px-5 py-2.5 rounded-2xl bg-slate-900 text-white text-sm font-medium hover:bg-black transition shadow-float active:scale-95 flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Clothing</span>
        </button>
      </div>

      {/* Search, Filter & Sort Controls */}
      <div className="space-y-4 bg-white p-4 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        {/* Top Row: Search input & Sort dropdown */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, category, color, or style (e.g. Black)..."
              className="w-full pl-10 pr-9 py-2.5 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm bg-slate-50/50"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-slate-500 shrink-0 hidden sm:block" />
            <select
              value={selectedSort}
              onChange={(e) => setSelectedSort(e.target.value)}
              className="px-3.5 py-2.5 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 text-xs sm:text-sm font-medium bg-slate-50/50 text-slate-800"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  Sort by: {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Second Row: Category Pills (Scrollable horizontally on mobile) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar pt-1">
          <button
            onClick={() => setSelectedCategory('All')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition ${
              selectedCategory === 'All'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Categories
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Third Row: Status Filter Pills */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-100 flex-wrap">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Status:
          </span>
          {STATUS_OPTIONS.map((statusOpt) => (
            <button
              key={statusOpt.id}
              onClick={() => setSelectedStatus(statusOpt.id)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-medium transition ${
                selectedStatus === statusOpt.id
                  ? 'bg-slate-800 text-white'
                  : 'bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              {statusOpt.dot && (
                <span className={`w-2 h-2 rounded-full ${statusOpt.dot}`} />
              )}
              <span>{statusOpt.label}</span>
            </button>
          ))}

          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="ml-auto text-xs text-slate-500 hover:text-slate-800 font-medium underline transition"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Clothing Grid */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center min-h-[40vh]">
          <div className="flex flex-col items-center gap-2 text-slate-500">
            <Loader2 className="w-8 h-8 animate-spin text-slate-800" />
            <span className="text-xs font-medium">Loading collection...</span>
          </div>
        </div>
      ) : clothes.length === 0 ? (
        <EmptyState
          type={hasActiveFilters ? 'filter' : 'wardrobe'}
          onAction={
            hasActiveFilters
              ? resetFilters
              : () => outletContext?.onOpenAddModal?.()
          }
        />
      ) : (
        /* Responsive Grid: 1-2 on mobile, 2-3 on tablet, 4-5 on desktop */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
          {clothes.map((item) => (
            <ClothingCard
              key={item.clothing_id}
              item={item}
              onClick={handleCardClick}
              onQuickWear={handleWear}
            />
          ))}
        </div>
      )}

      {/* Clothing Detail Modal / Drawer */}
      <ClothingDetailModal
        isOpen={Boolean(selectedItem)}
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
        onWear={handleWear}
        onWash={handleWash}
        onEdit={(item) => {
          setSelectedItem(null);
          setEditingItem(item);
        }}
        onDelete={(item) => {
          setDeletingItem(item);
        }}
        isOperating={operating}
      />

      {/* Edit Clothing Modal */}
      <AddEditClothingModal
        isOpen={Boolean(editingItem)}
        item={editingItem}
        onClose={() => setEditingItem(null)}
        onSave={handleEditSave}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(deletingItem)}
        itemName={deletingItem?.name}
        onClose={() => setDeletingItem(null)}
        onConfirm={handleDeleteConfirm}
        isDeleting={operating}
      />
    </div>
  );
}

export default WardrobePage;
