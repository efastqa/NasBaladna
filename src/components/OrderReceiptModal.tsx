import React, { useRef, useState } from 'react';
import { Order } from '../types';
import {
  Printer,
  X,
  Download,
  Share2,
  Check,
  Truck,
  MapPin,
  Calendar,
  Phone,
  ShieldCheck,
  FileText,
  MessageCircle,
} from 'lucide-react';
import { NasBaladnaLogo } from './NasBaladnaLogo';

interface OrderReceiptModalProps {
  order: Order;
  isOpen: boolean;
  onClose: () => void;
  formatPrice: (amount: number) => string;
}

export const OrderReceiptModal: React.FC<OrderReceiptModalProps> = ({
  order,
  isOpen,
  onClose,
  formatPrice,
}) => {
  const receiptRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [printStatus, setPrintStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  // Print function: uses CSS @media print directly with robust fallbacks
  const handlePrint = () => {
    try {
      setPrintStatus('Opening print dialog...');
      // Direct window.print() leverages the @media print rules where only #printable-receipt-content is visible
      window.print();
      setTimeout(() => setPrintStatus(null), 2000);
    } catch (err) {
      console.warn('Native window.print failed, attempting iframe print fallback:', err);
      // Fallback iframe print method
      try {
        const printFrame = document.createElement('iframe');
        printFrame.style.position = 'fixed';
        printFrame.style.right = '0';
        printFrame.style.bottom = '0';
        printFrame.style.width = '0';
        printFrame.style.height = '0';
        printFrame.style.border = '0';
        document.body.appendChild(printFrame);

        const frameDoc = printFrame.contentWindow?.document;
        if (frameDoc && receiptRef.current) {
          frameDoc.open();
          frameDoc.write(`
            <!DOCTYPE html>
            <html>
              <head>
                <title>Receipt_Order_${order.orderNumber}</title>
                <meta charset="utf-8" />
                <style>
                  body { font-family: system-ui, sans-serif; padding: 20px; color: #1e293b; }
                  table { width: 100%; border-collapse: collapse; margin: 15px 0; }
                  th, td { padding: 8px; border-bottom: 1px solid #e2e8f0; text-align: left; }
                  .text-right { text-align: right; }
                  @media print { body { padding: 0; } }
                </style>
              </head>
              <body>${receiptRef.current.innerHTML}</body>
            </html>
          `);
          frameDoc.close();
          setTimeout(() => {
            printFrame.contentWindow?.focus();
            printFrame.contentWindow?.print();
            setTimeout(() => {
              if (document.body.contains(printFrame)) {
                document.body.removeChild(printFrame);
              }
            }, 1000);
          }, 200);
        }
      } catch (e) {
        console.error('All print methods failed:', e);
        handleDownloadHtml();
      }
    }
  };

  // 100% Reliable Download Invoice as Offline HTML document
  const handleDownloadHtml = () => {
    const itemsListHtml = order.items
      .map(
        (it) => `
        <tr>
          <td style="padding: 10px 8px; border-bottom: 1px solid #f1f5f9;">
            <strong>${it.product.name}</strong><br/>
            <span style="font-size: 11px; color: #64748b;">SKU: ${it.product.sku}</span>
          </td>
          <td style="padding: 10px 8px; text-align: center; border-bottom: 1px solid #f1f5f9;">${it.selectedWeight}</td>
          <td style="padding: 10px 8px; text-align: center; border-bottom: 1px solid #f1f5f9; font-weight: bold;">x${it.quantity}</td>
          <td style="padding: 10px 8px; text-align: right; border-bottom: 1px solid #f1f5f9; font-weight: bold;">${formatPrice(it.pricePerUnit * it.quantity)}</td>
        </tr>
      `
      )
      .join('');

    const invoiceContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>NasBaladna_Invoice_${order.orderNumber}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background: #f8fafc; color: #0f172a; margin: 0; padding: 24px; }
    .invoice-card { max-width: 620px; margin: 0 auto; background: #fff; border-radius: 16px; border: 1px solid #e2e8f0; padding: 32px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
    .brand-header { text-align: center; border-bottom: 2px dashed #cbd5e1; padding-bottom: 20px; margin-bottom: 20px; }
    .brand-title { color: #065f46; font-size: 24px; font-weight: 800; margin: 0; }
    .brand-sub { color: #64748b; font-size: 12px; margin-top: 4px; }
    .grid-2 { display: flex; justify-content: space-between; background: #f8fafc; padding: 14px; border-radius: 12px; font-size: 12px; line-height: 1.6; margin-bottom: 20px; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; margin: 16px 0; }
    th { background: #f1f5f9; padding: 8px; text-align: left; font-size: 11px; text-transform: uppercase; color: #475569; }
    .totals { border-top: 2px dashed #cbd5e1; padding-top: 14px; font-size: 13px; margin-top: 10px; }
    .total-line { display: flex; justify-content: space-between; margin-bottom: 6px; }
    .grand-total { font-size: 18px; font-weight: 800; color: #065f46; border-top: 1px solid #e2e8f0; padding-top: 10px; margin-top: 8px; }
    .footer { text-align: center; color: #94a3b8; font-size: 11px; margin-top: 28px; border-top: 1px solid #f1f5f9; padding-top: 14px; }
    .print-btn { display: inline-block; background: #065f46; color: #fff; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 13px; margin-top: 16px; cursor: pointer; border: none; }
    @media print {
      body { background: #fff; padding: 0; }
      .invoice-card { box-shadow: none; border: none; padding: 0; }
      .print-btn { display: none; }
    }
  </style>
</head>
<body>
  <div class="invoice-card">
    <div class="brand-header">
      <h1 class="brand-title">NasBaladna Farm Fresh W.L.L</h1>
      <p class="brand-sub">Commercial Registration C.R. 109482 · Al Khor Agricultural Estate, Qatar</p>
      <p class="brand-sub">Official Tax Invoice & Delivery Receipt · Hotline: +974 7731 5415</p>
      <button class="print-btn" onclick="window.print()">Print Document</button>
    </div>

    <div class="grid-2">
      <div>
        <strong>Invoice / Order No:</strong> #${order.orderNumber}<br/>
        <strong>Date & Time:</strong> ${order.createdAt} (Today)<br/>
        <strong>Payment Status:</strong> <span style="color: #065f46; font-weight: bold;">${order.paymentStatus === 'paid' ? 'PAID IN FULL' : 'PAYMENT ON DELIVERY'}</span><br/>
        <strong>Payment Method:</strong> ${order.paymentMethod.toUpperCase()}
      </div>
      <div>
        <strong>Billed To Customer:</strong> ${order.customerName}<br/>
        <strong>Contact:</strong> ${order.phone}<br/>
        <strong>Destination:</strong> ${order.address}, ${order.district}<br/>
        <strong>Delivery Slot:</strong> ${order.deliverySlot}
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>Produce Item</th>
          <th style="text-align: center;">Weight</th>
          <th style="text-align: center;">Qty</th>
          <th style="text-align: right;">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${itemsListHtml}
      </tbody>
    </table>

    <div class="totals">
      <div class="total-line">
        <span>Subtotal Produce:</span>
        <span>${formatPrice(order.subtotal)}</span>
      </div>
      <div class="total-line">
        <span>Express Cold-Chain Delivery:</span>
        <span>${order.deliveryFee === 0 ? 'FREE' : formatPrice(order.deliveryFee)}</span>
      </div>
      <div class="total-line">
        <span>Qatar VAT (0% Basic Fresh Foods):</span>
        <span>QAR 0.00</span>
      </div>
      <div class="total-line grand-total">
        <span>Grand Total:</span>
        <span>${formatPrice(order.total)}</span>
      </div>
    </div>

    <div style="background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 12px; padding: 12px; margin-top: 20px; font-size: 12px;">
      <strong>Assigned Courier:</strong> ${order.courier.name} (${order.courier.phone})<br/>
      <strong>Vehicle & License Plate:</strong> ${order.courier.vehicle} · Plate ${order.courier.plateNumber}
    </div>

    <div class="footer">
      <p>Thank you for choosing NasBaladna Local Agricultural Produce!</p>
      <p>Harvested Daily Fresh · Organic & Pesticide Tested · Maintain Cold Chain at 4°C</p>
    </div>
  </div>
</body>
</html>`;

    const blob = new Blob([invoiceContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `NasBaladna_Receipt_${order.orderNumber}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Copy plain text receipt to clipboard
  const handleCopyReceipt = () => {
    const itemsText = order.items
      .map((it) => `• ${it.product.name} (${it.selectedWeight}) x${it.quantity} = ${formatPrice(it.pricePerUnit * it.quantity)}`)
      .join('\n');

    const text = `🌿 NASBALADNA FRESH PRODUCE - ORDER RECEIPT
Order #: ${order.orderNumber}
Date: ${order.createdAt}
Customer: ${order.customerName} (${order.phone})
Delivery: ${order.address}, ${order.district}
Delivery Slot: ${order.deliverySlot}

ITEMS ORDERED:
${itemsText}

Subtotal: ${formatPrice(order.subtotal)}
Delivery Fee: ${order.deliveryFee === 0 ? 'FREE' : formatPrice(order.deliveryFee)}
Total Paid/Due: ${formatPrice(order.total)}
Payment Status: ${order.paymentStatus === 'paid' ? 'PAID IN FULL' : 'PAY ON DELIVERY'}

Courier: ${order.courier.name} (${order.courier.phone})
Customer Support: +974 7731 5415`;

    navigator.clipboard?.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  // Direct WhatsApp share
  const handleShareWhatsApp = () => {
    const summary = encodeURIComponent(
      `🌿 *NasBaladna Receipt - Order #${order.orderNumber}*\n` +
      `Customer: ${order.customerName}\n` +
      `Total: ${formatPrice(order.total)}\n` +
      `Items: ${order.items.length} farm items\n` +
      `Delivery To: ${order.address}, ${order.district}\n` +
      `Courier: ${order.courier.name} (${order.courier.phone})`
    );
    window.open(`https://wa.me/?text=${summary}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-60 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto max-h-[92dvh]">
        {/* Modal Top Bar */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <Printer className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm font-['Outfit']">Official Tax Invoice & Receipt</h3>
              <p className="text-[11px] text-slate-500">Order #{order.orderNumber}</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
              title="Print or Save as PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Now</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Content with print id */}
        <div
          id="printable-receipt-content"
          ref={receiptRef}
          className="overflow-y-auto p-5 sm:p-6 space-y-5 bg-white text-slate-800 text-xs"
        >
          {/* Receipt Header */}
          <div className="text-center pb-4 border-b border-dashed border-slate-200 space-y-1 print-avoid-break">
            <div className="flex justify-center mb-1">
              <NasBaladnaLogo size="sm" />
            </div>
            <h2 className="font-extrabold text-base text-slate-900 font-['Outfit'] tracking-tight">
              NasBaladna Farm Fresh Products W.L.L
            </h2>
            <p className="text-[11px] text-slate-500">
              Commercial Registration (C.R.): 109482 · Al Khor Agricultural Estate, Qatar
            </p>
            <p className="text-[11px] text-slate-500">
              Customer Support Hotline & WhatsApp: +974 7731 5415
            </p>
          </div>

          {/* Order Metadata */}
          <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3.5 rounded-2xl border border-slate-100 text-[11px] print-avoid-break">
            <div>
              <span className="text-slate-400 block">Receipt / Order No:</span>
              <span className="font-bold font-mono text-slate-900 text-xs">#{order.orderNumber}</span>
              <span className="text-slate-400 block mt-2">Date & Time:</span>
              <span className="font-medium text-slate-800">{order.createdAt} (Today)</span>
              <span className="text-slate-400 block mt-2">Payment Status:</span>
              <span className="font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 inline-block uppercase text-[10px]">
                {order.paymentStatus === 'paid' ? 'PAID IN FULL' : 'CASH / CARD ON DELIVERY'}
              </span>
            </div>

            <div>
              <span className="text-slate-400 block">Billed To Customer:</span>
              <span className="font-bold text-slate-900 block">{order.customerName}</span>
              <span className="font-mono text-slate-600 block">{order.phone}</span>
              <span className="text-slate-400 block mt-2">Delivery Address:</span>
              <span className="text-slate-800 block line-clamp-2">{order.address}, {order.district}</span>
              <span className="text-slate-400 block mt-1">Delivery Slot:</span>
              <span className="font-medium text-slate-800">{order.deliverySlot}</span>
            </div>
          </div>

          {/* Itemized Table */}
          <div className="space-y-1 print-avoid-break">
            <div className="flex justify-between text-[11px] font-bold text-slate-500 uppercase pb-1.5 border-b border-slate-200">
              <span className="flex-1">Farm Harvest Item</span>
              <span className="w-16 text-center">Unit / Weight</span>
              <span className="w-12 text-center">Qty</span>
              <span className="w-16 text-right">Amount</span>
            </div>

            <div className="divide-y divide-slate-100">
              {order.items.map((it, idx) => (
                <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="flex-1 pr-2">
                    <span className="font-bold text-slate-900 block">{it.product.name}</span>
                    <span className="text-[10px] text-slate-500 font-mono">SKU: {it.product.sku}</span>
                  </div>
                  <div className="w-16 text-center text-slate-600 text-[11px]">
                    {it.selectedWeight}
                  </div>
                  <div className="w-12 text-center font-mono font-medium text-slate-900">
                    x{it.quantity}
                  </div>
                  <div className="w-16 text-right font-mono font-bold text-slate-900">
                    {formatPrice(it.pricePerUnit * it.quantity)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Financial Summary */}
          <div className="border-t-2 border-dashed border-slate-200 pt-3 space-y-1.5 text-xs print-avoid-break">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal Produce</span>
              <span className="font-mono font-medium text-slate-900">{formatPrice(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Express Cold Delivery</span>
              <span className="font-mono font-medium text-slate-900">
                {order.deliveryFee === 0 ? 'FREE (Orders over 50 QAR)' : formatPrice(order.deliveryFee)}
              </span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Qatar Value Added Tax (0% Food Basic)</span>
              <span className="font-mono font-medium text-slate-900">QAR 0.00</span>
            </div>
            <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-2 border-t border-slate-200">
              <span>Grand Total</span>
              <span className="font-mono text-base text-emerald-800">{formatPrice(order.total)}</span>
            </div>
          </div>

          {/* Courier & Guarantee Footer */}
          <div className="bg-emerald-50/60 p-3 rounded-2xl border border-emerald-100 flex items-center gap-3 print-avoid-break">
            <Truck className="w-5 h-5 text-emerald-700 shrink-0" />
            <div className="text-[11px] text-emerald-950">
              <span className="font-bold block">Assigned Courier: {order.courier.name} ({order.courier.phone})</span>
              <span className="text-emerald-800/80">
                Vehicle: {order.courier.vehicle} · Plate: {order.courier.plateNumber}
              </span>
            </div>
          </div>

          <div className="text-center pt-2 text-[10px] text-slate-400 space-y-0.5 print-avoid-break">
            <p>Thank you for supporting NasBaladna Local Agricultural Estates!</p>
            <p>100% Pesticide Tested · Harvested Morning Fresh · Keep Chilled at 4°C</p>
          </div>
        </div>

        {/* Modal Bottom Actions */}
        <div className="p-3.5 border-t border-slate-100 bg-slate-50 flex flex-col gap-2">
          {printStatus && (
            <div className="text-center text-[11px] text-emerald-700 font-semibold bg-emerald-50 py-1 rounded-lg">
              {printStatus}
            </div>
          )}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex-1 py-2.5 px-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={handleDownloadHtml}
              className="py-2.5 px-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
              title="Download standalone invoice HTML document"
            >
              <Download className="w-4 h-4 text-emerald-700" />
              <span className="hidden sm:inline">Download</span> Invoice
            </button>
            <button
              onClick={handleCopyReceipt}
              className="py-2.5 px-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
              title="Copy receipt summary to clipboard"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <FileText className="w-4 h-4 text-slate-500" />}
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>
            <button
              onClick={handleShareWhatsApp}
              className="p-2.5 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-xl transition-all"
              title="Share receipt via WhatsApp"
            >
              <MessageCircle className="w-4 h-4 fill-current" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
