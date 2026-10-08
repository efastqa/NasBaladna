import React from 'react';
import { useStore } from '../context/StoreContext';
import { Home, Menu, Search, ShoppingBag, User, Store } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const {
    activeMobileTab,
    setActiveMobileTab,
    cartCount,
    setIsCartOpen,
    setIsTrackingOpen,
    activeOrder,
    setIsMenuDrawerOpen,
  } = useStore();

  const handleTabClick = (tab: 'home' | 'menu' | 'search' | 'shop' | 'cart' | 'account') => {
    setActiveMobileTab(tab);
    if (tab === 'cart') {
      setIsCartOpen(true);
    } else if (tab === 'menu') {
      setIsMenuDrawerOpen(true);
    } else if (tab === 'account') {
      setIsTrackingOpen(true);
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-2 py-1.5 shadow-[0_-4px_16px_rgba(0,0,0,0.05)]">
      <div className="max-w-md mx-auto grid grid-cols-6 items-center">
        {/* 1. Home */}
        <button
          onClick={() => handleTabClick('home')}
          className={`flex flex-col items-center justify-center py-1 transition-colors ${
            activeMobileTab === 'home' ? 'text-emerald-700 font-semibold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Home className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Home</span>
        </button>

        {/* 2. Menu */}
        <button
          onClick={() => handleTabClick('menu')}
          className={`flex flex-col items-center justify-center py-1 transition-colors ${
            activeMobileTab === 'menu' ? 'text-emerald-700 font-semibold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Menu className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Menu</span>
        </button>

        {/* 3. Search */}
        <button
          onClick={() => handleTabClick('search')}
          className={`flex flex-col items-center justify-center py-1 transition-colors ${
            activeMobileTab === 'search' ? 'text-emerald-700 font-semibold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Search className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Search</span>
        </button>

        {/* 4. Shop */}
        <button
          onClick={() => handleTabClick('shop')}
          className={`flex flex-col items-center justify-center py-1 transition-colors ${
            activeMobileTab === 'shop' ? 'text-emerald-700 font-semibold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Store className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Shop</span>
        </button>

        {/* 5. Cart */}
        <button
          onClick={() => handleTabClick('cart')}
          className={`relative flex flex-col items-center justify-center py-1 transition-colors ${
            activeMobileTab === 'cart' ? 'text-emerald-700 font-semibold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5 mb-0.5" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-emerald-600 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </div>
          <span className="text-[10px]">Cart</span>
        </button>

        {/* 6. Account / Orders */}
        <button
          onClick={() => handleTabClick('account')}
          className={`relative flex flex-col items-center justify-center py-1 transition-colors ${
            activeMobileTab === 'account' ? 'text-emerald-700 font-semibold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <div className="relative">
            <User className="w-5 h-5 mb-0.5" />
            {activeOrder && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
            )}
          </div>
          <span className="text-[10px]">{activeOrder ? 'Tracking' : 'Account'}</span>
        </button>
      </div>
    </nav>
  );
};
