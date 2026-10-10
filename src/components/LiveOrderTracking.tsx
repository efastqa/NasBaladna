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
  Send,
  BellRing,
} from 'lucide-react';
import { OrderStatus } from '../types';
import { GoogleDeliveryMap } from './GoogleDeliveryMap';
import { NotificationService } from '../services/notifications';

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
      <div className="bg-white w-full max-w-2xl sm:rounded-3xl shadow-2xl overflow-hidden min-h-[100dvh] sm:min-h-0 sm:max-h-[92dvh] flex flex-col my-auto border border-slate-200/60">
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
        <div className="overflow-y-auto flex-1 p-4 sm:p-7 space-y-6 pb-[max(1.5rem,calc(env(safe-area-inset-bottom)+1.5rem))]">
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

              {/* Live Google Maps Delivery Telemetry */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wider">
                    <MapPin className="w-4 h-4 text-emerald-600" />
                    <span>Live GPS Delivery Telemetry (Google Maps)</span>
                  </div>
                  <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Google Maps Platform Active
                  </span>
                </div>

                <GoogleDeliveryMap
                  order={order}
                  apiKey={
                    import.meta.env.VITE_GOOGLE_MAPS_API_KEY ||
                    'AIzaSyDUSGKV8Bx619Wm4mB_u34hf8XQta9PGbY'
                  }
                />
              </div>

              {/* Automated WhatsApp & SMS Notifications Action Bar */}
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50/70 border border-emerald-200/80 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BellRing className="w-4 h-4 text-emerald-700" />
                    <span className="text-xs font-bold text-emerald-950 uppercase tracking-wider">
                      Automated Order Notifications
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100/90 px-2 py-0.5 rounded-full">
                    Auto-Dispatched to {order.phone}
                  </span>
                </div>

                <p className="text-[11px] text-slate-600">
                  Instant receipt and live courier telemetry updates sent straight to the customer's phone via WhatsApp and SMS text message.
                </p>

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <a
                    href={NotificationService.getWhatsAppUrl(
                      order.phone,
                      NotificationService.buildWhatsAppMessage(order)
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 min-w-[140px] flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-[#25D366] hover:bg-[#20bd5a] rounded-xl shadow-xs transition-transform active:scale-95"
                  >
                    <MessageCircle className="w-3.5 h-3.5 fill-current" />
                    <span>Open in WhatsApp</span>
                  </a>

                  <a
                    href={NotificationService.getSmsUrl(
                      order.phone,
                      NotificationService.buildSmsMessage(order)
                    )}
                    className="flex-1 min-w-[140px] flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-800 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl shadow-2xs transition-transform active:scale-95"
                  >
                    <Send className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Send SMS Message</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => {
                      NotificationService.sendAutomatedNotification(order, 'whatsapp', order.status);
                      NotificationService.sendAutomatedNotification(order, 'sms', order.status);
                      showToast(`Test automated alert sent to ${order.phone} via WhatsApp & SMS!`);
                    }}
                    className="px-3 py-2 text-xs font-semibold text-emerald-800 bg-emerald-100/80 hover:bg-emerald-200/80 rounded-xl transition-colors"
                  >
                    Resend Alert Now
                  </button>
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
