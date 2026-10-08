import React from 'react';
import { Product } from '../types';
import { useStore } from '../context/StoreContext';
import { Plus, Check, AlertCircle, Zap, Clock } from 'lucide-react';
import { motion } from 'motion/react';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { setSelectedProduct, addToCart, formatPrice, cart, customerTier } = useStore();

  const isLowStock = product.stock > 0 && product.stock <= 10;
  const isOutOfStock = product.stock === 0;

  const isBusiness = customerTier === 'business';
  const effectivePrice = isBusiness
    ? product.wholesalePrice || product.basePrice * 4.5
    : product.basePrice;
  const effectiveWeight = isBusiness
    ? product.wholesaleUnit || '5kg Crate'
    : product.baseWeight;

  // Find if already in cart
  const inCartQuantity = cart
    .filter((item) => item.productId === product.id)
    .reduce((sum, item) => sum + item.quantity, 0);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isOutOfStock) {
      addToCart(product, effectiveWeight, 1);
    }
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      onClick={() => setSelectedProduct(product)}
      className="group bg-white rounded-2xl border border-slate-200/80 p-3 sm:p-4 flex flex-col justify-between transition-all duration-200 hover:shadow-lg hover:border-emerald-300 cursor-pointer relative"
    >
      {/* Top badges */}
      <div className="flex items-center justify-between mb-2 gap-1">
        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider truncate max-w-[140px]">
          {product.brand}
        </span>
        <div className="flex items-center gap-1 shrink-0">
          {(product.isNearExpiry || product.category === 'near_expiry') && (
            <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200 flex items-center gap-1 shadow-2xs animate-pulse">
              <Zap className="w-2.5 h-2.5 fill-rose-500 text-rose-500" />
              <span>{product.discountPercent ? `${product.discountPercent}% OFF` : 'Deal'}</span>
            </span>
          )}
          {product.organic && (
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
              Organic
            </span>
          )}
        </div>
      </div>

      {/* Image Showcase */}
      <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-slate-50 flex items-center justify-center mb-3">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-300"
          referrerPolicy="no-referrer"
          loading="lazy"
        />

        {/* Real-time stock status indicator */}
        <div className="absolute bottom-2 left-2 right-2">
          {isOutOfStock ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 text-[10px] font-semibold border border-rose-200">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              <span>Sold out for today</span>
            </span>
          ) : isLowStock ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 text-[10px] font-semibold border border-amber-200 shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              <span>Only {product.stock} left in stock</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50/90 text-emerald-800 text-[10px] font-medium border border-emerald-200/60 backdrop-blur-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>In stock ({product.stock} units)</span>
            </span>
          )}
        </div>
      </div>

      {/* Product Details */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-snug group-hover:text-emerald-700 transition-colors line-clamp-1">
            {product.name}
          </h3>
          {product.scientificName && (
            <p className="text-[11px] italic text-slate-500 mb-1 truncate">
              {product.scientificName}
            </p>
          )}

          {product.expiryDate && (
            <div className="flex items-center gap-1 text-[11px] font-semibold text-rose-600 mb-1.5">
              <Clock className="w-3 h-3 shrink-0" />
              <span>{product.expiryDate}</span>
            </div>
          )}

          <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
            <span className={isBusiness ? 'font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded' : ''}>
              {isBusiness ? `Bulk: ${effectiveWeight}` : `Pack: ${product.baseWeight}`}
            </span>
            <span aria-hidden="true">·</span>
            <span className="text-[11px] font-mono">{product.sku}</span>
          </div>
        </div>

        {/* Pricing & CTA */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 mt-2">
          <div>
            <span className="text-xs text-slate-500 block leading-none">
              {isBusiness ? 'B2B Wholesale' : product.isNearExpiry ? 'Deal Price' : 'Starting from'}
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className={`text-base sm:text-lg font-bold font-mono ${isBusiness ? 'text-emerald-700' : product.isNearExpiry ? 'text-rose-600' : 'text-slate-900'}`}>
                {formatPrice(effectivePrice)}
              </span>
              {!isBusiness && product.originalPrice && (
                <span className="text-xs text-slate-400 line-through font-mono">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
            </div>
          </div>

          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={handleQuickAdd}
            disabled={isOutOfStock}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              isOutOfStock
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : inCartQuantity > 0
                ? 'bg-emerald-700 text-white shadow-sm hover:bg-emerald-800'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm hover:shadow'
            }`}
          >
            {inCartQuantity > 0 ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>{inCartQuantity} in bag</span>
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </>
            )}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};
