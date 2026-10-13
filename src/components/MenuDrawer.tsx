import React from 'react';
import { useStore } from '../context/StoreContext';
import { NasBaladnaLogo } from './NasBaladnaLogo';
import {
  X,
  Truck,
  ShieldCheck,
  Activity,
  Phone,
  ChevronRight,
  Lock,
  QrCode,
  LogOut,
  LayoutDashboard,
  Smartphone,
  Download,
  Sparkles,
} from 'lucide-react';
import { CATEGORIES_DATA } from '../data/mockData';
import { motion } from 'motion/react';

export const MenuDrawer: React.FC = () => {
  const {
    isMenuDrawerOpen,
    setIsMenuDrawerOpen,
    categories,
    setSelectedCategory,
    setIsInventoryModalOpen,
    setIsTrackingOpen,
    setIsWhatsAppOpen,
    setIsQrModalOpen,
    setIsAppDownloadModalOpen,
    isAdminAuthenticated,
    adminLogout,
    setCurrentView,
    ownerPhone,
    unreadOrdersCount,
  } = useStore();

  if (!isMenuDrawerOpen) return null;

  const handleCategorySelect = (id: any) => {
    setSelectedCategory(id);
    setIsMenuDrawerOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs flex justify-start animate-in fade-in duration-200">
      <div className="w-full max-w-xs sm:max-w-sm bg-white h-full shadow-2xl flex flex-col border-r border-slate-200">
        {/* Drawer Header with Official Logo */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-[#14532D] text-white">
          <div className="p-1.5 px-2.5 rounded-xl bg-white shadow-xs">
            <NasBaladnaLogo size="sm" showTagline={true} />
          </div>

          <button
            onClick={() => setIsMenuDrawerOpen(false)}
            className="p-1.5 text-emerald-200 hover:text-white rounded-lg hover:bg-white/10"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Categories */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-2">
              Farm Categories
            </h3>
            <div className="space-y-1">
              <motion.button
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleCategorySelect('all')}
                className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-emerald-50 hover:text-emerald-800 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
              >
                <span>All Farm Harvest</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </motion.button>

              {categories.map((cat, idx) => (
                <motion.button
                  key={cat.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 + idx * 0.03, duration: 0.2 }}
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleCategorySelect(cat.id)}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                    cat.id === 'near_expiry'
                      ? 'bg-rose-50/70 text-rose-800 hover:bg-rose-100/80'
                      : 'hover:bg-emerald-50 hover:text-emerald-800 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {cat.image ? (
                      <img
                        src={cat.image}
                        alt={cat.name}
                        className="w-5 h-5 rounded-md object-contain bg-slate-100 p-0.5 border border-slate-200 shrink-0"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <span
                        className={`w-2 h-2 rounded-full ${
                          cat.id === 'near_expiry' ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'
                        }`}
                      />
                    )}
                    <span>{cat.name}</span>
                    {cat.badge && (
                      <span className="text-[10px] font-bold text-rose-600 bg-rose-100 px-1.5 py-0.2 rounded-md">
                        {cat.badge}
                      </span>
                    )}
                  </div>
                  <ChevronRight className={`w-4 h-4 ${cat.id === 'near_expiry' ? 'text-rose-400' : 'text-slate-400'}`} />
                </motion.button>
              ))}
            </div>
          </div>

          {/* Mobile App Download Card */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 text-white shadow-md space-y-2.5 border border-emerald-700/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white p-0.5 shadow-sm border border-emerald-300/40 shrink-0 overflow-hidden flex items-center justify-center">
                  <img
                    src="/app-icon.png"
                    alt="NasBaladna App Icon"
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>
                <div>
                  <h4 className="font-extrabold text-xs text-white">NasBaladna App</h4>
                  <span className="text-[10px] text-emerald-200">15% OFF · Code: APP15</span>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-400 text-emerald-950 font-black text-[9px]">
                GET APP
              </span>
            </div>
            <button
              onClick={() => {
                setIsMenuDrawerOpen(false);
                setIsAppDownloadModalOpen(true);
              }}
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download for iOS & Android</span>
            </button>
          </div>

          {/* Customer Tools */}
          <div className="border-t border-slate-100 pt-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-2">
              Customer Services
            </h3>
            <div className="space-y-1">
              <button
                onClick={() => {
                  setIsMenuDrawerOpen(false);
                  setIsAppDownloadModalOpen(true);
                }}
                className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-emerald-50 hover:text-emerald-800 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-emerald-600" />
                  <span>Download Mobile App</span>
                </div>
                <span className="text-[10px] font-mono bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded font-bold">
                  15% OFF
                </span>
              </button>

              <button
                onClick={() => {
                  setIsMenuDrawerOpen(false);
                  setIsInventoryModalOpen(true);
                }}
                className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-emerald-50 hover:text-emerald-800 text-xs font-semibold text-slate-700 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-600" />
                  <span>Real-Time Stock Availability</span>
                </div>
                <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold">
                  LIVE
                </span>
              </button>

              <button
                onClick={() => {
                  setIsMenuDrawerOpen(false);
                  setIsTrackingOpen(true);
                }}
                className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-emerald-50 hover:text-emerald-800 text-xs font-semibold text-slate-700 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-emerald-600" />
                  <span>Live Delivery GPS Tracking</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              <button
                onClick={() => {
                  setIsMenuDrawerOpen(false);
                  setIsWhatsAppOpen(true);
                }}
                className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-emerald-50 hover:text-emerald-800 text-xs font-semibold text-slate-700 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-emerald-600" />
                  <span>Hotline: {ownerPhone}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              <button
                onClick={() => {
                  setIsMenuDrawerOpen(false);
                  setIsQrModalOpen(true);
                }}
                className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-emerald-50 hover:text-emerald-800 text-xs font-semibold text-slate-700 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <QrCode className="w-4 h-4 text-emerald-600" />
                  <span>Scan to Order QR Code & Standees</span>
                </div>
                <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold">
                  PRINT
                </span>
              </button>
            </div>
          </div>

          {/* Delivery Promise */}
          <div className="p-4 bg-emerald-50/70 border border-emerald-200/60 rounded-2xl text-xs space-y-2 text-emerald-950">
            <div className="flex items-center gap-2 font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>NasBaladna Freshness Pledge</span>
            </div>
            <p className="text-[11px] text-emerald-800 leading-relaxed">
              Every item is harvested daily under cold-chain preservation at 4°C. Direct farm produce delivered fresh to your doorstep in minutes.
            </p>
          </div>
        </div>

        {/* Footer info & Admin Controls */}
        <div className="p-4 pb-[max(1rem,calc(env(safe-area-inset-bottom)+0.75rem))] border-t border-slate-100 bg-slate-50 text-[11px] text-slate-500 flex items-center justify-between gap-2">
          <span>NasBaladna · Doha, Qatar</span>
          
          {isAdminAuthenticated ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setIsMenuDrawerOpen(false);
                  setCurrentView('admin');
                }}
                className="text-emerald-800 hover:text-emerald-950 flex items-center gap-1 font-bold transition-colors py-1 px-2 rounded-lg bg-emerald-100/70"
                title="Go to Admin Dashboard"
              >
                <LayoutDashboard className="w-3 h-3" />
                <span>Admin</span>
                {unreadOrdersCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-rose-600 text-white text-[9px] font-black animate-pulse">
                    +{unreadOrdersCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => {
                  setIsMenuDrawerOpen(false);
                  adminLogout();
                }}
                className="text-white hover:bg-rose-700 flex items-center gap-1 font-bold transition-colors py-1 px-2.5 rounded-lg bg-rose-600 shadow-xs cursor-pointer"
                title="Log out of Admin session"
              >
                <LogOut className="w-3 h-3" />
                <span>Log Out</span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                setIsMenuDrawerOpen(false);
                setCurrentView('admin');
              }}
              className="text-slate-400 hover:text-emerald-800 flex items-center gap-1 font-semibold transition-colors"
              title="Authorized Personnel Login"
            >
              <Lock className="w-3 h-3" />
              <span>Staff Login</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
