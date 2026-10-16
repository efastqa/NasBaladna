import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { CategoryType } from '../types';
import { Sparkles, Carrot, Apple, Milk, Wheat, Leaf, Citrus, Clock, Tag, Check, ArrowRight, Cookie, Flame } from 'lucide-react';
import { motion } from 'motion/react';

const CategoryCardImage: React.FC<{
  image?: string;
  name: string;
  id: CategoryType;
  fallbackIcon: React.ReactNode;
  isHovered: boolean;
}> = ({ image, name, fallbackIcon, isHovered }) => {
  const [hasError, setHasError] = useState(false);

  if (!image || hasError) {
    return (
      <motion.div
        animate={isHovered ? { scale: 1.15, rotate: [0, -3, 3, 0] } : { scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 15 }}
        className="flex items-center justify-center w-full h-full"
      >
        {fallbackIcon}
      </motion.div>
    );
  }

  return (
    <motion.img
      src={image}
      alt={name}
      animate={
        isHovered
          ? { scale: 1.12, y: -3, filter: 'drop-shadow(0 8px 12px rgba(16, 185, 129, 0.22))' }
          : { scale: 1, y: 0, filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.06))' }
      }
      transition={{ type: 'spring', stiffness: 320, damping: 20 }}
      className="w-full h-full object-contain filter"
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
    />
  );
};

export const CategoryGrid: React.FC = () => {
  const { selectedCategory, setSelectedCategory, categories } = useStore();
  const [hoveredCatId, setHoveredCatId] = useState<string | null>(null);

  const getFallbackIcon = (id: CategoryType) => {
    switch (id) {
      case 'near_expiry':
        return <Clock className="w-10 h-10 text-rose-600" />;
      case 'vegetables':
        return <Carrot className="w-10 h-10 text-emerald-600" />;
      case 'fruits':
        return <Apple className="w-10 h-10 text-amber-600" />;
      case 'dairy':
        return <Milk className="w-10 h-10 text-sky-600" />;
      case 'bakery':
        return <Wheat className="w-10 h-10 text-amber-700" />;
      case 'herbs':
        return <Leaf className="w-10 h-10 text-teal-600" />;
      case 'juices':
        return <Citrus className="w-10 h-10 text-orange-600" />;
      case 'biscuits':
        return <Cookie className="w-10 h-10 text-amber-700" />;
      case 'chocolates':
        return <Sparkles className="w-10 h-10 text-amber-900" />;
      case 'spices':
        return <Flame className="w-10 h-10 text-red-600" />;
      case 'chips':
        return <Wheat className="w-10 h-10 text-yellow-600" />;
      default:
        return <Sparkles className="w-10 h-10 text-emerald-600" />;
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: 'spring' as const,
        stiffness: 300,
        damping: 24,
      },
    },
  };

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 font-['Outfit']">
              Explore Categories
            </h2>
            <motion.span
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
              className="hidden sm:inline-block text-emerald-600"
            >
              <Leaf className="w-4 h-4 fill-emerald-100" />
            </motion.span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Cold-stored and hand-selected at optimal morning freshness · Tap to filter
          </p>
        </div>

        {selectedCategory !== 'all' && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9, x: 10 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedCategory('all')}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200/60 px-3 py-1.5 rounded-xl transition-all shadow-2xs flex items-center gap-1 cursor-pointer"
          >
            <span>Show All Produce</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </motion.button>
        )}
      </div>

      {/* Grid of Animated Interactive 3D Category Cards */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.1 }}
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 gap-3 sm:gap-4"
      >
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          const isNearExpiry = cat.id === 'near_expiry';
          const isHovered = hoveredCatId === cat.id;

          return (
            <motion.button
              key={cat.id}
              variants={itemVariants}
              whileHover={{
                y: -6,
                scale: 1.03,
                transition: { type: 'spring', stiffness: 400, damping: 20 },
              }}
              whileTap={{ scale: 0.96 }}
              onHoverStart={() => setHoveredCatId(cat.id)}
              onHoverEnd={() => setHoveredCatId(null)}
              onClick={() => setSelectedCategory(isSelected ? 'all' : cat.id)}
              className={`group relative flex flex-col text-left rounded-2xl p-2.5 sm:p-3 transition-colors duration-200 border cursor-pointer select-none overflow-hidden ${
                cat.bgColor || 'bg-slate-50/80'
              } ${
                isSelected
                  ? isNearExpiry
                    ? 'ring-2 ring-rose-500 shadow-lg border-rose-400 bg-white'
                    : 'ring-2 ring-emerald-600 shadow-lg border-emerald-500 bg-white'
                  : 'border-slate-200/80 hover:border-emerald-300 hover:shadow-md'
              }`}
            >
              {/* Animated Selected Active Indicator Bar */}
              {isSelected && (
                <motion.div
                  layoutId="activeCategoryIndicator"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  className={`absolute inset-x-0 top-0 h-1.5 ${
                    isNearExpiry ? 'bg-gradient-to-r from-rose-500 to-amber-500' : 'bg-gradient-to-r from-emerald-600 to-teal-500'
                  }`}
                />
              )}

              {/* Animated Floating Badge (Near Expiry / Special / Organic) */}
              {cat.badge && (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  whileHover={{ scale: 1.1 }}
                  className="absolute top-2 right-2 z-10"
                >
                  <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-full bg-rose-600 text-white shadow-xs flex items-center gap-0.5 animate-pulse">
                    <Tag className="w-2.5 h-2.5" />
                    <span>{cat.badge}</span>
                  </span>
                </motion.div>
              )}

              {/* Selected Checkmark Badge */}
              {isSelected && !cat.badge && (
                <motion.div
                  initial={{ scale: 0, rotate: -45 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                  className="absolute top-2 right-2 z-10"
                >
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </span>
                </motion.div>
              )}

              {/* Animated Visual Card Image Slot */}
              <motion.div
                animate={
                  isHovered
                    ? { y: -2, boxShadow: '0 8px 16px -4px rgba(16, 185, 129, 0.15)' }
                    : { y: 0, boxShadow: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.04)' }
                }
                transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                className="relative w-full aspect-square rounded-xl overflow-hidden bg-white/90 flex items-center justify-center p-2 mb-2.5"
              >
                <CategoryCardImage
                  image={cat.image}
                  name={cat.name}
                  id={cat.id}
                  fallbackIcon={getFallbackIcon(cat.id)}
                  isHovered={isHovered}
                />
              </motion.div>

              {/* Category Title & Item Count */}
              <div className="text-center px-1">
                <motion.span
                  animate={isHovered ? { color: '#047857' } : {}}
                  className="block text-sm font-bold text-slate-900 group-hover:text-emerald-800 transition-colors truncate"
                >
                  {cat.name}
                </motion.span>
                <div className="flex items-center justify-center gap-1 mt-0.5">
                  <span className="text-[11px] text-slate-500 font-medium">
                    {cat.itemCount} {cat.itemCount === 1 ? 'item' : 'varieties'}
                  </span>
                </div>
              </div>

              {/* Subtle Active Glow on Selection */}
              {isSelected && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.15 }}
                  className={`absolute inset-0 pointer-events-none rounded-2xl ${
                    isNearExpiry ? 'bg-rose-500' : 'bg-emerald-500'
                  }`}
                />
              )}
            </motion.button>
          );
        })}
      </motion.div>
    </section>
  );
};
