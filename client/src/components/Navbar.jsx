import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Shirt, BarChart3, Plus, Menu, X, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export function Navbar({ onOpenAddModal }) {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/wardrobe', label: 'My Wardrobe', icon: Shirt },
    { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  ];

  return (
    <header className="lg:hidden sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 py-3">
      <div className="flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center">
            <Shirt className="w-4 h-4" />
          </div>
          <span className="font-serif font-bold text-base text-slate-900">
            Wardrobe
          </span>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenAddModal}
            className="p-2 rounded-xl bg-slate-900 text-white text-xs font-medium flex items-center gap-1 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add</span>
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Dropdown */}
      {mobileMenuOpen && (
        <div className="pt-4 pb-2 border-t border-slate-100 mt-3 space-y-1 animate-fade-in">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium ${
                    isActive
                      ? 'bg-slate-100 text-slate-900'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between px-3 text-xs text-slate-500">
            <span>Signed in as {user?.name || 'User'}</span>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                logout();
              }}
              className="text-rose-600 font-medium flex items-center gap-1 hover:underline"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}

export default Navbar;
