import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { CategoryType } from '../types';
import { Sparkles, Carrot, Apple, Milk, Wheat, Leaf, Citrus, Clock, Tag, Check, ArrowRight, Cookie, Flame, Coffee, Egg, Droplets } from 'lucide-react';
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
  const { selectedCategory, setSelectedCategory, categories, setSearchQuery } = useStore();
  const [hoveredCatId, setHoveredCatId] = useState<string | null>(null);

  const handleSelectCategory = (catId: CategoryType) => {
    setSelectedCategory(catId);
    setSearchQuery('');

    // Smooth scroll down to the produce section so the customer immediately sees the opened category items
    setTimeout(() => {
      const elem = document.getElementById('produce');
      if (elem) {
        const yOffset = -85; // accounts for the sticky header
        const y = elem.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
      }
    }, 50);
  };

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
      case 'dates_nuts':
        return <Sparkles className="w-10 h-10 text-amber-800" />;
      case 'honey_oils':
        return <Droplets className="w-10 h-10 text-yellow-600" />;
      case 'tea_coffee':
        return <Coffee className="w-10 h-10 text-amber-900" />;
      case 'poultry_eggs':
        return <Egg className="w-10 h-10 text-orange-600" />;
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

        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => handleSelectCategory('all')}
          className={`text-xs font-bold px-3.5 py-2 rounded-xl transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer border ${
            selectedCategory === 'all'
              ? 'bg-[#E8F8F1] text-emerald-800 border-emerald-200/70 hover:bg-emerald-100'
              : 'bg-emerald-600 text-white border-transparent hover:bg-emerald-700 shadow-sm'
          }`}
        >
          <span>Show All Produce</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </motion.button>
      </div>

      {/* Grid of Category Cards matching IMG_5754.png */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-4"
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
                y: -5,
                scale: 1.02,
                transition: { type: 'spring', stiffness: 400, damping: 20 },
              }}
              whileTap={{ scale: 0.97 }}
              onHoverStart={() => setHoveredCatId(cat.id)}
              onHoverEnd={() => setHoveredCatId(null)}
              onClick={() => handleSelectCategory(cat.id)}
              className={`group relative flex flex-col text-left rounded-3xl p-3 sm:p-3.5 transition-all duration-200 border cursor-pointer select-none ${
                cat.bgColor || 'bg-slate-50/90'
              } ${
                isSelected
                  ? isNearExpiry
                    ? 'ring-2 ring-rose-500 shadow-md border-rose-300'
                    : 'ring-2 ring-emerald-600 shadow-md border-emerald-400'
                  : `${cat.borderColor || 'border-slate-200/70'} hover:shadow-md hover:border-emerald-300`
              }`}
            >
              {/* Inner White Image Card with Floating Badge */}
              <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-white shadow-xs p-2 flex items-center justify-center">
                {/* Floating Tag/Pill Badge */}
                {cat.badge && (
                  <div className="absolute top-2 right-2 z-10">
                    <span className="text-[9px] sm:text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-[#E11D48] text-white shadow-xs flex items-center gap-1 tracking-wide">
                      <Tag className="w-2.5 h-2.5 fill-white text-white shrink-0" />
                      <span>{cat.badge}</span>
                    </span>
                  </div>
                )}

                {/* Selected Checkmark Badge (when no badge or selected) */}
                {isSelected && !cat.badge && (
                  <div className="absolute top-2 right-2 z-10">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </span>
                  </div>
                )}

                <CategoryCardImage
                  image={cat.image}
                  name={cat.name}
                  id={cat.id}
                  fallbackIcon={getFallbackIcon(cat.id)}
                  isHovered={isHovered}
                />
              </div>

              {/* Category Title & Varieties Count matching screenshot */}
              <div className="text-center px-1 mt-2.5 pb-0.5">
                <span className="block text-sm sm:text-base font-bold text-slate-900 group-hover:text-emerald-800 transition-colors truncate font-['Outfit']">
                  {cat.name}
                </span>
                <span className="block text-xs text-slate-500 font-medium mt-0.5">
                  {cat.itemCount} {cat.itemCount === 1 ? 'item' : 'varieties'}
                </span>
              </div>
            </motion.button>
          );
        })}
      </motion.div>
    </section>
  );
};
