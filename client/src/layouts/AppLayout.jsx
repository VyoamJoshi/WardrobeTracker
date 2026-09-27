import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar.jsx';
import Navbar from '../components/Navbar.jsx';
import AddEditClothingModal from '../components/AddEditClothingModal.jsx';
import clothingService from '../services/clothingService.js';
import { useToast } from '../context/ToastContext.jsx';

export function AppLayout() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const { success, error } = useToast();
  const navigate = useNavigate();

  const handleSaveNewClothing = async (formData) => {
    try {
      const res = await clothingService.createClothing(formData);
      success('Clothing added successfully');
      // Dispatch an event so any listening page (e.g. Wardrobe, Dashboard) can re-fetch
      window.dispatchEvent(new CustomEvent('wardrobe:updated'));
      navigate('/wardrobe');
    } catch (err) {
      error(err.message || 'Unable to add clothing. Please try again.');
      throw err;
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#FAF9F6]">
      {/* Sidebar for Desktop */}
      <Sidebar onOpenAddModal={() => setIsAddModalOpen(true)} />

      {/* Mobile Top Navbar */}
      <Navbar onOpenAddModal={() => setIsAddModalOpen(true)} />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 pb-16 lg:pb-10">
        <Outlet context={{ onOpenAddModal: () => setIsAddModalOpen(true) }} />
      </main>

      {/* Global Add Clothing Modal */}
      <AddEditClothingModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleSaveNewClothing}
      />
    </div>
  );
}

export default AppLayout;
