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
} from 'lucide-react';
import { DELIVERY_SLOTS, QATAR_DISTRICTS } from '../data/mockData';

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
  const deliveryFee = cartTotal >= 50 ? 0 : selectedSlot.fee;
  const finalTotal = cartTotal + deliveryFee;

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();

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
        deliverySlot: selectedSlot.title,
        paymentMethod,
      });
      setIsProcessing(false);
      setShowOtpModal(false);
    }, 1400);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex justify-center items-start sm:items-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl sm:rounded-3xl shadow-2xl overflow-hidden min-h-screen sm:min-h-0 max-h-[96vh] flex flex-col my-auto border border-slate-200/60">
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
        <form onSubmit={handleSubmitOrder} className="overflow-y-auto flex-1 p-5 sm:p-7 space-y-6">
          {/* Section 1: Delivery Address & Customer Details */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wider">
              <MapPin className="w-4 h-4 text-emerald-600" />
              <span>1. Delivery Destination</span>
            </div>

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
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Street, Villa / Building & Apt
                </label>
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
          </div>

          {/* Section 2: Delivery Slot Selection */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wider">
              <Clock className="w-4 h-4 text-emerald-600" />
              <span>2. Delivery Window</span>
            </div>

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
                      {slot.fee === 0 ? 'Free Delivery' : formatPrice(slot.fee)}
                    </span>
                  </button>
                );
              })}
            </div>
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
                  <span>Supported: Visa, Mastercard, QPay</span>
                  <div className="flex gap-1.5 font-mono text-[10px] text-slate-600 font-bold">
                    <span className="bg-white px-1.5 py-0.5 rounded border">VISA</span>
                    <span className="bg-white px-1.5 py-0.5 rounded border">MC</span>
                    <span className="bg-white px-1.5 py-0.5 rounded border">QPAY</span>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Card Number
                  </label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full text-xs font-mono font-medium px-3 py-2 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-emerald-500"
                    placeholder="4000 0000 0000 0000"
                  />
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
              </div>
            )}

            {paymentMethod === 'apple_pay' && (
              <div className="bg-slate-900 text-white p-4 rounded-2xl text-center space-y-2">
                <Smartphone className="w-8 h-8 mx-auto text-emerald-400" />
                <h4 className="text-sm font-bold">1-Touch Biometric Express Checkout</h4>
                <p className="text-xs text-slate-300">
                  Pay instantly using Apple Pay or Google Pay with device token encryption.
                </p>
              </div>
            )}

            {paymentMethod === 'cod' && (
              <div className="bg-emerald-50/70 border border-emerald-200 p-4 rounded-2xl text-xs text-emerald-900 space-y-1">
                <span className="font-bold block text-sm">Pay upon Arrival at Doorstep</span>
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
      </div>
    </div>
  );
};
