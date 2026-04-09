import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Calendar, MapPin, Plane, User, Phone, 
  ArrowRight, ShieldCheck, Clock, CheckCircle2,
  AlertCircle, Sparkles
} from 'lucide-react';
import { formatNarx } from '../utils/formatPrice';
import { kunlarFarqi } from '../utils/dateUtils';
import { createBooking } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const DRIVER_FEE_PER_DAY = 150000;

const ChauffeurBookingModal = ({ car, isOpen, onClose }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    pickupLocation: '',
    flightNumber: '',
    fullName: user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : (user?.username || ''),
    phoneNumber: user?.phone_number || '',
  });

  const totalDays = formData.startDate && formData.endDate ? kunlarFarqi(formData.startDate, formData.endDate) : 0;
  const basePrice = totalDays * (car?.daily_price || 0);
  const chauffeurFeeTotal = totalDays * DRIVER_FEE_PER_DAY;
  const totalPrice = basePrice + chauffeurFeeTotal;

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setStep(1);
      setError(null);
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    if (!user) {
      alert('Iltimos, avval tizimga kiring.');
      navigate('/login');
      return;
    }

    setLoading(true);
    setError(null);

    const chauffeurDetails = `Pickup: ${formData.pickupLocation}${formData.flightNumber ? ` | Flight: ${formData.flightNumber}` : ''}`;

    try {
      await createBooking({
        car: car.id,
        start_datetime: `${formData.startDate}T10:00:00Z`,
        end_datetime: `${formData.endDate}T10:00:00Z`,
        full_name: formData.fullName,
        phone_number: formData.phoneNumber,
        is_chauffeur: true,
        chauffeur_details: chauffeurDetails,
        total_price: totalPrice // Backend also handles this, but for consistency
      });
      setStep(4); // Success step
    } catch (err) {
      console.error(err);
      const backendError = err.response?.data?.non_field_errors?.[0] || 
                           err.response?.data?.[0] || 
                           (typeof err.response?.data === 'string' ? err.response?.data : null) || 
                           "Bron qilishda xatolik yuz berdi. Iltimos qaytadan urinib ko'ring.";
      setError(backendError);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        />

        {/* Modal Content */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-2xl bg-[#111] border border-white/10 rounded-[48px] overflow-hidden shadow-2xl"
        >
          {/* Header */}
          <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                   <Sparkles className="w-6 h-6 text-primary" />
                </div>
                <div>
                   <h2 className="text-xl font-black uppercase tracking-tighter">VIP Chauffeur <span className="text-white/20">Booking</span></h2>
                   <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">{car?.brand} {car?.model}</p>
                </div>
             </div>
             <button onClick={onClose} className="w-10 h-10 rounded-xl hover:bg-white/5 flex items-center justify-center transition-colors">
                <X className="w-5 h-5 text-white/40" />
             </button>
          </div>

          <div className="p-10">
             <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3 group">
                           <label className="text-[9px] text-white/30 uppercase font-black tracking-widest ml-1">Olish sanasi</label>
                           <div className="relative">
                              <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                              <input 
                                type="date" 
                                className="w-full bg-[#0A0A0A] border border-white/5 rounded-2xl p-5 pl-14 text-sm focus:border-primary/50 outline-none"
                                value={formData.startDate}
                                onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                              />
                           </div>
                        </div>
                        <div className="space-y-3 group">
                           <label className="text-[9px] text-white/30 uppercase font-black tracking-widest ml-1">Qaytarish sanasi</label>
                           <div className="relative">
                              <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                              <input 
                                type="date" 
                                className="w-full bg-[#0A0A0A] border border-white/5 rounded-2xl p-5 pl-14 text-sm focus:border-primary/50 outline-none"
                                value={formData.endDate}
                                onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                              />
                           </div>
                        </div>
                     </div>
                     <button 
                       disabled={!formData.startDate || !formData.endDate}
                       onClick={() => setStep(2)}
                       className="w-full btn-primary h-16 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-3 disabled:opacity-50 disabled:grayscale"
                     >
                        Keyingisi <ArrowRight className="w-4 h-4" />
                     </button>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                     <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           <div className="space-y-3">
                              <label className="text-[9px] text-white/30 uppercase font-black tracking-widest ml-1">Ism va familiya</label>
                              <div className="relative">
                                 <User className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                                 <input 
                                   type="text" 
                                   placeholder="To'liq ismingiz"
                                   className="w-full bg-[#0A0A0A] border border-white/5 rounded-2xl p-5 pl-14 text-sm focus:border-primary/50 outline-none"
                                   value={formData.fullName}
                                   onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                                 />
                              </div>
                           </div>
                           <div className="space-y-3">
                              <label className="text-[9px] text-white/30 uppercase font-black tracking-widest ml-1">Telefon raqam</label>
                              <div className="relative">
                                 <Phone className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                                 <input 
                                   type="text" 
                                   placeholder="+998"
                                   className="w-full bg-[#0A0A0A] border border-white/5 rounded-2xl p-5 pl-14 text-sm focus:border-primary/50 outline-none"
                                   value={formData.phoneNumber}
                                   onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                                 />
                              </div>
                           </div>
                        </div>
                        <div className="space-y-3">
                           <label className="text-[9px] text-white/30 uppercase font-black tracking-widest ml-1">Kutib olish joyi (Aeroport/Mehmonxona/Uy)</label>
                           <div className="relative">
                              <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                              <input 
                                type="text" 
                                placeholder="Masalan: Islom Karimov NOMIDAGI AEROPORT"
                                className="w-full bg-[#0A0A0A] border border-white/5 rounded-2xl p-5 pl-14 text-sm focus:border-primary/50 outline-none"
                                value={formData.pickupLocation}
                                onChange={(e) => setFormData({...formData, pickupLocation: e.target.value})}
                              />
                           </div>
                        </div>
                        <div className="space-y-3">
                           <label className="text-[9px] text-white/30 uppercase font-black tracking-widest ml-1">Parvoz raqami (Ixtiyoriy)</label>
                           <div className="relative">
                              <Plane className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                              <input 
                                type="text" 
                                placeholder="Masalan: HY-231"
                                className="w-full bg-[#0A0A0A] border border-white/5 rounded-2xl p-5 pl-14 text-sm focus:border-primary/50 outline-none"
                                value={formData.flightNumber}
                                onChange={(e) => setFormData({...formData, flightNumber: e.target.value})}
                              />
                           </div>
                        </div>
                     </div>
                     <div className="flex gap-4">
                        <button onClick={() => setStep(1)} className="flex-1 h-16 rounded-2xl bg-white/5 text-[10px] font-black uppercase tracking-widest">Orqaga</button>
                        <button 
                           disabled={!formData.pickupLocation || !formData.fullName || !formData.phoneNumber}
                           onClick={() => setStep(3)}
                           className="flex-[2] btn-primary h-16 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-3 disabled:opacity-50"
                        >
                           Davom etish <ArrowRight className="w-4 h-4" />
                        </button>
                     </div>
                  </motion.div>
                )}

                {step === 3 && (
                  <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                     <div className="p-8 rounded-[32px] bg-white/[0.02] border border-white/5 space-y-4">
                        <div className="flex justify-between items-center text-[11px] font-black uppercase tracking-widest text-white/30">
                           <span>Muddati ({totalDays} kun):</span>
                           <span className="text-white">{formatNarx(basePrice)}</span>
                        </div>
                        <div className="flex justify-between items-center text-[11px] font-black uppercase tracking-widest text-primary">
                           <span>Haydovchi xizmati:</span>
                           <span>{formatNarx(chauffeurFeeTotal)}</span>
                        </div>
                        <div className="h-px bg-white/5" />
                        <div className="flex justify-between items-center text-xl font-black uppercase tracking-tighter">
                           <span>JAMI:</span>
                           <span className="text-white">{formatNarx(totalPrice)}</span>
                        </div>
                     </div>

                     {error && (
                        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-bold text-center">
                           {error}
                        </div>
                     )}

                     <div className="flex gap-4">
                        <button onClick={() => setStep(2)} className="flex-1 h-16 rounded-2xl bg-white/5 text-[10px] font-black uppercase tracking-widest">Orqaga</button>
                        <button 
                           onClick={handleSubmit}
                           disabled={loading}
                           className="flex-[2] btn-primary h-16 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-3"
                        >
                           {loading ? "Yuborilmoqda..." : "Tasdiqlash va Yuborish"} 
                           {!loading && <CheckCircle2 className="w-5 h-5" />}
                        </button>
                     </div>
                  </motion.div>
                )}

                {step === 4 && (
                  <motion.div key="step4" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center py-10 text-center">
                     <div className="w-24 h-24 rounded-full bg-green-500/20 border border-green-500/40 flex items-center justify-center mb-8">
                        <CheckCircle2 className="w-12 h-12 text-green-500" />
                     </div>
                     <h3 className="text-3xl font-black uppercase tracking-tighter mb-4">So'rov yuborildi!</h3>
                     <p className="text-sm text-white/40 max-w-sm mb-10">Sizning VIP Chauffeur xizmati uchun so'rovingiz qabul qilindi. Tez orada menejerimiz siz bilan bog'lanadi.</p>
                     <button onClick={onClose} className="btn-primary px-12 h-14">Tushunarli</button>
                  </motion.div>
                )}
             </AnimatePresence>
          </div>

          {/* Footer Info */}
          {step < 4 && (
            <div className="p-6 bg-white/[0.01] border-t border-white/5 flex items-center justify-center gap-6">
               <div className="flex items-center gap-2 text-[8px] text-white/20 uppercase font-black tracking-widest">
                  <ShieldCheck className="w-3.5 h-3.5" /> 100% Xavfsizlik
               </div>
               <div className="flex items-center gap-2 text-[8px] text-white/20 uppercase font-black tracking-widest">
                  <Clock className="w-3.5 h-3.5" /> 24/7 Qo'llab-quvvatlash
               </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ChauffeurBookingModal;
