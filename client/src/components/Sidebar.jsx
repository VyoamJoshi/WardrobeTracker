import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Shirt, BarChart3, Plus, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export function Sidebar({ onOpenAddModal }) {
  const { user, logout } = useAuth();

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/wardrobe', label: 'My Wardrobe', icon: Shirt },
    { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  ];

  return (
    <aside className="hidden lg:flex w-64 flex-col justify-between h-screen sticky top-0 bg-white border-r border-slate-200/80 p-6 z-20 shrink-0">
      {/* Brand & Logo */}
      <div className="space-y-8">
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-float">
            <Shirt className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-serif font-bold text-lg text-slate-900 tracking-tight leading-tight">
              Wardrobe
            </h1>
            <span className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">
              Personal Tracker
            </span>
          </div>
        </div>

        {/* Quick Add Button */}
        <button
          onClick={onOpenAddModal}
          className="w-full py-3 px-4 rounded-2xl bg-slate-900 hover:bg-black text-white text-sm font-medium flex items-center justify-center gap-2 shadow-soft hover:shadow-float active:scale-98 transition duration-200"
        >
          <Plus className="w-4 h-4" />
          <span>Add Clothing</span>
        </button>

        {/* Navigation Links */}
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-slate-100 text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`
                }
              >
                <Icon className="w-5 h-5 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* User Profile & Sign Out */}
      <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-full bg-slate-200 text-slate-800 font-semibold text-xs flex items-center justify-center shrink-0 border border-white shadow-xs">
            {user?.name
              ? user.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase()
                  .slice(0, 2)
              : 'U'}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-900 truncate">
              {user?.name || 'User'}
            </p>
            <p className="text-[11px] text-slate-600 truncate">
              {user?.email || 'Logged in'}
            </p>
          </div>
        </div>

        <button
          onClick={logout}
          title="Sign out"
          className="p-2 rounded-xl text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
