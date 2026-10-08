import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import {
  X,
  ChevronLeft,
  Share2,
  HelpCircle,
  ShoppingBag,
  Check,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  Zap,
  Clock,
} from 'lucide-react';

export const ProductDetailModal: React.FC = () => {
  const {
    selectedProduct,
    setSelectedProduct,
    addToCart,
    formatPrice,
    setIsCheckoutOpen,
    showToast,
    setIsWhatsAppOpen,
    ownerPhone,
    ownerWhatsAppUrl,
  } = useStore();

  if (!selectedProduct) return null;

  const wholesaleUnit = selectedProduct.wholesaleUnit || '5kg Crate';
  const wholesalePriceVal = selectedProduct.wholesalePrice || selectedProduct.basePrice * 4.5;

  const [selectedWeight, setSelectedWeight] = useState<string>(
    selectedProduct.weightOptions[0]?.weight || selectedProduct.baseWeight
  );
  const [quantity, setQuantity] = useState<number>(1);
  const [activeThumbIndex, setActiveThumbIndex] = useState<number>(0);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showHelpBox, setShowHelpBox] = useState(false);

  // Calculate current price based on weight
  const isWholesaleSelected = selectedWeight === wholesaleUnit;
  const currentWeightOption = selectedProduct.weightOptions.find(
    (w) => w.weight === selectedWeight
  ) || { weight: selectedWeight, multiplier: 1 };

  const currentPrice = isWholesaleSelected
    ? wholesalePriceVal
    : selectedProduct.basePrice * currentWeightOption.multiplier;
  const isOutOfStock = selectedProduct.stock === 0;


  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addToCart(selectedProduct, selectedWeight, quantity);
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    addToCart(selectedProduct, selectedWeight, quantity);
    setSelectedProduct(null);
    setIsCheckoutOpen(true);
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedLink(true);
    showToast('Product link copied to clipboard!');
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex justify-center items-start sm:items-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl sm:rounded-3xl shadow-2xl overflow-hidden min-h-screen sm:min-h-0 max-h-[96vh] flex flex-col my-auto border border-slate-200/60">
        {/* Sticky Modal Header */}
        <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md px-4 py-3 border-b border-slate-100 flex items-center justify-between">
          <button
            onClick={() => setSelectedProduct(null)}
            className="flex items-center gap-1 text-slate-600 hover:text-slate-900 text-sm font-medium p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            <span>Back to produce</span>
          </button>

          <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full">
            NasBaladna Farm Fresh
          </span>

          <button
            onClick={() => setSelectedProduct(null)}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto flex-1 p-5 sm:p-7 space-y-6">
          {/* Main Product Showcase Image matching IMG_5614 */}
          <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] bg-[#FAFAFA] rounded-2xl overflow-hidden flex items-center justify-center border border-slate-100 shadow-inner">
            <img
              src={selectedProduct.image}
              alt={selectedProduct.name}
              className="max-h-full max-w-full object-contain p-4 filter drop-shadow-sm transition-transform duration-500 hover:scale-105"
              referrerPolicy="no-referrer"
            />

            {/* Farm Tag */}
            <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-md text-[11px] font-semibold text-slate-700 shadow-xs border border-slate-200/60 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>{selectedProduct.farm}</span>
            </div>
          </div>

          {/* Thumbnails row matching IMG_5614 */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveThumbIndex(0)}
              className={`w-16 h-16 rounded-xl border-2 overflow-hidden p-1 bg-white transition-all ${
                activeThumbIndex === 0 ? 'border-slate-900 shadow-xs' : 'border-slate-200 opacity-70'
              }`}
            >
              <img
                src={selectedProduct.image}
                alt="thumbnail primary"
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </button>
            <div className="text-xs text-slate-500 font-medium pl-1">
              <span>Standard harvest packaging</span>
              <span className="block text-[11px] text-emerald-700 font-semibold mt-0.5">
                Chilled cold-chain box
              </span>
            </div>
          </div>

          {/* Near Expiry Banner Alert */}
          {(selectedProduct.isNearExpiry || selectedProduct.category === 'near_expiry') && (
            <div className="bg-rose-50 border border-rose-200/90 rounded-2xl p-3.5 flex items-start gap-3 text-xs text-rose-900 shadow-2xs">
              <Zap className="w-4 h-4 text-rose-600 shrink-0 mt-0.5 fill-rose-500" />
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-bold">
                    Near Expiry Super Value Deal {selectedProduct.discountPercent ? `(${selectedProduct.discountPercent}% OFF)` : ''}
                  </span>
                  {selectedProduct.expiryDate && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full">
                      <Clock className="w-2.5 h-2.5" />
                      {selectedProduct.expiryDate}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-rose-700 leading-relaxed">
                  Harvested at peak flavor. Specially discounted as part of our Qatar zero-food-waste initiative. Perfectly crisp and nutritious for immediate consumption.
                </p>
              </div>
            </div>
          )}

          {/* Title, Brand, SKU & Price Section matching IMG_5614 */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-slate-500 tracking-wider uppercase block">
                {selectedProduct.brand}
              </span>
              {(selectedProduct.isNearExpiry || selectedProduct.category === 'near_expiry') && (
                <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200 flex items-center gap-1">
                  <Zap className="w-2.5 h-2.5 fill-rose-500 text-rose-500" />
                  <span>Zero-Waste Clearance</span>
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-['Outfit'] tracking-tight">
              {selectedProduct.name.toUpperCase()}
            </h1>
            <p className="text-xs text-slate-500 font-mono mt-1">
              SKU: {selectedProduct.sku}
            </p>

            <div className="mt-3 flex items-baseline gap-3">
              <span className={`text-2xl sm:text-3xl font-bold font-mono tracking-tight ${selectedProduct.isNearExpiry ? 'text-rose-600' : 'text-slate-900'}`}>
                {formatPrice(currentPrice)}
              </span>
              {selectedProduct.originalPrice && selectedWeight === selectedProduct.baseWeight && (
                <span className="text-lg text-slate-400 line-through font-mono">
                  {formatPrice(selectedProduct.originalPrice)}
                </span>
              )}
              <span className="text-xs text-slate-500 font-medium">
                ({selectedWeight} portion)
              </span>
              {selectedProduct.discountPercent && (
                <span className="text-xs font-bold text-rose-700 bg-rose-100/90 px-2 py-0.5 rounded-full">
                  Save {selectedProduct.discountPercent}%
                </span>
              )}
            </div>
          </div>

          {/* Weight Selection Pills matching IMG_5614 */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                Weight: <span className="font-semibold text-emerald-700">{selectedWeight}</span>
              </span>
              <span className="text-[11px] text-slate-500">Select portion size</span>
            </div>

            <div className="flex flex-wrap gap-2.5">
              {selectedProduct.weightOptions.map((opt) => {
                const isSelected = selectedWeight === opt.weight;
                return (
                  <button
                    key={opt.weight}
                    onClick={() => setSelectedWeight(opt.weight)}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                      isSelected
                        ? 'bg-slate-900 text-white shadow-sm ring-2 ring-slate-900'
                        : 'bg-white text-slate-800 border border-slate-300 hover:border-slate-500'
                    }`}
                  >
                    {opt.weight}
                  </button>
                );
              })}

              {/* Wholesale Bulk Crate Option */}
              <button
                onClick={() => setSelectedWeight(wholesaleUnit)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  selectedWeight === wholesaleUnit
                    ? 'bg-emerald-800 text-white shadow-sm ring-2 ring-emerald-700'
                    : 'bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100'
                }`}
              >
                <span>📦 {wholesaleUnit} (Bulk Crate)</span>
              </button>
            </div>

          </div>

          {/* Real-time Inventory Stock Badge matching IMG_5614 */}
          <div>
            {isOutOfStock ? (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                <span>Currently out of stock for today's delivery</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>In stock, ready to ship</span>
                <span className="text-emerald-700/80 font-normal">({selectedProduct.stock} units available)</span>
              </div>
            )}
          </div>

          {/* Quantity Stepper & Add to Cart matching IMG_5615 */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-3">
              {/* Stepper matching screenshot */}
              <div className="flex items-center border border-slate-300 rounded-2xl px-3 py-2 bg-slate-50/50">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-8 h-8 flex items-center justify-center text-slate-700 hover:text-slate-900 font-bold text-lg"
                  disabled={quantity <= 1}
                >
                  &lsaquo;
                </button>
                <span className="w-10 text-center font-bold text-slate-900 font-mono text-base">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((q) => Math.min(selectedProduct.stock, q + 1))}
                  className="w-8 h-8 flex items-center justify-center text-slate-700 hover:text-slate-900 font-bold text-lg"
                  disabled={quantity >= selectedProduct.stock}
                >
                  &rsaquo;
                </button>
              </div>

              {/* Add to cart solid button matching IMG_5615 */}
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className="flex-1 bg-[#059669] hover:bg-[#047857] text-white py-3.5 px-6 rounded-2xl font-bold text-sm tracking-wide shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Add to cart</span>
              </button>
            </div>

            {/* Buy it now secondary button matching IMG_5615 */}
            <button
              onClick={handleBuyNow}
              disabled={isOutOfStock}
              className="w-full border-2 border-emerald-600 text-emerald-700 hover:bg-emerald-50 py-3 rounded-2xl font-bold text-sm tracking-wide transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Buy it now
            </button>
          </div>

          {/* Share & Need Help Links matching IMG_5615 */}
          <div className="flex items-center justify-between text-xs text-slate-600 pt-1 pb-2 border-b border-slate-100">
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 hover:text-emerald-700 underline underline-offset-4 font-medium transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{copiedLink ? 'Copied Link!' : 'Share'}</span>
            </button>

            <button
              onClick={() => setShowHelpBox(!showHelpBox)}
              className="flex items-center gap-1.5 hover:text-emerald-700 underline underline-offset-4 font-medium transition-colors"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Need help?</span>
            </button>
          </div>

          {/* Help popover if toggled */}
          {showHelpBox && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-2 text-slate-700">
              <p className="font-semibold text-slate-900">NasBaladna Produce Concierge & Wholesale</p>
              <p>
                All produce is inspected at 5:00 AM daily. For custom restaurant crates, wholesale pricing, or immediate order assistance, contact our manager directly at{' '}
                <a href={`tel:${ownerPhone}`} className="font-mono font-bold text-emerald-800 underline">
                  {ownerPhone} (77315415)
                </a>.
              </p>
              <div className="flex items-center gap-3 pt-1">
                <button
                  onClick={() => setIsWhatsAppOpen(true)}
                  className="text-emerald-700 font-bold hover:underline flex items-center gap-1"
                >
                  <span>Chat directly on WhatsApp</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
                <a
                  href={`https://wa.me/97477315415?text=Hello%20NasBaladna,%20I%20am%20inquiring%20about%20${encodeURIComponent(selectedProduct.name)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#25D366] font-bold hover:underline text-[11px]"
                >
                  Open WhatsApp (+974 77315415)
                </a>
              </div>
            </div>
          )}


          {/* Botanical / Origin Description matching IMG_5615 */}
          <div className="space-y-3">
            <h2 className="text-base font-bold text-slate-900 font-['Outfit']">
              {selectedProduct.scientificName
                ? `${selectedProduct.name} (${selectedProduct.scientificName})`
                : selectedProduct.name}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {selectedProduct.description}
            </p>
          </div>

          {/* Key Benefits matching IMG_5615 */}
          <div className="space-y-2.5">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Key Benefits
            </h3>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-600">
              {selectedProduct.benefits.map((benefit, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2 shrink-0" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Storage Advice */}
          <div className="bg-emerald-50/60 border border-emerald-200/60 rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-emerald-900">
            <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Freshness Storage Guide: </span>
              <span>{selectedProduct.storageAdvice}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
