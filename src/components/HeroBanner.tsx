import React from 'react';
import { heroImg } from '../data/mockData';
import { Truck, Sparkles, CheckCircle2, ArrowRight, Zap } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { motion } from 'motion/react';

export const HeroBanner: React.FC = () => {
  const { setSelectedCategory, setIsWhatsAppOpen } = useStore();

  return (
    <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl shadow-sm mb-6 bg-slate-900">
      {/* Background Hero Image with Slow Ken-Burns / Parallax scale */}
      <div className="relative min-h-[390px] sm:min-h-[340px] md:h-96 w-full overflow-hidden flex flex-col justify-end">
        <motion.img
          initial={{ scale: 1.08 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.4, ease: 'easeOut' }}
          src={heroImg}
          alt="Fresh produce delivered from farm to doorstep"
          className="absolute inset-0 w-full h-full object-cover object-center filter brightness-[0.88] contrast-[1.05]"
          referrerPolicy="no-referrer"
        />

        {/* Measured scrim overlay ensuring WCAG AA legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/50 to-black/25" />

        {/* Content Container */}
        <div className="relative z-10 p-4 sm:p-8 md:p-10 text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="max-w-2xl"
          >
            {/* Direct Farm Badge */}
            <motion.div
              animate={{ y: [0, -3, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
              className="inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-emerald-500/25 border border-emerald-400/40 backdrop-blur-md text-emerald-200 text-[11px] sm:text-xs font-semibold mb-2 sm:mb-3 shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
              <span>NasBaladna Morning Harvest</span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white font-['Outfit'] mb-2 leading-[1.15] text-balance"
            >
              From Farm to Your Door
            </motion.h1>

            {/* Subheading */}
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-xs sm:text-sm md:text-base text-slate-200 font-normal leading-relaxed max-w-xl mb-3.5 sm:mb-6"
            >
              Get organic products and sustainably sourced groceries delivered to your door in minutes with live temperature-controlled vehicles.
            </motion.p>

            {/* Action Buttons & Trust Markers */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-wrap items-center gap-2.5 sm:gap-3 mb-3.5 sm:mb-4"
            >
              <button
                onClick={() => {
                  const elem = document.getElementById('produce');
                  elem?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-3.5 sm:px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5"
              >
                <span>Shop Fresh Produce</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setSelectedCategory('near_expiry')}
                className="px-3 sm:px-3.5 py-2 bg-rose-600/90 hover:bg-rose-600 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5 border border-rose-400/40"
              >
                <Zap className="w-3.5 h-3.5 fill-current" />
                <span>Near Expiry Deals</span>
              </button>
            </motion.div>

            {/* Trust Markers */}
            <div className="flex flex-wrap items-center gap-2 text-[11px] sm:text-sm text-slate-200 font-medium">
              <span className="flex items-center gap-1 bg-black/40 backdrop-blur-sm px-2 sm:px-2.5 py-1 rounded-lg border border-white/10">
                <Truck className="w-3.5 h-3.5 text-emerald-400" />
                <span>35-Min Express Delivery</span>
              </span>
              <span className="flex items-center gap-1 bg-black/40 backdrop-blur-sm px-2 sm:px-2.5 py-1 rounded-lg border border-white/10">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Chilled Cold-Chain (4°C)</span>
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
