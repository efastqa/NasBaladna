import React from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { Header } from './components/Header';
import { HeroBanner } from './components/HeroBanner';
import { CategoryGrid } from './components/CategoryGrid';
import { ProductCard } from './components/ProductCard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { LiveOrderTracking } from './components/LiveOrderTracking';
import { InventoryManagerModal } from './components/InventoryManagerModal';
import { WhatsAppChatModal } from './components/WhatsAppChatModal';
import { MenuDrawer } from './components/MenuDrawer';
import { BottomNav } from './components/BottomNav';
import { AdminPortal } from './components/AdminPortal';
import { NasBaladnaLogo } from './components/NasBaladnaLogo';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  MessageCircle,
  Sparkles,
  Truck,
  ShieldCheck,
  RotateCcw,
  Package,
  Lock,
} from 'lucide-react';

const MainStoreContent: React.FC = () => {
  const {
    products,
    categories,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    customerTier,
    setCustomerTier,
    setIsCartOpen,
    setIsInventoryModalOpen,
    setIsWhatsAppOpen,
    toastMessage,
    cartCount,
    setIsMenuDrawerOpen,
    currentView,
    setCurrentView,
    ownerPhone,
  } = useStore();

  // If in Admin mode, render the Admin Portal (Login or Dashboard)
  if (currentView === 'admin') {
    return <AdminPortal />;
  }

  // Filter products by selected category and search query
  const filteredProducts = products.filter((p) => {
    const matchesCategory =
      selectedCategory === 'all' || p.category === selectedCategory;
    const matchesSearch =
      searchQuery.trim() === '' ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.scientificName && p.scientificName.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  const activeCategoryObj = categories.find((c) => c.id === selectedCategory);
  const categoryTitle =
    selectedCategory === 'all'
      ? "Today's Morning Harvest"
      : selectedCategory === 'near_expiry'
      ? '⚡ Near Expiry Super Deals'
      : activeCategoryObj
      ? activeCategoryObj.name
      : `${selectedCategory.toUpperCase()} Selection`;

  return (
    <div className="min-h-screen bg-[#F8FAF9] text-slate-800 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Toast Notification Alert with Spring Animation */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -25, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -25, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-60 bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 border border-slate-700"
          >
            <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Customer Header Bar (Clean, no admin controls, official logo) */}
      <Header />

      {/* Main Responsive Customer Storefront */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-4 sm:py-8 space-y-6">
        {/* Search Bar */}
        <div className="relative max-w-2xl mx-auto sm:mx-0">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search farm fresh vegetables, fruits, dairy, or herbs (e.g. Pani Dodam)..."
            className="w-full text-xs sm:text-sm pl-10 pr-10 py-3 rounded-2xl bg-white border border-slate-200/90 shadow-2xs focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all placeholder:text-slate-400 text-slate-800"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-xs text-slate-400 hover:text-slate-700"
            >
              Clear
            </button>
          )}
        </div>

        {/* Hero Banner matching IMG_5613 */}
        <HeroBanner />

        {/* Category 3D Cards Grid matching IMG_5613 */}
        <CategoryGrid />

        {/* Fresh Produce Catalog */}
        <section id="produce" className="pt-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 font-['Outfit']">
                {categoryTitle}
              </h2>
              <p className="text-xs text-slate-500">
                {selectedCategory === 'near_expiry'
                  ? 'Save up to 50%+ on peak ripeness produce & bakery — zero food waste initiative!'
                  : `${filteredProducts.length} farm items harvested & available for immediate dispatch`}
              </p>
            </div>

            {/* Category Filter Pills (Functional Filter Controls) */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === 'all'
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
                }`}
              >
                All Produce
              </button>
              {categories.map((cat) => {
                const isSelected = selectedCategory === cat.id;
                const isNearExpiry = cat.id === 'near_expiry';
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                      isSelected
                        ? isNearExpiry
                          ? 'bg-rose-700 text-white shadow-xs'
                          : 'bg-emerald-800 text-white shadow-xs'
                        : isNearExpiry
                        ? 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 font-bold'
                        : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {isNearExpiry ? '⚡ Near Expiry' : cat.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Product Cards Grid */}
          {filteredProducts.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
              <p className="text-slate-500 text-sm">
                No produce matches "{searchQuery}".
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
                className="px-4 py-2 bg-emerald-700 text-white text-xs font-bold rounded-xl"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-3.5 sm:gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>

        {/* Quality & Farm Direct Promise Section */}
        <section className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-8 space-y-4">
          <div className="max-w-xl">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
              Why NasBaladna
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-['Outfit'] mt-1">
              From Local Organic Farms Direct to Your Door
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
              We deliver produce within 24 hours of harvest. Kept chilled at 4°C throughout transport to lock in peak vitamins, natural enzymes, and crispy garden taste.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100 flex items-start gap-3">
              <Truck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-xs sm:text-sm text-slate-900">35-Min Express Home Delivery</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Chilled cold-chain delivery straight to your doorstep across Qatar.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-teal-50/60 border border-teal-100 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-teal-700 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-xs sm:text-sm text-slate-900">100% Pesticide-Free</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Certified organic soils and eco-friendly closed-loop hydroponics.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-sky-50/60 border border-sky-100 flex items-start gap-3">
              <RotateCcw className="w-5 h-5 text-sky-700 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-xs sm:text-sm text-slate-900">Zero-Fuss Freshness Guarantee</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Instant refund or replacement if any item does not meet your quality expectations.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Clean Public Footer */}
        <footer className="pt-10 pb-20 sm:pb-12 border-t border-slate-200 text-xs text-slate-500">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6">
            <NasBaladnaLogo size="sm" showTagline={true} />
            <div className="flex items-center gap-6 font-medium text-slate-600">
              <a href="#produce" className="hover:text-emerald-800">Fresh Produce</a>
              <button onClick={() => setIsInventoryModalOpen(true)} className="hover:text-emerald-800">
                Stock Availability
              </button>
              <a href={`tel:${ownerPhone}`} className="hover:text-emerald-800 font-mono">
                Hotline: {ownerPhone}
              </a>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between pt-4 border-t border-slate-100 gap-2 text-[11px]">
            <p>© {new Date().getFullYear()} NasBaladna. Fresh Produce Delivery · Doha, State of Qatar.</p>
            {/* Discreet Staff & Admin Access Link */}
            <button
              onClick={() => setCurrentView('admin')}
              className="text-slate-400 hover:text-slate-700 flex items-center gap-1 transition-colors"
              title="Staff & Store Management Login"
            >
              <Lock className="w-3 h-3" />
              <span>Staff / Admin Login</span>
            </button>
          </div>
        </footer>
      </main>

      {/* Floating WhatsApp Quick Order Button with Pulse Glow Animation */}
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsWhatsAppOpen(true)}
        aria-label="WhatsApp Support"
        className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white shadow-xl flex items-center justify-center transition-all group"
        title="Chat with NasBaladna on WhatsApp"
      >
        <span className="absolute inset-0 rounded-full bg-[#25D366] opacity-40 animate-ping group-hover:opacity-75 pointer-events-none" />
        <MessageCircle className="w-7 h-7 fill-current relative z-10" />
      </motion.button>

      {/* Mobile Bottom Navigation Bar (Home, Menu, Search, Shop, Cart, Account) */}
      <div className="md:hidden">
        <BottomNav />
      </div>

      {/* Customer Modals & Drawers */}
      <ProductDetailModal />
      <CartDrawer />
      <CheckoutModal />
      <LiveOrderTracking />
      <InventoryManagerModal />
      <WhatsAppChatModal />
      <MenuDrawer />
    </div>
  );
};

export default function App() {
  return (
    <StoreProvider>
      <MainStoreContent />
    </StoreProvider>
  );
}
