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
} from 'lucide-react';
import { CATEGORIES_DATA } from '../data/mockData';

export const MenuDrawer: React.FC = () => {
  const {
    isMenuDrawerOpen,
    setIsMenuDrawerOpen,
    categories,
    setSelectedCategory,
    setIsInventoryModalOpen,
    setIsTrackingOpen,
    setIsWhatsAppOpen,
    setCurrentView,
    ownerPhone,
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
          <div className="p-1 rounded-xl bg-white shadow-xs">
            <NasBaladnaLogo size="sm" showTagline={false} />
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
              <button
                onClick={() => handleCategorySelect('all')}
                className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-emerald-50 hover:text-emerald-800 text-xs font-semibold text-slate-700 transition-colors"
              >
                <span>All Farm Harvest</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleCategorySelect(cat.id)}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold transition-colors ${
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
                </button>
              ))}
            </div>
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

        {/* Footer info & Discreet Admin Login Link */}
        <div className="p-4 pb-[max(1rem,calc(env(safe-area-inset-bottom)+0.75rem))] border-t border-slate-100 bg-slate-50 text-[11px] text-slate-500 flex items-center justify-between">
          <span>NasBaladna · Doha, Qatar</span>
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
        </div>
      </div>
    </div>
  );
};
