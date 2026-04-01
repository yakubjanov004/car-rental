import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Star, MapPin, Users, Fuel, Settings2, Heart, Zap, Send, MessageCircle } from 'lucide-react';
import { formatNarx } from '../utils/formatPrice';

const CarCard = ({ car, index = 0 }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  const WHATSAPP_RAQAM = "+998901234567";
  const TELEGRAM_USERNAME = "carrentaluz";

  const handleWhatsApp = (e) => {
    e.preventDefault();
    const matn = encodeURIComponent(
      `Salom! ${car.brend} ${car.model} (${car.yil}) mashinasini ijaraga olmoqchiman. Kunlik narx: ${formatNarx(car.kunlik_narx)}`
    );
    window.open(`https://wa.me/${WHATSAPP_RAQAM}?text=${matn}`, '_blank');
  };

  const handleTelegram = (e) => {
    e.preventDefault();
    window.open(`https://t.me/${TELEGRAM_USERNAME}`, '_blank');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ 
        duration: 0.6, 
        delay: index * 0.1,      // staggered entry
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
      whileHover={{ y: -8, transition: { duration: 0.3 } }}
      className="card-premium group relative overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* ====== BACKGROUND HOVER EFFECT ====== */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, x: 100 }}
            animate={{ opacity: 0.07, scale: 1.2, x: 0 }}
            exit={{ opacity: 0, scale: 0.8, x: 100 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="absolute inset-0 z-0 pointer-events-none"
          >
            <img
              src={car.rasm}
              alt=""
              className="w-full h-full object-cover scale-150 -rotate-12 translate-x-16"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Electric/Hybrid Badge */}
      {(car.elektr || car.yoqilgi === 'elektro' || car.yoqilgi === 'gibrid') && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="absolute top-4 left-4 z-20 flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold shadow-lg"
          style={{ 
            background: (car.yoqilgi === 'elektro' || (car.elektr && !car.gibrid)) ? '#00c896' : '#f59e0b', 
            color: '#000' 
          }}
        >
          <Zap className="w-3 h-3 fill-black" />
          { (car.yoqilgi === 'elektro' || (car.elektr && !car.gibrid)) ? 'ELEKTR' : 'GIBRID'}
        </motion.div>
      )}

      {/* Image Container */}
      <div className="relative aspect-[16/10] overflow-hidden">
        <motion.img
          src={car.rasm}
          alt={car.model}
          className="w-full h-full object-cover"
          animate={{ scale: isHovered ? 1.08 : 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />

        <motion.div
          className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"
          animate={{ opacity: isHovered ? 1 : 0.6 }}
          transition={{ duration: 0.4 }}
        />

        {/* Favorite Button */}
        <motion.button
          className="absolute top-4 right-4 z-10 p-3 bg-black/40 backdrop-blur-md rounded-2xl border border-white/10"
          whileTap={{ scale: 0.85 }}
          onClick={(e) => {
            e.preventDefault();
            setIsLiked(!isLiked);
          }}
          animate={{ 
            backgroundColor: isLiked ? 'rgba(239,68,68,0.8)' : 'rgba(0,0,0,0.4)',
            borderColor: isLiked ? 'rgba(239,68,68,1)' : 'rgba(255,255,255,0.1)',
          }}
        >
          <Heart className={`w-5 h-5 transition-all ${isLiked ? 'fill-white text-white' : 'text-white'}`} />
        </motion.button>

        {/* Rating */}
        <div className="absolute bottom-4 left-4 z-10 px-4 py-2 bg-black/40 backdrop-blur-md rounded-xl flex items-center gap-2 border border-white/5">
          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
          <span className="text-sm font-bold">{car.reyting || 0}</span>
          <span className="text-xs text-white/50">({car.sharhlar_soni || 0})</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 relative z-10">
        <div className="flex justify-between items-start mb-4">
          <div>
            <motion.h3
              className="text-xl font-bold mb-1"
              animate={{ color: isHovered ? 'var(--color-primary)' : 'white' }}
              transition={{ duration: 0.3 }}
            >
              {car.brend} {car.model}
            </motion.h3>
            <div className="flex items-center gap-2 text-white/50 text-sm">
              <MapPin className="w-4 h-4 text-primary" />
              <span>{car.tuman_nomi || 'Toshkent'}</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-primary font-black text-xl">{formatNarx(car.kunlik_narx)}</p>
            <span className="text-xs text-white/50">/kun</span>
          </div>
        </div>

        {/* Specs */}
        <motion.div
          className="flex justify-between p-4 bg-white/5 rounded-2xl mb-4"
          animate={{ backgroundColor: isHovered ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.05)' }}
        >
          <div className="flex flex-col items-center gap-1">
            <Users className="w-4 h-4 text-primary" />
            <span className="text-[10px] text-white/50 uppercase font-bold">{car.orinlar} o'rin</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Settings2 className="w-4 h-4 text-primary" />
            <span className="text-[10px] text-white/50 uppercase font-bold">
              {car.uzatma === 'automatic' ? 'Avtomat' : 'Mexanika'}
            </span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Fuel className="w-4 h-4 text-primary" />
            <span className="text-[10px] text-white/50 uppercase font-bold">{car.yoqilgi}</span>
          </div>
        </motion.div>

        {/* Social Actions (New) */}
        <div className="flex gap-2 mb-4">
            <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleWhatsApp}
                className="flex-1 py-3 bg-green-600/20 hover:bg-green-600/30 border border-green-600/30 rounded-xl text-green-500 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
            >
                <MessageCircle className="w-4 h-4" />
                WhatsApp
            </motion.button>
            <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleTelegram}
                className="flex-1 py-3 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-600/30 rounded-xl text-blue-400 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
            >
                <Send className="w-4 h-4" />
                Telegram
            </motion.button>
        </div>

        {/* Detail Button */}
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Link to={`/mashina/${car.id}`} className="btn-primary w-full py-4 rounded-2xl font-bold block text-center shadow-lg shadow-primary/20">
            Batafsil ma'lumot
          </Link>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default CarCard;
