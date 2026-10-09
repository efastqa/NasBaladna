import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import {
  X,
  Boxes,
  RefreshCw,
  Plus,
  Minus,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Zap,
  Activity,
  History,
} from 'lucide-react';

export const InventoryManagerModal: React.FC = () => {
  const {
    isInventoryModalOpen,
    setIsInventoryModalOpen,
    products,
    updateStock,
    inventoryLogs,
    formatPrice,
    showToast,
  } = useStore();

  const [activeTab, setActiveTab] = useState<'stocks' | 'logs'>('stocks');
  const [filterStock, setFilterStock] = useState<'all' | 'low' | 'out'>('all');
  const [isSimulatingRush, setIsSimulatingRush] = useState(false);

  if (!isInventoryModalOpen) return null;

  const handleSimulateRush = () => {
    setIsSimulatingRush(true);
    showToast('Simulating live customer purchases across Doha...');

    // Pick 3 random products and decrement stock
    const available = products.filter((p) => p.stock > 0);
    if (available.length > 0) {
      const p1 = available[Math.floor(Math.random() * available.length)];
      updateStock(p1.id, -2, 'customer_order');

      setTimeout(() => {
        const available2 = products.filter((p) => p.stock > 0);
        if (available2.length > 0) {
          const p2 = available2[Math.floor(Math.random() * available2.length)];
          updateStock(p2.id, -3, 'customer_order');
        }
      }, 700);

      setTimeout(() => {
        setIsSimulatingRush(false);
        showToast('Real-time inventory deduction complete!');
      }, 1400);
    } else {
      setIsSimulatingRush(false);
    }
  };

  const filteredProducts = products.filter((p) => {
    if (filterStock === 'low') return p.stock > 0 && p.stock <= 10;
    if (filterStock === 'out') return p.stock === 0;
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex justify-center items-start sm:items-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-3xl sm:rounded-3xl shadow-2xl overflow-hidden min-h-[100dvh] sm:min-h-0 sm:max-h-[92dvh] flex flex-col my-auto border border-slate-200/60">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Activity className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold font-['Outfit']">
                  Real-Time Inventory Tracking Engine
                </h2>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              </div>
              <p className="text-[11px] text-slate-300">
                Cold-chain warehouse automated stock levels & customer order sync
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsInventoryModalOpen(false)}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Controls & Tab Switcher */}
        <div className="p-3 sm:p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Tabs */}
          <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setActiveTab('stocks')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                activeTab === 'stocks'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Live SKUs ({products.length})
            </button>
            <button
              onClick={() => setActiveTab('logs')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                activeTab === 'logs'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Activity Audit Log ({inventoryLogs.length})
            </button>
          </div>

          {/* Rush Simulator Button */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleSimulateRush}
              disabled={isSimulatingRush}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs transition-all disabled:opacity-50"
              title="Test real-time inventory tracking by simulating live orders"
            >
              <Zap className="w-3.5 h-3.5 text-amber-300" />
              <span>{isSimulatingRush ? 'Simulating...' : 'Simulate Live Customer Order'}</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 p-4 sm:p-6 space-y-4 pb-[max(1.5rem,calc(env(safe-area-inset-bottom)+1.5rem))]">
          {activeTab === 'stocks' ? (
            <>
              {/* Filter pills */}
              <div className="flex items-center gap-2 text-xs">
                <span className="font-semibold text-slate-500">Filter stock:</span>
                <button
                  onClick={() => setFilterStock('all')}
                  className={`px-2.5 py-1 rounded-lg border font-medium ${
                    filterStock === 'all'
                      ? 'bg-slate-800 text-white border-slate-800'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  All Items
                </button>
                <button
                  onClick={() => setFilterStock('low')}
                  className={`px-2.5 py-1 rounded-lg border font-medium ${
                    filterStock === 'low'
                      ? 'bg-amber-600 text-white border-amber-600'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  Low Stock (&le; 10)
                </button>
                <button
                  onClick={() => setFilterStock('out')}
                  className={`px-2.5 py-1 rounded-lg border font-medium ${
                    filterStock === 'out'
                      ? 'bg-rose-600 text-white border-rose-600'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  Out of Stock
                </button>
              </div>

              {/* Table of SKUs */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100">
                {filteredProducts.map((p) => {
                  const isLow = p.stock > 0 && p.stock <= 10;
                  const isOut = p.stock === 0;

                  return (
                    <div
                      key={p.id}
                      className="p-3.5 flex items-center justify-between gap-3 hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={p.image}
                          alt={p.name}
                          className="w-12 h-12 rounded-xl object-contain bg-slate-50 p-1 border border-slate-200 shrink-0"
                          referrerPolicy="no-referrer"
                        />
                        <div className="min-w-0">
                          <h4 className="font-bold text-slate-900 text-xs sm:text-sm truncate">
                            {p.name}
                          </h4>
                          <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono mt-0.5">
                            <span>{p.sku}</span>
                            <span>·</span>
                            <span>Base: {formatPrice(p.basePrice)}</span>
                            <span>·</span>
                            <span className="capitalize">{p.category}</span>
                          </div>
                        </div>
                      </div>

                      {/* Stock Level & Adjusters */}
                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right">
                          <div className="flex items-center gap-1.5 justify-end">
                            <span
                              className={`w-2 h-2 rounded-full ${
                                isOut ? 'bg-rose-500' : isLow ? 'bg-amber-500' : 'bg-emerald-500'
                              } animate-pulse`}
                            />
                            <span className="font-mono font-bold text-sm sm:text-base text-slate-900">
                              {p.stock} units
                            </span>
                          </div>
                          <span
                            className={`text-[10px] font-semibold ${
                              isOut
                                ? 'text-rose-600'
                                : isLow
                                ? 'text-amber-600'
                                : 'text-emerald-700'
                            }`}
                          >
                            {isOut ? 'Sold Out' : isLow ? 'Low Stock Alert' : 'Healthy Inventory'}
                          </span>
                        </div>

                        {/* Adjust buttons */}
                        <div className="flex items-center gap-1 border border-slate-200 rounded-xl p-0.5 bg-white">
                          <button
                            onClick={() => updateStock(p.id, -1, 'manual_audit')}
                            disabled={p.stock <= 0}
                            className="p-1 hover:bg-slate-100 rounded text-slate-600 disabled:opacity-30"
                            title="Decrement 1"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => updateStock(p.id, 10, 'restock')}
                            className="px-2 py-0.5 text-[11px] font-bold text-emerald-700 hover:bg-emerald-50 rounded"
                            title="Restock +10 units"
                          >
                            +10
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            /* Audit Log View */
            <div className="space-y-2">
              <div className="text-xs text-slate-500 mb-2">
                Real-time ledger recording inventory modifications, customer checkouts, and warehouse shipments.
              </div>
              <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100">
                {inventoryLogs.map((log) => (
                  <div key={log.id} className="p-3 text-xs flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900 block">{log.productName}</span>
                      <span className="text-[11px] text-slate-500">
                        Reason: {log.reason.replace('_', ' ')} · Time: {log.timestamp}
                      </span>
                    </div>

                    <div className="text-right font-mono">
                      <span
                        className={`font-bold ${
                          log.change > 0 ? 'text-emerald-700' : 'text-rose-600'
                        }`}
                      >
                        {log.change > 0 ? `+${log.change}` : log.change} units
                      </span>
                      <span className="block text-[11px] text-slate-500">
                        New balance: {log.newStock}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
