import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Search, ArrowRight, Star, Shield, Clock, MapPin,
  Zap, ChevronRight, Phone, CheckCircle, Quote, Users, Sparkles, Car, ChevronDown
} from 'lucide-react';
import { TOSHKENT_TUMANLARI } from '../data/districts';
import evHero from '../assets/ev-hero.png';
import catBusiness from '../assets/cat-business.png';
import catSuv from '../assets/cat-suv.png';
import catEv from '../assets/cat-ev.png';
import { fetchCars, MEDIA_BASE_URL } from '../utils/api';
import CarCard from '../components/CarCard';
import ScrollReveal from '../components/ScrollReveal';
import heroSlideImg from '../assets/hero-slide-1.webp';

// ===================== BRENDLAR TICKER =====================
const BRENDLAR = ['Chevrolet','BYD','Kia','Chery','Haval','Hyundai','Toyota','Lexus','Mercedes-Benz','BMW','Porsche','Tesla'];

const BrendTicker = () => (
  <div className="relative overflow-hidden py-8 border-y border-white/[0.05] bg-white/[0.01]">
    <div className="flex gap-16 w-max animate-marquee">
      {[...BRENDLAR, ...BRENDLAR].map((b, i) => (
        <span key={i} className="text-white/10 font-display font-extrabold text-2xl uppercase tracking-[0.2em] whitespace-nowrap select-none italic hover:text-primary transition-colors cursor-default">
          {b}
        </span>
      ))}
    </div>
    <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-[#0A0A0A] to-transparent z-10 pointer-events-none" />
    <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-[#0A0A0A] to-transparent z-10 pointer-events-none" />
  </div>
);

// ===================== REVIEWS DATA =====================
const REVIEWS = [
  { id: 1, name: 'Azamat Rasulov', role: 'Business Owner', text: 'Eng yaxshi servis! BYD Han ijaraga oldim, mashina yangi va judayam toza edi. Xizmat ko\'rsatish 10/10.', img: 'https://i.pravatar.cc/150?u=1' },
  { id: 2, name: 'Malika Karimova', role: 'Premium Client', text: 'Aeroportda kutib olishdi, mashina tayyor edi. Juda qulay va tez. Tavsiya qilaman!', img: 'https://i.pravatar.cc/150?u=2' },
  { id: 3, name: 'Sardor Aliev', role: 'Traveler', text: 'Chevrolet Tahoe ijaraga oldik, oilaviy sayohat uchun ajoyib bo\'ldi. Shartlar judayam oson ekan.', img: 'https://i.pravatar.cc/150?u=3' },
];

const ReviewCard = ({ review, index }) => {
  const name = review.user_name || review.name || "Mijoz";
  const comment = review.comment || review.text || "Ajoyib xizmat!";
  const avatar = review.user_avatar || review.img || `https://i.pravatar.cc/150?u=${index}`;
  const role = review.role || "Premium Client";

  return (
    <ScrollReveal direction="up" delay={index * 0.1}>
      <div className="glass p-10 h-full flex flex-col justify-between border-white/5 hover:border-primary/30 transition-all duration-500 group relative">
         {/* Glow Background */}
         <div className="absolute inset-0 bg-primary/[0.02] group-hover:bg-primary/[0.05] transition-colors -z-10" />
         
         <div className="relative">
            <Quote className="absolute -top-6 -left-6 w-12 h-12 text-primary/10 group-hover:text-primary/20 transition-all group-hover:scale-110" />
            <div className="flex gap-1 mb-8">
               {[...Array(5)].map((_, i) => (
                 <Star key={i} className="w-4 h-4 text-primary fill-primary drop-shadow-[0_0_8px_rgba(255,107,1,0.5)]" />
               ))}
            </div>
            <p className="text-white/70 text-lg font-light leading-relaxed mb-10 italic relative z-10">
              "{comment}"
            </p>
         </div>
         
         <div className="flex items-center gap-5 border-t border-white/5 pt-8">
            <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-white/10 group-hover:border-primary/50 transition-all duration-500 shadow-xl">
               <img src={avatar} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={name} />
            </div>
            <div>
               <h4 className="font-display font-bold text-lg text-white group-hover:text-primary transition-colors tracking-tight">{name}</h4>
               <p className="text-[10px] text-primary font-black uppercase tracking-[0.2em]">{role}</p>
            </div>
         </div>
      </div>
    </ScrollReveal>
  );
};

// ===================== HERO =====================
const Hero = ({ filterTuman, setFilterTuman, filterKategoriya, setFilterKategoriya }) => {
  const heroRef = useRef(null);
  const [isOpenTuman, setIsOpenTuman] = useState(false);
  const [isOpenKateg, setIsOpenKateg] = useState(false);
  
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const bgScale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);
  const textY = useTransform(scrollYProgress, [0, 1], [0, 50]);

  return (
    <section ref={heroRef} className="relative h-screen min-h-[800px] flex items-center overflow-hidden">
      {/* Background Image Container */}
      <motion.div 
        style={{ scale: bgScale }}
        className="absolute inset-0 z-0"
      >
        <img 
          src={heroSlideImg} 
          alt="Hero Background" 
          className="w-full h-full object-cover"
        />
        {/* Overlays for readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/20" />
      </motion.div>
      
      {/* Search Bar Background Glow */}
      <div className="absolute top-1/2 left-1/4 w-[600px] h-[600px] rounded-full bg-primary/[0.08] blur-[150px] pointer-events-none -translate-x-1/2 -translate-y-1/2" />

      <div className="max-w-7xl mx-auto px-6 w-full relative z-10 pt-20">
        <div className="max-w-2xl">
          <motion.div style={{ y: textY }}>
            {/* Tagline pill */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 text-[10px] text-white/50 font-bold uppercase tracking-[0.2em] mb-10 backdrop-blur-md"
            >
              <Sparkles className="w-3.5 h-3.5 text-primary animate-pulse" />
              Toshkentdagi #1 Premium Ijara
            </motion.div>
  
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="font-display font-extrabold text-6xl md:text-8xl leading-[0.85] tracking-tighter mb-8 text-white drop-shadow-2xl"
            >
              Premium<br />
              <span className="text-white/40 italic">Erkinlik</span><br />
              Sizni kutmoqda
            </motion.h1>
  
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-white/60 text-lg md:text-xl leading-relaxed mb-12 max-w-md font-light italic"
            >
              "Sizning yo'lingiz, sizning uslubingiz. Har bir sayohat biz bilan unutilmas premium tajribaga aylanadi."
            </motion.p>
  
            {/* Search form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="glass p-5 relative group max-w-xl"
            >
              <div className="absolute inset-0 bg-primary/[0.02] group-hover:bg-primary/[0.05] transition-colors -z-10" />
            <div className="flex flex-col md:flex-row items-center gap-4">
              {/* Custom District Dropdown */}
              <div className="relative w-full md:w-64 group">
                <button
                  onClick={() => setIsOpenTuman(!isOpenTuman)}
                  className="w-full h-14 px-6 flex items-center justify-between gap-3 glass border-white/5 group-hover:border-primary/30 transition-all text-sm font-medium"
                >
                  <div className="flex items-center gap-3 text-white/70">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span>{filterTuman || 'Barcha tumanlar'}</span>
                  </div>
                  <ChevronDown className={`w-4 h-4 transition-transform ${isOpenTuman ? 'rotate-180' : ''}`} />
                </button>
                
                <AnimatePresence>
                  {isOpenTuman && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      className="absolute bottom-full left-0 w-full mb-2 py-2 bg-[#0F0F0F]/95 backdrop-blur-2xl border border-white/10 z-[999] shadow-2xl rounded-2xl max-h-64 overflow-y-auto no-scrollbar"
                    >
                      <div 
                        onClick={() => { setFilterTuman(''); setIsOpenTuman(false); }}
                        className="px-6 py-4 hover:bg-white/5 cursor-pointer text-sm transition-colors text-white/50 border-b border-white/5"
                      >
                        📍 Barcha tumanlar
                      </div>
                      {TOSHKENT_TUMANLARI.map(tuman => (
                        <div
                          key={tuman.id}
                          onClick={() => { setFilterTuman(tuman.nomi); setIsOpenTuman(false); }}
                          className="px-6 py-4 hover:bg-primary/20 hover:text-primary cursor-pointer text-sm font-medium transition-all"
                        >
                          {tuman.nomi}
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Custom Category Dropdown */}
              <div className="relative w-full md:w-64 group">
                <button
                  onClick={() => setIsOpenKateg(!isOpenKateg)}
                  className="w-full h-14 px-6 flex items-center justify-between gap-3 glass border-white/5 group-hover:border-primary/30 transition-all text-sm font-medium"
                >
                  <div className="flex items-center gap-3 text-white/70">
                    <Car className="w-4 h-4 text-primary" />
                    <span>{filterKategoriya ? filterKategoriya.toUpperCase() : 'Kategoriya'}</span>
                  </div>
                  <ChevronDown className={`w-4 h-4 transition-transform ${isOpenKateg ? 'rotate-180' : ''}`} />
                </button>
                
                <AnimatePresence>
                  {isOpenKateg && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      className="absolute bottom-full left-0 w-full mb-2 py-2 bg-[#0F0F0F]/95 backdrop-blur-2xl border border-white/10 z-[999] shadow-2xl rounded-2xl"
                    >
                      {[
                        { val: '', lab: 'Barcha kategoriyalar' },
                        { val: 'sedan', lab: 'Sedan' },
                        { val: 'crossover', lab: 'Krossover' },
                        { val: 'suv', lab: 'SUV' },
                        { val: 'elektro', lab: '⚡ Elektro' },
                        { val: 'premium', lab: '💎 Premium' },
                      ].map(cat => (
                        <div
                          key={cat.val}
                          onClick={() => { setFilterKategoriya(cat.val); setIsOpenKateg(false); }}
                          className="px-6 py-4 hover:bg-primary/20 hover:text-primary cursor-pointer text-sm font-medium transition-all"
                        >
                          {cat.lab}
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <Link
                to={`/fleet?tuman=${filterTuman}&kategoriya=${filterKategoriya}`}
                className="btn-primary h-14 px-8 w-full md:w-auto shrink-0 text-sm font-bold uppercase tracking-widest flex items-center justify-center gap-2 group-hover:scale-105 transition-transform shadow-xl shadow-primary/20"
              >
                <Search className="w-4 h-4" />
                QIDIRISH
              </Link>
            </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 hidden md:block z-10">
         <motion.div 
           animate={{ y: [0, 10, 0] }}
           transition={{ duration: 2, repeat: Infinity }}
           className="w-6 h-10 rounded-full border border-white/20 flex justify-center p-2 backdrop-blur-sm"
         >
            <div className="w-1 h-2 bg-primary rounded-full" />
         </motion.div>
      </div>
    </section>
  );
};

// ===================== ASOSIY KOMPONENT =====================
const Home = () => {
  const [cars, setCars] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [filterTuman, setFilterTuman] = useState('');
  const [filterKategoriya, setFilterKategoriya] = useState('');
  
  useEffect(() => {
    const loadData = async () => {
      try {
        const allCars = await fetchCars();
        setCars(allCars || []);
        
        // Sharhlarni mashinalar ichidan yig'amiz
        const allReviews = allCars.flatMap(c => c.reviews || []);
        setReviews(allReviews.length > 0 ? allReviews.slice(0, 6) : []);
      } catch (err) {
        console.error("Home data fetch failed:", err);
      }
    };
    loadData();
  }, []);

  // 1. Premium mashinalarni guruhlash (Takrorlanishni oldini olish)
  const premiumCars = useMemo(() => {
    const grouped = {};
    cars.forEach(car => {
      const key = car.model_group || car.id;
      if (!grouped[key]) {
        grouped[key] = { ...car, unit_count: 1 };
      } else {
        grouped[key].unit_count += 1;
      }
    });
    return Object.values(grouped).sort((a,b) => b.daily_price - a.daily_price).slice(0, 6);
  }, [cars]);

  // 2. Elektro-promo uchun bitta elektrokar tanlash
  const electricFeatured = useMemo(() => {
    return cars.find(c => c.fuel_type === 'elektro') || cars[0];
  }, [cars]);

  return (
    <div className="bg-[#0A0A0A] overflow-x-hidden">
      <Hero 
         filterTuman={filterTuman} 
         setFilterTuman={setFilterTuman}
         filterKategoriya={filterKategoriya}
         setFilterKategoriya={setFilterKategoriya}
      />
      <BrendTicker />

      {/* === STATS SECTION === */}
      <section className="py-24 border-y border-white/[0.05] bg-white/[0.01]">
         <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-12 md:gap-24">
               {[
                  { label: "Modellar", value: "33+", sub: "Eng so'nggi avlod" },
                  { label: "Buyurtmalar", value: "1500+", sub: "Mamnun mijozlar" },
                  { label: "Xizmat", value: "24/7", sub: "Professional support" },
                  { label: "Filiallar", value: "12+", sub: "Toshkent bo'ylab" }
               ].map((stat, i) => (
                  <ScrollReveal key={i} direction="up" delay={i * 0.1}>
                     <div className="text-center group">
                        <p className="text-4xl md:text-6xl font-display font-black text-white mb-2 group-hover:text-primary transition-colors tracking-tighter">{stat.value}</p>
                        <p className="text-[10px] text-primary font-black uppercase tracking-[0.2em] mb-1">{stat.label}</p>
                        <p className="text-[9px] text-white/20 font-bold uppercase tracking-widest">{stat.sub}</p>
                     </div>
                  </ScrollReveal>
               ))}
            </div>
         </div>
      </section>

      {/* === CHAUFFEUR PROMO === */}
      <section className="py-32 max-w-7xl mx-auto px-6 overflow-hidden">
         <div className="grid lg:grid-cols-2 gap-20 items-center">
            <ScrollReveal direction="left">
               <div className="relative group">
                  <div className="aspect-[4/5] rounded-[64px] overflow-hidden border border-white/10 group-hover:border-primary/30 transition-all duration-700">
                     <img 
                        src="/images/chauffeur_hero.jpg" 
                        className="w-full h-full object-cover scale-110 group-hover:scale-100 transition-transform duration-[3s] ease-out" 
                        alt="Chauffeur Service" 
                     />
                     <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                  </div>
                  {/* Floating Label */}
                  <div className="absolute -bottom-10 -right-10 p-10 glass border-white/10 rounded-[40px] shadow-2xl z-20 backdrop-blur-2xl hidden md:block">
                     <p className="text-primary text-[10px] font-black uppercase tracking-[0.3em] mb-3">VIP Xizmat</p>
                     <h4 className="text-2xl font-bold tracking-tight mb-4">Shaxsiy Haydovchi</h4>
                     <p className="text-xs text-white/40 leading-relaxed font-medium uppercase tracking-wider">Professional va xushmuomala jamoa</p>
                  </div>
               </div>
            </ScrollReveal>

            <ScrollReveal direction="right">
               <div className="space-y-10">
                  <div className="text-[10px] text-primary font-black uppercase tracking-[0.4em]">— Eksklyuziv Imkoniyat</div>
                  <h2 className="font-display text-5xl md:text-7xl font-extrabold tracking-tighter leading-tight">
                     Rulda emas,<br />
                     <span className="text-white/20 italic">Komfortda</span> bo'ling
                  </h2>
                  <p className="text-white/40 text-lg font-light leading-relaxed">
                     Biznes uchrashuvlar, aeroport transporti va maxsus tadbirlar uchun professional haydovchi xizmati. O'z ishingizga e'tibor qarating, yo'ldagi barcha mas'uliyatni bizga topshiring.
                  </p>
                  <div className="flex flex-col gap-6 pt-6">
                     {[
                        { icon: Shield, text: "To'liq xavfsizlik kafolati" },
                        { icon: Users, text: "Professional haydovchilar" },
                        { icon: Clock, text: "Vaqtni maksimal tejash" }
                     ].map((item, i) => (
                        <div key={i} className="flex items-center gap-5 group">
                           <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-primary/20 transition-all">
                              <item.icon className="w-5 h-5 text-primary" />
                           </div>
                           <span className="text-sm font-bold text-white/60 uppercase tracking-widest group-hover:text-white transition-colors">{item.text}</span>
                        </div>
                     ))}
                  </div>
                  <div className="pt-10">
                     <Link to="/chauffeur" className="btn-primary px-12 h-16 text-xs shadow-2xl shadow-primary/20">XIZMATNI KO'RISH</Link>
                  </div>
               </div>
            </ScrollReveal>
         </div>
      </section>

      {/* === CATEGORIES === */}
      <section className="py-24 max-w-7xl mx-auto px-6">
         <ScrollReveal direction="up">
            <div className="text-center mb-16">
               <h2 className="font-display text-4xl md:text-5xl font-extrabold tracking-tighter mb-4">Har bir <span className="text-white/40">Manzil</span> uchun</h2>
               <p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.2em]">Sizning maqsadlaringiz — bizning tanlovimiz</p>
            </div>
         </ScrollReveal>

         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
               { title: 'Biznes Klass', desc: 'Muhim uchrashuvlar uchun', img: catBusiness, link: '/fleet?kategoriya=business' },
               { title: 'Oilaviy SUV', desc: 'Katta sarguzashtlar uchun', img: catSuv, link: '/fleet?kategoriya=suv' },
               { title: '⚡ Elektro Markaz', desc: 'Kelajak energiyasi', img: catEv, link: '/fleet?kategoriya=elektro' },
            ].map((cat, i) => (
               <ScrollReveal key={i} direction="up" delay={i * 0.1}>
                  <Link to={cat.link} className="relative aspect-[4/3] rounded-[40px] overflow-hidden group block border border-white/5">
                     <img src={cat.img} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt="" />
                     <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent p-10 flex flex-col justify-end">
                        <h4 className="text-2xl font-bold mb-1">{cat.title}</h4>
                        <p className="text-xs text-white/40 font-medium uppercase tracking-widest">{cat.desc}</p>
                     </div>
                  </Link>
               </ScrollReveal>
            ))}
         </div>
      </section>

      {/* === MASHHUR MASHINALAR === */}
      <section className="py-24 max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-6">
          <ScrollReveal direction="left">
            <div className="text-[10px] text-primary font-bold uppercase tracking-[0.2em] mb-4">— Eksklyuziv Park</div>
            <h2 className="font-display text-4xl md:text-6xl font-extrabold tracking-tighter leading-none">
              Premium Tanlovlar
            </h2>
          </ScrollReveal>
          <ScrollReveal direction="right">
            <Link to="/fleet" className="btn-secondary group">
              Barchasini ko'rish 
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </ScrollReveal>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {premiumCars.map((car, i) => (
            <CarCard key={car.id} car={car} index={i} />
          ))}
        </div>
      </section>

      {/* === ELEKTRO PROMO BANNER (Hero Style) === */}
      <section className="relative min-h-[600px] flex items-center overflow-hidden mb-24">
         {/* Background Image with Parallax-like feel */}
         <div className="absolute inset-0 z-0">
            <img 
               src={evHero} 
               className="w-full h-full object-cover scale-105" 
               alt="EV Background" 
            />
            {/* Dark Overlay Gradients */}
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent z-10" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent z-10" />
         </div>

         <div className="max-w-7xl mx-auto px-6 relative z-20 w-full">
            <ScrollReveal direction="left">
               <div className="max-w-xl space-y-8">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#00D97E]/20 border border-[#00D97E]/30 text-[10px] text-[#00D97E] font-black uppercase tracking-[0.2em] backdrop-blur-md">
                     ⚡ Kelajak bu yerda
                  </div>
                  <h2 className="font-display text-6xl md:text-8xl font-extrabold tracking-tighter leading-[0.9]">
                     Elektr <br />
                     <span className="text-white/40 italic">Inqilobi</span>
                  </h2>
                  <p className="text-white/50 text-xl font-light leading-relaxed">
                     Tabiatni asrang va premium qulaylikdan bahra oling. Kelajak texnologiyasi endi sizning ixtiyoringizda.
                  </p>
                  <div className="flex flex-wrap gap-6 pt-4">
                     <Link to="/fleet?kategoriya=elektro" className="btn-primary bg-[#00D97E] hover:bg-[#00D97E]/90 border-none shadow-2xl shadow-[#00D97E]/20 px-12 h-16">KASHF ETISH</Link>
                  </div>
               </div>
            </ScrollReveal>
         </div>
         
         {/* Decorative Bottom Line */}
         <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </section>

      {/* === REVIEWS === */}
      <section className="py-32 max-w-7xl mx-auto px-6">
         <ScrollReveal direction="up">
            <div className="text-center mb-20">
               <h2 className="font-display text-4xl md:text-6xl font-extrabold tracking-tighter mb-4">Mijozlarimiz <span className="text-white/40 italic">Nima</span> Deyishadi</h2>
               <div className="flex justify-center gap-1">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 text-primary fill-primary" />)}
                  <span className="ml-3 text-sm font-bold text-white/50 tracking-widest uppercase">4.9/5.0 Premium Xizmat</span>
               </div>
            </div>
         </ScrollReveal>

         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(reviews.length > 0 ? reviews : [
              { id: 1, user_name: "Ahmad", rating: 5, comment: "Xizmat daxshat, mashinalar ideal holatda!", user_avatar: "https://i.pravatar.cc/150?u=1" },
              { id: 2, user_name: "Laylo", rating: 5, comment: "BMW iX bilan sayohat unutilmas bo'ldi.", user_avatar: "https://i.pravatar.cc/150?u=2" },
              { id: 3, user_name: "Aziz", rating: 4, comment: "Hammasi yaxshi, bron qilish juda oson.", user_avatar: "https://i.pravatar.cc/150?u=3" }
            ]).map((review, i) => (
               <ReviewCard key={review.id} review={review} index={i} />
            ))}
         </div>
      </section>

      {/* === FAQ SECTION === */}
      <section className="py-32 max-w-4xl mx-auto px-6">
         <ScrollReveal direction="up">
            <div className="text-center mb-20">
               <h2 className="font-display text-4xl md:text-5xl font-extrabold tracking-tighter">Ko'p so'raladigan <br /><span className="text-white/40 italic">Savollar</span></h2>
            </div>
         </ScrollReveal>

         <div className="space-y-4">
            {[
               { q: "Mashina band qilish uchun qanday hujjatlar kerak?", a: "Sizga passport va haydovchilik guvohnomasi kifoya. Hujjatlarni onlayn profilingiz orqali yuklashingiz mumkin." },
               { q: "Depozit qaytariladimi?", a: "Ha, depozit mashina topshirilgandan so'ng, jarimalar va boshqa kamchiliklar yo'qligi tasdiqlangach, 3-7 ish kuni ichida qaytariladi." },
               { q: "Haydovchi bilan xizmat ko'rsatish narxi qancha?", a: "Narx tanlangan avtomobil va xizmat davomiyligiga bog'liq. Chauffeur sahifasida batafsil narxlar bilan tanishishingiz mumkin." },
               { q: "Eng kam ijara muddati qancha?", a: "Bizda eng kam ijara muddati — 24 soat (1 kun). Shuningdek, uzoq muddatli ijara uchun maxsus chegirmalar mavjud." }
            ].map((faq, i) => (
               <ScrollReveal key={i} direction="up" delay={i * 0.1}>
                  <details className="group glass border-white/5 transition-all duration-500">
                     <summary className="list-none p-8 cursor-pointer flex items-center justify-between">
                        <span className="text-sm font-bold text-white/80 uppercase tracking-widest">{faq.q}</span>
                        <ChevronDown className="w-5 h-5 text-primary group-open:rotate-180 transition-transform" />
                     </summary>
                     <div className="px-8 pb-8 text-white/40 text-sm font-light leading-relaxed border-t border-white/5 pt-6 italic">
                        {faq.a}
                     </div>
                  </details>
               </ScrollReveal>
            ))}
         </div>
      </section>

      {/* === CTA === */}
      <section className="py-24 px-6 mb-20">
         <div className="max-w-7xl mx-auto">
            <ScrollReveal direction="scale">
               <div className="glass p-12 md:p-24 rounded-[64px] relative overflow-hidden border-white/5 shardow-2xl text-center">
                  <div className="absolute top-0 left-0 w-full h-full bg-primary/[0.03] blur-[120px] pointer-events-none" />
                  <h2 className="font-display text-5xl md:text-8xl font-extrabold tracking-tighter mb-10 leading-none">
                     Sayohatni <span className="text-primary italic">Bugun</span><br />boshlang
                  </h2>
                  <p className="text-white/40 text-lg md:text-xl font-light mb-12 max-w-xl mx-auto">
                     O'zbekistondagi eng yaxshi mashinalar sizni kutmoqda. Qulaylik va sifat — bizning asosiy qoidamiz.
                  </p>
                  <div className="flex flex-wrap justify-center gap-6">
                     <Link to="/fleet" className="btn-primary px-12 h-16 text-sm">MASHINA TANLASH</Link>
                     <a href="tel:+998901234567" className="btn-secondary px-12 h-16 text-sm">BOG'LANISH</a>
                  </div>
               </div>
            </ScrollReveal>
         </div>
      </section>

    </div>
  );
};

export default Home;
