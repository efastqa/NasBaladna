import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import {
  X,
  CreditCard,
  Lock,
  ShieldCheck,
  CheckCircle2,
  Truck,
  MapPin,
  Clock,
  Sparkles,
  Smartphone,
  Wallet,
  ArrowRight,
  Zap,
  ExternalLink,
  LocateFixed,
  FileText,
  Leaf,
  Bell,
  BellOff,
  Building,
  Home,
  UserCheck,
} from 'lucide-react';
import { DELIVERY_SLOTS, QATAR_DISTRICTS } from '../data/mockData';
import { DeliveryMapPickerModal } from './DeliveryMapPickerModal';
import { LatLng } from '../constants/locations';
import { DeliveryServiceType, DropoffPreference } from '../types';

export const CheckoutModal: React.FC = () => {
  const {
    isCheckoutOpen,
    setIsCheckoutOpen,
    cart,
    cartTotal,
    formatPrice,
    createOrder,
    currency,
  } = useStore();

  if (!isCheckoutOpen) return null;

  const [customerName, setCustomerName] = useState('Sara Al-Kuwari');
  const [phone, setPhone] = useState('+974 5582 3419');
  const [district, setDistrict] = useState(QATAR_DISTRICTS[0]);
  const [address, setAddress] = useState('Villa 24, Street 902, Zone 66');
  const [deliverySlot, setDeliverySlot] = useState(DELIVERY_SLOTS[0].id);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'apple_pay' | 'cod'>('card');

  // Delivery & Fulfillment enhancements state
  const [serviceType, setServiceType] = useState<DeliveryServiceType>('standard');
  const [dropoffPreference, setDropoffPreference] = useState<DropoffPreference>('hand_to_me');
  const [doorbellPreference, setDoorbellPreference] = useState<'ring' | 'silent'>('ring');
  const [bluePlateZone, setBluePlateZone] = useState('66');
  const [bluePlateStreet, setBluePlateStreet] = useState('902');
  const [bluePlateBuilding, setBluePlateBuilding] = useState('24');
  const [showBluePlateHelper, setShowBluePlateHelper] = useState(false);

  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [pinnedCoordinates, setPinnedCoordinates] = useState<LatLng | undefined>(undefined);
  const [googleMapsUrl, setGoogleMapsUrl] = useState<string | undefined>(undefined);
  const [deliveryNotes, setDeliveryNotes] = useState<string>('');
  const [isExpressDelivery, setIsExpressDelivery] = useState<boolean>(false);

  // Card details state
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8829');
  const [cardHolder, setCardHolder] = useState('SARA AL KUWARI');
  const [cardExpiry, setCardExpiry] = useState('08/28');
  const [cardCvv, setCardCvv] = useState('742');

  // Processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpCode, setOtpCode] = useState('');

  const selectedSlot = DELIVERY_SLOTS.find((s) => s.id === deliverySlot) || DELIVERY_SLOTS[0];
  let baseDeliveryFee = cartTotal >= 50 ? 0 : selectedSlot.fee;
  if (serviceType === 'eco_green' && baseDeliveryFee > 0) {
    baseDeliveryFee = 2.0; // Eco-green discounted fee
  }
  const expressFee = serviceType === 'express' || isExpressDelivery ? 10.0 : 0;
  const deliveryFee = baseDeliveryFee + expressFee;
  const finalTotal = cartTotal + deliveryFee;

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();

    if (paymentMethod === 'apple_pay') {
      // Check for native browser PaymentRequest API (Apple Pay on Safari / Web)
      if (typeof window !== 'undefined' && 'PaymentRequest' in window) {
        try {
          const supportedInstruments = [
            {
              supportedMethods: 'https://apple.com/apple-pay',
              data: {
                version: 3,
                merchantIdentifier: 'merchant.com.nasbaladna.fresh',
                countryCode: 'QA',
                currencyCode: currency || 'QAR',
                supportedNetworks: ['visa', 'masterCard', 'amex'],
                merchantCapabilities: ['supports3DS'],
              },
            },
          ];

          const details = {
            total: {
              label: 'NasBaladna Farm Fresh Produce',
              amount: { currency: currency || 'QAR', value: finalTotal.toFixed(2) },
            },
          };

          // Try instantiating PaymentRequest
          new window.PaymentRequest(supportedInstruments, details);
        } catch {
          // If browser environment or simulation, proceed gracefully
        }
      }

      setIsProcessing(true);
      setTimeout(() => {
        processFinalOrder();
      }, 1200);
      return;
    }

    if (paymentMethod === 'card') {
      // Trigger 3D-Secure simulation
      setShowOtpModal(true);
      return;
    }

    processFinalOrder();
  };

  const processFinalOrder = () => {
    setIsProcessing(true);
    setTimeout(() => {
      createOrder({
        customerName,
        phone,
        address,
        district,
        deliverySlot:
          serviceType === 'express' || isExpressDelivery
            ? 'Express 60-Minute Priority Direct Courier'
            : serviceType === 'eco_green'
            ? `🌱 Eco Batch: ${selectedSlot.title}`
            : selectedSlot.title,
        paymentMethod,
        coordinates: pinnedCoordinates,
        googleMapsUrl,
        deliveryNotes,
        isExpress: serviceType === 'express' || isExpressDelivery,
        serviceType,
        dropoffPreference,
        doorbellPreference,
        bluePlateInfo:
          bluePlateZone && bluePlateStreet && bluePlateBuilding
            ? { zone: bluePlateZone, street: bluePlateStreet, building: bluePlateBuilding }
            : undefined,
        customDeliveryFee: deliveryFee,
      });
      setIsProcessing(false);
      setShowOtpModal(false);
    }, 1400);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex justify-center items-start sm:items-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl sm:rounded-3xl shadow-2xl overflow-hidden min-h-[100dvh] sm:min-h-0 sm:max-h-[92dvh] flex flex-col my-auto border border-slate-200/60">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 font-['Outfit']">
                Secure Home Delivery Checkout
              </h2>
              <p className="text-[11px] text-slate-500">
                Encrypted payment with 256-bit bank standard SSL
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsCheckoutOpen(false)}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmitOrder} className="overflow-y-auto flex-1 p-4 sm:p-7 space-y-6 pb-[max(1.5rem,calc(env(safe-area-inset-bottom)+1.5rem))]">
          {/* Section 1: Delivery Address & Customer Details */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wider">
                <MapPin className="w-4 h-4 text-emerald-600" />
                <span>1. Delivery Destination</span>
              </div>

              {/* Pin Location on Map Button */}
              <button
                type="button"
                onClick={() => setIsMapModalOpen(true)}
                className="px-2.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs"
              >
                <LocateFixed className="w-3.5 h-3.5 text-emerald-600" />
                <span>{pinnedCoordinates ? 'Change Location Pin' : '📍 Drop Map Pin (GPS)'}</span>
              </button>
            </div>

            {/* Pinned Coordinates Notification Pill */}
            {pinnedCoordinates && (
              <div className="p-2.5 rounded-xl bg-emerald-50/90 border border-emerald-300 text-emerald-900 text-xs flex items-center justify-between gap-2 shadow-2xs">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                  <span className="font-semibold truncate">
                    GPS Pin Dropped: {pinnedCoordinates.lat}° N, {pinnedCoordinates.lng}° E ({district})
                  </span>
                </div>
                {googleMapsUrl && (
                  <a
                    href={googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] font-bold text-emerald-700 hover:text-emerald-950 flex items-center gap-1 shrink-0 underline"
                  >
                    <span>Test on Google Maps</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full text-xs font-medium px-3 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="e.g. Sara Al-Kuwari"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Mobile (for courier SMS & WhatsApp)
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full text-xs font-medium px-3 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="+974 5582 3419"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Zone / Area</label>
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full text-xs font-medium px-3 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                >
                  {QATAR_DISTRICTS.map((dist) => (
                    <option key={dist} value={dist}>
                      {dist}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-medium text-slate-700">
                    Street, Villa / Building & Apt
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowBluePlateHelper(!showBluePlateHelper)}
                    className="text-[11px] font-bold text-sky-700 hover:text-sky-900 flex items-center gap-1 hover:underline"
                  >
                    <span>🇶🇦 Qatar Blue Plate Assistant</span>
                  </button>
                </div>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full text-xs font-medium px-3 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Villa 24, Street 902, Zone 66"
                />
              </div>
            </div>

            {/* Qatar National Address (Blue Plate) Helper Drawer */}
            {showBluePlateHelper && (
              <div className="p-3.5 rounded-2xl bg-sky-50/90 border border-sky-200 text-sky-950 space-y-2 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-sky-900">
                    <Building className="w-3.5 h-3.5 text-sky-600" />
                    <span>Qatar National Address Blue Plate (اللوحة الزرقاء)</span>
                  </div>
                  <span className="text-[10px] text-sky-600 font-mono">Official Qatar Addressing</span>
                </div>
                <p className="text-[11px] text-sky-800">
                  Enter the 3 numbers from your blue building plate outside your gate/entrance to help our driver find you instantly:
                </p>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <label className="block text-[10px] font-bold text-sky-900 mb-0.5">Zone No. (المنطقة)</label>
                    <input
                      type="text"
                      value={bluePlateZone}
                      onChange={(e) => {
                        const val = e.target.value;
                        setBluePlateZone(val);
                        setAddress(`Building ${bluePlateBuilding}, Street ${bluePlateStreet}, Zone ${val}`);
                      }}
                      placeholder="e.g. 66"
                      className="w-full px-2.5 py-1.5 rounded-xl bg-white border border-sky-300 text-center font-mono font-bold text-sky-950"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-sky-900 mb-0.5">Street No. (الشارع)</label>
                    <input
                      type="text"
                      value={bluePlateStreet}
                      onChange={(e) => {
                        const val = e.target.value;
                        setBluePlateStreet(val);
                        setAddress(`Building ${bluePlateBuilding}, Street ${val}, Zone ${bluePlateZone}`);
                      }}
                      placeholder="e.g. 902"
                      className="w-full px-2.5 py-1.5 rounded-xl bg-white border border-sky-300 text-center font-mono font-bold text-sky-950"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-sky-900 mb-0.5">Building No. (المبنى)</label>
                    <input
                      type="text"
                      value={bluePlateBuilding}
                      onChange={(e) => {
                        const val = e.target.value;
                        setBluePlateBuilding(val);
                        setAddress(`Building ${val}, Street ${bluePlateStreet}, Zone ${bluePlateZone}`);
                      }}
                      placeholder="e.g. 24"
                      className="w-full px-2.5 py-1.5 rounded-xl bg-white border border-sky-300 text-center font-mono font-bold text-sky-950"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Doorstep & Contactless Drop-off Preferences */}
            <div className="space-y-2 pt-1">
              <label className="block text-xs font-semibold text-slate-700 flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Doorstep & Drop-off Preference</span>
                </span>
                <span className="text-[10px] text-slate-400">Driver follows your instructions</span>
              </label>

              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setDropoffPreference('hand_to_me')}
                  className={`p-2 rounded-xl border text-center transition-all text-xs font-semibold flex flex-col items-center gap-1 ${
                    dropoffPreference === 'hand_to_me'
                      ? 'border-emerald-600 bg-emerald-50/80 text-emerald-950 ring-2 ring-emerald-600/20'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Home className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-[11px] leading-tight">Hand to Me</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDropoffPreference('doorstep')}
                  className={`p-2 rounded-xl border text-center transition-all text-xs font-semibold flex flex-col items-center gap-1 ${
                    dropoffPreference === 'doorstep'
                      ? 'border-emerald-600 bg-emerald-50/80 text-emerald-950 ring-2 ring-emerald-600/20'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-[11px] leading-tight">Leave at Door</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDropoffPreference('security')}
                  className={`p-2 rounded-xl border text-center transition-all text-xs font-semibold flex flex-col items-center gap-1 ${
                    dropoffPreference === 'security'
                      ? 'border-emerald-600 bg-emerald-50/80 text-emerald-950 ring-2 ring-emerald-600/20'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Building className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-[11px] leading-tight">Building Security</span>
                </button>
              </div>

              {/* Doorbell Preference Toggle */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <div className="flex items-center gap-2">
                  {doorbellPreference === 'ring' ? (
                    <Bell className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <BellOff className="w-4 h-4 text-rose-500" />
                  )}
                  <div>
                    <span className="font-semibold text-slate-800 block text-[11px]">
                      {doorbellPreference === 'ring' ? 'Ring Doorbell & Knock' : 'Silent Delivery (No Ringing)'}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {doorbellPreference === 'ring'
                        ? 'Courier will ring bell upon delivery'
                        : 'Courier will text WhatsApp or call quietly upon arrival'}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setDoorbellPreference(doorbellPreference === 'ring' ? 'silent' : 'ring')
                  }
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-colors ${
                    doorbellPreference === 'ring'
                      ? 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
                      : 'bg-rose-50 border-rose-200 text-rose-800'
                  }`}
                >
                  {doorbellPreference === 'ring' ? 'Switch to Silent' : '✓ Silent Active'}
                </button>
              </div>
            </div>

            {/* Courier Specific Delivery Notes */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1 flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                <span>Special Access Notes (Gate code, buzzer, porch instruction)</span>
              </label>
              <input
                type="text"
                value={deliveryNotes}
                onChange={(e) => setDeliveryNotes(e.target.value)}
                placeholder="e.g. Ring buzzer on front gate, leave box by white entrance door"
                className="w-full text-xs font-medium px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Section 2: Delivery Speed & Fulfillment Mode */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wider">
                <Clock className="w-4 h-4 text-emerald-600" />
                <span>2. Delivery Speed & Service Level</span>
              </div>
              <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Cold-Chain Refrigerated
              </span>
            </div>

            {/* Service Level Selection Cards (3 Modes) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {/* Option A: Express 60-Minute */}
              <div
                onClick={() => {
                  setServiceType('express');
                  setIsExpressDelivery(true);
                }}
                className={`p-3 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                  serviceType === 'express'
                    ? 'bg-gradient-to-br from-amber-50 to-orange-50/60 border-amber-400 ring-2 ring-amber-400/30 shadow-xs'
                    : 'bg-slate-50/80 border-slate-200 hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="w-6 h-6 rounded-lg bg-amber-500 text-white flex items-center justify-center">
                      <Zap className="w-3.5 h-3.5 fill-current" />
                    </div>
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded-full">
                      60 MINS
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900">Express Priority</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">
                    Direct refrigerated van departs immediately for your door.
                  </p>
                </div>
                <div className="pt-2 mt-2 border-t border-slate-200/80 flex items-center justify-between">
                  <span className="text-xs font-bold font-mono text-amber-900">+QAR 10.00</span>
                  <span className={`text-[10px] font-bold ${serviceType === 'express' ? 'text-amber-700' : 'text-slate-400'}`}>
                    {serviceType === 'express' ? '✓ Active' : 'Select'}
                  </span>
                </div>
              </div>

              {/* Option B: Standard Scheduled Slot */}
              <div
                onClick={() => {
                  setServiceType('standard');
                  setIsExpressDelivery(false);
                }}
                className={`p-3 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                  serviceType === 'standard'
                    ? 'bg-emerald-50/60 border-emerald-600 ring-2 ring-emerald-600/30 shadow-xs'
                    : 'bg-slate-50/80 border-slate-200 hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
                      <Clock className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded-full">
                      SCHEDULED
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900">Scheduled Slot</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">
                    Select a convenient 2-3 hour morning, afternoon, or evening window.
                  </p>
                </div>
                <div className="pt-2 mt-2 border-t border-slate-200/80 flex items-center justify-between">
                  <span className="text-xs font-bold font-mono text-emerald-900">
                    {cartTotal >= 50 ? 'FREE' : formatPrice(selectedSlot.fee || 5.0)}
                  </span>
                  <span className={`text-[10px] font-bold ${serviceType === 'standard' ? 'text-emerald-700' : 'text-slate-400'}`}>
                    {serviceType === 'standard' ? '✓ Active' : 'Select'}
                  </span>
                </div>
              </div>

              {/* Option C: Eco-Green Consolidated Batch Delivery */}
              <div
                onClick={() => {
                  setServiceType('eco_green');
                  setIsExpressDelivery(false);
                }}
                className={`p-3 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                  serviceType === 'eco_green'
                    ? 'bg-teal-50/70 border-teal-600 ring-2 ring-teal-600/30 shadow-xs'
                    : 'bg-slate-50/80 border-slate-200 hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="w-6 h-6 rounded-lg bg-teal-600 text-white flex items-center justify-center">
                      <Leaf className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[10px] font-bold text-teal-700 bg-teal-100 px-1.5 py-0.2 rounded-full">
                      ECO GREEN
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900">Green Batch Route</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">
                    Groups deliveries with neighbors to reduce Qatar emissions & fuel.
                  </p>
                </div>
                <div className="pt-2 mt-2 border-t border-slate-200/80 flex items-center justify-between">
                  <span className="text-xs font-bold font-mono text-teal-900">
                    {cartTotal >= 50 ? 'FREE' : 'QAR 2.00 (Save QAR 3)'}
                  </span>
                  <span className={`text-[10px] font-bold ${serviceType === 'eco_green' ? 'text-teal-700' : 'text-slate-400'}`}>
                    {serviceType === 'eco_green' ? '✓ Active' : 'Select'}
                  </span>
                </div>
              </div>
            </div>

            {/* Scheduled Slots Grid (Active for standard & eco_green) */}
            {serviceType !== 'express' ? (
              <div className="space-y-1.5 pt-1">
                <span className="text-[11px] font-semibold text-slate-700 block">
                  Select Delivery Time Window:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {DELIVERY_SLOTS.map((slot) => {
                    const isSelected = deliverySlot === slot.id;
                    return (
                      <button
                        key={slot.id}
                        type="button"
                        onClick={() => setDeliverySlot(slot.id)}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-600/30'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-slate-900">{slot.title}</span>
                          <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-100/80 px-1.5 py-0.5 rounded">
                            {slot.badge}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-500">
                          {cartTotal >= 50
                            ? 'Free (Order > 50)'
                            : serviceType === 'eco_green'
                            ? 'QAR 2.00 (Eco-Discounted)'
                            : slot.fee === 0
                            ? 'Free Delivery'
                            : formatPrice(slot.fee)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-[11px] flex items-center gap-2">
                <Zap className="w-3.5 h-3.5 text-amber-600 shrink-0 fill-amber-600" />
                <span>Express courier priority activated! Courier departs immediately from cold transit hub upon order.</span>
              </div>
            )}
          </div>

          {/* Section 3: Secure Payment Gateway */}
          <div className="space-y-4 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wider">
                <CreditCard className="w-4 h-4 text-emerald-600" />
                <span>3. Secure Payment Gateway</span>
              </div>
              <span className="text-[11px] font-mono font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                PCI-DSS Level 1
              </span>
            </div>

            {/* Payment Method Tabs */}
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`py-2.5 px-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
                  paymentMethod === 'card'
                    ? 'border-emerald-600 bg-emerald-50/70 text-emerald-950 ring-2 ring-emerald-600/20'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <CreditCard className="w-4 h-4 text-emerald-600" />
                <span>Credit / Debit Card</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('apple_pay')}
                className={`py-2.5 px-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
                  paymentMethod === 'apple_pay'
                    ? 'border-emerald-600 bg-emerald-50/70 text-emerald-950 ring-2 ring-emerald-600/20'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Smartphone className="w-4 h-4 text-slate-900" />
                <span>Apple / G-Pay</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('cod')}
                className={`py-2.5 px-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
                  paymentMethod === 'cod'
                    ? 'border-emerald-600 bg-emerald-50/70 text-emerald-950 ring-2 ring-emerald-600/20'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Wallet className="w-4 h-4 text-slate-700" />
                <span>Cash / Card on Delivery</span>
              </button>
            </div>

            {/* Card Details Form */}
            {paymentMethod === 'card' && (
              <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                  <span className="font-medium text-slate-700">Supported: Visa, Mastercard, QPay, NAPS</span>
                  <div className="flex gap-1.5 font-mono text-[10px] text-slate-600 font-bold">
                    <span className="bg-white px-1.5 py-0.5 rounded border border-slate-200 text-blue-800">VISA</span>
                    <span className="bg-white px-1.5 py-0.5 rounded border border-slate-200 text-red-600">MC</span>
                    <span className="bg-white px-1.5 py-0.5 rounded border border-slate-200 text-emerald-800">QPAY</span>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Card Number
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full text-xs font-mono font-medium px-3 py-2 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-emerald-500"
                      placeholder="4000 0000 0000 0000"
                    />
                    <CreditCard className="w-4 h-4 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Expiry Date
                    </label>
                    <input
                      type="text"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      className="w-full text-xs font-mono font-medium px-3 py-2 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-emerald-500"
                      placeholder="MM/YY"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      CVV / Security Code
                    </label>
                    <input
                      type="password"
                      maxLength={4}
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value)}
                      className="w-full text-xs font-mono font-medium px-3 py-2 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-emerald-500"
                      placeholder="•••"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Cardholder Name
                  </label>
                  <input
                    type="text"
                    value={cardHolder}
                    onChange={(e) => setCardHolder(e.target.value)}
                    className="w-full text-xs font-medium px-3 py-2 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-emerald-500"
                    placeholder="NAME ON CARD"
                  />
                </div>

                <div className="flex items-center gap-2 text-[10px] text-slate-500 pt-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Qatar Central Bank (QCB) & PCI-DSS 3D Secure 2.0 Tokenization</span>
                </div>
              </div>
            )}

            {paymentMethod === 'apple_pay' && (
              <div className="bg-gradient-to-br from-slate-950 to-slate-900 text-white p-5 rounded-2xl text-center space-y-3 border border-slate-800 shadow-lg">
                <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mx-auto text-emerald-400 border border-white/10">
                  <Smartphone className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center justify-center gap-1.5">
                    <span>Apple Pay on the Web & Google Pay</span>
                  </h4>
                  <p className="text-xs text-slate-300 mt-1">
                    1-Touch biometric authentication with Touch ID, Face ID, or device passcode.
                  </p>
                </div>

                <div className="bg-slate-900/90 rounded-xl p-3 border border-slate-800 text-left text-xs space-y-1.5 font-mono">
                  <div className="flex justify-between text-slate-400 text-[11px]">
                    <span>Merchant:</span>
                    <span className="text-white">NasBaladna Farm Fresh W.L.L</span>
                  </div>
                  <div className="flex justify-between text-slate-400 text-[11px]">
                    <span>Amount:</span>
                    <span className="text-emerald-400 font-bold">{formatPrice(finalTotal)}</span>
                  </div>
                  <div className="flex justify-between text-slate-400 text-[11px]">
                    <span>Network:</span>
                    <span className="text-white">Apple Pay / Visa / MC Tokenized</span>
                  </div>
                </div>

                <div className="pt-1">
                  <span className="text-[11px] text-emerald-400/90 flex items-center justify-center gap-1.5 font-medium">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Card details are never shared with merchants or stored on servers</span>
                  </span>
                </div>
              </div>
            )}

            {paymentMethod === 'cod' && (
              <div className="bg-emerald-50/70 border border-emerald-200 p-4 rounded-2xl text-xs text-emerald-900 space-y-1">
                <span className="font-bold block text-sm flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-emerald-700" />
                  <span>Pay upon Arrival at Doorstep</span>
                </span>
                <p>
                  Our courier carries sanitized mobile POS card readers (NFC tap, Apple Pay, credit cards) and exact change.
                </p>
              </div>
            )}
          </div>

          {/* Section 4: Order Breakdown */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Fresh produce items ({cart.reduce((s, i) => s + i.quantity, 0)})</span>
              <span className="font-mono font-medium text-slate-900">{formatPrice(cartTotal)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Express Delivery Fee</span>
              <span className="font-mono font-medium text-slate-900">
                {deliveryFee === 0 ? <span className="text-emerald-700 font-bold">FREE</span> : formatPrice(deliveryFee)}
              </span>
            </div>
            <div className="flex justify-between text-sm font-bold text-slate-900 pt-2 border-t border-slate-200">
              <span>Total Payable</span>
              <span className="font-mono text-base text-emerald-800">{formatPrice(finalTotal)}</span>
            </div>
          </div>

          {/* Submit CTA */}
          <button
            type="submit"
            disabled={isProcessing}
            className="w-full bg-[#059669] hover:bg-[#047857] text-white py-4 px-6 rounded-2xl font-bold text-sm tracking-wide shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:bg-slate-300 disabled:cursor-wait"
          >
            {isProcessing ? (
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Processing Bank Gateway Authorization...</span>
              </div>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                <span>Pay {formatPrice(finalTotal)} & Confirm Home Delivery</span>
              </>
            )}
          </button>
        </form>

        {/* 3D-Secure OTP Simulation Dialog */}
        {showOtpModal && (
          <div className="fixed inset-0 z-60 bg-black/70 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl border border-slate-200 animate-in zoom-in-95">
              <div className="flex items-center justify-between border-b pb-3">
                <span className="text-xs font-bold text-slate-900">3D-Secure 2.0 Verification</span>
                <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">
                  VERIFIED BY VISA
                </span>
              </div>

              <div className="text-center space-y-1">
                <ShieldCheck className="w-10 h-10 text-emerald-600 mx-auto" />
                <h3 className="font-bold text-slate-900 text-sm">Authentication Code Sent</h3>
                <p className="text-xs text-slate-500">
                  Please enter the test 6-digit code sent to {phone} to authorize payment of{' '}
                  <span className="font-mono font-bold text-slate-900">{formatPrice(finalTotal)}</span>
                </p>
              </div>

              <div className="space-y-2">
                <input
                  type="text"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  placeholder="Enter 482910"
                  className="w-full text-center text-lg font-mono font-bold tracking-widest py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  type="button"
                  onClick={() => setOtpCode('482910')}
                  className="text-[11px] text-emerald-700 hover:underline block mx-auto font-medium"
                >
                  Quick Fill Test OTP (482910)
                </button>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowOtpModal(false)}
                  className="flex-1 py-2 text-xs font-semibold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={processFinalOrder}
                  className="flex-1 py-2 text-xs font-bold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700"
                >
                  Confirm & Pay
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Interactive Delivery Map Pin Drop Modal */}
        <DeliveryMapPickerModal
          isOpen={isMapModalOpen}
          onClose={() => setIsMapModalOpen(false)}
          currentDistrict={district}
          currentAddress={address}
          initialCoordinates={pinnedCoordinates}
          onConfirmLocation={({ district: newDist, address: newAddr, coordinates, googleMapsUrl: newUrl, deliveryNotes: newNotes }) => {
            setDistrict(newDist);
            if (newAddr) setAddress(newAddr);
            setPinnedCoordinates(coordinates);
            setGoogleMapsUrl(newUrl);
            if (newNotes) setDeliveryNotes(newNotes);
          }}
        />
      </div>
    </div>
  );
};
