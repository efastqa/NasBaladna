import React, { useState } from 'react';
import {
  X,
  Truck,
  MapPin,
  ExternalLink,
  Phone,
  MessageCircle,
  FileSpreadsheet,
  Download,
  Share2,
  CheckCircle2,
  Clock,
  Zap,
  Leaf,
  Navigation,
  Printer,
  Compass,
  Check,
  Copy,
  AlertCircle,
  SlidersHorizontal,
} from 'lucide-react';
import { Order, OrderStatus } from '../types';
import { DeliveryDriverConfig } from '../types';
import { getDistrictCoordinates } from '../constants/locations';

interface DriverManifestModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
  updateOrderStatus: (id: string, status: OrderStatus) => void;
  formatPrice: (price: number) => string;
  driverInfo: DeliveryDriverConfig;
  showToast: (msg: string) => void;
}

export const DriverManifestModal: React.FC<DriverManifestModalProps> = ({
  isOpen,
  onClose,
  orders,
  updateOrderStatus,
  formatPrice,
  driverInfo,
  showToast,
}) => {
  const [statusFilter, setStatusFilter] = useState<'all' | OrderStatus>('all');
  const [districtFilter, setDistrictFilter] = useState<string>('all');
  const [copiedStopId, setCopiedStopId] = useState<string | null>(null);
  const [isCopiedRoute, setIsCopiedRoute] = useState(false);

  if (!isOpen) return null;

  // Filter orders
  const filteredOrders = orders.filter((o) => {
    if (statusFilter !== 'all' && o.status !== statusFilter) return false;
    if (districtFilter !== 'all' && o.district !== districtFilter) return false;
    return true;
  });

  // Extract unique districts
  const districts = Array.from(new Set(orders.map((o) => o.district)));

  // Generate Google Maps navigation link
  const getGoogleMapsDirUrl = (order: Order) => {
    if (order.coordinates?.lat && order.coordinates?.lng) {
      return `https://www.google.com/maps/dir/?api=1&destination=${order.coordinates.lat},${order.coordinates.lng}`;
    }
    const defaultCoords = getDistrictCoordinates(order.district);
    return `https://www.google.com/maps/dir/?api=1&destination=${defaultCoords.lat},${defaultCoords.lng}`;
  };

  // Generate Waze navigation link
  const getWazeUrl = (order: Order) => {
    const coords = order.coordinates || getDistrictCoordinates(order.district);
    return `https://waze.com/ul?ll=${coords.lat},${coords.lng}&navigate=yes`;
  };

  // Export Driver Manifest CSV
  const handleExportManifestCsv = () => {
    const headers = [
      'StopSequence',
      'OrderNumber',
      'CustomerName',
      'Phone',
      'DistrictZone',
      'StreetAddress',
      'Latitude',
      'Longitude',
      'GoogleMapsLink',
      'DeliverySlot',
      'ServiceLevel',
      'DropoffPreference',
      'DoorbellNotice',
      'PaymentMethod',
      'PaymentStatus',
      'TotalPayable',
      'DeliveryNotes',
      'ItemsChecklist',
      'CurrentStatus',
    ];

    const rows = filteredOrders.map((ord, idx) => {
      const coords = ord.coordinates || getDistrictCoordinates(ord.district);
      const navUrl = getGoogleMapsDirUrl(ord);
      const itemsList = ord.items
        .map((i) => `${i.product.name} (${i.selectedWeight}) x${i.quantity}`)
        .join('; ');

      const serviceLevel = ord.isExpress || ord.serviceType === 'express'
        ? 'Express 60-Min'
        : ord.serviceType === 'eco_green'
        ? 'Eco-Green Consolidated'
        : 'Scheduled Standard';

      const dropoff = ord.dropoffPreference === 'doorstep'
        ? 'Doorstep Drop'
        : ord.dropoffPreference === 'security'
        ? 'Security / Concierge'
        : 'Hand to Customer';

      const doorbell = ord.doorbellPreference === 'silent' ? 'Silent Delivery (No Bell)' : 'Ring Bell / Knock';

      const payment = ord.paymentMethod === 'cod' ? `COD (${ord.total} QAR)` : `Prepaid Online (${ord.total} QAR)`;

      return [
        idx + 1,
        `"${ord.orderNumber}"`,
        `"${ord.customerName.replace(/"/g, '""')}"`,
        `"${ord.phone}"`,
        `"${ord.district.replace(/"/g, '""')}"`,
        `"${ord.address.replace(/"/g, '""')}"`,
        coords.lat,
        coords.lng,
        `"${navUrl}"`,
        `"${ord.deliverySlot.replace(/"/g, '""')}"`,
        `"${serviceLevel}"`,
        `"${dropoff}"`,
        `"${doorbell}"`,
        `"${ord.paymentMethod}"`,
        `"${payment}"`,
        ord.total,
        `"${(ord.deliveryNotes || '').replace(/"/g, '""')}"`,
        `"${itemsList.replace(/"/g, '""')}"`,
        `"${ord.status}"`,
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `nasbaladna_driver_manifest_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast(`Exported ${filteredOrders.length} route stops to Driver Manifest CSV!`);
  };

  // Build full WhatsApp Dispatch Message for the Fleet Driver
  const buildDriverWhatsAppMessage = () => {
    const today = new Date().toLocaleDateString('en-GB', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

    let msg = `🚚 *NASBALADNA COLD-CHAIN ROUTE MANIFEST*\n`;
    msg += `📅 Date: ${today}\n`;
    msg += `👤 Driver: ${driverInfo.name} (${driverInfo.phone})\n`;
    msg += `🚐 Vehicle: ${driverInfo.vehicle} | Plate: ${driverInfo.plateNumber}\n`;
    msg += `📦 Total Stops: ${filteredOrders.length}\n`;
    msg += `━━━━━━━━━━━━━━━━━━━━━\n\n`;

    filteredOrders.forEach((ord, idx) => {
      const isExpress = ord.isExpress || ord.serviceType === 'express';
      const coords = ord.coordinates || getDistrictCoordinates(ord.district);
      const navUrl = `https://www.google.com/maps/dir/?api=1&destination=${coords.lat},${coords.lng}`;

      msg += `📍 *STOP #${idx + 1}: ${ord.orderNumber}* ${isExpress ? '⚡ [EXPRESS PRIORITY]' : ''}\n`;
      msg += `👤 Recipient: ${ord.customerName}\n`;
      msg += `📞 Phone: ${ord.phone}\n`;
      msg += `🏠 Area: ${ord.district}\n`;
      msg += `📍 Address: ${ord.address}\n`;
      if (ord.deliveryNotes) {
        msg += `📝 Notes: ${ord.deliveryNotes}\n`;
      }
      if (ord.dropoffPreference === 'doorstep') {
        msg += `🚪 Preference: Leave at Doorstep\n`;
      } else if (ord.dropoffPreference === 'security') {
        msg += `🏢 Preference: Leave with Security\n`;
      }
      if (ord.doorbellPreference === 'silent') {
        msg += `🔕 Do NOT ring bell (call/text WhatsApp only)\n`;
      }
      msg += `⏰ Slot: ${ord.deliverySlot}\n`;
      msg += `💵 Total: ${ord.total} QAR (${ord.paymentMethod === 'cod' ? '⚠️ CASH ON DELIVERY' : '✅ PAID ONLINE'})\n`;
      msg += `🗺️ Turn-by-Turn GPS Navigation:\n${navUrl}\n`;
      msg += `─────────────────────\n\n`;
    });

    msg += `🌿 NasBaladna Farm Fresh Cold-Chain Logistics Hub\n`;
    msg += `Keep van temperature chilled at 2°C - 4°C.`;
    return msg;
  };

  const handleDispatchWhatsApp = () => {
    const message = buildDriverWhatsAppMessage();
    const cleanPhone = (driverInfo.dispatchWhatsApp || driverInfo.phone).replace(/[^0-9]/g, '');
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    showToast(`Opened WhatsApp with complete ${filteredOrders.length}-stop driver route manifest!`);
  };

  const handleCopyManifestText = () => {
    const message = buildDriverWhatsAppMessage();
    navigator.clipboard.writeText(message);
    setIsCopiedRoute(true);
    showToast('Copied full driver route manifest to clipboard!');
    setTimeout(() => setIsCopiedRoute(false), 2500);
  };

  const handleCopySingleStop = (order: Order, index: number) => {
    const coords = order.coordinates || getDistrictCoordinates(order.district);
    const navUrl = `https://www.google.com/maps/dir/?api=1&destination=${coords.lat},${coords.lng}`;
    const text = `📍 Stop #${index + 1}: ${order.orderNumber}\n${order.customerName} (${order.phone})\n${order.district} - ${order.address}\nNavigate: ${navUrl}`;
    navigator.clipboard.writeText(text);
    setCopiedStopId(order.id);
    showToast(`Copied Stop #${index + 1} details!`);
    setTimeout(() => setCopiedStopId(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex justify-center items-start sm:items-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[94vh]">
        {/* Header Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold font-['Outfit'] text-white">
                  Driver Delivery Manifest & Fleet Dispatch Hub
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-mono font-bold">
                  {filteredOrders.length} Stops
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Assigned Driver: <strong className="text-white">{driverInfo.name}</strong> · {driverInfo.vehicle} ({driverInfo.plateNumber})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Export CSV */}
            <button
              type="button"
              onClick={handleExportManifestCsv}
              className="px-3 py-1.5 bg-emerald-900/60 hover:bg-emerald-800 text-emerald-200 border border-emerald-700/60 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
              title="Download clean CSV of driver run sheet"
            >
              <Download className="w-3.5 h-3.5 text-emerald-300" />
              <span>Export CSV</span>
            </button>

            {/* Dispatch to Driver WhatsApp */}
            <button
              type="button"
              onClick={handleDispatchWhatsApp}
              className="px-3 py-1.5 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
              title="Send run sheet to driver via WhatsApp"
            >
              <MessageCircle className="w-3.5 h-3.5 fill-current" />
              <span>WhatsApp Driver</span>
            </button>

            {/* Copy Full Route */}
            <button
              type="button"
              onClick={handleCopyManifestText}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors"
              title="Copy route text to clipboard"
            >
              {isCopiedRoute ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{isCopiedRoute ? 'Copied' : 'Copy Text'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors ml-1"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filters and Summary Bar */}
        <div className="p-3 bg-slate-950/60 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-slate-400 flex items-center gap-1">
              <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-400" />
              <span>Status:</span>
            </span>
            <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800">
              {(['all', 'confirmed', 'packing', 'on_the_way', 'delivered'] as const).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1 rounded text-[11px] font-semibold capitalize transition-colors ${
                    statusFilter === st
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {st === 'all' ? 'All Stops' : st === 'on_the_way' ? 'On Route' : st}
                </button>
              ))}
            </div>

            {districts.length > 1 && (
              <div className="flex items-center gap-1.5 ml-2">
                <span className="text-slate-400">Zone:</span>
                <select
                  value={districtFilter}
                  onChange={(e) => setDistrictFilter(e.target.value)}
                  className="bg-slate-900 text-slate-200 border border-slate-800 rounded-lg px-2 py-1 text-xs focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="all">All Qatar Districts ({orders.length})</option>
                  {districts.map((d) => (
                    <option key={d} value={d}>
                      {d} ({orders.filter((o) => o.district === d).length})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="text-slate-400 text-[11px] flex items-center gap-3">
            <span>
              Total Route Value:{' '}
              <strong className="text-emerald-400 font-mono font-bold">
                {formatPrice(filteredOrders.reduce((s, o) => s + o.total, 0))}
              </strong>
            </span>
            <span>·</span>
            <span>
              Express Stops:{' '}
              <strong className="text-amber-400 font-mono font-bold">
                {filteredOrders.filter((o) => o.isExpress || o.serviceType === 'express').length}
              </strong>
            </span>
          </div>
        </div>

        {/* Route Stops List */}
        <div className="overflow-y-auto flex-1 p-4 sm:p-5 space-y-3.5">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-sm">
              No orders matching the selected filter criteria.
            </div>
          ) : (
            filteredOrders.map((ord, idx) => {
              const coords = ord.coordinates || getDistrictCoordinates(ord.district);
              const navUrl = getGoogleMapsDirUrl(ord);
              const wazeUrl = getWazeUrl(ord);
              const isExpress = ord.isExpress || ord.serviceType === 'express';
              const isEco = ord.serviceType === 'eco_green';

              return (
                <div
                  key={ord.id}
                  className={`bg-slate-950 border rounded-2xl p-4 transition-all ${
                    isExpress
                      ? 'border-amber-500/40 ring-1 ring-amber-500/20 bg-gradient-to-r from-amber-950/20 via-slate-950 to-slate-950'
                      : ord.status === 'delivered'
                      ? 'border-slate-800/60 opacity-80'
                      : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                    {/* Left: Sequence and Info */}
                    <div className="flex items-start gap-3">
                      {/* Stop Sequence Badge */}
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm shadow-xs ${
                            ord.status === 'delivered'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                              : isExpress
                              ? 'bg-amber-500 text-slate-950'
                              : 'bg-emerald-600 text-white'
                          }`}
                        >
                          #{idx + 1}
                        </div>
                        <span className="text-[10px] text-slate-400 mt-1 font-mono">
                          Stop {idx + 1}
                        </span>
                      </div>

                      {/* Details */}
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-bold text-white text-sm">#{ord.orderNumber}</span>

                          {isExpress && (
                            <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold flex items-center gap-1">
                              <Zap className="w-3 h-3 fill-current" />
                              <span>EXPRESS 60-MIN</span>
                            </span>
                          )}

                          {isEco && (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold flex items-center gap-1">
                              <Leaf className="w-3 h-3" />
                              <span>ECO BATCH</span>
                            </span>
                          )}

                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono ${
                              ord.status === 'delivered'
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                : ord.status === 'on_the_way'
                                ? 'bg-sky-950 text-sky-300 border border-sky-800'
                                : 'bg-slate-800 text-slate-300'
                            }`}
                          >
                            {ord.status.replace('_', ' ')}
                          </span>

                          <span className="text-slate-400 text-xs">· Slot: {ord.deliverySlot}</span>
                        </div>

                        {/* Customer & Address Details */}
                        <div className="text-xs text-slate-300 flex flex-wrap items-center gap-x-3 gap-y-1">
                          <span className="font-semibold text-white">{ord.customerName}</span>
                          <span className="text-slate-500">·</span>
                          <a
                            href={`tel:${ord.phone}`}
                            className="text-emerald-400 hover:underline font-mono flex items-center gap-1"
                          >
                            <Phone className="w-3 h-3" />
                            <span>{ord.phone}</span>
                          </a>
                          <span className="text-slate-500">·</span>
                          <span className="text-emerald-300 font-medium flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-emerald-400 shrink-0" />
                            <span>{ord.district}</span>
                          </span>
                        </div>

                        {/* Exact Street Address */}
                        <div className="text-xs text-slate-300 bg-slate-900/80 p-2 rounded-xl border border-slate-800/80 flex items-start justify-between gap-2">
                          <div>
                            <span className="text-slate-400 font-semibold block text-[11px]">
                              Address / Building:
                            </span>
                            <span className="text-white font-medium">{ord.address}</span>
                            {ord.bluePlateInfo && (
                              <span className="block text-[11px] text-sky-400 font-mono mt-0.5">
                                Qatar Blue Plate: Zone {ord.bluePlateInfo.zone} · Street {ord.bluePlateInfo.street} · Building {ord.bluePlateInfo.building}
                              </span>
                            )}
                          </div>
                          {coords && (
                            <span className="text-[10px] font-mono text-slate-400 bg-slate-950 px-2 py-1 rounded shrink-0 border border-slate-800">
                              {coords.lat.toFixed(4)}° N, {coords.lng.toFixed(4)}° E
                            </span>
                          )}
                        </div>

                        {/* Drop-off Preferences & Notes */}
                        <div className="flex flex-wrap items-center gap-2 pt-0.5 text-[11px]">
                          {ord.dropoffPreference === 'doorstep' && (
                            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-200 border border-slate-700 font-medium">
                              🚪 Leave at Doorstep
                            </span>
                          )}
                          {ord.dropoffPreference === 'security' && (
                            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-200 border border-slate-700 font-medium">
                              🏢 Leave with Security / Reception
                            </span>
                          )}
                          {ord.doorbellPreference === 'silent' && (
                            <span className="px-2 py-0.5 rounded bg-rose-950/70 text-rose-300 border border-rose-800 font-medium">
                              🔕 Silent Drop (Do NOT ring bell)
                            </span>
                          )}
                          {ord.deliveryNotes && (
                            <span className="px-2 py-0.5 rounded bg-amber-950/60 text-amber-300 border border-amber-800 font-medium truncate max-w-md">
                              📝 Note: {ord.deliveryNotes}
                            </span>
                          )}
                        </div>

                        {/* Order Basket Summary */}
                        <div className="text-[11px] text-slate-400 pt-1">
                          <strong className="text-slate-300">Produce: </strong>
                          {ord.items.map((i) => `${i.product.name} x${i.quantity}`).join(', ')}
                        </div>
                      </div>
                    </div>

                    {/* Right: Actions & Navigation Links */}
                    <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-between gap-3 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-800">
                      <div className="text-left lg:text-right">
                        <span className="text-slate-400 text-[10px] block">Payment Due</span>
                        <div className="flex items-baseline gap-1.5 lg:justify-end">
                          <span className="text-base font-bold font-mono text-emerald-400">
                            {formatPrice(ord.total)}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.2 rounded font-mono ${
                              ord.paymentMethod === 'cod'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            }`}
                          >
                            {ord.paymentMethod === 'cod' ? 'CASH ON DELIVERY' : 'PAID'}
                          </span>
                        </div>
                      </div>

                      {/* Turn-by-Turn Navigation Buttons */}
                      <div className="flex flex-wrap items-center gap-1.5">
                        <a
                          href={navUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1 transition-transform active:scale-95 shadow-sm"
                          title="Open turn-by-turn navigation in Google Maps"
                        >
                          <Navigation className="w-3.5 h-3.5" />
                          <span>Google Maps</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>

                        <a
                          href={wazeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1 transition-transform active:scale-95"
                          title="Open navigation in Waze"
                        >
                          <Compass className="w-3.5 h-3.5" />
                          <span>Waze</span>
                        </a>

                        <a
                          href={`https://wa.me/${ord.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                            `Hello ${ord.customerName}! Your NasBaladna fresh order #${ord.orderNumber} is arriving soon with our cold-chain courier ${driverInfo.name}.`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-xl text-xs transition-colors"
                          title="WhatsApp customer directly"
                        >
                          <MessageCircle className="w-3.5 h-3.5 fill-current" />
                        </a>

                        <button
                          type="button"
                          onClick={() => handleCopySingleStop(ord, idx)}
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs transition-colors"
                          title="Copy single stop details"
                        >
                          {copiedStopId === ord.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>

                      {/* Status Stepper */}
                      <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
                        {(['confirmed', 'packing', 'on_the_way', 'delivered'] as OrderStatus[]).map((st) => (
                          <button
                            key={st}
                            type="button"
                            onClick={() => {
                              updateOrderStatus(ord.id, st);
                              showToast(`Order #${ord.orderNumber} status updated to ${st.replace('_', ' ')}`);
                            }}
                            className={`px-2 py-1 rounded text-[10px] font-bold capitalize transition-colors ${
                              ord.status === st
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'text-slate-400 hover:text-white'
                            }`}
                          >
                            {st === 'on_the_way' ? 'Out for Delivery' : st}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Guidance */}
        <div className="p-3.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Active cold-chain logistics telemetry · Fleet driver dispatch mode</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-semibold text-xs transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
