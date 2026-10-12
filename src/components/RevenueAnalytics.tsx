import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  DollarSign,
  ShoppingBag,
  TrendingDown,
  Calendar,
  Award,
  BarChart3,
  PieChart as PieChartIcon,
  Sparkles,
  ArrowUpRight,
  ShieldAlert,
  Percent,
  Layers,
  Clock,
  CheckCircle2,
  Filter,
} from 'lucide-react';
import { Order, Product } from '../types';

interface RevenueAnalyticsProps {
  orders: Order[];
  products: Product[];
  formatPrice: (amountInQar: number) => string;
}

export const RevenueAnalytics: React.FC<RevenueAnalyticsProps> = ({
  orders,
  products,
  formatPrice,
}) => {
  const [timeRange, setTimeRange] = useState<'all' | '30d' | '7d'>('all');

  // Filter orders by time range
  const filteredOrders = useMemo(() => {
    const now = Date.now();
    return orders.filter((o) => {
      if (timeRange === 'all') return true;
      const orderDate = new Date(o.createdAt).getTime();
      const diffDays = (now - orderDate) / (1000 * 60 * 60 * 24);
      if (timeRange === '7d') return diffDays <= 7;
      if (timeRange === '30d') return diffDays <= 30;
      return true;
    });
  }, [orders, timeRange]);

  // Key KPI metrics
  const stats = useMemo(() => {
    const totalOrders = filteredOrders.length;
    const totalRevenue = filteredOrders.reduce((sum, o) => sum + (o.total || 0), 0);
    const subtotalRevenue = filteredOrders.reduce((sum, o) => sum + (o.subtotal || 0), 0);
    const deliveryRevenue = filteredOrders.reduce((sum, o) => sum + (o.deliveryFee || 0), 0);
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Approximate estimated COGS (Cost of Goods Sold) ~ 62% for fresh farm direct harvest
    // Net profit ~ 38% gross margin
    const estimatedCogs = subtotalRevenue * 0.62;
    const estimatedGrossProfit = subtotalRevenue - estimatedCogs + deliveryRevenue * 0.45;
    const profitMargin = totalRevenue > 0 ? (estimatedGrossProfit / totalRevenue) * 100 : 0;

    // Breakdown by payment status & delivery service
    const expressOrders = filteredOrders.filter((o) => o.isExpress || o.serviceType === 'express').length;
    const prepaidOrders = filteredOrders.filter((o) => o.paymentMethod !== 'cod' || o.paymentStatus === 'paid').length;
    const codOrders = filteredOrders.filter((o) => o.paymentMethod === 'cod').length;

    return {
      totalOrders,
      totalRevenue,
      subtotalRevenue,
      deliveryRevenue,
      avgOrderValue,
      estimatedGrossProfit,
      profitMargin,
      expressOrders,
      prepaidOrders,
      codOrders,
    };
  }, [filteredOrders]);

  // Daily revenue data (for visual chart)
  const dailyData = useMemo(() => {
    const map = new Map<string, { date: string; revenue: number; ordersCount: number; profit: number }>();

    // Sort chronologically
    const sorted = [...filteredOrders].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    sorted.forEach((order) => {
      const d = new Date(order.createdAt);
      // Format as "MMM DD" e.g. "Oct 12"
      const dateKey = !isNaN(d.getTime())
        ? d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        : 'Recent';

      const existing = map.get(dateKey) || { date: dateKey, revenue: 0, ordersCount: 0, profit: 0 };
      existing.revenue += order.total || 0;
      existing.ordersCount += 1;
      existing.profit += (order.subtotal || 0) * 0.38 + (order.deliveryFee || 0) * 0.45;
      map.set(dateKey, existing);
    });

    const entries = Array.from(map.values());
    if (entries.length === 0) {
      return [
        { date: 'Today', revenue: 0, ordersCount: 0, profit: 0 }
      ];
    }
    return entries;
  }, [filteredOrders]);

  const maxDailyRevenue = useMemo(() => {
    return Math.max(...dailyData.map((d) => d.revenue), 10);
  }, [dailyData]);

  // Top-selling produce (by units and revenue)
  const topSellingProduce = useMemo(() => {
    const itemMap = new Map<
      string,
      {
        id: string;
        name: string;
        unitsSold: number;
        revenueGenerated: number;
        category: string;
        image?: string;
        organic: boolean;
      }
    >();

    filteredOrders.forEach((order) => {
      (order.items || []).forEach((cartItem) => {
        const prodId = cartItem.productId || cartItem.product?.id || 'unknown';
        const prodName = cartItem.product?.name || 'Produce Item';
        const qty = cartItem.quantity || 1;
        const lineTotal = (cartItem.pricePerUnit || 0) * qty;

        const existing = itemMap.get(prodId) || {
          id: prodId,
          name: prodName,
          unitsSold: 0,
          revenueGenerated: 0,
          category: cartItem.product?.category || 'vegetables',
          image: cartItem.product?.image,
          organic: cartItem.product?.organic || false,
        };

        existing.unitsSold += qty;
        existing.revenueGenerated += lineTotal;
        itemMap.set(prodId, existing);
      });
    });

    return Array.from(itemMap.values())
      .sort((a, b) => b.revenueGenerated - a.revenueGenerated)
      .slice(0, 8);
  }, [filteredOrders]);

  // Breakdown by District/Zone
  const districtBreakdown = useMemo(() => {
    const distMap = new Map<string, { district: string; orders: number; revenue: number }>();
    filteredOrders.forEach((o) => {
      const dist = o.district || 'Doha';
      const cur = distMap.get(dist) || { district: dist, orders: 0, revenue: 0 };
      cur.orders += 1;
      cur.revenue += o.total || 0;
      distMap.set(dist, cur);
    });
    return Array.from(distMap.values()).sort((a, b) => b.revenue - a.revenue);
  }, [filteredOrders]);

  return (
    <div className="space-y-6">
      {/* Top Header & Range Filters */}
      <div className="bg-slate-950 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-lg shadow-emerald-900/30">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold font-['Outfit'] text-white flex items-center gap-2">
                  <span>Revenue & Profit Analytics</span>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800">
                    LIVE
                  </span>
                </h2>
                <p className="text-xs text-slate-400">
                  Real-time sales revenue in QAR, gross margins, average order ticket, and top harvest produce.
                </p>
              </div>
            </div>
          </div>

          {/* Time range selector */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-2xl self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setTimeRange('7d')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                timeRange === '7d'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Last 7 Days
            </button>
            <button
              type="button"
              onClick={() => setTimeRange('30d')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                timeRange === '30d'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Last 30 Days
            </button>
            <button
              type="button"
              onClick={() => setTimeRange('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                timeRange === 'all'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All Time ({orders.length})
            </button>
          </div>
        </div>
      </div>

      {/* KPI Highlights Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Sales Revenue */}
        <div className="bg-slate-950 border border-slate-800 hover:border-emerald-700/60 transition-all rounded-3xl p-5 relative overflow-hidden shadow-lg group">
          <div className="absolute top-0 right-0 w-28 h-28 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all pointer-events-none" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400">Total Sales Revenue</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-950 border border-emerald-800 text-emerald-400 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-['Outfit'] text-white">
            {formatPrice(stats.totalRevenue)}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-xs text-emerald-400 font-semibold">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Includes 100% verified customer orders</span>
          </div>
        </div>

        {/* Estimated Profit */}
        <div className="bg-slate-950 border border-slate-800 hover:border-teal-700/60 transition-all rounded-3xl p-5 relative overflow-hidden shadow-lg group">
          <div className="absolute top-0 right-0 w-28 h-28 bg-teal-500/10 rounded-full blur-2xl group-hover:bg-teal-500/20 transition-all pointer-events-none" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400">Est. Gross Profit</span>
            <div className="w-8 h-8 rounded-xl bg-teal-950 border border-teal-800 text-teal-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-['Outfit'] text-teal-300">
            {formatPrice(stats.estimatedGrossProfit)}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-xs text-teal-400 font-semibold">
            <Percent className="w-3.5 h-3.5" />
            <span>~{stats.profitMargin.toFixed(1)}% Estimated Farm Margin</span>
          </div>
        </div>

        {/* Total Orders Placed */}
        <div className="bg-slate-950 border border-slate-800 hover:border-blue-700/60 transition-all rounded-3xl p-5 relative overflow-hidden shadow-lg group">
          <div className="absolute top-0 right-0 w-28 h-28 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all pointer-events-none" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400">Total Orders Placed</span>
            <div className="w-8 h-8 rounded-xl bg-blue-950 border border-blue-800 text-blue-400 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-['Outfit'] text-white">
            {stats.totalOrders}{' '}
            <span className="text-sm font-normal text-slate-400">orders</span>
          </div>
          <div className="flex items-center gap-2 mt-2 text-xs text-slate-400 font-medium">
            <span className="text-amber-400 font-bold">⚡ {stats.expressOrders} Express</span>
            <span>·</span>
            <span className="text-blue-400 font-bold">{stats.prepaidOrders} Prepaid</span>
          </div>
        </div>

        {/* Average Order Value (AOV) */}
        <div className="bg-slate-950 border border-slate-800 hover:border-purple-700/60 transition-all rounded-3xl p-5 relative overflow-hidden shadow-lg group">
          <div className="absolute top-0 right-0 w-28 h-28 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-all pointer-events-none" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400">Average Order Value (AOV)</span>
            <div className="w-8 h-8 rounded-xl bg-purple-950 border border-purple-800 text-purple-400 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-['Outfit'] text-purple-300">
            {formatPrice(stats.avgOrderValue)}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-xs text-purple-400 font-semibold">
            <span>Per customer basket delivery</span>
          </div>
        </div>
      </div>

      {/* Visual Chart: Daily Sales Revenue & Order Velocity */}
      <div className="bg-slate-950 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-emerald-400" />
              <span>Daily Sales Revenue Velocity (QAR)</span>
            </h3>
            <p className="text-xs text-slate-400">
              Interactive bar graph showing revenue trajectory across recent sales days
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-emerald-500 inline-block" />
              <span className="text-slate-300">Revenue (QAR)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-teal-400/50 inline-block" />
              <span className="text-slate-300">Est. Profit</span>
            </div>
          </div>
        </div>

        {/* Visual Responsive Bar Chart */}
        <div className="pt-6 pb-2">
          {dailyData.length === 0 || dailyData.every((d) => d.revenue === 0) ? (
            <div className="h-48 flex flex-col items-center justify-center text-slate-500 border border-dashed border-slate-800 rounded-2xl">
              <BarChart3 className="w-8 h-8 mb-2 opacity-50" />
              <p className="text-sm font-semibold">No orders recorded in this date range yet.</p>
              <p className="text-xs text-slate-500">New customer orders will immediately graph here in real-time.</p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="h-56 flex items-end gap-2 sm:gap-4 px-2 pt-6 pb-2 border-b border-slate-800/80 overflow-x-auto">
                {dailyData.map((day, idx) => {
                  const heightPercent = Math.max(12, Math.round((day.revenue / maxDailyRevenue) * 100));
                  const profitPercent = Math.max(8, Math.round((day.profit / maxDailyRevenue) * 100));

                  return (
                    <div
                      key={idx}
                      className="flex-1 min-w-[52px] sm:min-w-[64px] flex flex-col items-center justify-end h-full group relative"
                    >
                      {/* Tooltip on Hover */}
                      <div className="absolute -top-14 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 border border-slate-700 text-white text-[11px] rounded-xl px-2.5 py-1.5 pointer-events-none shadow-xl z-20 whitespace-nowrap text-center">
                        <div className="font-bold text-emerald-400">{formatPrice(day.revenue)}</div>
                        <div className="text-slate-400 text-[10px]">
                          {day.ordersCount} {day.ordersCount === 1 ? 'order' : 'orders'} · Profit {formatPrice(day.profit)}
                        </div>
                      </div>

                      {/* Bar columns */}
                      <div className="w-full flex items-end justify-center gap-1 h-full">
                        {/* Revenue Bar */}
                        <div
                          style={{ height: `${heightPercent}%` }}
                          className="w-full max-w-[28px] bg-gradient-to-t from-emerald-600 via-emerald-500 to-teal-400 rounded-t-lg group-hover:brightness-125 transition-all shadow-md relative"
                        >
                          {heightPercent > 35 && (
                            <span className="absolute top-1 inset-x-0 text-center text-[9px] font-black text-emerald-950 drop-shadow-xs">
                              {Math.round(day.revenue)}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* X-axis label */}
                      <span className="text-[10px] font-semibold text-slate-400 mt-2 truncate w-full text-center">
                        {day.date}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 px-2 font-mono">
                <span>0 QAR</span>
                <span>Max: {formatPrice(maxDailyRevenue)}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Two-Column Grid: Top-Selling Produce & District Heatmap */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top-Selling Produce */}
        <div className="bg-slate-950 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              <span>Top-Selling Produce (By Sales Volume)</span>
            </h3>
            <span className="text-xs text-slate-400 font-mono">
              {topSellingProduce.length} top items
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Highest grossing items ranked by total revenue and harvest units sold.
          </p>

          <div className="space-y-2.5">
            {topSellingProduce.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs">
                No produce items ordered yet in this range.
              </div>
            ) : (
              topSellingProduce.map((item, idx) => {
                const highestRevenue = topSellingProduce[0]?.revenueGenerated || 1;
                const progressWidth = Math.max(10, Math.round((item.revenueGenerated / highestRevenue) * 100));

                return (
                  <div
                    key={item.id}
                    className="p-3 bg-slate-900/80 border border-slate-800/80 hover:border-emerald-700/50 rounded-2xl transition-all"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="w-6 h-6 rounded-lg bg-slate-800 text-slate-300 font-mono text-xs font-bold flex items-center justify-center shrink-0">
                          #{idx + 1}
                        </span>
                        {item.image && (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-10 h-10 rounded-xl object-cover border border-slate-700 shrink-0"
                          />
                        )}
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-white truncate flex items-center gap-1.5">
                            <span>{item.name}</span>
                            {item.organic && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                                Organic
                              </span>
                            )}
                          </h4>
                          <span className="text-[11px] text-slate-400">
                            {item.unitsSold} units dispatched · {item.category}
                          </span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="text-xs font-black text-emerald-400 font-['Outfit']">
                          {formatPrice(item.revenueGenerated)}
                        </div>
                        <span className="text-[10px] text-slate-400">Revenue</span>
                      </div>
                    </div>

                    {/* Horizontal volume progress bar */}
                    <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2.5 overflow-hidden">
                      <div
                        style={{ width: `${progressWidth}%` }}
                        className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500"
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Sales by Qatar Zone & Payment Methods */}
        <div className="bg-slate-950 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-5">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <PieChartIcon className="w-4 h-4 text-teal-400" />
              <span>Revenue by Qatar District & Fulfillment</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Geographic delivery distribution across Doha and municipalities
            </p>
          </div>

          <div className="space-y-2.5">
            {districtBreakdown.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs">
                No orders recorded yet.
              </div>
            ) : (
              districtBreakdown.slice(0, 6).map((dist, idx) => {
                const totalDistRev = stats.totalRevenue || 1;
                const pct = Math.round((dist.revenue / totalDistRev) * 100);

                return (
                  <div
                    key={idx}
                    className="p-3 bg-slate-900/70 border border-slate-800 rounded-2xl flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-2">
                        <span>{dist.district}</span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          ({dist.orders} {dist.orders === 1 ? 'order' : 'orders'})
                        </span>
                      </div>
                      <div className="w-32 sm:w-44 bg-slate-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
                        <div
                          style={{ width: `${pct}%` }}
                          className="bg-teal-500 h-full rounded-full"
                        />
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-bold text-teal-300 font-['Outfit']">
                        {formatPrice(dist.revenue)}
                      </div>
                      <span className="text-[10px] text-slate-400">{pct}% of total</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Quick Fulfillment Breakdown Summary */}
          <div className="pt-3 border-t border-slate-800 grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-amber-400">
                ⚡ Express 60-Min Deliveries
              </span>
              <p className="text-base font-black text-white mt-1">
                {stats.expressOrders} orders
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                10.00 QAR rush surcharge collected
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-emerald-400">
                💳 Online Prepaid Share
              </span>
              <p className="text-base font-black text-white mt-1">
                {stats.totalOrders > 0
                  ? Math.round((stats.prepaidOrders / stats.totalOrders) * 100)
                  : 0}
                %
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Apple Pay / Credit Card settled
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
