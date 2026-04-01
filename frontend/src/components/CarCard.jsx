import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, MapPin, Users, Fuel, Settings2, Heart, Zap, ArrowRight } from 'lucide-react';
import { formatNarx } from '../utils/formatPrice';
import { MEDIA_BASE_URL } from '../utils/api';

const YOQILGI_RANGI = {
  elektro: { bg: 'rgba(0,217,126,0.12)', text: '#00D97E', label: '⚡ Elektro' },
  gibrid:  { bg: 'rgba(245,158,11,0.12)', text: '#F59E0B', label: '⚡ Gibrid' },
  benzin:  { bg: 'rgba(255,255,255,0.06)', text: 'rgba(255,255,255,0.5)', label: '⛽ Benzin' },
  gaz:     { bg: 'rgba(255,255,255,0.06)', text: 'rgba(255,255,255,0.5)', label: '🔵 Gaz' },
};

const CarCard = ({ car, index = 0 }) => {
  const [liked, setLiked] = useState(false);
  const [hovered, setHovered] = useState(false);

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
  
  let image = car.main_image || car.rasm;
  
  // Agar bu to'liq havola (http) bo'lsa, o'zini ko'rsatadi
  if (image && image.startsWith('http')) {
    // Hech narsa qo'shilmaydi
  } else if (image && !image.startsWith('/images') && !image.startsWith('/static')) {
    image = `${MEDIA_BASE_URL}${image}`;
  }

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
      {/* Background decoration */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0, scale: 1.1, x: 60 }}
            animate={{ opacity: 1, scale: 1.3, x: 20 }}
            exit={{ opacity: 0, scale: 1.1, x: 60 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="absolute inset-0 z-0 pointer-events-none overflow-hidden"
          >
            <img
              src={image}
              alt=""
              className="absolute right-0 bottom-0 w-3/4 h-3/4 object-contain opacity-[0.06] -rotate-6"
              style={{ filter: 'blur(2px)' }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Rasm */}
      <div className="relative aspect-[16/9] overflow-hidden rounded-t-[24px] shrink-0">
        <motion.img
          src={image}
          alt={`${brand} ${model}`}
          className="w-full h-full object-cover"
          animate={{ scale: hovered ? 1.06 : 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          onError={(e) => {
            e.target.src = `https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&q=70`;
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-transparent to-transparent opacity-70" />

        <motion.button
          whileTap={{ scale: 0.8 }}
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setLiked(!liked); }}
          className="absolute top-3 right-3 z-20 w-9 h-9 rounded-xl flex items-center justify-center transition-all bg-black/40 backdrop-blur-md"
          style={{
            background: liked ? 'rgba(239,68,68,0.85)' : 'rgba(0,0,0,0.45)',
          }}
        >
          <Heart className={`w-4 h-4 ${liked ? 'fill-white text-white' : 'text-white/70'}`} />
        </motion.button>

        <div
          className="absolute top-3 left-3 z-20 px-2.5 py-1 rounded-[8px] text-[10px] font-bold uppercase tracking-wider"
          style={{ background: fuel.bg, color: fuel.text }}
        >
          {fuel.label}
        </div>

        <div className="absolute bottom-3 left-3 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-black/50 backdrop-blur-md">
          <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
          <span className="text-xs font-semibold">{rating}</span>
          <span className="text-[10px] text-white/40">({reviewsCount})</span>
        </div>
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
            <div className="flex items-center gap-1.5 mt-1 no-wrap">
              <MapPin className="w-3 h-3 text-primary shrink-0" />
              <span className="text-[11px] text-white/35 truncate">{car.district_name || car.tuman_nomi || 'Tashkent'}</span>
            </div>
          </div>
          <div className="text-right shrink-0 ml-4">
            <div className="text-xl font-extrabold font-display text-white whitespace-nowrap">
              {formatNarx(price)}
            </div>
            <div className="text-[10px] text-white/35 font-medium uppercase tracking-tighter">/ kun</div>
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
          to={`/car/${car.id}`}
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
