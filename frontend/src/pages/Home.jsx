import React, { useState, useRef, useEffect } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Search, ArrowRight, Star, Shield, Clock, MapPin,
  Zap, ChevronRight, Phone, CheckCircle, Quote, Users, Sparkles, Car
} from 'lucide-react';
import { TOSHKENT_TUMANLARI } from '../data/districts';
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

const ReviewCard = ({ review, index }) => (
  <ScrollReveal direction="up" delay={index * 0.1}>
    <div className="glass p-8 h-full flex flex-col justify-between border-white/5 hover:border-primary/20 transition-all group">
       <div className="relative">
          <Quote className="absolute -top-4 -left-4 w-10 h-10 text-primary/10 group-hover:text-primary/20 transition-colors" />
          <div className="flex gap-1 mb-6">
             {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 text-primary fill-primary" />)}
          </div>
          <p className="text-white/60 text-lg font-light leading-relaxed mb-8 italic">"{review.text}"</p>
       </div>
       <div className="flex items-center gap-4 border-t border-white/5 pt-6">
          <div className="w-12 h-12 rounded-full overflow-hidden border border-white/10 group-hover:border-primary/50 transition-colors">
             <img src={review.img} className="w-full h-full object-cover" alt="" />
          </div>
          <div>
             <h4 className="font-bold text-base text-white">{review.name}</h4>
             <p className="text-[10px] text-primary font-bold uppercase tracking-[0.1em]">{review.role}</p>
          </div>
       </div>
    </div>
  </ScrollReveal>
);

// ===================== HERO =====================
const Hero = ({ filterTuman, setFilterTuman, filterKategoriya, setFilterKategoriya }) => {
  const heroRef = useRef(null);
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
              className="glass p-5 relative overflow-hidden group max-w-xl"
            >
              <div className="absolute inset-0 bg-primary/[0.02] group-hover:bg-primary/[0.05] transition-colors -z-10" />
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <select
                    className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 text-sm focus:border-primary/50 transition-all outline-none appearance-none cursor-pointer text-white"
                    onChange={(e) => setFilterTuman(e.target.value)}
                  >
                    <option value="" className="bg-[#0A0A0A]">📍 Barcha tumanlar</option>
                    {TOSHKENT_TUMANLARI.map((t) => (
                      <option key={t.id} value={t.id} className="bg-[#0A0A0A]">{t.nomi}</option>
                    ))}
                  </select>
                </div>
                <div className="flex-1 relative">
                  <Car className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <select
                    className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 text-sm focus:border-primary/50 transition-all outline-none appearance-none cursor-pointer text-white"
                    onChange={(e) => setFilterKategoriya(e.target.value)}
                  >
                    <option value="" className="bg-[#0A0A0A]">🚗 Kategoriya</option>
                    <option value="sedan" className="bg-[#0A0A0A]">Sedan</option>
                    <option value="crossover" className="bg-[#0A0A0A]">Krossover</option>
                    <option value="suv" className="bg-[#0A0A0A]">SUV</option>
                    <option value="elektro" className="bg-[#0A0A0A]">⚡ Elektro</option>
                    <option value="premium" className="bg-[#0A0A0A]">💎 Premium</option>
                  </select>
                </div>
                <Link
                  to={`/fleet?tuman=${filterTuman}&kategoriya=${filterKategoriya}`}
                  className="btn-primary h-14 px-8 shrink-0 text-sm font-bold uppercase tracking-widest flex items-center justify-center gap-2 group-hover:scale-105 transition-transform shadow-xl shadow-primary/20"
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
  const [mashhurlar, setMashhurlar] = useState([]);
  const [filterTuman, setFilterTuman] = useState('');
  const [filterKategoriya, setFilterKategoriya] = useState('');
  
  useEffect(() => {
    const loadData = async () => {
      try {
        const all = await fetchCars();
        if (all && all.length > 0) {
          setMashhurlar(all.slice(0, 6));
        } else {
          setMashhurlar([]);
        }
      } catch (err) {
        console.error("Home data fetch failed:", err);
        setMashhurlar([]);
      }
    };
    loadData();
  }, []);

  // const elektromobillar = DEMO_MASHINALAR.filter(c => c.yoqilgi === 'elektro').slice(0, 3);

  return (
    <div className="bg-[#0A0A0A] overflow-x-hidden">
      <Hero 
         filterTuman={filterTuman} 
         setFilterTuman={setFilterTuman}
         filterKategoriya={filterKategoriya}
         setFilterKategoriya={setFilterKategoriya}
      />
      <BrendTicker />

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
               { title: 'Biznes Klass', desc: 'Muhim uchrashuvlar uchun', img: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&q=80', link: '/fleet?kategoriya=business' },
               { title: 'Oilaviy SUV', desc: 'Katta sarguzashtlar uchun', img: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&q=80', link: '/fleet?kategoriya=suv' },
               { title: '⚡ Elektro Markaz', desc: 'Kelajak energiyasi', img: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800&q=80', link: '/ev-fleet' },
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
          {mashhurlar.map((car, i) => (
            <CarCard key={car.id} car={car} index={i} />
          ))}
        </div>
      </section>

      {/* === ELEKTRO PROMO === */}
      <section className="py-24 bg-[#0F0F0F] relative overflow-hidden">
         <div className="absolute top-0 right-0 w-[600px] h-full bg-primary/5 blur-[120px] -rotate-12 translate-x-1/2 pointer-events-none" />
         <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-20 items-center">
            <ScrollReveal direction="left">
               <div className="space-y-10">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00D97E]/10 border border-[#00D97E]/20 text-[10px] text-[#00D97E] font-bold uppercase tracking-widest">
                     ⚡ Kelajak bu yerda
                  </div>
                  <h2 className="font-display text-5xl md:text-7xl font-extrabold tracking-tighter leading-none">
                     Elektr <span className="text-white/30 italic">Inqilobi</span>
                  </h2>
                  <p className="text-white/40 text-lg font-light leading-relaxed max-w-md">
                     BYD, Tesla va boshqa yetakchi brendlar bilan tabiatni asrang va premium qulaylikdan bahra oling.
                  </p>
                  <div className="flex gap-4">
                     <Link to="/ev-fleet" className="btn-primary bg-[#00D97E] hover:bg-[#00D97E]/90 border-none shadow-[#00D97E]/20 px-10">Kashf eting</Link>
                  </div>
               </div>
            </ScrollReveal>
            <ScrollReveal direction="right">
               <div className="relative">
                   <img src={mashhurlar[4]?.main_image || "/images/cars/car-fallback.jpg"} className="w-full drop-shadow-[0_40px_40px_rgba(0,0,0,0.8)] scale-110" alt="EV" />
               </div>
            </ScrollReveal>
         </div>
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
            {REVIEWS.map((review, i) => (
               <ReviewCard key={review.id} review={review} index={i} />
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
