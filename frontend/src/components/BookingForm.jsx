import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Clock, Search, Plane, Building, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatNarx } from '../utils/formatPrice';

const OLISH_JOYLARI = [
  { id: 'ofis', icon: <Building className="w-4 h-4" />, nomi: 'Our Office — Amir Temur 15' },
  { id: 'airport', icon: <Plane className="w-4 h-4" />, nomi: 'Tashkent Airport' },
  { id: 'yetkazib', icon: <MapPin className="w-4 h-4" />, nomi: "Delivery to Address (+50 000 UZS)" },
];

const BookingForm = ({ carPrice = 400000 }) => {
  const navigate = useNavigate();
    const { t } = useTranslation();
  const [olishJoyi, setOlishJoyi] = useState('');
  const [qaytarishJoyi, setQaytarishJoyi] = useState('');
  const [boshlanish, setBoshlanish] = useState('');
  const [tugash, setTugash] = useState('');

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (olishJoyi) params.set('location', olishJoyi);
    if (boshlanish) params.set('start', boshlanish);
    if (tugash) params.set('end', tugash);
    navigate(`/fleet?${params.toString()}`);
  };

  const calculateDays = () => {
    if (!boshlanish || !tugash) return 0;
    const start = new Date(boshlanish);
    const end = new Date(tugash);
    const diff = end - start;
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  const days = calculateDays();
  const total = days * carPrice;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="glass-panel p-6 md:p-8 rounded-[32px] border-white/5 shadow-2xl relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-3xl -mr-16 -mt-16 rounded-full" />
      
      <h3 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
        <Clock className="w-6 h-6 text-primary" />
        Book a Car
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Olish joyi */}
        <div className="space-y-2">
          <label className="text-xs text-white/40 uppercase font-black tracking-widest flex items-center gap-1.5 ml-1">
            <MapPin className="w-3 h-3 text-primary" /> Pick-up Location
          </label>
          <div className="relative">
            <select 
                className="input-premium py-4 pl-4 pr-10 appearance-none cursor-pointer hover:border-white/20 transition-colors" 
                onChange={(e) => setOlishJoyi(e.target.value)}
                value={olishJoyi}
            >
                <option value="" disabled>{t('bookingForm.selectOpt')}</option>
                {OLISH_JOYLARI.map(j => (
                <option key={j.id} value={j.id}>{j.nomi}</option>
                ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/20">
                <Building className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Qaytarish joyi */}
        <div className="space-y-2">
          <label className="text-xs text-white/40 uppercase font-black tracking-widest flex items-center gap-1.5 ml-1">
            <MapPin className="w-3 h-3 text-primary" /> {t('bookingForm.returnLabel')}
          </label>
          <div className="relative">
            <select 
                className="input-premium py-4 pl-4 pr-10 appearance-none cursor-pointer hover:border-white/20 transition-colors" 
                onChange={(e) => setQaytarishJoyi(e.target.value)}
                value={qaytarishJoyi}
            >
                <option value="" disabled>{t('bookingForm.selectOpt')}</option>
                {OLISH_JOYLARI.map(j => (
                <option key={j.id} value={j.id}>{j.nomi}</option>
                ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/20">
                <MapPin className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Boshlanish sanasi */}
        <div className="space-y-2">
          <label className="text-xs text-white/40 uppercase font-black tracking-widest flex items-center gap-1.5 ml-1">
            <Calendar className="w-3 h-3 text-primary" /> Pick-up Date and Time
          </label>
          <input
            type="datetime-local"
            className="input-premium py-4 text-white !scheme-dark"
            onChange={(e) => setBoshlanish(e.target.value)}
          />
        </div>

        {/* Tugash sanasi */}
        <div className="space-y-2">
          <label className="text-xs text-white/40 uppercase font-black tracking-widest flex items-center gap-1.5 ml-1">
            <Clock className="w-3 h-3 text-primary" /> {t('bookingForm.returnDateTime')}
          </label>
          <input
            type="datetime-local"
            className="input-premium py-4 text-white !scheme-dark"
            onChange={(e) => setTugash(e.target.value)}
          />
        </div>
      </div>

      {/* Hisoblash */}
      {days > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mb-8 p-6 bg-primary/10 border border-primary/20 rounded-[24px] flex justify-between items-center"
        >
          <div>
            <p className="text-xs text-white/40 uppercase font-bold mb-1">{t('bookingForm.rentalDuration')}</p>
            <p className="text-lg font-bold">{days} days</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-white/40 uppercase font-bold mb-1">{t('bookingForm.totalAmount')}</p>
            <p className="text-3xl font-black text-primary tracking-tighter">
              {formatNarx(total)}
            </p>
          </div>
        </motion.div>
      )}

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleSearch}
        className="btn-primary w-full py-5 text-xl font-black rounded-2xl flex items-center justify-center gap-3 shadow-xl shadow-primary/20"
      >
        <Search className="w-6 h-6" />
        BOOK NOW
      </motion.button>
      
      <p className="text-[10px] text-center text-white/30 mt-4 uppercase tracking-tighter font-medium flex items-center justify-center gap-1">
        <Info className="w-3 h-3" />
        Documents: Passport and Driving License required
      </p>
    </motion.div>
  );
};

export default BookingForm;
