import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { useStore } from '../context/StoreContext';
import { NasBaladnaLogo } from './NasBaladnaLogo';
import {
  QrCode,
  Printer,
  Download,
  Copy,
  Check,
  Share2,
  X,
  Smartphone,
  Store,
  Layers,
  FileText,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Clock,
  PhoneCall,
  Info,
  MapPin,
  RefreshCw,
  ShoppingBag,
  Milk,
  MessageCircle,
} from 'lucide-react';

export type QrTemplateType = 'standee' | 'stickers' | 'poster' | 'simulator';

interface ScanToOrderModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  initialTemplate?: QrTemplateType;
}

export const ScanToOrderModal: React.FC<ScanToOrderModalProps> = ({
  isOpen,
  onClose,
  initialTemplate = 'standee',
}) => {
  const {
    isQrModalOpen,
    setIsQrModalOpen,
    ownerPhone,
    ownerWhatsAppUrl,
  } = useStore();

  const showModal = isOpen !== undefined ? isOpen : isQrModalOpen;
  const handleClose = onClose || (() => setIsQrModalOpen(false));

  const [activeTemplate, setActiveTemplate] = useState<QrTemplateType>(initialTemplate);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [locationTag, setLocationTag] = useState<string>('table_stand');
  const [customDomain, setCustomDomain] = useState<string>('');
  const [targetPath, setTargetPath] = useState<string>('home');
  const [isGenerating, setIsGenerating] = useState(false);

  // Determine current website origin
  const defaultOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://nasbaladnafresh.qa';
  const effectiveOrigin = customDomain.trim() ? customDomain.trim() : defaultOrigin;

  // Build final scan URL
  const getFullScanUrl = () => {
    let base = effectiveOrigin.replace(/\/$/, '');
    let path = '';
    if (targetPath === 'produce') path = '#produce';
    else if (targetPath === 'baladna_dairy') path = '#baladna_dairy';
    else if (targetPath === 'fast_order') path = '#fast_order';
    else if (targetPath === 'whatsapp') {
      return `https://wa.me/${ownerPhone.replace(/\D/g, '')}?text=${encodeURIComponent(
        'Hello NasBaladna! I scanned the QR code at your store and would like to order fresh produce.'
      )}`;
    }

    const separator = base.includes('?') ? '&' : '?';
    const tagParam = locationTag.trim() ? `${separator}ref=${encodeURIComponent(locationTag.trim())}` : '';
    return `${base}/${path}${tagParam}`;
  };

  const currentScanUrl = getFullScanUrl();

  // Generate QR Code data URL using qrcode library
  useEffect(() => {
    let isCurrent = true;
    const generateQr = async () => {
      try {
        setIsGenerating(true);
        // Error correction level 'H' (High, 30% error recovery) allows custom center branding
        const url = await QRCode.toDataURL(currentScanUrl, {
          width: 800,
          margin: 1.5,
          color: {
            dark: '#064e3b', // Deep organic farm emerald
            light: '#ffffff',
          },
          errorCorrectionLevel: 'H',
        });
        if (isCurrent) {
          setQrDataUrl(url);
          setIsGenerating(false);
        }
      } catch (err) {
        console.error('Error generating QR code:', err);
        setIsGenerating(false);
      }
    };

    generateQr();
    return () => {
      isCurrent = false;
    };
  }, [currentScanUrl]);

  // Copy scan link to clipboard
  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentScanUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Direct print using native browser print dialog
  const handlePrint = () => {
    window.print();
  };

  // Download high-resolution PNG image
  const handleDownloadPng = () => {
    if (!qrDataUrl) return;
    const link = document.createElement('a');
    link.download = `NasBaladna_QR_ScanToOrder_${locationTag || 'store'}.png`;
    link.href = qrDataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Download Standalone Printable HTML Flyer
  const handleDownloadHtmlFlyer = () => {
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>NasBaladna Scan & Order Standee</title>
  <style>
    @page { size: A4 portrait; margin: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; margin: 0; padding: 24px; background: #fff; color: #0f172a; display: flex; justify-content: center; }
    .card { width: 100%; max-width: 600px; border: 4px solid #14532D; border-radius: 28px; padding: 36px; text-align: center; box-shadow: 0 10px 30px rgba(0,0,0,0.08); }
    .badge { background: #14532D; color: #fff; padding: 6px 18px; border-radius: 12px; font-weight: bold; font-size: 14px; display: inline-block; letter-spacing: 1px; }
    h1 { color: #14532D; font-size: 32px; margin: 16px 0 6px; font-weight: 900; }
    h2 { color: #047857; font-size: 26px; margin: 0 0 18px; direction: rtl; font-family: Tahoma, sans-serif; }
    .subtitle { color: #475569; font-size: 15px; margin-bottom: 24px; }
    .qr-box { background: #f0fdf4; border: 3px dashed #059669; border-radius: 24px; padding: 20px; display: inline-block; margin: 12px 0; }
    .qr-img { width: 280px; height: 280px; display: block; border-radius: 12px; }
    .steps { display: flex; justify-content: space-around; margin: 28px 0; text-align: center; gap: 12px; }
    .step { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 12px; flex: 1; font-size: 13px; }
    .step-num { width: 24px; height: 24px; background: #059669; color: #fff; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-weight: bold; margin-bottom: 6px; }
    .footer { margin-top: 24px; padding-top: 18px; border-top: 2px solid #e2e8f0; font-size: 13px; color: #64748b; }
    .hotline { font-size: 18px; font-weight: bold; color: #14532D; margin-top: 6px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="badge">NASBALADNA FRESH FARM HARVEST · مزرعة ناس بلدنا</div>
    <h1>SCAN TO ORDER ON YOUR PHONE</h1>
    <h2>امسح الكود واطلب طازجاً في ثوانٍ</h2>
    <div class="subtitle">Direct Daily Harvest & Baladna Fresh Dairy Delivered to Your Doorstep in 30 Minutes</div>
    
    <div class="qr-box">
      <img src="${qrDataUrl}" class="qr-img" alt="Scan to Order QR Code" />
    </div>

    <div class="steps">
      <div class="step">
        <div class="step-num">1</div>
        <div><strong>Open Camera</strong></div>
        <div style="direction: rtl; color: #64748b; font-size: 11px;">افتح كاميرا الهاتف</div>
      </div>
      <div class="step">
        <div class="step-num">2</div>
        <div><strong>Point at Code</strong></div>
        <div style="direction: rtl; color: #64748b; font-size: 11px;">وجّه نحو الكود</div>
      </div>
      <div class="step">
        <div class="step-num">3</div>
        <div><strong>Tap & Order</strong></div>
        <div style="direction: rtl; color: #64748b; font-size: 11px;">اضغط الرابط واطلب</div>
      </div>
    </div>

    <div class="footer">
      <div>100% Pesticide-Free · Cold-Chain Preserved at 4°C · State of Qatar</div>
      <div class="hotline">Hotline & WhatsApp: ${ownerPhone}</div>
      <div style="font-size: 11px; margin-top: 4px; color: #94a3b8;">${currentScanUrl}</div>
    </div>
  </div>
  <script>window.onload = function() { window.print(); };</script>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `NasBaladna_Printable_Flyer_${locationTag || 'stand'}.html`;
    link.href = url;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Top Header */}
        <div className="bg-[#14532D] text-white px-5 sm:px-8 py-4 sm:py-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-emerald-300">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold">Scan & Order QR Code Studio</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-400 text-emerald-950">
                  PRINT READY
                </span>
              </div>
              <p className="text-xs text-emerald-100 mt-0.5">
                Generate, customize, and print high-resolution QR codes to place on tables, counters, packaging, and flyers.
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-2 text-emerald-200 hover:text-white rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Two Columns (Controls on Left, Live Print Preview on Right) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 bg-slate-50/60">
          
          {/* LEFT COLUMN: Controls & Presets (5 cols) */}
          <div className="lg:col-span-5 space-y-5">
            {/* Template Selector Tabs */}
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-emerald-600" />
                <span>1. Select Print Format</span>
              </label>
              
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTemplate('standee')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    activeTemplate === 'standee'
                      ? 'border-emerald-600 bg-emerald-50/80 text-emerald-950 font-bold shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <Store className="w-4 h-4 text-emerald-600" />
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                      A5
                    </span>
                  </div>
                  <div className="text-xs font-bold">Table / Counter Tent</div>
                  <div className="text-[10px] text-slate-500 font-normal">For tables & cashier stand</div>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTemplate('stickers')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    activeTemplate === 'stickers'
                      ? 'border-emerald-600 bg-emerald-50/80 text-emerald-950 font-bold shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                      6x / Sheet
                    </span>
                  </div>
                  <div className="text-xs font-bold">Bag & Box Stickers</div>
                  <div className="text-[10px] text-slate-500 font-normal">Peel & stick on bags/boxes</div>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTemplate('poster')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    activeTemplate === 'poster'
                      ? 'border-emerald-600 bg-emerald-50/80 text-emerald-950 font-bold shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <FileText className="w-4 h-4 text-emerald-600" />
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                      A4
                    </span>
                  </div>
                  <div className="text-xs font-bold">Storefront Poster</div>
                  <div className="text-[10px] text-slate-500 font-normal">Windows, walls, entrance</div>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTemplate('simulator')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    activeTemplate === 'simulator'
                      ? 'border-emerald-600 bg-emerald-50/80 text-emerald-950 font-bold shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <Smartphone className="w-4 h-4 text-emerald-600" />
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-sky-100 text-sky-800 font-bold">
                      DEMO
                    </span>
                  </div>
                  <div className="text-xs font-bold">Phone Camera Demo</div>
                  <div className="text-[10px] text-slate-500 font-normal">Simulate customer scan</div>
                </button>
              </div>
            </div>

            {/* Destination URL & Category Target */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
                <span>2. Scan Destination Link</span>
                <span className="text-[10px] font-mono text-emerald-600 font-bold">AUTO LIVE</span>
              </label>

              {/* Target Quick Chips */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setTargetPath('home')}
                  className={`p-2 rounded-xl text-left border flex items-center gap-1.5 transition-all ${
                    targetPath === 'home'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <Store className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Full Storefront</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTargetPath('produce')}
                  className={`p-2 rounded-xl text-left border flex items-center gap-1.5 transition-all ${
                    targetPath === 'produce'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <ShoppingBag className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Fresh Harvest</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTargetPath('baladna_dairy')}
                  className={`p-2 rounded-xl text-left border flex items-center gap-1.5 transition-all ${
                    targetPath === 'baladna_dairy'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <Milk className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Baladna Dairy</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTargetPath('whatsapp')}
                  className={`p-2 rounded-xl text-left border flex items-center gap-1.5 transition-all ${
                    targetPath === 'whatsapp'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span>WhatsApp Chat</span>
                </button>
              </div>

              {/* Location Tag preset */}
              <div>
                <label className="text-[11px] font-semibold text-slate-600 mb-1 block">
                  Placement / Tracking Tag (helps identify where customer scanned):
                </label>
                <div className="flex gap-2">
                  <select
                    value={locationTag}
                    onChange={(e) => setLocationTag(e.target.value)}
                    className="flex-1 text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="table_stand">🏪 Dining Table / Cafe Stand</option>
                    <option value="counter_cashier">💳 Cashier Checkout Counter</option>
                    <option value="delivery_bag">🛍️ Delivery Paper Bag Sticker</option>
                    <option value="box_packaging">📦 Vegetable Box Packaging</option>
                    <option value="storefront_poster">🚪 Storefront Glass / Wall</option>
                    <option value="delivery_van">🚚 Delivery Van Decal</option>
                    <option value="residential_lobby">🏢 Residential Compound Lobby</option>
                    <option value="organic_flyer">📄 Farmer Market Flyer</option>
                  </select>
                </div>
              </div>

              {/* Custom Domain Input (Optional) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-semibold text-slate-600">
                    Custom Live Domain (Optional):
                  </label>
                  {customDomain && (
                    <button
                      onClick={() => setCustomDomain('')}
                      className="text-[10px] text-emerald-700 hover:underline"
                    >
                      Reset to default
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  value={customDomain}
                  onChange={(e) => setCustomDomain(e.target.value)}
                  placeholder={defaultOrigin}
                  className="w-full text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none placeholder:text-slate-400"
                />
              </div>

              {/* Final Generated URL readout */}
              <div className="p-2.5 rounded-xl bg-slate-100 border border-slate-200 text-[11px] flex items-center justify-between gap-2">
                <span className="font-mono text-slate-600 truncate">{currentScanUrl}</span>
                <button
                  onClick={handleCopyLink}
                  className="shrink-0 p-1 text-slate-500 hover:text-emerald-700 rounded transition-colors"
                  title="Copy full scan URL"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Quick Tips & Instructions */}
            <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200/80 text-xs text-emerald-950 space-y-2">
              <div className="font-bold flex items-center gap-1.5 text-emerald-900">
                <Info className="w-4 h-4 text-emerald-700" />
                <span>How Customers Use It:</span>
              </div>
              <ul className="text-[11px] text-emerald-800 space-y-1 list-disc list-inside">
                <li>Customers point their native iPhone or Android camera at the code.</li>
                <li>No app download or scanner install is needed.</li>
                <li>A pop-up banner appears immediately: tap it to order in 30 seconds!</li>
                <li>Print on regular A4 paper, glossy photo paper, or sticky label sheets.</li>
              </ul>
            </div>
          </div>

          {/* RIGHT COLUMN: Live Print & Standee Preview (7 cols) */}
          <div className="lg:col-span-7 flex flex-col space-y-4">
            
            {/* Top Preview Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 bg-white p-3 rounded-2xl border border-slate-200/90 shadow-2xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold text-slate-800">
                  {activeTemplate === 'standee' && 'A5 Table Standee Preview'}
                  {activeTemplate === 'stickers' && 'A4 Sheet of 6 Stickers Preview'}
                  {activeTemplate === 'poster' && 'A4 Wall Poster Preview'}
                  {activeTemplate === 'simulator' && 'Customer Smartphone Scan Simulation'}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDownloadPng}
                  disabled={!qrDataUrl || isGenerating}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition-colors cursor-pointer"
                  title="Download 1024x1024 high-resolution PNG image"
                >
                  <Download className="w-3.5 h-3.5 text-slate-600" />
                  <span className="hidden sm:inline">PNG Image</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadHtmlFlyer}
                  disabled={!qrDataUrl || isGenerating}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition-colors cursor-pointer"
                  title="Download standalone printable HTML flyer"
                >
                  <FileText className="w-3.5 h-3.5 text-slate-600" />
                  <span className="hidden sm:inline">HTML Flyer</span>
                </button>

                <button
                  type="button"
                  onClick={handlePrint}
                  disabled={!qrDataUrl || isGenerating}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-xs font-bold text-white shadow-sm transition-all cursor-pointer"
                  title="Print this template now using your printer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Now</span>
                </button>
              </div>
            </div>

            {/* PREVIEW CONTAINER (This is also what prints under #printable-qr-content) */}
            <div className="flex-1 bg-slate-200/60 p-4 sm:p-6 rounded-3xl border border-slate-200 flex items-center justify-center min-h-[460px] overflow-auto">
              
              <div id="printable-qr-content" className="w-full flex justify-center">
                
                {/* 1. STANDEE / TABLE TENT (A5 format) */}
                {activeTemplate === 'standee' && (
                  <div className="w-full max-w-md bg-white border-4 border-[#14532D] rounded-3xl p-6 sm:p-8 text-center shadow-xl print-avoid-break">
                    {/* Top Green Brand Banner */}
                    <div className="bg-[#14532D] text-white py-1.5 px-4 rounded-xl text-[10px] font-bold tracking-wider uppercase inline-flex items-center gap-1.5 mb-4">
                      <Sparkles className="w-3 h-3 text-emerald-300" />
                      <span>NASBALADNA FRESH HARVEST · الدوحة - قطر</span>
                    </div>

                    <div className="flex justify-center mb-2">
                      <NasBaladnaLogo size="responsive" showTagline={false} />
                    </div>

                    <h3 className="text-xl sm:text-2xl font-black text-[#14532D] tracking-tight mt-1">
                      SCAN TO ORDER NOW
                    </h3>
                    <h4 className="text-lg sm:text-xl font-bold text-emerald-700 mb-3 font-['Tahoma',sans-serif] direction-rtl">
                      امسح الكود واطلب طازجاً في ثوانٍ
                    </h4>

                    <p className="text-xs text-slate-600 max-w-xs mx-auto mb-4 leading-relaxed">
                      Point your phone camera to view today's morning harvest and fresh Baladna dairy delivered to your door in 30 minutes!
                    </p>

                    {/* QR Code Container with Leaf Center Badge */}
                    <div className="relative inline-block p-3.5 bg-emerald-50/80 border-2 border-dashed border-emerald-600 rounded-3xl mb-4 shadow-inner">
                      {qrDataUrl ? (
                        <img
                          src={qrDataUrl}
                          alt="Scan to order NasBaladna fresh produce"
                          className="w-52 h-52 sm:w-56 sm:h-56 mx-auto rounded-xl object-contain"
                        />
                      ) : (
                        <div className="w-52 h-52 flex items-center justify-center text-slate-400">
                          <RefreshCw className="w-6 h-6 animate-spin text-emerald-600" />
                        </div>
                      )}

                      {/* Small Center Emblem Overlay */}
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-2xl shadow-md border-2 border-emerald-600 flex items-center justify-center p-1 pointer-events-none">
                        <span className="text-lg">🥬</span>
                      </div>
                    </div>

                    {/* 3 Step Instruction Row */}
                    <div className="grid grid-cols-3 gap-2 text-center text-slate-700 mb-5">
                      <div className="bg-slate-50 border border-slate-200/90 rounded-xl p-2">
                        <div className="w-5 h-5 mx-auto bg-emerald-600 text-white rounded-full text-[11px] font-bold flex items-center justify-center mb-1">
                          1
                        </div>
                        <div className="text-[10px] font-bold">Open Camera</div>
                        <div className="text-[9px] text-slate-500">افتح الكاميرا</div>
                      </div>

                      <div className="bg-slate-50 border border-slate-200/90 rounded-xl p-2">
                        <div className="w-5 h-5 mx-auto bg-emerald-600 text-white rounded-full text-[11px] font-bold flex items-center justify-center mb-1">
                          2
                        </div>
                        <div className="text-[10px] font-bold">Point at QR</div>
                        <div className="text-[9px] text-slate-500">وجّه نحو الكود</div>
                      </div>

                      <div className="bg-slate-50 border border-slate-200/90 rounded-xl p-2">
                        <div className="w-5 h-5 mx-auto bg-emerald-600 text-white rounded-full text-[11px] font-bold flex items-center justify-center mb-1">
                          3
                        </div>
                        <div className="text-[10px] font-bold">Tap & Order</div>
                        <div className="text-[9px] text-slate-500">اضغط واطلب</div>
                      </div>
                    </div>

                    {/* Quality Badges and Hotline Footer */}
                    <div className="pt-3 border-t border-slate-200 text-slate-500 text-[11px] space-y-1">
                      <div className="flex items-center justify-center gap-4 text-emerald-800 font-semibold text-[10px]">
                        <span>⚡ 30-Min Delivery</span>
                        <span>•</span>
                        <span>🌿 100% Organic</span>
                        <span>•</span>
                        <span>❄️ Cold-Chain 4°C</span>
                      </div>
                      <div className="font-bold text-slate-800 text-xs">
                        Hotline & WhatsApp: <strong className="text-emerald-700">{ownerPhone}</strong>
                      </div>
                      <div className="text-[9px] font-mono text-slate-400 truncate">
                        {currentScanUrl}
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. PACKAGING & BAG STICKERS (Grid of 6 stickers for A4 adhesive sheet) */}
                {activeTemplate === 'stickers' && (
                  <div className="w-full max-w-xl bg-white p-4 sm:p-6 rounded-3xl border border-slate-300 shadow-xl print-avoid-break">
                    <div className="text-center mb-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Print on A4 Adhesive Sticker Sheet · Cut / Peel & Stick on Bags & Boxes
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {[1, 2, 3, 4, 5, 6].map((idx) => (
                        <div
                          key={idx}
                          className="border-2 border-dashed border-emerald-600 rounded-2xl p-3 bg-emerald-50/40 text-center flex flex-col items-center justify-between space-y-1.5 shadow-2xs"
                        >
                          <div className="text-[10px] font-black text-[#14532D] tracking-tight">
                            NASBALADNA FRESH
                          </div>

                          {qrDataUrl && (
                            <img
                              src={qrDataUrl}
                              alt="Scan to reorder"
                              className="w-24 h-24 rounded-lg bg-white p-1 border border-emerald-200"
                            />
                          )}

                          <div className="text-[10px] font-bold text-emerald-800 leading-tight">
                            Scan to Re-Order
                          </div>
                          <div className="text-[9px] text-emerald-700 font-['Tahoma',sans-serif] direction-rtl">
                            امسح لإعادة الطلب
                          </div>

                          <div className="text-[9px] font-mono font-bold text-slate-600 pt-1 border-t border-emerald-200 w-full">
                            📞 {ownerPhone}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. STOREFRONT WINDOW & WALL POSTER (A4 format) */}
                {activeTemplate === 'poster' && (
                  <div className="w-full max-w-lg bg-white border-8 border-[#14532D] rounded-3xl p-8 sm:p-10 text-center shadow-2xl print-avoid-break">
                    <div className="inline-block bg-[#14532D] text-white px-6 py-2 rounded-2xl text-xs font-black tracking-widest uppercase mb-4 shadow-sm">
                      DIRECT FROM LOCAL FARMS · الدوحة - قطر
                    </div>

                    <div className="flex justify-center mb-3">
                      <NasBaladnaLogo size="responsive" showTagline={true} />
                    </div>

                    <h2 className="text-2xl sm:text-3xl font-black text-[#14532D] tracking-tight leading-tight">
                      ORDER FARM FRESH PRODUCE ON YOUR PHONE
                    </h2>
                    <h3 className="text-xl sm:text-2xl font-bold text-emerald-700 mt-1 mb-4 font-['Tahoma',sans-serif] direction-rtl">
                      امسح الكود واطلب خضار وفواكه وألبان طازجة
                    </h3>

                    {/* Massive QR Code */}
                    <div className="p-4 bg-emerald-50 border-4 border-emerald-600 rounded-3xl inline-block my-2 shadow-inner">
                      {qrDataUrl ? (
                        <img
                          src={qrDataUrl}
                          alt="Poster scan code"
                          className="w-64 h-64 sm:w-72 sm:h-72 mx-auto rounded-2xl"
                        />
                      ) : (
                        <div className="w-64 h-64 flex items-center justify-center">
                          <RefreshCw className="w-8 h-8 animate-spin text-emerald-600" />
                        </div>
                      )}
                    </div>

                    <div className="mt-4 text-sm font-bold text-slate-800">
                      Point Phone Camera Here · Express 30-Minute Delivery
                    </div>
                    <div className="text-xs text-slate-500 font-medium mt-1">
                      No App Required · 100% Pesticide-Free · Cash & Cards Accepted
                    </div>

                    <div className="mt-6 pt-4 border-t-2 border-slate-200 flex items-center justify-between text-xs text-slate-600 font-bold">
                      <span>Hotline: {ownerPhone}</span>
                      <span>Doha, State of Qatar</span>
                    </div>
                  </div>
                )}

                {/* 4. SMARTPHONE CAMERA LIVE SIMULATOR */}
                {activeTemplate === 'simulator' && (
                  <div className="w-full max-w-sm bg-slate-900 rounded-[44px] p-4 border-4 border-slate-700 shadow-2xl text-white relative">
                    {/* Phone Notch */}
                    <div className="w-28 h-5 bg-black rounded-b-xl mx-auto mb-3 flex items-center justify-center">
                      <div className="w-3 h-3 rounded-full bg-slate-900 mr-2" />
                      <div className="w-2 h-2 rounded-full bg-blue-950" />
                    </div>

                    {/* Camera Viewfinder */}
                    <div className="relative bg-slate-800 rounded-3xl p-6 text-center overflow-hidden border border-slate-700 aspect-3/4 flex flex-col justify-between">
                      {/* Top Camera Status */}
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span>PHOTO</span>
                        <span className="text-amber-400 font-mono">1x</span>
                        <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                      </div>

                      {/* Viewfinder Corner Brackets */}
                      <div className="relative my-auto flex flex-col items-center justify-center">
                        <div className="relative p-2 border-2 border-amber-400/80 rounded-2xl">
                          {qrDataUrl && (
                            <img
                              src={qrDataUrl}
                              alt="Scanned code in viewfinder"
                              className="w-36 h-36 rounded-lg opacity-90"
                            />
                          )}
                        </div>

                        {/* Simulated iOS Safari Yellow Notification Banner */}
                        <a
                          href={currentScanUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-4 bg-amber-400 hover:bg-amber-300 text-slate-950 px-3.5 py-2 rounded-full text-xs font-bold flex items-center gap-2 shadow-lg transition-transform hover:scale-105 active:scale-95 animate-bounce"
                        >
                          <ExternalLink className="w-3.5 h-3.5 text-slate-950 shrink-0" />
                          <span className="truncate max-w-[200px]">Open nasbaladnafresh.com</span>
                        </a>
                      </div>

                      {/* Bottom Camera Button Controls */}
                      <div className="text-[10px] text-slate-400 text-center">
                        Customer taps the yellow link to open the store in Safari / Chrome instantly!
                      </div>
                    </div>

                    <div className="mt-3 text-center text-xs text-slate-400">
                      Simulating iPhone & Android Native Camera Scan
                    </div>
                  </div>
                )}

              </div>
            </div>

            {/* Bottom Sharing Strip */}
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-slate-600">
                <Share2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Share scan link with customers or team:</span>
              </div>
              
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied!' : 'Copy Link'}</span>
                </button>

                <a
                  href={`https://wa.me/?text=${encodeURIComponent(
                    `Fresh Farm Harvest & Baladna Dairy delivered across Qatar in 30 mins! Scan or tap here to order: ${currentScanUrl}`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-1 px-3.5 py-1.5 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold transition-all shadow-xs"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp Share</span>
                </a>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
