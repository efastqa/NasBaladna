import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { useStore } from '../context/StoreContext';
import { usePWAInstall } from '../hooks/usePWAInstall';
import {
  Smartphone,
  Download,
  QrCode,
  Sparkles,
  Zap,
  Bell,
  Gift,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { motion } from 'motion/react';

export const AppDownloadSection: React.FC = () => {
  const { setIsAppDownloadModalOpen } = useStore();
  const { isInstallable, isInstalled, install } = usePWAInstall();
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');

  useEffect(() => {
    const appUrl = typeof window !== 'undefined' ? window.location.origin : 'https://nasbaladna.com';
    QRCode.toDataURL(appUrl, {
      width: 220,
      margin: 1,
      color: {
        dark: '#064E3B',
        light: '#FFFFFF',
      },
    })
      .then((url) => setQrCodeUrl(url))
      .catch((err) => console.error(err));
  }, []);

  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-950 text-white p-6 sm:p-10 border border-emerald-800/60 shadow-xl my-8">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-10 -mb-20 w-72 h-72 rounded-full bg-teal-400/10 blur-3xl pointer-events-none" />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: Value Prop & CTA */}
        <div className="lg:col-span-7 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Official Mobile Experience</span>
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black font-['Outfit'] tracking-tight text-white leading-tight">
            Shop Smart & Fast on the <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-green-300 to-teal-200">
              NasBaladna Mobile App
            </span>
          </h2>

          <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed max-w-xl">
            Get ultra-fast chilled delivery of organic harvest and farm produce. Track your delivery driver live on GPS, unlock app-exclusive flash sales, and re-order your weekly basket in 2 taps.
          </p>

          {/* Value Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 text-xs text-emerald-100">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-emerald-800/80 text-emerald-300 shrink-0">
                <Zap className="w-4 h-4" />
              </div>
              <span><strong>15-Min Delivery:</strong> Temperature-controlled cold chain.</span>
            </div>

            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-emerald-800/80 text-emerald-300 shrink-0">
                <Bell className="w-4 h-4" />
              </div>
              <span><strong>Driver GPS Tracking:</strong> Live status notifications.</span>
            </div>

            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-emerald-800/80 text-emerald-300 shrink-0">
                <Gift className="w-4 h-4" />
              </div>
              <span><strong>15% OFF First Order:</strong> Use promo code <strong>APP15</strong>.</span>
            </div>

            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-emerald-800/80 text-emerald-300 shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span><strong>Works Offline:</strong> Lightweight, 0 MB disk storage.</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-3">
            <button
              onClick={() => {
                if (isInstallable) {
                  install();
                } else {
                  setIsAppDownloadModalOpen(true);
                }
              }}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-xs sm:text-sm shadow-lg hover:shadow-emerald-500/25 transition-all flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>{isInstalled ? 'App Installed ✓' : 'Install NasBaladna App'}</span>
            </button>

            <button
              onClick={() => setIsAppDownloadModalOpen(true)}
              className="px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-bold text-xs sm:text-sm transition-all flex items-center gap-2 cursor-pointer"
            >
              <Smartphone className="w-4 h-4 text-emerald-300" />
              <span>iOS & Android Options</span>
              <ArrowRight className="w-3.5 h-3.5 text-emerald-300" />
            </button>
          </div>
        </div>

        {/* Right Column: Phone Mockup & Scan QR */}
        <div className="lg:col-span-5 flex flex-col sm:flex-row items-center justify-center lg:justify-end gap-5">
          {/* QR Code Card */}
          <div className="bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-white/30 text-slate-900 text-center w-full sm:w-auto max-w-[210px] shrink-0">
            <div className="w-36 h-36 mx-auto bg-white rounded-xl p-1 border border-slate-100 flex items-center justify-center">
              {qrCodeUrl ? (
                <img
                  src={qrCodeUrl}
                  alt="Scan QR code to install NasBaladna App"
                  className="w-full h-full object-contain"
                />
              ) : (
                <QrCode className="w-24 h-24 text-emerald-800" />
              )}
            </div>
            <div className="mt-2.5">
              <span className="block font-black text-xs font-['Outfit'] text-slate-900">
                Scan to Install
              </span>
              <span className="block text-[10px] text-slate-500 font-medium">
                Point your phone camera
              </span>
            </div>
          </div>

          {/* Quick Store badges column */}
          <div className="flex flex-col gap-2.5 w-full sm:w-auto">
            {/* Google Play Button */}
            <button
              onClick={() => setIsAppDownloadModalOpen(true)}
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-slate-950/80 hover:bg-slate-950 border border-white/15 hover:border-emerald-400/50 transition-all text-left group cursor-pointer shadow-md"
            >
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none">
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
              <div>
                <span className="block text-[8px] uppercase tracking-wider text-slate-400 font-bold leading-none">
                  GET IT ON
                </span>
                <span className="font-extrabold text-xs text-white leading-tight">
                  Google Play
                </span>
              </div>
            </button>

            {/* Apple App Store Button */}
            <button
              onClick={() => setIsAppDownloadModalOpen(true)}
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-slate-950/80 hover:bg-slate-950 border border-white/15 hover:border-emerald-400/50 transition-all text-left group cursor-pointer shadow-md"
            >
              <svg className="w-5 h-5 fill-current text-white shrink-0" viewBox="0 0 24 24">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.42c.67-.82 1.12-1.96.99-3.1-.96.04-2.12.64-2.8 1.44-.6.69-1.12 1.85-.98 2.96 1.07.08 2.12-.54 2.79-1.3" />
              </svg>
              <div>
                <span className="block text-[8px] uppercase tracking-wider text-slate-400 font-bold leading-none">
                  Download on the
                </span>
                <span className="font-extrabold text-xs text-white leading-tight">
                  App Store
                </span>
              </div>
            </button>

            {/* Direct Web App Button */}
            <button
              onClick={() => setIsAppDownloadModalOpen(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-800/50 hover:bg-emerald-800/80 border border-emerald-500/30 text-emerald-200 text-[10px] font-bold transition-all text-center justify-center cursor-pointer"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>PWA Web App</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
