import React from 'react';
import { heroImg } from '../data/mockData';
import { ArrowRight, Zap } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { motion } from 'motion/react';

export const HeroBanner: React.FC = () => {
  const { setSelectedCategory } = useStore();

  return (
    <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl shadow-sm mb-6 bg-slate-950">
      {/* Background Hero Image with Continuous Smooth Ken-Burns Breathing Scale */}
      <div className="relative min-h-[300px] sm:min-h-[340px] md:h-96 w-full overflow-hidden flex flex-col justify-end">
        <motion.div
          className="absolute inset-0 w-full h-full"
          initial={{ scale: 1.1, opacity: 0.8 }}
          animate={{
            scale: [1.05, 1.12, 1.05],
            opacity: 1,
          }}
          transition={{
            scale: {
              repeat: Infinity,
              duration: 22,
              ease: 'easeInOut',
            },
            opacity: {
              duration: 1.2,
              ease: 'easeOut',
            },
          }}
        >
          <img
            src={heroImg}
            alt="Fresh produce delivered from farm to doorstep"
            className="w-full h-full object-cover object-center filter brightness-[0.88] contrast-[1.05]"
            referrerPolicy="no-referrer"
          />
        </motion.div>

        {/* Ambient Floating Glow Orb for Organic Depth */}
        <motion.div
          animate={{
            x: [0, 20, 0],
            y: [0, -15, 0],
            opacity: [0.25, 0.45, 0.25],
          }}
          transition={{
            repeat: Infinity,
            duration: 8,
            ease: 'easeInOut',
          }}
          className="absolute top-10 right-10 w-72 h-72 rounded-full bg-emerald-500/20 blur-3xl pointer-events-none"
        />

        {/* Measured scrim overlay ensuring WCAG AA legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/50 to-black/25" />

        {/* Content Container with Staggered Entrance */}
        <div className="relative z-10 p-5 sm:p-8 md:p-10 text-white">
          <div className="max-w-2xl">
            {/* Headline with Smooth Entrance */}
            <motion.h1
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
              className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white font-['Outfit'] mb-4 sm:mb-6 leading-[1.15] text-balance drop-shadow-sm"
            >
              SHOP SMART DELIVERED FAST
            </motion.h1>

            {/* Action Buttons: Shop Fresh Produce & Near Expiry Deals */}
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.25 }}
              className="flex flex-wrap items-center gap-3"
            >
              <motion.button
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.96 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                onClick={() => {
                  const elem = document.getElementById('produce');
                  elem?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="group relative overflow-hidden px-4 sm:px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold rounded-xl shadow-lg shadow-emerald-950/30 transition-colors flex items-center gap-2 cursor-pointer"
              >
                {/* Subtle Shimmer highlight sweep */}
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
                <span className="relative z-10">Shop Fresh Produce</span>
                <ArrowRight className="w-4 h-4 relative z-10 transition-transform group-hover:translate-x-0.5" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.96 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                onClick={() => {
                  setSelectedCategory('near_expiry');
                  const elem = document.getElementById('produce');
                  elem?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="group relative px-4 sm:px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs sm:text-sm font-bold rounded-xl shadow-lg shadow-rose-950/30 transition-colors flex items-center gap-2 border border-rose-400/40 cursor-pointer"
              >
                <motion.span
                  animate={{ scale: [1, 1.25, 1], rotate: [0, -6, 6, 0] }}
                  transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
                  className="flex items-center justify-center"
                >
                  <Zap className="w-4 h-4 fill-current text-amber-300" />
                </motion.span>
                <span>Near Expiry Deals</span>
              </motion.button>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};
