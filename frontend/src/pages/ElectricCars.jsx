import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Zap, ShieldCheck, BatteryCharging, Leaf, TrendingDown, DollarSign, ArrowRight, Sparkles, AlertCircle } from 'lucide-react';
import CarCard from '../components/CarCard';
import ScrollReveal from '../components/ScrollReveal';
import { fetchCarModels } from '../utils/api';
import evHeroImg from '../assets/ev-hero.jpg';

const ELEKTR_AFZALLIKLARI = [
  { 
    title: "Tejamkorlik", 
    desc: "Benzinli avtomobillarga qaraganda 4-5 baravar kam xarajat.",
    accent: "#00D97E",
    icon: DollarSign
  },
  { 
    title: "Texnologiya", 
    desc: "Eng so'nggi avtopilot va aqlli multimedia tizimlari.",
    accent: "#3B82F6",
    icon: Sparkles
  },
  { 
    title: "Ekologiya", 
    desc: "Tabiatga zarar yetkazmaydigan toza va shovqinsiz energiya.",
    accent: "#10B981",
    icon: Leaf
  },
];

const ElectricCars = () => {
  const [mashinalar, setMashinalar] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadEVs = async () => {
      setLoading(true);
      try {
        const data = await fetchCarModels();
        // Faqat haqiqiy elektr modellarni olamiz (1 donadan bo'lib chiqadi)
        const evs = data.filter(c => c.fuel_type === 'elektro');
        
        if (evs && evs.length > 0) {
          setMashinalar(evs);
        } else {
          setMashinalar([]);
        }
      } catch (err) {
        console.error("EV data fetch failed:", err);
        setMashinalar([]);
      } finally {
        setLoading(false);
      }
    };
    loadEVs();
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="bg-[#0A0A0A] min-h-screen pt-32 pb-40 overflow-hidden">
      
      {/* === HERO === */}
      <section className="relative h-[85vh] min-h-[700px] flex items-center overflow-hidden">
        {/* Background Image Container */}
        <motion.div 
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0 z-0"
        >
          <img 
            src={evHeroImg} 
            alt="EV Background" 
            className="w-full h-full object-cover"
          />
          {/* Overlays for green vibe */}
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-black/20" />
          <div className="absolute inset-0 bg-[#00D97E]/[0.05] mix-blend-overlay" />
        </motion.div>
        
        <div className="max-w-7xl mx-auto px-6 w-full relative z-10">
          <div className="max-w-3xl">
            <ScrollReveal direction="up">
              <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full border border-[#00D97E]/20 bg-[#00D97E]/5 text-[10px] font-extrabold text-[#00D97E] uppercase tracking-[0.3em] mb-12 backdrop-blur-md">
                <Zap className="w-3.5 h-3.5 fill-[#00D97E] animate-pulse" />
                Kelajak — bu elektro
              </div>
              <h1 className="font-display text-7xl md:text-[8rem] font-extrabold tracking-tighter mb-10 leading-[0.85] text-white">
                Premium <span className="text-[#00D97E] italic">Elektr</span><br />
                Modellar
              </h1>
              <p className="max-w-xl text-white/60 text-lg md:text-xl font-light leading-relaxed mb-16 italic">
                "Toshkentdagi eng katta elektromobil parki. BYD, Kia va Tesla'dan eng so'nggi durdonalar bilan tabiatni asrang."
              </p>
            </ScrollReveal>
          </div>
        </div>
        
        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 hidden md:block">
           <motion.div 
             animate={{ y: [0, 8, 0] }}
             transition={{ duration: 2, repeat: Infinity }}
             className="w-5 h-8 rounded-full border border-white/20 flex justify-center p-1.5 backdrop-blur-sm"
           >
              <div className="w-1 h-1.5 bg-[#00D97E] rounded-full" />
           </motion.div>
        </div>
      </section>

      {/* === BENEFITS GRID === */}
      <section className="py-32 px-6 border-y border-white/[0.04] bg-white/[0.01] relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#00D97E]/[0.02] to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {ELEKTR_AFZALLIKLARI.map((item, i) => (
              <ScrollReveal key={i} direction="up" delay={i * 0.1}>
                <div className="glass p-10 group hover:border-[#00D97E]/40 border-white/5 transition-all duration-500 rounded-[40px]">
                  <div 
                    className="w-16 h-16 rounded-2xl flex items-center justify-center mb-8 transition-all duration-700 bg-white/5 group-hover:bg-[#00D97E]/10 group-hover:scale-110"
                  >
                    <item.icon className="w-7 h-7" style={{ color: item.accent }} />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 tracking-tight">{item.title}</h3>
                  <p className="text-white/40 text-sm leading-relaxed font-light">{item.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* === COMPARISON PANEL === */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <ScrollReveal direction="scale">
            <div className="glass p-12 md:p-24 relative overflow-hidden rounded-[64px] border-white/5 border-2">
               <div className="absolute top-0 right-0 w-96 h-96 bg-[#00D97E]/10 blur-[150px] rounded-full pointer-events-none" />
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center relative z-10">
                  <div className="space-y-10">
                    <div className="text-[10px] text-[#00D97E] font-black uppercase tracking-[0.3em] mb-4">— Solishtiruv</div>
                    <h2 className="font-display text-5xl md:text-7xl font-extrabold tracking-tighter leading-none">
                      Iqtisodiy <br /> <span className="text-white/30 italic">Inqilob</span>
                    </h2>
                    <p className="text-white/40 text-xl font-light leading-relaxed max-w-md italic">
                      "Har bir kilometr shunchaki masofa emas, balki aqlli tanlov mevasi. Biz bilan 75% gacha tejang."
                    </p>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-6 rounded-2xl bg-white/5 border border-white/5 group hover:bg-white/10 transition-colors">
                        <span className="text-white/30 text-xs font-bold uppercase tracking-widest">Benzin (100km)</span>
                        <span className="font-display font-extrabold text-xl text-red-500/80">~120 000 UZS</span>
                      </div>
                      <div className="flex justify-between items-center p-6 rounded-2xl bg-[#00D97E]/10 border border-[#00D97E]/20 group hover:bg-[#00D97E]/15 transition-colors">
                        <span className="text-[#00D97E] text-xs font-bold uppercase tracking-widest">Elektr (100km)</span>
                        <span className="font-display font-extrabold text-2xl text-[#00D97E]">~18 000 UZS</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="glass bg-[#0F0F0F] p-16 rounded-[48px] border-white/5 flex flex-col items-center justify-center text-center shadow-2xl relative">
                    <div className="absolute inset-0 bg-primary/[0.01] blur-3xl pointer-events-none" />
                    <div className="w-24 h-24 rounded-[32px] bg-[#00D97E]/10 flex items-center justify-center mb-8 relative">
                      <Zap className="w-12 h-12 text-[#00D97E] animate-bounce-slow" />
                      <div className="absolute inset-0 bg-[#00D97E]/20 blur-xl rounded-full scale-150 animate-pulse" />
                    </div>
                    <p className="text-[9px] text-white/30 uppercase font-black tracking-[0.4em] mb-4">Sizning foydangiz</p>
                    <div className="font-display text-7xl md:text-8xl font-extrabold text-[#00D97E] leading-none mb-4 tracking-tighter">102K</div>
                    <p className="text-white/20 text-xs font-bold uppercase tracking-widest">Har 100 kilometrda</p>
                  </div>
               </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* === FLEET GRID === */}
      <section className="py-32 px-6 max-w-7xl mx-auto">
        <ScrollReveal direction="up" className="mb-20">
          <div className="flex flex-col md:flex-row items-end justify-between gap-8">
            <div>
              <div className="text-[10px] text-[#00D97E] font-black uppercase tracking-[0.3em] mb-6">— Eksklyuziv Park</div>
              <h2 className="font-display text-5xl md:text-7xl font-extrabold tracking-tighter leading-none">
                Elektr <span className="text-white/30 italic">Katalog</span>
              </h2>
            </div>
             <Link to="/fleet" className="btn-secondary group">
              Barchasini ko'rish 
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </ScrollReveal>

        {loading ? (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(3)].map((_, i) => (
                 <div key={i} className="aspect-[4/3] bg-white/[0.02] animate-pulse rounded-[40px] border border-white/5" />
              ))}
           </div>
        ) : (
           <>
            {mashinalar.length > 0 ? (
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {mashinalar.map((car, index) => (
                    <CarCard key={car.id} car={car} index={index} />
                  ))}
               </div>
            ) : (
               <div className="py-24 text-center glass rounded-[48px] border-white/5">
                  <AlertCircle className="w-12 h-12 text-white/10 mx-auto mb-6" />
                  <h3 className="text-2xl font-bold mb-2">Hozircha bo'sh</h3>
                  <p className="text-white/30 text-sm">Yaqin orada yangi elektromobillar qo'shiladi.</p>
               </div>
            )}
           </>
        )}
      </section>

    </div>
  );
};

export default ElectricCars;
