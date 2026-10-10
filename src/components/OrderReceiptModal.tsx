import React, { useRef } from 'react';
import { Order } from '../types';
import {
  Printer,
  X,
  Download,
  Share2,
  CheckCircle2,
  Truck,
  MapPin,
  Calendar,
  Phone,
  ShieldCheck,
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

  if (!isOpen) return null;

  const handlePrint = () => {
    // Print in new isolated popup/window for clean receipt rendering without page headers/UI clutter
    const receiptHtml = receiptRef.current?.innerHTML;
    if (!receiptHtml) {
      window.print();
      return;
    }

    const printFrame = document.createElement('iframe');
    printFrame.style.position = 'fixed';
    printFrame.style.right = '0';
    printFrame.style.bottom = '0';
    printFrame.style.width = '0';
    printFrame.style.height = '0';
    printFrame.style.border = '0';
    document.body.appendChild(printFrame);

    const frameDoc = printFrame.contentWindow?.document;
    if (frameDoc) {
      frameDoc.open();
      frameDoc.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Receipt_Order_${order.orderNumber}</title>
            <meta charset="utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                margin: 0;
                padding: 24px;
                color: #1e293b;
                background: #fff;
              }
              .receipt-container {
                max-width: 580px;
                margin: 0 auto;
                border: 1px solid #e2e8f0;
                border-radius: 12px;
                padding: 24px;
              }
              .header {
                text-align: center;
                border-bottom: 2px dashed #cbd5e1;
                padding-bottom: 16px;
                margin-bottom: 16px;
              }
              .logo-title {
                font-size: 20px;
                font-weight: 800;
                color: #065f46;
                margin: 0;
              }
              .subtitle {
                font-size: 11px;
                color: #64748b;
                margin-top: 4px;
              }
              .meta-grid {
                display: flex;
                justify-content: space-between;
                font-size: 12px;
                margin-bottom: 16px;
                line-height: 1.6;
              }
              .items-table {
                width: 100%;
                border-collapse: collapse;
                margin: 16px 0;
                font-size: 12px;
              }
              .items-table th {
                text-align: left;
                background: #f8fafc;
                padding: 8px;
                border-bottom: 1px solid #e2e8f0;
                font-size: 11px;
                text-transform: uppercase;
                color: #475569;
              }
              .items-table td {
                padding: 10px 8px;
                border-bottom: 1px solid #f1f5f9;
              }
              .text-right { text-align: right; }
              .totals {
                border-top: 2px dashed #cbd5e1;
                padding-top: 12px;
                font-size: 12px;
              }
              .total-row {
                display: flex;
                justify-content: space-between;
                margin-bottom: 6px;
              }
              .grand-total {
                font-size: 16px;
                font-weight: 800;
                color: #065f46;
                border-top: 1px solid #e2e8f0;
                padding-top: 8px;
                margin-top: 6px;
              }
              .footer {
                text-align: center;
                font-size: 11px;
                color: #64748b;
                margin-top: 24px;
                border-top: 1px solid #f1f5f9;
                padding-top: 12px;
              }
              @media print {
                body { padding: 0; }
                .receipt-container { border: none; padding: 12px; }
              }
            </style>
          </head>
          <body>
            ${receiptHtml}
          </body>
        </html>
      `);
      frameDoc.close();

      setTimeout(() => {
        printFrame.contentWindow?.focus();
        printFrame.contentWindow?.print();
        setTimeout(() => {
          document.body.removeChild(printFrame);
        }, 1500);
      }, 300);
    }
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
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Now</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Content */}
        <div className="overflow-y-auto p-5 sm:p-6 space-y-5 bg-white text-slate-800 text-xs" ref={receiptRef}>
          {/* Receipt Header */}
          <div className="text-center pb-4 border-b border-dashed border-slate-200 space-y-1">
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
          <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3.5 rounded-2xl border border-slate-100 text-[11px]">
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
          <div className="space-y-1">
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
          <div className="border-t-2 border-dashed border-slate-200 pt-3 space-y-1.5 text-xs">
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
          <div className="bg-emerald-50/60 p-3 rounded-2xl border border-emerald-100 flex items-center gap-3">
            <Truck className="w-5 h-5 text-emerald-700 shrink-0" />
            <div className="text-[11px] text-emerald-950">
              <span className="font-bold block">Assigned Courier: {order.courier.name} ({order.courier.phone})</span>
              <span className="text-emerald-800/80">
                Vehicle: {order.courier.vehicle} · Plate: {order.courier.plateNumber}
              </span>
            </div>
          </div>

          <div className="text-center pt-2 text-[10px] text-slate-400 space-y-0.5">
            <p>Thank you for supporting NasBaladna Local Agricultural Estates!</p>
            <p>100% Pesticide Tested · Harvested Morning Fresh · Keep Chilled at 4°C</p>
          </div>
        </div>

        {/* Modal Bottom Actions */}
        <div className="p-3.5 border-t border-slate-100 bg-slate-50 flex gap-2">
          <button
            onClick={handlePrint}
            className="flex-1 py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Save as PDF</span>
          </button>
          <button
            onClick={onClose}
            className="py-2.5 px-4 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl font-semibold text-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
