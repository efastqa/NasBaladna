import React from 'react';
import { heroImg } from '../data/mockData';
import { ArrowRight, Zap } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { motion } from 'motion/react';

export const HeroBanner: React.FC = () => {
  const { setSelectedCategory } = useStore();

  return (
    <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl shadow-sm mb-6 bg-slate-900">
      {/* Background Hero Image with Slow Ken-Burns scale */}
      <div className="relative min-h-[300px] sm:min-h-[340px] md:h-96 w-full overflow-hidden flex flex-col justify-end">
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
        <div className="relative z-10 p-5 sm:p-8 md:p-10 text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="max-w-2xl"
          >
            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white font-['Outfit'] mb-4 sm:mb-6 leading-[1.15] text-balance"
            >
              SHOP SMART DELIVERED FAST
            </motion.h1>

            {/* Action Buttons: Shop Fresh Produce & Near Expiry Deals */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap items-center gap-3"
            >
              <button
                onClick={() => {
                  const elem = document.getElementById('produce');
                  elem?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-4 sm:px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md transition-all hover:scale-105 active:scale-95 flex items-center gap-2 cursor-pointer"
              >
                <span>Shop Fresh Produce</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => setSelectedCategory('near_expiry')}
                className="px-4 sm:px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md transition-all hover:scale-105 active:scale-95 flex items-center gap-2 border border-rose-400/40 cursor-pointer"
              >
                <Zap className="w-4 h-4 fill-current" />
                <span>Near Expiry Deals</span>
              </button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
