import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { CategoryType } from '../types';
import { Sparkles, Carrot, Apple, Milk, Wheat, Leaf, Citrus, Clock, Tag } from 'lucide-react';
import { motion } from 'motion/react';

const CategoryCardImage: React.FC<{
  image?: string;
  name: string;
  id: CategoryType;
  fallbackIcon: React.ReactNode;
}> = ({ image, name, fallbackIcon }) => {
  const [hasError, setHasError] = useState(false);

  if (!image || hasError) {
    return <>{fallbackIcon}</>;
  }

  return (
    <img
      src={image}
      alt={name}
      className="w-full h-full object-contain filter drop-shadow-sm group-hover:scale-105 transition-transform duration-300"
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
    />
  );
};

export const CategoryGrid: React.FC = () => {
  const { selectedCategory, setSelectedCategory, categories } = useStore();

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
      default:
        return <Sparkles className="w-10 h-10 text-emerald-600" />;
    }
  };

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 font-['Outfit']">
            Explore Categories
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Cold-stored and hand-selected at optimal morning freshness
          </p>
        </div>

        {selectedCategory !== 'all' && (
          <button
            onClick={() => setSelectedCategory('all')}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md transition-all hover:scale-105 active:scale-95"
          >
            Show All Produce
          </button>
        )}
      </div>

      {/* Grid of 3D/Clean Minimalist Cards with Motion Animation */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 gap-3 sm:gap-4">
        {categories.map((cat, idx) => {
          const isSelected = selectedCategory === cat.id;

          return (
            <motion.button
              key={cat.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: idx * 0.04 }}
              whileHover={{ y: -4, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedCategory(isSelected ? 'all' : cat.id)}
              className={`group relative flex flex-col text-left rounded-2xl p-2.5 sm:p-3 transition-shadow duration-200 border text-decoration-none ${
                cat.bgColor || 'bg-slate-50/80'
              } ${
                isSelected
                  ? 'ring-2 ring-emerald-600 shadow-md border-emerald-500 bg-white'
                  : 'border-slate-200/80 hover:shadow-md'
              }`}
            >
              {/* Optional Badge */}
              {cat.badge && (
                <div className="absolute top-2 right-2 z-10">
                  <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-full bg-rose-600 text-white shadow-2xs flex items-center gap-0.5 animate-pulse">
                    <Tag className="w-2.5 h-2.5" />
                    <span>{cat.badge}</span>
                  </span>
                </div>
              )}

              {/* Visual Card Image Slot */}
              <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-white/80 flex items-center justify-center p-2 mb-2.5 shadow-inner">
                <CategoryCardImage
                  image={cat.image}
                  name={cat.name}
                  id={cat.id}
                  fallbackIcon={getFallbackIcon(cat.id)}
                />
              </div>

              {/* Category Title */}
              <div className="text-center px-1">
                <span className="block text-sm font-bold text-slate-900 group-hover:text-emerald-800 transition-colors truncate">
                  {cat.name}
                </span>
                <span className="text-[11px] text-slate-500 font-medium">
                  {cat.itemCount} {cat.itemCount === 1 ? 'item' : 'varieties'}
                </span>
              </div>
            </motion.button>
          );
        })}
      </div>
    </section>
  );
};
