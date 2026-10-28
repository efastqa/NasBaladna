import React, { useState, useRef } from 'react';
import { Order, CartItem } from '../types';
import {
  Printer,
  X,
  Check,
  CheckCircle2,
  Package,
  Clock,
  MapPin,
  Phone,
  User,
  ShoppingBag,
  ExternalLink,
  ChefHat,
  Tag,
  AlertCircle,
  Truck,
  Sparkles,
} from 'lucide-react';
import { NasBaladnaLogo } from './NasBaladnaLogo';

interface ShopPickSlipModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  formatPrice: (amount: number) => string;
  pickedItemsMap: Record<string, boolean>;
  onToggleItemPicked: (itemKey: string) => void;
  onMarkAllPicked: () => void;
  onAdvanceStatus?: (status: 'packing' | 'on_the_way') => void;
}

export const getDepartmentInfo = (category?: string) => {
  const cat = (category || '').toLowerCase();
  if (cat.includes('dairy')) return { name: 'Chilled Dairy Cooler (4°C)', color: 'bg-blue-950 text-blue-300 border-blue-800', icon: '🥛' };
  if (cat.includes('juice')) return { name: 'Cold Juices Fridge (2°C)', color: 'bg-amber-950 text-amber-300 border-amber-800', icon: '🧃' };
  if (cat.includes('bakery')) return { name: 'Artisan Bakery Rack', color: 'bg-yellow-950 text-yellow-300 border-yellow-800', icon: '🥖' };
  if (cat.includes('fruit')) return { name: 'Fresh Fruits Display', color: 'bg-rose-950 text-rose-300 border-rose-800', icon: '🍎' };
  if (cat.includes('veg') || cat.includes('herb')) return { name: 'Produce Stand & Greenery', color: 'bg-emerald-950 text-emerald-300 border-emerald-800', icon: '🥬' };
  if (cat.includes('poultry') || cat.includes('egg')) return { name: 'Poultry & Eggs Chiller', color: 'bg-orange-950 text-orange-300 border-orange-800', icon: '🥚' };
  if (cat.includes('date') || cat.includes('nut')) return { name: 'Dates & Roastery Bar', color: 'bg-amber-950 text-amber-300 border-amber-800', icon: '🌴' };
  if (cat.includes('honey') || cat.includes('oil')) return { name: 'Honey & Artisan Oils', color: 'bg-amber-950 text-amber-300 border-amber-800', icon: '🍯' };
  if (cat.includes('expir')) return { name: 'Clearance Deal Station', color: 'bg-rose-950 text-rose-300 border-rose-800', icon: '⚡' };
  return { name: 'General Grocery Aisle', color: 'bg-slate-900 text-slate-300 border-slate-700', icon: '📦' };
};

export const ShopPickSlipModal: React.FC<ShopPickSlipModalProps> = ({
  order,
  isOpen,
  onClose,
  formatPrice,
  pickedItemsMap,
  onToggleItemPicked,
  onMarkAllPicked,
  onAdvanceStatus,
}) => {
  const [printStatus, setPrintStatus] = useState<string | null>(null);
  const printableRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !order) return null;

  const totalItemsCount = order.items.reduce((sum, it) => sum + (it.quantity || 1), 0);
  const pickedCount = order.items.filter((it, idx) => {
    const key = `${it.productId || it.product?.id || idx}-${it.selectedWeight || 'std'}`;
    return !!pickedItemsMap[key];
  }).length;
  const isAllPicked = order.items.length > 0 && pickedCount === order.items.length;
  const pickProgressPercent = Math.round((pickedCount / (order.items.length || 1)) * 100);

  const handlePrint = () => {
    try {
      setPrintStatus('Opening kitchen printer...');
      window.print();
      setTimeout(() => setPrintStatus(null), 2000);
    } catch {
      setPrintStatus('Print dialog error');
      setTimeout(() => setPrintStatus(null), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh]">
        {/* MODAL HEADER */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950 border-b border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <ChefHat className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-emerald-500 text-slate-950 text-[10px] font-black uppercase tracking-wider">
                  SHOP PICKING SLIP
                </span>
                <span className="text-xs font-mono text-emerald-400 font-bold">
                  Order #{order.orderNumber}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white mt-0.5">
                Kitchen & Store Assembly Ticket
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
              title="Print shop picking ticket"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Print Ticket</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PROGRESS BANNER */}
        <div className="px-5 py-3 bg-slate-950/80 border-b border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-300 font-medium">
              Picking Progress:
            </span>
            <span className="text-xs font-bold font-mono text-emerald-400">
              {pickedCount} of {order.items.length} items picked ({pickProgressPercent}%)
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              · {totalItemsCount} total physical units
            </span>
          </div>

          <div className="flex items-center gap-2">
            {!isAllPicked ? (
              <button
                type="button"
                onClick={onMarkAllPicked}
                className="px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 font-semibold transition-colors flex items-center gap-1"
              >
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Mark All Picked</span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>All Items Gathered!</span>
                </span>
                {onAdvanceStatus && order.status !== 'on_the_way' && order.status !== 'delivered' && (
                  <button
                    type="button"
                    onClick={() => onAdvanceStatus('on_the_way')}
                    className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-sm transition-all flex items-center gap-1"
                  >
                    <Truck className="w-3.5 h-3.5" />
                    <span>Advance to On Route</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ORDER INFO BAR */}
        <div className="p-4 bg-slate-950/50 border-b border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs shrink-0">
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Customer & Phone</span>
            <span className="text-white font-bold block">{order.customerName}</span>
            <a href={`tel:${order.phone}`} className="text-emerald-400 font-mono text-xs hover:underline">
              {order.phone}
            </a>
          </div>

          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Delivery Slot & Area</span>
            <span className="text-white font-bold block">{order.deliverySlot}</span>
            <span className="text-slate-300 block truncate">{order.district} · {order.address}</span>
            {order.bluePlateInfo && (
              <span className="text-sky-400 font-mono text-[10px] block mt-0.5">
                Blue Plate: Zone {order.bluePlateInfo.zone} · St {order.bluePlateInfo.street} · Bldg {order.bluePlateInfo.building}
              </span>
            )}
          </div>

          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Payment & Notes</span>
            <span className="text-emerald-400 font-mono font-bold block">
              {formatPrice(order.total)} · {(order.paymentMethod || 'cod').toUpperCase()} ({order.paymentStatus === 'paid' ? 'PAID' : 'DUE ON ARRIVAL'})
            </span>
            {order.deliveryNotes ? (
              <span className="text-amber-300 text-[11px] block truncate">
                📝 {order.deliveryNotes}
              </span>
            ) : (
              <span className="text-slate-500 text-[11px] block italic">No special delivery notes</span>
            )}
          </div>
        </div>

        {/* PRINTABLE / VISUAL ITEM LIST */}
        <div
          ref={printableRef}
          id="printable-pick-slip"
          className="p-4 sm:p-5 overflow-y-auto space-y-3 flex-1"
        >
          <div className="text-xs text-slate-400 font-bold uppercase tracking-wider flex items-center justify-between pb-1">
            <span>Items to Gather from Shelves ({order.items.length})</span>
            <span className="text-[11px] text-slate-500 font-normal">Tap item or checkbox when put in box</span>
          </div>

          <div className="space-y-2.5">
            {order.items.map((item: CartItem, idx: number) => {
              const itemKey = `${item.productId || item.product?.id || idx}-${item.selectedWeight || 'std'}`;
              const isPicked = !!pickedItemsMap[itemKey];
              const dept = getDepartmentInfo(item.product?.category);
              const qty = item.quantity || 1;
              const unitPrice = item.pricePerUnit || item.product?.basePrice || 0;
              const lineTotal = unitPrice * qty;

              return (
                <div
                  key={itemKey}
                  onClick={() => onToggleItemPicked(itemKey)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer select-none flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isPicked
                      ? 'bg-emerald-950/30 border-emerald-600/60 ring-1 ring-emerald-500/30 opacity-90'
                      : 'bg-slate-950/80 border-slate-800 hover:border-slate-700 shadow-sm'
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0 flex-1">
                    {/* Big Interactive Checkbox */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleItemPicked(itemKey);
                      }}
                      className={`w-8 h-8 rounded-xl border flex items-center justify-center shrink-0 transition-transform active:scale-90 ${
                        isPicked
                          ? 'bg-emerald-500 border-emerald-400 text-slate-950 shadow-md shadow-emerald-950'
                          : 'bg-slate-900 border-slate-700 text-transparent hover:border-emerald-500'
                      }`}
                    >
                      <Check className="w-5 h-5 stroke-[3]" />
                    </button>

                    {/* Product Photo Thumbnail */}
                    <div className="w-14 h-14 rounded-xl bg-slate-900 border border-slate-800 overflow-hidden shrink-0 flex items-center justify-center relative">
                      {item.product?.image ? (
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.currentTarget as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <Package className="w-6 h-6 text-slate-600" />
                      )}
                      {isPicked && (
                        <div className="absolute inset-0 bg-emerald-950/60 flex items-center justify-center text-emerald-300 font-bold text-xs">
                          <Check className="w-6 h-6 stroke-[3]" />
                        </div>
                      )}
                    </div>

                    {/* Product Name, SKU, Department */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4
                          className={`text-sm font-bold truncate ${
                            isPicked ? 'text-slate-300 line-through' : 'text-white'
                          }`}
                        >
                          {item.product?.name || (item as any).name || 'Farm Product'}
                        </h4>
                        {item.product?.sku && (
                          <span className="text-[10px] font-mono text-slate-500 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                            {item.product.sku}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        {/* Selected Unit / Weight */}
                        <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-800/80">
                          {item.selectedWeight || item.product?.baseWeight || 'Standard Unit'}
                        </span>

                        {/* Department location badge */}
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-medium border flex items-center gap-1 ${dept.color}`}>
                          <span>{dept.icon}</span>
                          <span>{dept.name}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* HIGH-CONTRAST QUANTITY & PRICE */}
                  <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                    <div className="text-left sm:text-right">
                      <span className="text-[10px] text-slate-400 block font-mono">
                        {formatPrice(unitPrice)} ea
                      </span>
                      <span className="text-xs font-bold font-mono text-emerald-400 block">
                        {formatPrice(lineTotal)}
                      </span>
                    </div>

                    {/* EXTRA LARGE QUANTITY BADGE - IMPOSSIBLE TO MISS */}
                    <div className="flex flex-col items-center">
                      <span className="text-[9px] uppercase font-bold text-slate-400 mb-0.5">Quantity</span>
                      <div
                        className={`px-3.5 py-1.5 rounded-xl font-black text-sm font-mono flex items-center justify-center shadow-md ${
                          qty > 1
                            ? 'bg-amber-400 text-slate-950 ring-2 ring-amber-300'
                            : 'bg-emerald-500 text-slate-950'
                        }`}
                      >
                        x{qty} QTY
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* FOOTER */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-400 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>
              {isAllPicked
                ? 'All items checked off and placed in delivery box.'
                : 'Check each item as you pack it into the order box.'}
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={handlePrint}
              className="flex-1 sm:flex-none px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition-colors flex items-center justify-center gap-1.5"
            >
              <Printer className="w-4 h-4" />
              <span>Print Slip</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md transition-colors"
            >
              Done / Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
