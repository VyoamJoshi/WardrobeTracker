import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import dashboardService from '../services/dashboardService.js';
import clothingService from '../services/clothingService.js';
import StatusBadge from '../components/StatusBadge.jsx';
import ClothingDetailModal from '../components/ClothingDetailModal.jsx';
import AddEditClothingModal from '../components/AddEditClothingModal.jsx';
import DeleteConfirmModal from '../components/DeleteConfirmModal.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { getGreeting, formatRelativeDate, resolveImageUrl } from '../utils/formatters.js';
import {
  Shirt,
  Sparkles,
  AlertCircle,
  Clock,
  ArrowRight,
  Plus,
  RotateCcw,
  CheckCircle2,
  Calendar,
  Layers,
  ChevronRight,
  Loader2,
} from 'lucide-react';

export function DashboardPage() {
  const navigate = useNavigate();
  const outletContext = useOutletContext();
  const { success, error } = useToast();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    stats: { totalItems: 0, cleanCount: 0, washSoonCount: 0, washRequiredCount: 0 },
    laundryReminders: [],
    recentlyWorn: [],
    recentlyWashed: [],
  });

  // Modal states
  const [selectedItem, setSelectedItem] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [deletingItem, setDeletingItem] = useState(null);
  const [operating, setOperating] = useState(false);

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      const res = await dashboardService.getDashboard();
      if (res.success && res.data) {
        setData(res.data);
      }
    } catch (err) {
      error('Unable to load dashboard data. Please refresh.');
    } finally {
      setLoading(false);
    }
  }, [error]);

  useEffect(() => {
    fetchDashboard();

    const handleUpdate = () => fetchDashboard();
    window.addEventListener('wardrobe:updated', handleUpdate);
    return () => window.removeEventListener('wardrobe:updated', handleUpdate);
  }, [fetchDashboard]);

  // Handle Wear Action
  const handleWear = async (item) => {
    try {
      setOperating(true);
      const res = await clothingService.recordWear(item.clothing_id);
      success('Wear count updated');
      setSelectedItem(res.data);
      fetchDashboard();
    } catch (err) {
      error('Failed to log wear. Please try again.');
    } finally {
      setOperating(false);
    }
  };

  // Handle Wash Action
  const handleWash = async (item) => {
    try {
      setOperating(true);
      const res = await clothingService.recordWash(item.clothing_id);
      success('Marked as washed');
      setSelectedItem(res.data);
      fetchDashboard();
    } catch (err) {
      error('Failed to mark as washed.');
    } finally {
      setOperating(false);
    }
  };

  // Handle Edit Action
  const handleEditSave = async (formData, id) => {
    try {
      setOperating(true);
      const res = await clothingService.updateClothing(id, formData);
      success('Clothing updated');
      setSelectedItem(res.data);
      fetchDashboard();
    } catch (err) {
      error(err.message || 'Unable to update item.');
      throw err;
    } finally {
      setOperating(false);
    }
  };

  // Handle Delete Action
  const handleDeleteConfirm = async () => {
    if (!deletingItem) return;
    try {
      setOperating(true);
      await clothingService.deleteClothing(deletingItem.clothing_id);
      success('Clothing deleted');
      setDeletingItem(null);
      setSelectedItem(null);
      fetchDashboard();
    } catch (err) {
      error('Unable to delete clothing.');
    } finally {
      setOperating(false);
    }
  };

  const openItemDetail = async (item) => {
    try {
      const res = await clothingService.getClothingById(item.clothing_id);
      setSelectedItem(res.data);
    } catch {
      setSelectedItem(item);
    }
  };

  if (loading && !data.stats.totalItems) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <Loader2 className="w-8 h-8 animate-spin text-slate-800" />
          <span className="text-sm font-medium">Curating your wardrobe...</span>
        </div>
      </div>
    );
  }

  const greeting = getGreeting();

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto w-full space-y-8 animate-fade-in">
      {/* Header & Subtitle */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-slate-900 tracking-tight">
            {greeting} 👋
          </h1>
          <p className="text-sm sm:text-base text-slate-500 mt-1 font-normal">
            Here's what's happening with your wardrobe today.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => outletContext?.onOpenAddModal?.()}
            className="px-5 py-2.5 rounded-2xl bg-slate-900 text-white text-sm font-medium hover:bg-black transition shadow-float active:scale-95 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Clothing</span>
          </button>
          <button
            onClick={() => navigate('/wardrobe')}
            className="px-5 py-2.5 rounded-2xl bg-white text-slate-800 border border-slate-200 text-sm font-medium hover:bg-slate-50 transition shadow-xs active:scale-95 flex items-center gap-1.5"
          >
            <span>View Wardrobe</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Items */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs uppercase tracking-wider font-semibold text-slate-500">
              Total Items
            </span>
            <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-800">
              <Shirt className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-3xl sm:text-4xl font-bold text-slate-900 font-serif">
              {data.stats.totalItems}
            </span>
            <span className="block text-xs text-slate-600 mt-1 font-medium">
              Registered pieces
            </span>
          </div>
        </div>

        {/* Clean */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs uppercase tracking-wider font-semibold text-emerald-600">
              Clean
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-3xl sm:text-4xl font-bold text-emerald-700 font-serif">
              {data.stats.cleanCount}
            </span>
            <span className="block text-xs text-slate-600 mt-1 font-medium">
              Ready to wear
            </span>
          </div>
        </div>

        {/* Wash Soon */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs uppercase tracking-wider font-semibold text-amber-600">
              Wash Soon
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-3xl sm:text-4xl font-bold text-amber-600 font-serif">
              {data.stats.washSoonCount}
            </span>
            <span className="block text-xs text-slate-600 mt-1 font-medium">
              Approaching limit
            </span>
          </div>
        </div>

        {/* Wash Required */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs uppercase tracking-wider font-semibold text-rose-600">
              Wash Required
            </span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-3xl sm:text-4xl font-bold text-rose-600 font-serif">
              {data.stats.washRequiredCount}
            </span>
            <span className="block text-xs text-slate-600 mt-1 font-medium">
              Needs laundry
            </span>
          </div>
        </div>
      </div>

      {/* Laundry Reminders Section */}
      <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-lg">🧺</span>
            <h2 className="text-lg font-serif font-bold text-slate-900">
              Laundry Reminders
            </h2>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
            {data.laundryReminders.length} pending
          </span>
        </div>

        {data.laundryReminders.length === 0 ? (
          <div className="py-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <p className="text-sm font-medium text-slate-800">
              Your laundry basket is clear!
            </p>
            <p className="text-xs text-slate-600 mt-0.5">
              All your clothes are fresh and ready to wear.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {data.laundryReminders.map((item) => (
              <div
                key={item.clothing_id}
                onClick={() => openItemDetail(item)}
                className="group flex items-center justify-between p-3.5 rounded-2xl border border-slate-200/70 hover:border-slate-400 bg-slate-50/50 hover:bg-white hover:shadow-xs transition duration-200 cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-200 shrink-0">
                    <img
                      src={resolveImageUrl(item.image_url)}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-semibold text-slate-900 truncate group-hover:text-slate-700">
                      {item.name}
                    </h4>
                    <span className="text-xs text-slate-600 block">
                      {item.current_wear_count} / {item.wash_threshold} wears
                    </span>
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  <StatusBadge status={item.status} size="sm" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Grid of Two Columns: Recently Worn & Recently Washed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recently Worn */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-serif font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-500" />
              <span>Recently Worn</span>
            </h2>
            <button
              onClick={() => navigate('/wardrobe')}
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 transition flex items-center gap-1"
            >
              <span>See all</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {data.recentlyWorn.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-3xl border border-slate-200/80 text-xs text-slate-600">
              No recent wears logged. Wear an item to see it here!
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {data.recentlyWorn.map((item) => (
                <div
                  key={item.clothing_id}
                  onClick={() => openItemDetail(item)}
                  className="group bg-white rounded-2xl overflow-hidden border border-slate-200/80 shadow-xs hover:shadow-float transition cursor-pointer flex flex-col"
                >
                  <div className="relative aspect-square bg-slate-100 overflow-hidden">
                    <img
                      src={resolveImageUrl(item.image_url)}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                    <div className="absolute top-2 left-2">
                      <StatusBadge status={item.status} size="sm" />
                    </div>
                  </div>
                  <div className="p-3">
                    <h4 className="text-xs font-semibold text-slate-900 truncate">
                      {item.name}
                    </h4>
                    <span className="text-[11px] text-slate-600 block mt-0.5">
                      {formatRelativeDate(item.last_worn)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recently Washed */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-serif font-bold text-slate-900 flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-slate-500" />
              <span>Recently Washed</span>
            </h2>
            <button
              onClick={() => navigate('/wardrobe')}
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 transition flex items-center gap-1"
            >
              <span>See all</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {data.recentlyWashed.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-3xl border border-slate-200/80 text-xs text-slate-600">
              No washes logged yet. Items marked as washed will show up here.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {data.recentlyWashed.map((item) => (
                <div
                  key={item.clothing_id}
                  onClick={() => openItemDetail(item)}
                  className="group bg-white rounded-2xl overflow-hidden border border-slate-200/80 shadow-xs hover:shadow-float transition cursor-pointer flex flex-col"
                >
                  <div className="relative aspect-square bg-slate-100 overflow-hidden">
                    <img
                      src={resolveImageUrl(item.image_url)}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                    <div className="absolute top-2 left-2">
                      <StatusBadge status={item.status} size="sm" />
                    </div>
                  </div>
                  <div className="p-3">
                    <h4 className="text-xs font-semibold text-slate-900 truncate">
                      {item.name}
                    </h4>
                    <span className="text-[11px] text-emerald-600 font-medium block mt-0.5">
                      Washed {formatRelativeDate(item.last_washed)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
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

export default DashboardPage;
