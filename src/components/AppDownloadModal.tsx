import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { useStore } from '../context/StoreContext';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { NasBaladnaLogo } from './NasBaladnaLogo';
import {
  X,
  Smartphone,
  Download,
  CheckCircle2,
  Share2,
  PlusSquare,
  QrCode,
  Copy,
  Check,
  Sparkles,
  Zap,
  Bell,
  ShieldCheck,
  Gift,
  ArrowRight,
  ExternalLink,
  Laptop,
  CheckCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const AppDownloadModal: React.FC = () => {
  const { isAppDownloadModalOpen, setIsAppDownloadModalOpen, showToast } = useStore();
  const { isInstallable, isInstalled, isIOS, isAndroid, isMobile, install } = usePWAInstall();

  const [activeTab, setActiveTab] = useState<'quick' | 'qr' | 'ios' | 'android'>('quick');
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [installing, setInstalling] = useState(false);

  // Auto-detect preferred tab on open
  useEffect(() => {
    if (isIOS) {
      setActiveTab('ios');
    } else if (isAndroid) {
      setActiveTab('quick');
    } else if (!isMobile) {
      setActiveTab('quick');
    }
  }, [isIOS, isAndroid, isMobile]);

  // Generate QR code for mobile scanning
  useEffect(() => {
    if (!isAppDownloadModalOpen) return;
    const appUrl = typeof window !== 'undefined' ? window.location.origin : 'https://nasbaladna.com';
    QRCode.toDataURL(appUrl, {
      width: 320,
      margin: 1.5,
      color: {
        dark: '#064E3B',
        light: '#FFFFFF',
      },
    })
      .then((url) => setQrCodeUrl(url))
      .catch((err) => console.error('Failed to generate QR code', err));
  }, [isAppDownloadModalOpen]);

  if (!isAppDownloadModalOpen) return null;

  const handleInstallClick = async () => {
    setInstalling(true);
    try {
      const success = await install();
      if (success) {
        showToast('🎉 NasBaladna App installed successfully to your device!');
        setTimeout(() => setIsAppDownloadModalOpen(false), 1200);
      } else {
        // If beforeinstallprompt is not directly available (e.g. on iOS or unsupported browser), switch to step-by-step tab
        if (isIOS) {
          setActiveTab('ios');
        } else {
          setActiveTab('qr');
        }
      }
    } catch {
      setActiveTab('qr');
    } finally {
      setInstalling(false);
    }
  };

  const handleCopyLink = () => {
    const appUrl = typeof window !== 'undefined' ? window.location.origin : 'https://nasbaladna.com';
    navigator.clipboard?.writeText(appUrl);
    setCopiedLink(true);
    showToast('App link copied to clipboard!');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-emerald-100 overflow-hidden flex flex-col my-auto max-h-[92vh]"
        >
          {/* Header Banner */}
          <div className="relative bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-900 text-white p-5 sm:p-6 pb-6 overflow-hidden shrink-0">
            {/* Background geometric accents */}
            <div className="absolute top-0 right-0 -mr-12 -mt-12 w-48 h-48 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none" />
            <div className="absolute bottom-0 left-1/3 -mb-10 w-40 h-40 rounded-full bg-teal-400/10 blur-xl pointer-events-none" />

            <div className="relative z-10 flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-2xl shadow-md shrink-0">
                  <NasBaladnaLogo size="sm" showTagline={false} />
                </div>
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-400/20 border border-emerald-300/30 text-[11px] font-bold text-emerald-200 mb-1">
                    <Sparkles className="w-3 h-3 text-emerald-300" />
                    <span>Official Mobile & Web App</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-white font-['Outfit'] tracking-tight">
                    Get the NasBaladna App
                  </h2>
                  <p className="text-xs sm:text-sm text-emerald-100/90 mt-0.5">
                    Fast cold-chain farm delivery right on your phone or desktop.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsAppDownloadModalOpen(false)}
                className="p-2 text-emerald-200 hover:text-white rounded-full hover:bg-white/10 transition-colors shrink-0"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Special App Offer Pill */}
            <div className="mt-4 p-2.5 px-3.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-emerald-500/20 border border-amber-300/30 flex items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 text-amber-200 font-semibold">
                <Gift className="w-4 h-4 text-amber-300 shrink-0" />
                <span>App Exclusive: 15% OFF your first order!</span>
              </div>
              <span className="font-mono font-bold bg-amber-400 text-slate-950 px-2 py-0.5 rounded-md text-[11px]">
                CODE: APP15
              </span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-slate-200 bg-slate-50/80 px-4 sm:px-6 shrink-0 text-xs font-bold overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveTab('quick')}
              className={`py-3 px-3 border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === 'quick'
                  ? 'border-emerald-600 text-emerald-800'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Download className="w-4 h-4" />
              <span>Direct Install</span>
              {isInstallable && (
                <span className="px-1.5 py-0.2 rounded-full bg-emerald-500 text-white text-[9px] font-black">
                  Ready
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('ios')}
              className={`py-3 px-3 border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === 'ios'
                  ? 'border-emerald-600 text-emerald-800'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span>iPhone & iPad (iOS)</span>
            </button>

            <button
              onClick={() => setActiveTab('android')}
              className={`py-3 px-3 border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === 'android'
                  ? 'border-emerald-600 text-emerald-800'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span>Android</span>
            </button>

            <button
              onClick={() => setActiveTab('qr')}
              className={`py-3 px-3 border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === 'qr'
                  ? 'border-emerald-600 text-emerald-800'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <QrCode className="w-4 h-4" />
              <span>Scan QR Code</span>
            </button>
          </div>

          {/* Tab Contents - Scrollable */}
          <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
            {/* TAB 1: QUICK INSTALL (PWA 1-CLICK) */}
            {activeTab === 'quick' && (
              <div className="space-y-5">
                {isInstalled ? (
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
                    <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                    <h3 className="font-extrabold text-base text-slate-900 font-['Outfit']">
                      NasBaladna is Installed!
                    </h3>
                    <p className="text-xs text-slate-600 max-w-md mx-auto">
                      You are using the official standalone app. You can find NasBaladna on your home screen or application launcher.
                    </p>
                  </div>
                ) : (
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-50 via-teal-50/50 to-white border border-emerald-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-white shadow-md p-1 border border-emerald-200 shrink-0 flex items-center justify-center overflow-hidden">
                        <img
                          src="/pwa-192x192.png"
                          alt="NasBaladna App Icon"
                          className="w-full h-full object-cover rounded-xl"
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-black text-slate-900 text-lg font-['Outfit']">
                            NasBaladna Express
                          </h3>
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                            Free · 0 MB Storage
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-0.5">
                          Instant install · Works seamlessly offline · Live order tracking
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={handleInstallClick}
                      disabled={installing}
                      className="w-full sm:w-auto px-6 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white rounded-xl font-extrabold text-sm shadow-md transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] cursor-pointer shrink-0"
                    >
                      <Download className="w-4 h-4" />
                      <span>{installing ? 'Opening Install Prompt...' : 'Install App Now'}</span>
                    </button>
                  </div>
                )}

                {/* App Store & Google Play Mock Badges + Links */}
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">
                    Available Everywhere
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Google Play / Android Badge */}
                    <button
                      onClick={() => setActiveTab('android')}
                      className="flex items-center gap-3 p-3 rounded-2xl border border-slate-200 bg-white hover:bg-emerald-50/40 hover:border-emerald-300 transition-all text-left group cursor-pointer"
                    >
                      <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white shrink-0 group-hover:scale-105 transition-transform">
                        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
                          <path
                            d="M3.6 1.8L14.7 12 3.6 22.2c-.4-.3-.6-.8-.6-1.4V3.2c0-.6.2-1.1.6-1.4z"
                            fill="#00E676"
                          />
                          <path
                            d="M18.3 8.7l-3.6 3.3L3.6 1.8c.3-.1.6-.1.9.1l13.8 6.8z"
                            fill="#00B0FF"
                          />
                          <path
                            d="M18.3 15.3L4.5 22.1c-.3.2-.6.2-.9.1l11.1-10.2 3.6 3.3z"
                            fill="#FF3D00"
                          />
                          <path
                            d="M21.6 10.7l-3.3-1.6-3.6 3.3 3.6 3.3 3.3-1.6c.9-.5.9-2.9 0-3.4z"
                            fill="#FFD600"
                          />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="block text-[10px] text-slate-400 uppercase font-bold tracking-wider leading-none">
                          GET IT ON
                        </span>
                        <span className="font-extrabold text-sm text-slate-900 font-['Outfit'] leading-tight">
                          Google Play / Android
                        </span>
                        <span className="block text-[11px] text-emerald-700 font-medium">
                          PWA & Instant APK
                        </span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-700 group-hover:translate-x-0.5 transition-all" />
                    </button>

                    {/* Apple App Store Badge */}
                    <button
                      onClick={() => setActiveTab('ios')}
                      className="flex items-center gap-3 p-3 rounded-2xl border border-slate-200 bg-white hover:bg-emerald-50/40 hover:border-emerald-300 transition-all text-left group cursor-pointer"
                    >
                      <div className="w-10 h-10 rounded-xl bg-slate-950 flex items-center justify-center text-white shrink-0 group-hover:scale-105 transition-transform">
                        <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                          <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.42c.67-.82 1.12-1.96.99-3.1-.96.04-2.12.64-2.8 1.44-.6.69-1.12 1.85-.98 2.96 1.07.08 2.12-.54 2.79-1.3" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="block text-[10px] text-slate-400 uppercase font-bold tracking-wider leading-none">
                          Download on the
                        </span>
                        <span className="font-extrabold text-sm text-slate-900 font-['Outfit'] leading-tight">
                          Apple App Store
                        </span>
                        <span className="block text-[11px] text-emerald-700 font-medium">
                          iOS Safari 1-Tap Home Screen
                        </span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-700 group-hover:translate-x-0.5 transition-all" />
                    </button>
                  </div>
                </div>

                {/* Key Benefits of Installing */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
                  <h4 className="text-xs font-bold text-slate-700">
                    Why install the NasBaladna App?
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-slate-600">
                    <div className="flex items-start gap-2">
                      <Zap className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      <span><strong>Instant Checkout:</strong> 3x faster with saved addresses and quick repeat order.</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Bell className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span><strong>Live GPS Alerts:</strong> Track your fresh produce chilled delivery van in real-time.</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Gift className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                      <span><strong>App-Only Discounts:</strong> Flash hour deals, Near-Expiry 50% bargains, and coupons.</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                      <span><strong>No App Store Bloat:</strong> Zero storage required, instant auto-updates with new harvest.</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: iOS SAFARI STEP-BY-STEP */}
            {activeTab === 'ios' && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-sky-50/70 border border-sky-200 flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-sky-500 text-white shrink-0 mt-0.5">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm sm:text-base text-slate-900 font-['Outfit']">
                      Add NasBaladna to iPhone / iPad Home Screen
                    </h3>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      Apple Safari lets you install NasBaladna directly as a native app with full offline capabilities in 3 simple steps:
                    </p>
                  </div>
                </div>

                {/* Steps Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-2 text-center">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 font-black text-sm flex items-center justify-center mx-auto">
                      1
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 inline-flex items-center justify-center text-sky-600 my-1">
                      <Share2 className="w-6 h-6" />
                    </div>
                    <h4 className="font-bold text-xs text-slate-900">Tap Share Button</h4>
                    <p className="text-[11px] text-slate-500">
                      Tap the <strong>Share</strong> icon (square with arrow up) at the bottom of Safari toolbar.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-2 text-center">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 font-black text-sm flex items-center justify-center mx-auto">
                      2
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 inline-flex items-center justify-center text-emerald-600 my-1">
                      <PlusSquare className="w-6 h-6" />
                    </div>
                    <h4 className="font-bold text-xs text-slate-900">Add to Home Screen</h4>
                    <p className="text-[11px] text-slate-500">
                      Scroll down the share options and tap <strong>"Add to Home Screen"</strong>.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-2 text-center">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 font-black text-sm flex items-center justify-center mx-auto">
                      3
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 inline-flex items-center justify-center text-teal-600 my-1">
                      <CheckCircle className="w-6 h-6" />
                    </div>
                    <h4 className="font-bold text-xs text-slate-900">Tap "Add"</h4>
                    <p className="text-[11px] text-slate-500">
                      Tap <strong>Add</strong> in the top right. NasBaladna will launch as a full-screen app!
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    <strong>Pro-Tip:</strong> Using Chrome or Firefox on iOS? Open this URL in Safari for native home screen support.
                  </span>
                </div>
              </div>
            )}

            {/* TAB 3: ANDROID GUIDE */}
            {activeTab === 'android' && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-emerald-600 text-white shrink-0 mt-0.5">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm sm:text-base text-slate-900 font-['Outfit']">
                      Install on Android (Chrome, Samsung Internet, Edge)
                    </h3>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      Android supports fast 1-click installation as a full Progressive Web App:
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-2">
                    <span className="inline-block px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                      Method 1: Direct Button
                    </span>
                    <h4 className="font-bold text-xs text-slate-900">Click Install App</h4>
                    <p className="text-xs text-slate-600">
                      Tap the direct install button below to open Chrome's native installation prompt.
                    </p>
                    <button
                      onClick={handleInstallClick}
                      className="mt-2 w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      <span>Install on this Android Device</span>
                    </button>
                  </div>

                  <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-2">
                    <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-bold text-[10px]">
                      Method 2: Browser Menu
                    </span>
                    <h4 className="font-bold text-xs text-slate-900">Tap Browser Menu (⋮)</h4>
                    <p className="text-xs text-slate-600">
                      Tap the 3 dots in the top-right of Chrome, then tap <strong>"Install app"</strong> or <strong>"Add to Home Screen"</strong>.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: SCAN QR CODE TO INSTALL ON PHONE */}
            {activeTab === 'qr' && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center gap-6">
                  {/* QR Code Container */}
                  <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-md shrink-0 text-center">
                    {qrCodeUrl ? (
                      <img
                        src={qrCodeUrl}
                        alt="Scan QR to install NasBaladna app"
                        className="w-48 h-48 sm:w-52 sm:h-52 object-contain rounded-xl"
                      />
                    ) : (
                      <div className="w-48 h-48 flex items-center justify-center text-slate-400">
                        Loading QR...
                      </div>
                    )}
                    <div className="mt-2 text-[10px] font-bold text-emerald-800 uppercase tracking-wider flex items-center justify-center gap-1">
                      <Smartphone className="w-3 h-3" />
                      <span>Scan with Camera</span>
                    </div>
                  </div>

                  {/* Instructions */}
                  <div className="space-y-3 flex-1 text-left">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                        Desktop to Mobile
                      </span>
                      <h3 className="font-extrabold text-base sm:text-lg text-slate-900 font-['Outfit'] mt-1">
                        Scan with your Mobile Phone
                      </h3>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        Point your iPhone or Android camera at this QR code. It will open the NasBaladna store instantly on your mobile phone, ready for 1-tap installation!
                      </p>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-700">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>iPhone: Camera app scans instantly & prompts in Safari</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Android: Camera or Google Lens prompts Chrome install</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Includes automatic 15% first-order discount</span>
                      </div>
                    </div>

                    {/* Share / Copy Link */}
                    <div className="pt-2 flex flex-wrap items-center gap-2">
                      <button
                        onClick={handleCopyLink}
                        className="px-3.5 py-2 rounded-xl border border-slate-300 hover:border-slate-400 bg-white text-slate-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        {copiedLink ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Copied Link!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy App Link</span>
                          </>
                        )}
                      </button>

                      <a
                        href={`https://wa.me/?text=${encodeURIComponent(
                          `Download the NasBaladna Fresh Produce App for 15-minute farm delivery & 15% OFF first order: ${
                            typeof window !== 'undefined' ? window.location.origin : ''
                          }`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3.5 py-2 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                      >
                        <span>Share on WhatsApp</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shrink-0">
            <div className="flex items-center gap-2 text-slate-500">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Safe & Verified · Qatar Ministry of Commerce compliant</span>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <button
                onClick={() => setIsAppDownloadModalOpen(false)}
                className="w-full sm:w-auto px-4 py-2 rounded-xl text-slate-600 hover:text-slate-900 font-bold hover:bg-slate-200/60 transition"
              >
                Close
              </button>
              <button
                onClick={handleInstallClick}
                className="w-full sm:w-auto px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition shadow-xs flex items-center justify-center gap-1.5"
              >
                <Download className="w-4 h-4" />
                <span>Install App</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
