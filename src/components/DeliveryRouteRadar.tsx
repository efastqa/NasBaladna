import React, { useMemo, useState, useEffect } from 'react';
import { Order } from '../types';
import { Truck, MapPin, Store, Navigation, ShieldCheck, Thermometer, Gauge, Clock } from 'lucide-react';
import { CENTRAL_FARM_HUB, getDistrictCoordinates } from '../constants/locations';

interface DeliveryRouteRadarProps {
  order: Order;
}

export const DeliveryRouteRadar: React.FC<DeliveryRouteRadarProps> = ({ order }) => {
  const [pulse, setPulse] = useState(0);

  // Subtle pulsing animation interval
  useEffect(() => {
    const timer = setInterval(() => {
      setPulse((p) => (p + 1) % 100);
    }, 1200);
    return () => clearInterval(timer);
  }, []);

  const coords = useMemo(() => {
    return getDistrictCoordinates(order.district);
  }, [order.district]);

  // Route progression percentage (0 to 1) based on order status
  const progressRatio = useMemo(() => {
    switch (order.status) {
      case 'confirmed':
        return 0.05;
      case 'packing':
        return 0.25;
      case 'on_the_way':
        return 0.70;
      case 'delivered':
        return 1.0;
      default:
        return 0.1;
    }
  }, [order.status]);

  // Coordinates on SVG viewBox (500 x 240)
  const startX = 60;
  const startY = 60;
  const endX = 430;
  const endY = 170;

  // Bezier curve control points
  const cp1X = 180;
  const cp1Y = 30;
  const cp2X = 320;
  const cp2Y = 200;

  // Cubic bezier point evaluation for vehicle placement
  const t = progressRatio;
  const currentX =
    Math.pow(1 - t, 3) * startX +
    3 * Math.pow(1 - t, 2) * t * cp1X +
    3 * (1 - t) * Math.pow(t, 2) * cp2X +
    Math.pow(t, 3) * endX;
  const currentY =
    Math.pow(1 - t, 3) * startY +
    3 * Math.pow(1 - t, 2) * t * cp1Y +
    3 * (1 - t) * Math.pow(t, 2) * cp2Y +
    Math.pow(t, 3) * endY;

  const remainingKm = Math.max(0, ((1 - progressRatio) * 28.4)).toFixed(1);
  const currentSpeed = order.status === 'on_the_way' ? '54 km/h' : order.status === 'delivered' ? '0 km/h' : 'Packing in Transit Hub';

  return (
    <div className="w-full rounded-2xl overflow-hidden border border-slate-200 bg-slate-950 relative shadow-inner">
      {/* Top Telemetry Strip */}
      <div className="p-3 bg-slate-900/90 border-b border-slate-800/80 flex items-center justify-between text-xs flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
          </span>
          <span className="font-bold text-white tracking-wide text-[11px] uppercase">
            Qatar Cold-Chain GPS Radar
          </span>
          <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
            · Al Shamal Express Route
          </span>
        </div>

        <div className="flex items-center gap-3 text-[11px] font-mono">
          <div className="flex items-center gap-1 text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60">
            <Thermometer className="w-3 h-3" />
            <span>4.1°C Chilled</span>
          </div>
          <div className="flex items-center gap-1 text-slate-300">
            <Gauge className="w-3 h-3 text-emerald-400" />
            <span>{currentSpeed}</span>
          </div>
        </div>
      </div>

      {/* Interactive Vector Route Map */}
      <div className="relative w-full h-56 sm:h-64 overflow-hidden bg-[#090d16]">
        {/* Subtle Map Grid Lines */}
        <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#334155" strokeWidth="0.8" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid-pattern)" />
        </svg>

        {/* Primary Route Layer */}
        <svg className="w-full h-full" viewBox="0 0 500 240" preserveAspectRatio="xMidYMid meet">
          <defs>
            <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#059669" />
              <stop offset="60%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#34d399" />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="glow" />
              <feComposite in="SourceGraphic" in2="glow" operator="over" />
            </filter>
          </defs>

          {/* Planned Highway Path Background */}
          <path
            d={`M ${startX} ${startY} C ${cp1X} ${cp1Y}, ${cp2X} ${cp2Y}, ${endX} ${endY}`}
            fill="none"
            stroke="#1e293b"
            strokeWidth="8"
            strokeLinecap="round"
          />

          {/* Active GPS Route */}
          <path
            d={`M ${startX} ${startY} C ${cp1X} ${cp1Y}, ${cp2X} ${cp2Y}, ${endX} ${endY}`}
            fill="none"
            stroke="url(#routeGradient)"
            strokeWidth="4"
            strokeDasharray="6 4"
            strokeLinecap="round"
            filter="url(#glow)"
            className="animate-pulse"
          />

          {/* Farm Hub Origin (Al Khor Agro Park) */}
          <g transform={`translate(${startX}, ${startY})`}>
            <circle r="14" fill="#065f46" opacity="0.4" className="animate-ping" />
            <circle r="9" fill="#047857" stroke="#34d399" strokeWidth="2" />
            <text x="14" y="4" fill="#a7f3d0" fontSize="10" fontWeight="bold" fontFamily="sans-serif">
              NasBaladna Farm Hub (Al Khor)
            </text>
          </g>

          {/* Destination Marker (Customer District) */}
          <g transform={`translate(${endX}, ${endY})`}>
            <circle r="14" fill="#dc2626" opacity="0.3" className="animate-ping" />
            <circle r="9" fill="#ef4444" stroke="#ffffff" strokeWidth="2" />
            <text x="-120" y="4" fill="#fca5a5" fontSize="10" fontWeight="bold" fontFamily="sans-serif">
              {order.district} ({order.address.substring(0, 18)}...)
            </text>
          </g>

          {/* Live Courier Van Indicator */}
          <g transform={`translate(${currentX}, ${currentY})`}>
            {/* Animated radar sonar wave */}
            <circle r="22" fill="#10b981" opacity="0.25" className="animate-ping" />
            <circle r="14" fill="#059669" stroke="#ffffff" strokeWidth="2.5" />
            <circle r="5" fill="#ffffff" />
            <rect x="-10" y="-30" width="80" height="18" rx="4" fill="#022c22" stroke="#059669" strokeWidth="1" />
            <text x="-6" y="-17" fill="#6ee7b7" fontSize="8.5" fontWeight="bold" fontFamily="sans-serif">
              {order.courier.name.split(' ')[0]} ({remainingKm} km)
            </text>
          </g>
        </svg>

        {/* Bottom Floating Telemetry Overlay */}
        <div className="absolute bottom-2.5 left-2.5 right-2.5 bg-slate-900/90 backdrop-blur-xs border border-slate-800 rounded-xl p-2.5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-950 border border-emerald-700/60 flex items-center justify-center text-emerald-400">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-white text-[11px] block">
                {order.courier.vehicle} · {order.courier.name}
              </span>
              <span className="text-[10px] text-slate-400">
                Plate: {order.courier.plateNumber} · Direct Cold-Chain
              </span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-slate-400 block">Remaining Distance</span>
            <span className="font-bold font-mono text-emerald-400 text-xs">
              {order.status === 'delivered' ? 'Arrived at Destination' : `${remainingKm} km (${order.estimatedMinutes} mins)`}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
