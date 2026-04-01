import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Star, MapPin, Users, Fuel, Settings2, Calendar, 
  CheckCircle2, ChevronLeft, Phone, User, Info, 
  ShieldCheck, Send, MessageSquare, ArrowRight, X, Clock, AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
// import { DEMO_MASHINALAR } from '../data/cars';
import { formatNarx } from '../utils/formatPrice';
import { kunlarFarqi } from '../utils/dateUtils';
import { useAuth } from '../context/AuthContext';
import ScrollReveal from '../components/ScrollReveal';
import { fetchCarDetail, MEDIA_BASE_URL, createBooking } from '../utils/api';

const CarDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [step, setStep] = useState(1);
  const [bookingData, setBookingData] = useState({
    startDate: '',
    endDate: '',
    fullName: user?.first_name ? `${user.first_name} ${user.last_name || ''}` : '',
    phone_number: user?.phone_number || '',
  });

  const [myBookings, setMyBookings] = useState([]);
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    const loadCar = async () => {
      setLoading(true);
      try {
        const data = await fetchCarDetail(id);
        if (data) {
          setCar(data);
        } else {
          setError("Mashina topilmadi");
        }
      } catch (err) {
        setError("Mashina topilmadi");
      } finally {
        setLoading(false);
      }
    };
    loadCar();
    window.scrollTo(0, 0);
  }, [id]);

  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const imgY = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const imgOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0.1]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A]">
      <motion.div 
        animate={{ scale: [1, 1.2, 1], rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity }}
        className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full shadow-[0_0_20px_rgba(232,55,42,0.3)]" 
      />
    </div>
  );
  
  if (error || !car) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0A0A0A] text-center px-6">
      <AlertCircle className="w-16 h-16 text-white/10 mb-6" />
      <h2 className="text-4xl font-display font-extrabold mb-8 tracking-tighter">Mashina <span className="text-white/30 italic">topilmadi</span></h2>
      <Link to="/mashinalar" className="btn-primary px-10">Katalogga qaytish</Link>
    </div>
  );

  // Normalize data
  const brand = car.brand || car.brend || "Chevrolet";
  const model = car.model || "Unknown";
  const year = car.year || car.yil || 2024;
  const price = car.daily_price || car.kunlik_narx || 0;
  const fuelType = car.fuel_type || car.yoqilgi || 'benzin';
  const transmission = car.transmission || car.uzatma || 'automatic';
  const seats = car.seats || car.orinlar || 5;
  const rating = car.rating || car.reyting || 4.9;
  const reviewsCount = car.review_count || car.sharhlar_soni || 0;
  const features = car.features || car.xususiyatlar || [];
  
  let mainImage = car.main_image || car.rasm;
  if (mainImage && !mainImage.startsWith('http') && !mainImage.startsWith('/images')) {
    mainImage = `${MEDIA_BASE_URL}${mainImage}`;
  }

  const totalDays = bookingData.startDate && bookingData.endDate ? kunlarFarqi(bookingData.startDate, bookingData.endDate) : 0;
  const totalPrice = totalDays * price;

  const handleBooking = async () => {
    if (!user) {
      alert('Iltimos, avval ro\'yxatdan o\'ting yoki tizimga kiring.');
      navigate('/kirish');
      return;
    }

    try {
       await createBooking({
         car: car.id,
         start_date: bookingData.startDate,
         end_date: bookingData.endDate,
         total_price: totalPrice,
         full_name: bookingData.fullName,
         phone_number: bookingData.phone_number,
       });
       alert('Bron so\'rovi muvaffaqiyatli yuborildi!');
       navigate('/kabinet');
    } catch (err) {
       alert('Xatolik yuz berdi. Iltimos qaytadan urinib ko\'ring.');
    }
  };

  return (
    <div ref={containerRef} className="bg-[#0A0A0A] min-h-screen pb-32 overflow-hidden">
      
      {/* === HERO AREA === */}
      <section className="relative h-[75vh] md:h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Ambient background */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/4 left-1/3 w-[600px] h-[600px] rounded-full bg-primary/[0.08] blur-[150px] pointer-events-none" />
          <motion.div style={{ y: imgY, opacity: imgOpacity }} className="w-full h-full">
            <img 
              src={mainImage} 
              className="w-full h-full object-contain md:object-cover scale-110 opacity-30 blur-[4px]" 
              alt="" 
            />
          </motion.div>
          <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0A]/60 via-transparent to-[#0A0A0A]" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            <Link to="/mashinalar" className="inline-flex items-center gap-2 text-white/30 hover:text-white transition-colors mb-10 group text-[10px] uppercase font-bold tracking-[0.2em]">
              <ChevronLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
              Katalogga qaytish
            </Link>
            <div className="text-primary font-bold uppercase tracking-[0.4em] text-[10px] mb-6">— {brand}</div>
            <h1 className="font-display text-7xl md:text-[10rem] font-extrabold tracking-tighter mb-8 leading-none">
              {model}
            </h1>
            <div className="flex flex-wrap justify-center gap-6">
              <span className="glass px-6 py-2.5 rounded-full border-white/5 text-[11px] font-bold uppercase tracking-widest">{year} yil</span>
              <span className="glass px-6 py-2.5 rounded-full border-white/5 text-[11px] font-bold uppercase tracking-widest text-primary">{fuelType === 'elektro' ? '⚡ Elektro' : fuelType}</span>
              <span className="glass px-6 py-2.5 rounded-full border-white/5 text-[11px] font-bold uppercase tracking-widest">{transmission === 'automatic' ? 'Avtomat' : 'Mexanika'}</span>
            </div>
          </motion.div>
        </div>

        {/* Floating main car image */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 150 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="absolute bottom-[-10%] md:bottom-[-20%] left-1/2 -translate-x-1/2 w-full max-w-5xl px-6 pointer-events-none z-20"
        >
          <img 
            src={mainImage} 
            alt={model} 
            className="w-full object-contain filter drop-shadow-[0_60px_120px_rgba(0,0,0,1)]" 
          />
        </motion.div>
      </section>

      {/* === CONTENT AREA === */}
      <div className="max-w-7xl mx-auto px-6 mt-40 md:mt-60 grid lg:grid-cols-12 gap-20 items-start relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 blur-[120px] pointer-events-none" />
        
        {/* Left Side: Details */}
        <div className="lg:col-span-7 space-y-24">
          
          {/* Main Info */}
          <section>
            <ScrollReveal direction="up">
              <div className="text-[11px] text-primary font-bold uppercase tracking-[0.2em] mb-4">— Showroom</div>
              <h2 className="font-display text-4xl md:text-5xl font-extrabold mb-10 tracking-tighter">Mukammallik har bir <span className="text-white/40 italic">detalda</span></h2>
              <p className="text-lg text-white/50 leading-relaxed font-light mb-12 italic">
                Ushbu {brand} {model} xizmat ko'rsatish sohasida o'z xavfsizligi va qulayligi bilan ajralib turadi. 
                Sizning har qanday sayohatingiz uchun ideal hamroh. Biz har bir mijoz uchun individual yondashuvni kafolatlaymiz.
              </p>
            </ScrollReveal>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: Zap, label: 'Dvigatel', val: '2.0T / 245 HP', color: '#00D97E' },
                { icon: ShieldCheck, label: 'Sug\'urta', val: 'To\'liq KASKO', color: '#3B82F6' },
                { icon: Clock, label: 'Yosh limiti', val: '21 Yosh', color: '#F59E0B' },
                { icon: Star, label: 'Reyting', val: '4.95 / 5.0', color: '#EF4444' },
              ].map((item, i) => (
                <ScrollReveal key={i} direction="up" delay={i * 0.1}>
                  <div className="glass p-8 flex flex-col items-center justify-center text-center group border-white/5 hover:border-primary/30 transition-all">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                      <item.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="text-[9px] text-white/30 uppercase font-black tracking-[0.2em] mb-2">{item.label}</div>
                    <div className="text-sm font-extrabold font-display uppercase">{item.val}</div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </section>

          <section>
            <ScrollReveal direction="up">
              <h3 className="font-display text-3xl font-extrabold mb-10 tracking-tight">Qulaylik va <span className="text-white/40">Texnologiya</span></h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(features || []).map((feat, i) => (
                  <div key={i} className="flex gap-5 p-6 rounded-3xl bg-white/[0.02] border border-white/5 items-center hover:bg-white/[0.04] transition-colors">
                    <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-sm font-bold text-white/70 tracking-wide">{feat}</span>
                  </div>
                ))}
              </div>
            </ScrollReveal>
          </section>

          <section>
            <ScrollReveal direction="up">
              <div className="p-10 rounded-[48px] bg-white/[0.01] border border-white/5 flex flex-col md:flex-row gap-10 items-center relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-[50px] pointer-events-none" />
                <div className="w-20 h-20 rounded-[32px] bg-primary/10 flex items-center justify-center shrink-0 text-primary group-hover:scale-110 transition-transform duration-700">
                  <MapPin className="w-10 h-10" />
                </div>
                <div>
                  <h3 className="font-display text-4xl font-extrabold mb-8 tracking-tighter">Band qilish <span className="text-white/40 italic">Jarayoni</span></h3>
                  <div className="space-y-6">
                    {[
                      { step: '01', t: 'So\'rov yuborish', d: 'Platforma orqali o\'z so\'rovingizni qoldiring.' },
                      { step: '02', t: 'Tasdiqlash', d: 'Menejerimiz siz bilan bog\'lanib barchasini tasdiqlaydi.' },
                      { step: '03', t: 'Mashinani olish', d: 'Mashinani ofisimizdan olib keting yoki yetkazib berishga buyurtma bering.' },
                    ].map((s, i) => (
                      <div key={i} className="flex gap-6 group">
                        <div className="text-xl font-display font-black text-primary/40 group-hover:text-primary transition-colors">{s.step}</div>
                        <div>
                          <h4 className="font-bold text-base mb-1">{s.t}</h4>
                          <p className="text-xs text-white/30 font-light leading-relaxed">{s.d}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </section>
        </div>

        <div className="lg:col-span-5">
          <div className="sticky top-32">
            <ScrollReveal direction="right">
              <div className="glass p-12 relative overflow-hidden border-white/10 border-2 shadow-2xl rounded-[48px]">
                <div className="absolute top-0 left-0 w-full h-full bg-primary/[0.02] -z-10" />
                
                <div className="flex items-end justify-between border-b border-white/5 pb-10 mb-12">
                  <div>
                    <div className="text-[10px] text-white/20 uppercase font-black tracking-[0.2em] mb-2">Kunlik ijara</div>
                    <div className="font-display text-5xl font-extrabold text-primary shadow-primary/20">{formatNarx(price)}</div>
                  </div>
                  <div className="flex flex-col items-end">
                     <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[9px] font-bold text-primary uppercase tracking-widest mb-6">
                        <Sparkles className="w-3 h-3" />
                        Eksklyuziv Imkoniyat
                     </div>
                     <h4 className="text-2xl font-bold mb-4 tracking-tight">Maxsus Taklif</h4>
                     <p className="text-white/40 text-sm font-light leading-relaxed mb-10">
                        3+ kunga bron qiling va umumiy narxdan 10% chegirmaga ega bo'ling.
                     </p>
                  </div>
                </div>

                <div className="flex gap-2 mb-12">
                  {[1, 2, 3].map(s => (
                    <div key={s} className={`h-1.5 flex-1 rounded-full transition-all duration-700 ${step >= s ? 'bg-primary' : 'bg-white/5'}`} />
                  ))}
                </div>

                <div className="min-h-[300px]">
                  <AnimatePresence mode="wait">
                    {step === 1 && (
                      <motion.div
                        key="step1"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-8"
                      >
                        <h4 className="text-xl font-bold tracking-tight mb-6">Ijara <span className="text-white/40 italic">Muddati</span></h4>
                        <div className="grid grid-cols-1 gap-6">
                          <div className="space-y-3">
                             <label className="text-[9px] text-white/20 uppercase font-black tracking-widest ml-1">Olish sanasi</label>
                             <input 
                               type="date" 
                               className="w-full bg-[#111] border border-white/5 rounded-2xl p-5 text-sm focus:border-primary/50 outline-none transition-all"
                               value={bookingData.startDate}
                               onFocus={(e) => e.target.showPicker && e.target.showPicker()}
                               onChange={(e) => setBookingData({...bookingData, startDate: e.target.value})}
                             />
                          </div>
                          <div className="space-y-3">
                             <label className="text-[9px] text-white/20 uppercase font-black tracking-widest ml-1">Qaytarish sanasi</label>
                             <input 
                               type="date" 
                               className="w-full bg-[#111] border border-white/5 rounded-2xl p-5 text-sm focus:border-primary/50 outline-none transition-all"
                               value={bookingData.endDate}
                               onFocus={(e) => e.target.showPicker && e.target.showPicker()}
                               onChange={(e) => setBookingData({...bookingData, endDate: e.target.value})}
                             />
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {step === 2 && (
                      <motion.div
                        key="step2"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                      >
                        <h4 className="text-xl font-bold tracking-tight mb-6">Aloqa <span className="text-white/40 italic">Ma'lumotlari</span></h4>
                        <div className="space-y-4">
                          <input 
                            type="text" 
                            placeholder="To'liq ism..."
                            className="w-full bg-[#111] border border-white/5 rounded-2xl p-5 text-sm focus:border-primary/50 outline-none"
                            value={bookingData.fullName}
                            onChange={(e) => setBookingData({...bookingData, fullName: e.target.value})}
                          />
                          <input 
                            type="tel" 
                            placeholder="+998 00 000-00-00"
                            className="w-full bg-[#111] border border-white/5 rounded-2xl p-5 text-sm focus:border-primary/50 outline-none"
                            value={bookingData.phone_number}
                            onChange={(e) => setBookingData({...bookingData, phone_number: e.target.value})}
                          />
                        </div>
                      </motion.div>
                    )}

                    {step === 3 && (
                      <motion.div
                        key="step3"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-8"
                      >
                        <h4 className="text-xl font-bold tracking-tight mb-6">Yakuniy <span className="text-white/40 italic">Tasdiqlash</span></h4>
                        <div className="glass bg-white/[0.02] border-white/5 rounded-3xl p-8 space-y-6">
                          <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest">
                            <span className="text-white/20">Davomiyligi:</span>
                            <span>{totalDays} kun</span>
                          </div>
                          <div className="h-px bg-white/5" />
                          <div className="flex flex-col items-center">
                            <h4 className="font-display text-2xl font-extrabold mb-2 text-white italic">Savollaringiz bormi?</h4>
                            <p className="text-xs text-white/30 mb-10 uppercase tracking-widest">Qo'llab-quvvatlash markazi</p>
                          </div>
                          <Link to="/contact" className="btn-secondary group px-8 flex justify-center">
                              Bog'lanish
                              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                          </Link>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="mt-12 flex flex-wrap gap-3 mb-12">
                   {['Klimat Kontrol', 'Charm Salon', 'Apple CarPlay', '360° Kamera', 'O\'rindiq isitgich'].map((f, i) => (
                      <span key={i} className="px-4 py-2 rounded-xl bg-white/5 border border-white/5 text-[10px] font-bold uppercase tracking-widest text-white/40">
                         {f}
                      </span>
                   ))}
                </div>

                <div className="flex gap-4">
                  {step > 1 && (
                    <button 
                      onClick={() => setStep(step - 1)}
                      className="glass px-8 py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/5"
                    >
                      Orqaga
                    </button>
                  )}
                  <button 
                    onClick={() => step < 3 ? setStep(step + 1) : handleBooking()}
                    disabled={step === 1 && (!bookingData.startDate || !bookingData.endDate)}
                    className="btn-primary flex-1 py-5 rounded-2xl text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-3 animate-pulse-slow"
                  >
                    {step < 3 ? 'Davom etish' : 'Hozir bron qilish'}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="mt-12 pt-8 border-t border-white/5 flex items-center justify-between">
                   <div className="flex -space-x-3">
                      {[1, 2, 3].map(i => <img key={i} src={`https://i.pravatar.cc/100?img=${20+i}`} className="w-8 h-8 rounded-full border-2 border-bg-dark" alt="" />)}
                   </div>
                   <div className="text-[9px] text-white/20 uppercase font-bold tracking-widest">
                      Hoziroq biz bilan bog'laning
                   </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarDetail;
