import React from 'react';
import { useStore } from '../context/StoreContext';
import { X, Trash2, ShoppingBag, ArrowRight, ShieldCheck, Truck } from 'lucide-react';

export const CartDrawer: React.FC = () => {
  const {
    isCartOpen,
    setIsCartOpen,
    cart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    cartTotal,
    formatPrice,
    setIsCheckoutOpen,
  } = useStore();

  if (!isCartOpen) return null;

  const freeDeliveryThreshold = 50;
  const isFreeDelivery = cartTotal >= freeDeliveryThreshold;
  const neededForFreeDelivery = Math.max(0, freeDeliveryThreshold - cartTotal);
  const deliveryFee = cart.length === 0 ? 0 : isFreeDelivery ? 0 : 5.0;
  const finalTotal = cartTotal + deliveryFee;

  const handleCheckoutClick = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col border-l border-slate-200/80">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-emerald-700" />
            <h2 className="text-lg font-bold text-slate-900 font-['Outfit']">Your Fresh Bag</h2>
            <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full">
              {cart.reduce((s, i) => s + i.quantity, 0)} items
            </span>
          </div>

          <button
            onClick={() => setIsCartOpen(false)}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="Close cart"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Delivery Bar */}
        <div className="bg-emerald-50/70 border-b border-emerald-100/80 px-4 py-2.5">
          {isFreeDelivery ? (
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800">
              <Truck className="w-4 h-4 text-emerald-600" />
              <span>You've unlocked FREE Express Cold-Chain Delivery!</span>
            </div>
          ) : (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs font-medium text-emerald-900">
                <span>Add {formatPrice(neededForFreeDelivery)} more for Free Delivery</span>
                <span>{Math.round((cartTotal / freeDeliveryThreshold) * 100)}%</span>
              </div>
              <div className="w-full bg-emerald-200/60 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-600 h-full rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, (cartTotal / freeDeliveryThreshold) * 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Item list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-3 text-slate-400">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-slate-800 text-base mb-1">Your bag is empty</h3>
              <p className="text-xs text-slate-500 max-w-xs mb-4">
                Explore our fresh morning harvest of vegetables, fruits, and dairy to get started.
              </p>
              <button
                onClick={() => setIsCartOpen(false)}
                className="px-4 py-2 bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs hover:bg-emerald-800"
              >
                Browse Farm Produce
              </button>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 p-3 rounded-2xl border border-slate-100 bg-white hover:border-slate-200 shadow-2xs"
              >
                {/* Thumbnail */}
                <div className="w-16 h-16 rounded-xl bg-slate-50 overflow-hidden flex items-center justify-center shrink-0 border border-slate-100">
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-full h-full object-contain p-1"
                    referrerPolicy="no-referrer"
                  />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-slate-900 text-xs sm:text-sm truncate">
                    {item.product.name}
                  </h4>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                    <span className="font-semibold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">
                      {item.selectedWeight}
                    </span>
                    <span>·</span>
                    <span className="font-mono">{formatPrice(item.pricePerUnit)}/ea</span>
                  </div>

                  {/* Quantity Stepper */}
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50">
                      <button
                        onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                        className="px-2 py-0.5 text-xs font-bold text-slate-700 hover:text-slate-900"
                      >
                        -
                      </button>
                      <span className="px-2 text-xs font-mono font-bold text-slate-900">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                        className="px-2 py-0.5 text-xs font-bold text-slate-700 hover:text-slate-900"
                      >
                        +
                      </button>
                    </div>

                    <span className="text-xs font-bold text-slate-900 font-mono ml-auto">
                      {formatPrice(item.pricePerUnit * item.quantity)}
                    </span>
                  </div>
                </div>

                {/* Remove button */}
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors"
                  aria-label="Remove item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer Summary & Checkout */}
        {cart.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/50 space-y-3">
            <div className="space-y-1.5 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Produce Subtotal</span>
                <span className="font-mono font-medium text-slate-900">
                  {formatPrice(cartTotal)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Express Cold Delivery</span>
                <span className="font-mono font-medium text-slate-900">
                  {deliveryFee === 0 ? (
                    <span className="text-emerald-700 font-bold">FREE</span>
                  ) : (
                    formatPrice(deliveryFee)
                  )}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-200 text-sm font-bold text-slate-900">
                <span>Total Amount</span>
                <span className="font-mono text-base text-emerald-800">
                  {formatPrice(finalTotal)}
                </span>
              </div>
            </div>

            <button
              onClick={handleCheckoutClick}
              className="w-full bg-[#059669] hover:bg-[#047857] text-white py-3.5 px-4 rounded-2xl font-bold text-sm tracking-wide shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <span>Proceed to Secure Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-center gap-2 text-[10px] text-slate-500 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>PCI-DSS Compliant & 256-Bit SSL Encrypted Gateway</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
