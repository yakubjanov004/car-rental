import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Shield, UserCheck, Briefcase, ChevronRight, Sparkles } from 'lucide-react';
import { formatNarx } from '../utils/formatPrice';
import ChauffeurBookingModal from './ChauffeurBookingModal';

const ChauffeurCarCard = ({ car, index = 0 }) => {
  const [hovered, setHovered] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Data normalization
  const brand = car.brand || "Premium";
  const model = car.model || "Car";
  const price = car.daily_price || 0;
  const rating = car.rating || 4.9;
  const image = car.media?.card_main || car.image || `/images/assets/car_fallback.jpg`;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: index * 0.1 }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="group relative bg-[#111] rounded-[40px] overflow-hidden border border-white/5 hover:border-primary/30 transition-all duration-500 flex flex-col md:flex-row h-full md:h-[300px]"
      >
        {/* Dynamic Background Slide (New) */}
        <AnimatePresence>
          {hovered && (
            <motion.div
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1.3 }}
              exit={{ opacity: 0, scale: 1.1 }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-0 z-0 pointer-events-none overflow-hidden opacity-20"
            >
              <img
                src={image}
                alt=""
                className="w-full h-full object-cover blur-[60px]"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-transparent" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Premium Badge */}
        <div className="absolute top-6 left-6 z-20 flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-md">
          <Sparkles className="w-3 h-3 text-primary" />
          <span className="text-[10px] font-black text-primary uppercase tracking-widest">VIP Xizmat</span>
        </div>

        {/* Image Section */}
        <div className="relative w-full md:w-[45%] h-[200px] md:h-full overflow-hidden bg-[#0a0a0a]">
          {/* Dynamic Studio Glow (New) */}
          <motion.div 
            animate={{ 
              scale: hovered ? 1.8 : 1.2,
              opacity: hovered ? 0.4 : 0.2 
            }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-primary blur-[80px] rounded-full z-0 transition-all duration-1000"
          />

          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.03)_0%,transparent_100%)]" />
          
          <motion.img
            src={image}
            alt={`${brand} ${model}`}
            animate={{ 
              scale: hovered ? 1.05 : 1,
              x: hovered ? 10 : 0,
              y: hovered ? -5 : 0
            }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="w-full h-full object-contain relative z-10 drop-shadow-[0_20px_40px_rgba(0,0,0,0.5)]"
          />
          
          {/* Reflection Floor */}
          <div className="absolute bottom-0 left-0 w-full h-20 bg-gradient-to-t from-[#111] to-transparent z-10" />
          <div className="absolute bottom-0 left-0 w-full h-1/4 bg-black/40 blur-xl z-0" />
        </div>

        {/* Content Section */}
        <div className="flex-1 p-8 md:p-10 flex flex-col justify-center relative z-10">
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-[11px] text-white/30 uppercase tracking-[0.2em] font-bold mb-1">{brand}</p>
              <h3 className="text-3xl font-extrabold tracking-tight group-hover:text-primary transition-colors">{model}</h3>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10">
               <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
               <span className="text-xs font-bold">{rating}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8">
             <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                   <UserCheck className="w-3.5 h-3.5 text-primary" />
                </div>
                <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Professional Haydovchi</span>
             </div>
             <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                   <Shield className="w-3.5 h-3.5 text-primary" />
                </div>
                <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider">To'liq Sug'urta</span>
             </div>
             <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                   <Briefcase className="w-3.5 h-3.5 text-primary" />
                </div>
                <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Biznes Klas Standarti</span>
             </div>
          </div>

          <div className="flex items-center justify-between mt-auto">
             <div>
                <p className="text-[10px] text-white/30 uppercase tracking-widest font-bold">Narxi (Kelishuv asosida)</p>
                <p className="text-2xl font-black text-white">{formatNarx(price)} <span className="text-xs font-medium text-white/30 truncate">/ kunlik bazaviy</span></p>
             </div>
             
             <motion.button 
               whileTap={{ scale: 0.95 }}
               onClick={() => setIsModalOpen(true)}
               className="px-8 py-4 rounded-2xl bg-white text-black text-[11px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all shadow-xl shadow-white/5"
             >
               Band qilish
             </motion.button>
          </div>
        </div>

        {/* Decorative Glow */}
        <AnimatePresence>
          {hovered && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" 
            />
          )}
        </AnimatePresence>
      </motion.div>

      <ChauffeurBookingModal 
        car={car}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};

export default ChauffeurCarCard;
