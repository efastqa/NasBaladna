import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import {
  X,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  MessageCircle,
  FileText,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import { OrderStatus } from '../types';

export const LiveOrderTracking: React.FC = () => {
  const {
    isTrackingOpen,
    setIsTrackingOpen,
    activeOrder,
    ordersHistory,
    setActiveOrder,
    formatPrice,
    showToast,
    addToCart,
    setIsWhatsAppOpen,
    ownerPhone,
  } = useStore();


  const [simulatedCalling, setSimulatedCalling] = useState(false);

  if (!isTrackingOpen) return null;

  // Use active order or latest order from history
  const order = activeOrder || ordersHistory[0];

  const handleCallCourier = () => {
    setSimulatedCalling(true);
    showToast(`Calling courier ${order?.courier.name} (${order?.courier.phone})...`);
    setTimeout(() => {
      setSimulatedCalling(false);
    }, 3500);
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  const handleReorder = () => {
    if (!order) return;
    order.items.forEach((item) => {
      addToCart(item.product, item.selectedWeight, item.quantity);
    });
    showToast('All items added back to basket for quick re-order!');
    setIsTrackingOpen(false);
  };

  const getStageNumber = (status: OrderStatus) => {
    switch (status) {
      case 'confirmed':
        return 1;
      case 'packing':
        return 2;
      case 'on_the_way':
        return 3;
      case 'delivered':
        return 4;
      default:
        return 1;
    }
  };

  const currentStage = order ? getStageNumber(order.status) : 1;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex justify-center items-start sm:items-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl sm:rounded-3xl shadow-2xl overflow-hidden min-h-screen sm:min-h-0 max-h-[96vh] flex flex-col my-auto border border-slate-200/60">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-emerald-800 text-white">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-xs flex items-center justify-center">
              <Truck className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold font-['Outfit']">
                Live Order Management & Tracking
              </h2>
              <p className="text-[11px] text-emerald-100">
                {order ? `Order #${order.orderNumber}` : 'Track Deliveries'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsTrackingOpen(false)}
            className="p-1.5 text-emerald-100 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="overflow-y-auto flex-1 p-5 sm:p-7 space-y-6">
          {!order ? (
            <div className="text-center py-12 space-y-3">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                <Package className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-slate-800 text-base">No active orders yet</h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Place an order for farm fresh produce to track harvest, packaging, and real-time courier route.
              </p>
            </div>
          ) : (
            <>
              {/* ETA & Status Banner */}
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50/50 border border-emerald-200/70 rounded-2xl p-4 sm:p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block mb-1">
                      Estimated Delivery Window
                    </span>
                    <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-['Outfit'] flex items-baseline gap-2">
                      <span>
                        {order.status === 'delivered'
                          ? 'Delivered'
                          : `Arriving in ~${order.estimatedMinutes} mins`}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Delivery slot: {order.deliverySlot}</span>
                    </p>
                  </div>

                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-600 text-white text-xs font-bold shadow-xs">
                    <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                    <span>
                      {order.status === 'confirmed' && 'Order Confirmed'}
                      {order.status === 'packing' && 'Packing at Cold Hub'}
                      {order.status === 'on_the_way' && 'Out for Delivery'}
                      {order.status === 'delivered' && 'Delivered'}
                    </span>
                  </span>
                </div>

                {/* Real-time Order Timeline */}
                <div className="mt-6 pt-5 border-t border-emerald-200/60">
                  <div className="grid grid-cols-4 relative text-center text-xs">
                    {/* Progress line */}
                    <div className="absolute top-3.5 left-[12%] right-[12%] h-1 bg-slate-200 -z-0">
                      <div
                        className="bg-emerald-600 h-full transition-all duration-700"
                        style={{
                          width: `${((currentStage - 1) / 3) * 100}%`,
                        }}
                      />
                    </div>

                    {/* Step 1 */}
                    <div className="flex flex-col items-center relative z-10">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs transition-colors ${
                          currentStage >= 1
                            ? 'bg-emerald-600 text-white ring-4 ring-emerald-100'
                            : 'bg-slate-200 text-slate-500'
                        }`}
                      >
                        ✓
                      </div>
                      <span className="font-bold text-slate-900 mt-2 text-[11px]">Paid & Synced</span>
                      <span className="text-[10px] text-slate-500 font-mono">{order.createdAt}</span>
                    </div>

                    {/* Step 2 */}
                    <div className="flex flex-col items-center relative z-10">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs transition-colors ${
                          currentStage >= 2
                            ? 'bg-emerald-600 text-white ring-4 ring-emerald-100'
                            : 'bg-slate-200 text-slate-500'
                        }`}
                      >
                        {currentStage >= 2 ? '✓' : '2'}
                      </div>
                      <span className="font-bold text-slate-900 mt-2 text-[11px]">Cold-Packed</span>
                      <span className="text-[10px] text-slate-500">Hub 4</span>
                    </div>

                    {/* Step 3 */}
                    <div className="flex flex-col items-center relative z-10">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs transition-colors ${
                          currentStage >= 3
                            ? 'bg-emerald-600 text-white ring-4 ring-emerald-100 animate-pulse'
                            : 'bg-slate-200 text-slate-500'
                        }`}
                      >
                        {currentStage >= 3 ? '✓' : '3'}
                      </div>
                      <span className="font-bold text-slate-900 mt-2 text-[11px]">On the Way</span>
                      <span className="text-[10px] text-slate-500">Live GPS</span>
                    </div>

                    {/* Step 4 */}
                    <div className="flex flex-col items-center relative z-10">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs transition-colors ${
                          currentStage >= 4
                            ? 'bg-emerald-600 text-white ring-4 ring-emerald-100'
                            : 'bg-slate-200 text-slate-500'
                        }`}
                      >
                        {currentStage >= 4 ? '✓' : '4'}
                      </div>
                      <span className="font-bold text-slate-900 mt-2 text-[11px]">Delivered</span>
                      <span className="text-[10px] text-slate-500">Doorstep</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Interactive Vector Route Map Simulation */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-900 relative">
                <div className="p-3 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between text-xs text-white">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span className="font-mono text-emerald-400">LIVE ROUTE TELEMETRY</span>
                  </div>
                  <span className="text-slate-400">{order.district}</span>
                </div>

                {/* Stylized SVG Map */}
                <div className="relative h-44 sm:h-52 w-full bg-[#0F172A] flex items-center justify-center overflow-hidden">
                  <svg
                    viewBox="0 0 600 240"
                    className="w-full h-full text-slate-800"
                    preserveAspectRatio="none"
                  >
                    {/* Grid lines */}
                    <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
                      <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#1E293B" strokeWidth="1" />
                    </pattern>
                    <rect width="600" height="240" fill="url(#grid)" />

                    {/* Stylized road network */}
                    <path
                      d="M 50 180 Q 150 160 220 120 T 380 90 T 520 60"
                      fill="none"
                      stroke="#334155"
                      strokeWidth="12"
                      strokeLinecap="round"
                    />
                    <path
                      d="M 50 180 Q 150 160 220 120 T 380 90 T 520 60"
                      fill="none"
                      stroke="#10B981"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeDasharray="6 4"
                    />

                    {/* Secondary roads */}
                    <path
                      d="M 120 40 L 220 120 L 260 220"
                      fill="none"
                      stroke="#1E293B"
                      strokeWidth="6"
                    />
                    <path
                      d="M 340 220 L 380 90 L 460 30"
                      fill="none"
                      stroke="#1E293B"
                      strokeWidth="6"
                    />

                    {/* Hub Marker */}
                    <g transform="translate(50, 180)">
                      <circle r="14" fill="#047857" opacity="0.3" />
                      <circle r="8" fill="#10B981" />
                      <text x="14" y="4" fill="#A7F3D0" fontSize="10" fontWeight="bold">
                        Central Cold Hub
                      </text>
                    </g>

                    {/* Destination Marker */}
                    <g transform="translate(520, 60)">
                      <circle r="14" fill="#EF4444" opacity="0.3" />
                      <circle r="8" fill="#EF4444" />
                      <text x="-95" y="4" fill="#FECACA" fontSize="10" fontWeight="bold">
                        Your Doorstep
                      </text>
                    </g>

                    {/* Moving Delivery Vehicle */}
                    <g
                      transform={
                        order.status === 'confirmed'
                          ? 'translate(60, 178)'
                          : order.status === 'packing'
                          ? 'translate(140, 155)'
                          : order.status === 'on_the_way'
                          ? 'translate(340, 95)'
                          : 'translate(520, 60)'
                      }
                      className="transition-transform duration-1000"
                    >
                      <circle r="16" fill="#10B981" opacity="0.4" className="animate-ping" />
                      <rect
                        x="-10"
                        y="-10"
                        width="20"
                        height="20"
                        rx="6"
                        fill="#FFFFFF"
                        stroke="#047857"
                        strokeWidth="2"
                      />
                      <circle cx="0" cy="0" r="4" fill="#047857" />
                    </g>
                  </svg>

                  {/* Destination overlay badge */}
                  <div className="absolute bottom-3 left-3 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800 text-[11px] text-slate-300 flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="truncate max-w-[200px] sm:max-w-xs">{order.address}</span>
                  </div>
                </div>
              </div>

              {/* Courier Profile Card */}
              {(() => {
                const driverInitials = order.courier.name
                  ? order.courier.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .substring(0, 2)
                      .toUpperCase()
                  : 'NB';
                const cleanDriverPhone = order.courier.phone.replace(/[^0-9]/g, '');
                const driverWhatsAppUrl = `https://wa.me/${cleanDriverPhone}?text=${encodeURIComponent(
                  `Hello ${order.courier.name}, I am contacting you regarding my NasBaladna delivery (Order #${order.orderNumber}) to ${order.address}.`
                )}`;

                return (
                  <div className="p-4 rounded-2xl border border-slate-200 bg-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xs">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center font-bold text-emerald-800 text-lg shadow-inner">
                        {driverInitials}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm">
                            {order.courier.name}
                          </span>
                          <span className="text-[11px] font-semibold text-amber-600 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                            ★ {order.courier.rating}
                          </span>
                        </div>
                        <span className="text-xs text-slate-500 block">{order.courier.vehicle}</span>
                        <div className="flex items-center gap-2 mt-0.5 text-[11px]">
                          <span className="font-mono text-slate-400">
                            Plate: {order.courier.plateNumber}
                          </span>
                          <span className="text-slate-300">·</span>
                          <span className="text-emerald-700 font-semibold flex items-center gap-1">
                            <MessageCircle className="w-3 h-3 text-emerald-600" />
                            {order.courier.phone}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <a
                        href={`tel:${cleanDriverPhone}`}
                        onClick={(e) => {
                          if (!navigator.userAgent.match(/Mobi/)) {
                            // On desktop, show dialed toast
                            handleCallCourier();
                          }
                        }}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all hover:scale-105 active:scale-95"
                      >
                        <Phone className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{simulatedCalling ? 'Dialing...' : 'Call Driver'}</span>
                      </a>

                      <a
                        href={driverWhatsAppUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#25D366] hover:bg-[#20bd5a] rounded-xl shadow-xs transition-all hover:scale-105 active:scale-95"
                      >
                        <MessageCircle className="w-3.5 h-3.5 fill-current" />
                        <span>WhatsApp Driver</span>
                      </a>
                    </div>
                  </div>
                );
              })()}

              {/* Order Items Summary */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Itemized Order Details ({order.items.length})
                  </span>
                  <span className="text-xs text-slate-500 font-mono">
                    Payment: {order.paymentMethod.toUpperCase()} (
                    {order.paymentStatus === 'paid' ? 'PAID' : 'DUE ON ARRIVAL'})
                  </span>
                </div>

                <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100">
                  {order.items.map((it, idx) => (
                    <div key={idx} className="p-3 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={it.product.image}
                          alt={it.product.name}
                          className="w-10 h-10 rounded-lg object-contain bg-slate-50 p-1"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <span className="font-bold text-slate-900 block">{it.product.name}</span>
                          <span className="text-slate-500 text-[11px]">
                            {it.selectedWeight} · Qty: {it.quantity}
                          </span>
                        </div>
                      </div>
                      <span className="font-mono font-bold text-slate-800">
                        {formatPrice(it.pricePerUnit * it.quantity)}
                      </span>
                    </div>
                  ))}

                    <div className="p-3 bg-slate-50 flex items-center justify-between text-xs font-bold text-slate-900">
                    <span>Total Paid</span>
                    <span className="text-sm font-mono text-emerald-800">
                      {formatPrice(order.total)}
                    </span>
                  </div>
                </div>

                <div className="text-center text-[11px] text-slate-500 py-1">
                  <span>Questions about your harvest delivery? Store Hotline: </span>
                  <a href={`tel:${ownerPhone}`} className="font-mono font-bold text-emerald-700 underline">
                    {ownerPhone} (77315415)
                  </a>
                </div>
              </div>

              {/* Action Buttons: Invoice & Re-order */}

              <div className="flex flex-col sm:flex-row gap-2.5 pt-2 border-t border-slate-100">
                <button
                  onClick={handlePrintReceipt}
                  className="flex-1 py-2.5 px-4 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors flex items-center justify-center gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5 text-slate-500" />
                  <span>Download / Print Receipt</span>
                </button>

                <button
                  onClick={handleReorder}
                  className="flex-1 py-2.5 px-4 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl hover:bg-emerald-100 transition-colors flex items-center justify-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Re-order Same Basket</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
