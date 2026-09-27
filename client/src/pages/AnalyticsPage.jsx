import React, { useState, useEffect, useCallback } from 'react';
import analyticsService from '../services/analyticsService.js';
import clothingService from '../services/clothingService.js';
import ClothingDetailModal from '../components/ClothingDetailModal.jsx';
import AddEditClothingModal from '../components/AddEditClothingModal.jsx';
import DeleteConfirmModal from '../components/DeleteConfirmModal.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { formatDate, formatRelativeDate, resolveImageUrl } from '../utils/formatters.js';
import {
  BarChart3,
  Shirt,
  Sparkles,
  RotateCcw,
  AlertCircle,
  TrendingUp,
  Clock,
  Award,
  Calendar,
  Layers,
  Loader2,
} from 'lucide-react';

export function AnalyticsPage() {
  const { success, error } = useToast();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    overview: {
      totalItems: 0,
      totalLifetimeWears: 0,
      totalWashes: 0,
      itemsRequiringWash: 0,
    },
    categoryDistribution: [],
    statusDistribution: [],
    mostWornItems: [],
    leastRecentlyWorn: [],
    mostWashedItems: [],
  });

  // Modal states
  const [selectedItem, setSelectedItem] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [deletingItem, setDeletingItem] = useState(null);
  const [operating, setOperating] = useState(false);

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      const res = await analyticsService.getAnalytics();
      if (res.success && res.data) {
        setData(res.data);
      }
    } catch (err) {
      error('Failed to load analytics data.');
    } finally {
      setLoading(false);
    }
  }, [error]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const handleWear = async (item) => {
    try {
      setOperating(true);
      const res = await clothingService.recordWear(item.clothing_id);
      success('Wear count updated');
      setSelectedItem(res.data);
      fetchAnalytics();
    } catch (err) {
      error('Failed to log wear.');
    } finally {
      setOperating(false);
    }
  };

  const handleWash = async (item) => {
    try {
      setOperating(true);
      const res = await clothingService.recordWash(item.clothing_id);
      success('Marked as washed');
      setSelectedItem(res.data);
      fetchAnalytics();
    } catch (err) {
      error('Failed to mark as washed.');
    } finally {
      setOperating(false);
    }
  };

  const handleEditSave = async (formData, id) => {
    try {
      setOperating(true);
      const res = await clothingService.updateClothing(id, formData);
      success('Clothing updated');
      setSelectedItem(res.data);
      fetchAnalytics();
    } catch (err) {
      error(err.message || 'Unable to update clothing.');
      throw err;
    } finally {
      setOperating(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingItem) return;
    try {
      setOperating(true);
      await clothingService.deleteClothing(deletingItem.clothing_id);
      success('Clothing deleted');
      setDeletingItem(null);
      setSelectedItem(null);
      fetchAnalytics();
    } catch (err) {
      error('Unable to delete item.');
    } finally {
      setOperating(false);
    }
  };

  const openDetail = async (item) => {
    try {
      const res = await clothingService.getClothingById(item.clothing_id);
      setSelectedItem(res.data);
    } catch {
      setSelectedItem(item);
    }
  };

  if (loading && !data.overview.totalItems) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-2 text-slate-500">
          <Loader2 className="w-8 h-8 animate-spin text-slate-800" />
          <span className="text-sm font-medium">Computing wardrobe metrics...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto w-full space-y-8 animate-fade-in">
      {/* Title */}
      <div>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-slate-900 tracking-tight">
          Wardrobe Analytics
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Insights on garment utilization, category balance, and wear longevity.
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Items */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs uppercase tracking-wider font-semibold text-slate-500">
              Total Clothing
            </span>
            <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-800">
              <Shirt className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-3xl sm:text-4xl font-bold text-slate-900 font-serif">
              {data.overview.totalItems}
            </span>
            <span className="block text-xs text-slate-400 mt-1">Unique garments</span>
          </div>
        </div>

        {/* Total Lifetime Wears */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs uppercase tracking-wider font-semibold text-indigo-600">
              Lifetime Wears
            </span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-3xl sm:text-4xl font-bold text-slate-900 font-serif">
              {data.overview.totalLifetimeWears}
            </span>
            <span className="block text-xs text-slate-400 mt-1">Outfits worn</span>
          </div>
        </div>

        {/* Total Washes */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs uppercase tracking-wider font-semibold text-emerald-600">
              Total Washes
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <RotateCcw className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-3xl sm:text-4xl font-bold text-slate-900 font-serif">
              {data.overview.totalWashes}
            </span>
            <span className="block text-xs text-slate-400 mt-1">Laundry cycles</span>
          </div>
        </div>

        {/* Items Requiring Washing */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs uppercase tracking-wider font-semibold text-rose-600">
              Needs Washing
            </span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-3xl sm:text-4xl font-bold text-rose-600 font-serif">
              {data.overview.itemsRequiringWash}
            </span>
            <span className="block text-xs text-slate-400 mt-1">At or over threshold</span>
          </div>
        </div>
      </div>

      {/* Category Distribution Section */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-serif font-bold text-slate-900">
              Category Distribution
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Breakdown of how your wardrobe is apportioned across types
            </p>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 text-slate-700">
            {data.categoryDistribution.length} Active Categories
          </span>
        </div>

        {data.categoryDistribution.length === 0 ? (
          <p className="text-xs text-slate-400 italic">No clothing categories to chart yet.</p>
        ) : (
          <div className="space-y-4">
            {data.categoryDistribution.map((cat) => (
              <div key={cat.category} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-medium">
                  <span className="text-slate-800 font-semibold">{cat.category}</span>
                  <div className="flex items-center gap-2 text-slate-500">
                    <span className="font-semibold text-slate-900">{cat.count} items</span>
                    <span>({cat.percentage}%)</span>
                  </div>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-slate-900 rounded-full transition-all duration-700"
                    style={{ width: `${cat.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3 Detail Columns: Most Worn, Least Recently Worn, Most Washed */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Most Worn Items */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-serif font-bold text-slate-900">
                  Most Worn Pieces
                </h3>
                <span className="text-[11px] text-slate-400">Highest lifetime wear count</span>
              </div>
            </div>

            <div className="space-y-3">
              {data.mostWornItems.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No wear data yet.</p>
              ) : (
                data.mostWornItems.map((item, index) => (
                  <div
                    key={item.clothing_id}
                    onClick={() => openDetail(item)}
                    className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-slate-50 transition cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-xs font-bold text-slate-400 w-4">
                        #{index + 1}
                      </span>
                      <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                        <img
                          src={resolveImageUrl(item.image_url)}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-semibold text-slate-900 truncate">
                          {item.name}
                        </h4>
                        <span className="text-[11px] text-slate-400 block">
                          {item.category}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-slate-900 px-2.5 py-1 rounded-full bg-slate-100 shrink-0">
                      {item.lifetime_wear_count} wears
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Least Recently Worn */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-serif font-bold text-slate-900">
                  Least Recently Worn
                </h3>
                <span className="text-[11px] text-slate-400">Garments neglected the longest</span>
              </div>
            </div>

            <div className="space-y-3">
              {data.leastRecentlyWorn.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No items yet.</p>
              ) : (
                data.leastRecentlyWorn.map((item) => (
                  <div
                    key={item.clothing_id}
                    onClick={() => openDetail(item)}
                    className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-slate-50 transition cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                        <img
                          src={resolveImageUrl(item.image_url)}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-semibold text-slate-900 truncate">
                          {item.name}
                        </h4>
                        <span className="text-[11px] text-slate-400 block">
                          {item.category}
                        </span>
                      </div>
                    </div>
                    <span className="text-[11px] font-medium text-slate-600 shrink-0">
                      {formatRelativeDate(item.last_worn)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Most Washed Items */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <RotateCcw className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-serif font-bold text-slate-900">
                  Most Washed Items
                </h3>
                <span className="text-[11px] text-slate-400">Garments with highest wash cycles</span>
              </div>
            </div>

            <div className="space-y-3">
              {data.mostWashedItems.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No wash records yet.</p>
              ) : (
                data.mostWashedItems.map((item, index) => (
                  <div
                    key={item.clothing_id}
                    onClick={() => openDetail(item)}
                    className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-slate-50 transition cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-xs font-bold text-slate-400 w-4">
                        #{index + 1}
                      </span>
                      <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                        <img
                          src={resolveImageUrl(item.image_url)}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-semibold text-slate-900 truncate">
                          {item.name}
                        </h4>
                        <span className="text-[11px] text-slate-400 block">
                          {item.category}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-emerald-700 px-2.5 py-1 rounded-full bg-emerald-50 shrink-0">
                      {item.wash_count} washes
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Item Detail Modal */}
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

      {/* Edit Modal */}
      <AddEditClothingModal
        isOpen={Boolean(editingItem)}
        item={editingItem}
        onClose={() => setEditingItem(null)}
        onSave={handleEditSave}
      />

      {/* Delete Modal */}
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

export default AnalyticsPage;
