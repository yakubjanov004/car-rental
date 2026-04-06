import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, MapPin, Users, Fuel, Settings2, Heart, Zap, ArrowRight, ArrowLeftRight } from 'lucide-react';
import { formatNarx } from '../utils/formatPrice';
import { MEDIA_BASE_URL } from '../utils/api';
import { useComparison } from '../context/ComparisonContext';

const YOQILGI_RANGI = {
  elektro: { bg: 'rgba(0,217,126,0.12)', text: '#00D97E', label: '⚡ Elektro' },
  gibrid:  { bg: 'rgba(245,158,11,0.12)', text: '#F59E0B', label: '⚡ Gibrid' },
  benzin:  { bg: 'rgba(255,255,255,0.06)', text: 'rgba(255,255,255,0.5)', label: '⛽ Benzin' },
  gaz:     { bg: 'rgba(255,255,255,0.06)', text: 'rgba(255,255,255,0.5)', label: '🔵 Gaz' },
};

const CarCard = ({ car, index = 0 }) => {
  const [liked, setLiked] = useState(false);
  const [hovered, setHovered] = useState(false);
  const { addToComparison, removeFromComparison, isInComparison } = useComparison();

  const inCompare = isInComparison(car.id);

  const toggleCompare = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (inCompare) removeFromComparison(car.id);
    else addToComparison(car);
  };

  // Data normalization for backend vs demo
  const brand = car.brand || car.brend || "Chevrolet";
  const model = car.model || "Unknown";
  const year = car.year || car.yil || 2024;
  const price = car.daily_price || car.kunlik_narx || 0;
  const fuelType = car.fuel_type || car.yoqilgi || 'benzin';
  const transmission = car.transmission || car.uzatma || 'automatic';
  const seats = car.seats || car.orinlar || 5;
  const rating = car.rating || car.reyting || 4.5;
  const reviewsCount = car.review_count || car.sharhlar_soni || 0;
  
  // Use Media Role Contract
  const image = car.media?.card_main || `/images/assets/car_fallback.jpg`;
  
  // Gallery dan gallery_front bo'lgan rasmni qidirib topamiz (Bazadan)
  const galleryFront = car.media?.gallery?.find(img => img.slot === 'gallery_front')?.url;
  const secondaryImage = galleryFront || image;

  const fuel = YOQILGI_RANGI[fuelType] || YOQILGI_RANGI.benzin;

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.55, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
      className="card group relative overflow-hidden cursor-pointer h-full flex flex-col"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Dynamic Background Slide (gallery_front) */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0, x: 80, scale: 1.1 }}
            animate={{ opacity: 1, x: 0, scale: 1.25 }}
            exit={{ opacity: 0, x: 80, scale: 1.1 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0 z-0 pointer-events-none overflow-hidden"
          >
            <img
              src={secondaryImage}
              alt=""
              className="absolute -right-20 -bottom-10 w-full h-full object-contain opacity-[0.12] blur-[40px] -rotate-6"
            />
            {/* Soft tint accent */}
            <div className="absolute inset-0 bg-gradient-to-l from-primary/10 via-transparent to-transparent opacity-40" />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative aspect-[16/10] overflow-hidden rounded-t-[32px] shrink-0 bg-[#0F0F0F] group/img relative">
        {/* Anti-Grid Studio Background */}
        <div className="absolute inset-0 bg-[#121212] z-0 opacity-80" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.05)_0%,transparent_70%)] z-0" />
        
        {/* Dynamic Studio Glow */}
        <motion.div 
          animate={{ 
            scale: hovered ? 1.5 : 1,
            opacity: hovered ? 0.3 : 0.15 
          }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-primary blur-[80px] rounded-full z-0 transition-all duration-700"
        />

        {/* Reflective Studio Floor */}
        <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-black via-black/40 to-transparent z-10" />
        <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent z-10" />

        <motion.img
          src={image}
          alt={`${brand} ${model}`}
          className="w-full h-full object-contain relative z-10 drop-shadow-[0_20px_50px_rgba(0,0,0,0.8)]"
          animate={{ 
            scale: hovered ? 1.08 : 1,
            y: hovered ? -8 : 0
          }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          onError={(e) => {
            e.target.src = `/images/assets/car_fallback.jpg`;
          }}
        />

        {/* Action Buttons */}
        <div className="absolute top-4 right-4 z-30 flex flex-col gap-2">
          <motion.button
            whileTap={{ scale: 0.8 }}
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setLiked(!liked); }}
            className="w-10 h-10 rounded-2xl flex items-center justify-center transition-all bg-black/40 backdrop-blur-xl border border-white/5 hover:border-white/20"
            style={{ color: liked ? '#ef4444' : 'white' }}
          >
            <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.8 }}
            onClick={toggleCompare}
            className="w-10 h-10 rounded-2xl flex items-center justify-center transition-all bg-black/40 backdrop-blur-xl border border-white/5 hover:border-white/20 group/compare"
            style={{ color: inCompare ? '#3b82f6' : 'white' }}
          >
            <ArrowLeftRight className="w-4 h-4" />
          </motion.button>
        </div>

        {/* Floating Badges */}
        <div className="absolute top-4 left-4 z-30 space-y-2">
          <div
            className="px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-[0.1em] border border-white/5 backdrop-blur-xl inline-block"
            style={{ background: fuel.bg, color: fuel.text }}
          >
            {fuel.label}
          </div>
        </div>

        <div className="absolute bottom-4 left-4 z-30 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/60 backdrop-blur-xl border border-white/5">
          <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500 drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]" />
          <span className="text-xs font-bold text-white tracking-tighter">{rating}</span>
          <span className="text-[10px] text-white/30 font-medium">({reviewsCount})</span>
        </div>

        {car.unit_count > 1 && (
          <div className="absolute bottom-4 right-4 z-30 px-3 py-1.5 rounded-xl bg-primary/20 backdrop-blur-xl border border-primary/20 text-[9px] font-black text-primary uppercase tracking-[0.15em]">
            {car.unit_count} MAVJUD
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 relative z-10 flex flex-col flex-1">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <div className="text-[11px] text-white/35 font-medium uppercase tracking-widest mb-0.5 truncate">
              {brand} · {year}
            </div>
            <h3 className="text-lg font-bold font-heading leading-tight group-hover:text-white/90 transition-colors truncate">
              {model}
            </h3>
            {car.short_tagline && (
              <div className="text-[9px] text-primary/80 font-bold uppercase tracking-tighter mt-0.5 italic truncate">
                {car.short_tagline}
              </div>
            )}
            <div className="flex items-center gap-1.5 mt-1 no-wrap">
              <MapPin className="w-3 h-3 text-primary shrink-0" />
              <span className="text-[11px] text-white/35 truncate">{car.district_name || car.tuman_nomi || 'Tashkent'}</span>
            </div>
          </div>
          <div className="text-right shrink-0 ml-4">
            <div className="text-xl font-extrabold font-display text-white whitespace-nowrap">
              {formatNarx(car.dynamic_price || price)}
            </div>
            <div className="flex justify-end gap-1">
               {car.dynamic_price && car.dynamic_price !== price && (
                 <span className="text-[8px] text-primary font-black uppercase italic line-through opacity-40">{formatNarx(price)}</span>
               )}
               <div className="text-[10px] text-white/35 font-medium uppercase tracking-tighter">/ kun</div>
            </div>
          </div>
        </div>

        <div className="h-px bg-white/[0.05] mb-4" />

        <div className="flex items-center justify-between mb-6">
          {[
            { icon: Users, label: `${seats} o'rin` },
            { icon: Settings2, label: transmission === 'automatic' ? 'Avto' : 'Mexanika' },
            { icon: Fuel, label: fuelType },
          ].map(({ icon: Icon, label }, i) => (
            <div key={i} className="flex items-center gap-1.5 text-white/40 text-[11px] font-medium">
              <Icon className="w-3.5 h-3.5 text-primary/70 shrink-0" />
              <span className="capitalize truncate max-w-[60px]">{label}</span>
            </div>
          ))}
        </div>

        <Link
          to={`/car/${car.slug || car.id}`}
          className="mt-auto flex items-center justify-between w-full px-5 py-3.5 rounded-2xl bg-white/5 hover:bg-primary/20 border border-white/5 hover:border-primary/50 transition-all duration-300 group/btn"
        >
          <span className="text-[11px] font-bold uppercase tracking-widest text-white/60 group-hover/btn:text-white transition-colors">
            BATAFSIL
          </span>
          <ArrowRight className="w-4 h-4 text-white/30 group-hover/btn:text-primary group-hover/btn:translate-x-1 transition-all duration-300" />
        </Link>
      </div>
    </motion.div>
  );
};

export default CarCard;
