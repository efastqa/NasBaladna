import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { NasBaladnaLogo } from './NasBaladnaLogo';
import {
  ShoppingBag,
  Search,
  Menu,
  ShieldCheck,
  PhoneCall,
  Clock,
  User,
  LayoutDashboard,
  QrCode,
  LogOut,
  Truck,
  Zap,
} from 'lucide-react';
import { CURRENCY_RATES } from '../data/mockData';
import { CurrencyType } from '../types';

export const Header: React.FC = () => {
  const {
    cartCount,
    setIsCartOpen,
    currency,
    setCurrency,
    setIsMenuDrawerOpen,
    setIsTrackingOpen,
    setIsInventoryModalOpen,
    setIsQrModalOpen,
    activeOrder,
    setActiveMobileTab,
    ownerPhone,
    isAdminAuthenticated,
    adminLogout,
    setCurrentView,
    unreadOrdersCount,
  } = useStore();

  const [deliveryCountdown, setDeliveryCountdown] = useState<{
    slotName: string;
    hours: number;
    minutes: number;
    seconds: number;
  }>({ slotName: 'Morning Slot (8 AM - 11 AM)', hours: 1, minutes: 42, seconds: 15 });

  useEffect(() => {
    const calculateCountdown = () => {
      const now = new Date();
      const currentHours = now.getHours();
      const currentMinutes = now.getMinutes();
      const currentSeconds = now.getSeconds();

      let targetHour = 10;
      let targetMinute = 30;
      let slot = 'Morning Slot (8 AM - 11 AM)';

      if (currentHours < 10 || (currentHours === 10 && currentMinutes < 30)) {
        targetHour = 10;
        targetMinute = 30;
        slot = 'Morning Slot (8 AM - 11 AM)';
      } else if (currentHours < 15 || (currentHours === 15 && currentMinutes < 30)) {
        targetHour = 15;
        targetMinute = 30;
        slot = 'Afternoon Slot (2 PM - 5 PM)';
      } else if (currentHours < 19 || (currentHours === 19 && currentMinutes < 30)) {
        targetHour = 19;
        targetMinute = 30;
        slot = 'Evening Slot (6 PM - 9 PM)';
      } else {
        targetHour = 24 + 10;
        targetMinute = 30;
        slot = "Tomorrow's Morning Slot (8 AM - 11 AM)";
      }

      const totalTargetSeconds = targetHour * 3600 + targetMinute * 60;
      const totalCurrentSeconds = currentHours * 3600 + currentMinutes * 60 + currentSeconds;
      const diffSeconds = Math.max(0, totalTargetSeconds - totalCurrentSeconds);

      const h = Math.floor(diffSeconds / 3600);
      const m = Math.floor((diffSeconds % 3600) / 60);
      const s = diffSeconds % 60;

      setDeliveryCountdown({ slotName: slot, hours: h, minutes: m, seconds: s });
    };

    calculateCountdown();
    const interval = setInterval(calculateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
      {/* Top micro announcement bar with dynamic live delivery cutoff countdown */}
      <div className="bg-[#14532D] text-white text-[10px] sm:text-[11px] font-medium py-1.5 px-3 sm:px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <div className="flex items-center gap-1.5 truncate">
              <span className="hidden sm:inline font-bold flex items-center gap-1">
                <Truck className="w-3 h-3 text-emerald-300 inline" />
                <span>Qatar Cold-Chain Dispatch:</span>
              </span>
              <span className="text-emerald-100 truncate">
                Order within{' '}
                <span className="font-mono font-bold text-amber-300">
                  {deliveryCountdown.hours}h {deliveryCountdown.minutes}m {String(deliveryCountdown.seconds).padStart(2, '0')}s
                </span>{' '}
                for <strong className="text-white font-bold">{deliveryCountdown.slotName}</strong>
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-4 text-emerald-100 shrink-0 text-right">
            <a
              href={`tel:${ownerPhone}`}
              className="flex items-start sm:items-center gap-1.5 hover:text-white font-mono font-medium text-[10px] sm:text-[11px] text-right"
            >
              <PhoneCall className="w-3.5 h-3.5 text-emerald-300 shrink-0 mt-0.5 sm:mt-0" />
              <div className="leading-tight text-right">
                <span className="block sm:inline text-emerald-200 sm:text-white">Orders Hotline: </span>
                <span className="text-white font-bold">{ownerPhone}</span>
              </div>
            </a>
            <span aria-hidden="true" className="hidden sm:inline">·</span>
            <span className="hidden md:flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-300" />
              <span>Free Delivery &gt; QAR 50</span>
            </span>
          </div>
        </div>
      </div>

      {/* Main Top Bar: 3-Zone Contract */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between gap-4">
        {/* Zone 1: NasBaladna Brand Official Logo matching IMG_5631 */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMenuDrawerOpen(true)}
            aria-label="Open navigation menu"
            className="p-2 text-slate-700 hover:text-emerald-700 hover:bg-slate-100 rounded-lg transition-colors md:hidden"
          >
            <Menu className="w-5 h-5" />
          </button>

          <a
            href="#home"
            onClick={(e) => {
              e.preventDefault();
              setActiveMobileTab('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center text-decoration-none group transition-transform hover:scale-[1.01]"
          >
            <NasBaladnaLogo size="responsive" showTagline={true} />
          </a>
        </div>

        {/* Zone 2: Clean Customer Navigation Links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-semibold text-slate-700">
          <a
            href="#produce"
            onClick={(e) => {
              e.preventDefault();
              setActiveMobileTab('home');
              const el = document.getElementById('produce');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="hover:text-emerald-700 transition-colors"
          >
            Fresh Produce
          </a>
          <button
            onClick={() => setIsInventoryModalOpen(true)}
            className="hover:text-emerald-700 transition-colors flex items-center gap-1.5 text-slate-700 font-semibold"
          >
            <span>Live Stock</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </button>
          <button
            onClick={() => setIsTrackingOpen(true)}
            className="hover:text-emerald-700 transition-colors text-slate-700 font-semibold"
          >
            Track Order
          </button>
        </nav>

        {/* Zone 3: Actions & Controls (NO Admin Buttons for Customers) */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Currency Selector */}
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value as CurrencyType)}
            className="text-xs font-semibold bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-2.5 py-2 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            aria-label="Currency"
          >
            {Object.keys(CURRENCY_RATES).map((cur) => (
              <option key={cur} value={cur}>
                {cur}
              </option>
            ))}
          </select>

          {/* Scan to Order QR Code Button */}
          <button
            onClick={() => setIsQrModalOpen(true)}
            className="flex items-center gap-1.5 px-2 sm:px-2.5 py-2 text-xs font-semibold text-slate-700 hover:text-emerald-800 bg-emerald-50/70 hover:bg-emerald-100/70 border border-emerald-200/80 rounded-xl transition-all shrink-0 cursor-pointer"
            title="Scan & Order QR Code / Print Standees"
          >
            <QrCode className="w-3.5 h-3.5 text-emerald-700" />
            <span className="hidden lg:inline">Scan to Order</span>
            <span className="lg:hidden hidden sm:inline">QR Code</span>
          </button>

          {/* If authenticated as Admin, show Admin Dashboard + Log Out buttons */}
          {isAdminAuthenticated && (
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => setCurrentView('admin')}
                className="relative flex items-center gap-1.5 px-2 sm:px-3 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-all shadow-xs shrink-0 cursor-pointer"
                title="Return to Admin Dashboard"
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="hidden sm:inline">Admin</span>
                {unreadOrdersCount > 0 && (
                  <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-rose-600 text-[10px] font-black text-white animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-white shrink-0" />
                    <span>{unreadOrdersCount} NEW</span>
                  </span>
                )}
              </button>
              
              <button
                onClick={adminLogout}
                className="flex items-center gap-1 px-2 sm:px-2.5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-all shadow-xs shrink-0 cursor-pointer"
                title="Log out of Admin session"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          )}

          {/* Account / Order Tracking Button */}
          <button
            onClick={() => setIsTrackingOpen(true)}
            className="p-2.5 text-slate-700 hover:text-emerald-700 hover:bg-emerald-50 border border-slate-200 rounded-xl transition-colors hidden sm:flex items-center gap-1.5 text-xs font-semibold"
            title="Customer Account & Order Tracking"
          >
            <User className="w-4 h-4 text-slate-700" />
            <span>Orders</span>
          </button>

          {/* Cart Bag Button */}
          <button
            onClick={() => setIsCartOpen(true)}
            aria-label="Shopping Cart"
            className="relative p-2.5 text-slate-700 hover:text-emerald-700 bg-emerald-50/50 hover:bg-emerald-50 border border-emerald-200/60 rounded-xl transition-all"
          >
            <ShoppingBag className="w-5 h-5 text-emerald-800" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-600 text-white text-[11px] font-bold rounded-full flex items-center justify-center shadow-md animate-scale">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
