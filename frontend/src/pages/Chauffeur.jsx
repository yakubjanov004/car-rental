import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UserCheck, Star, Shield, Clock, Coffee, MapPin, Briefcase, 
  Car, ArrowRight, Sparkles, Phone, MessageCircle, CheckCircle2,
  Calendar, CreditCard, ChevronRight
} from 'lucide-react';
import ScrollReveal from '../components/ScrollReveal';
import { fetchCarModels } from '../utils/api';
import ChauffeurCarCard from '../components/ChauffeurCarCard';

const AFZALLIKLAR = [
  {
    icon: UserCheck,
    title: "Professional",
    desc: "Kamida 10 yillik tajribaga ega xushmuomala haydovchilar jamoasi."
  },
  {
    icon: Clock,
    title: "Vaqtni tejash",
    desc: "Tirbandlik va mashina to'xtash joyi haqida qayg'urmasdan o'z ishingizga e'tibor qarating."
  },
  {
    icon: Shield,
    title: "Xavfsizlik",
    desc: "Haydovchi yo'lda barcha mas'uliyatni o'z zimmasiga oladi."
  },
  {
    icon: Coffee,
    title: "Maksimal Qulaylik",
    desc: "Mehmonlarni kutib olish yoki uzoq masofali sayohatlar uchun ideal tanlov."
  }
];

const STEPS = [
  { icon: Car, title: "Tanlash", desc: "Premium avtoparkimizdan o'zingizga mos mashinani tanlang." },
  { icon: Calendar, title: "Sana", desc: "Xizmat vaqti va yo'nalishni ko'rsatib biz bilan bog'laning." },
  { icon: CheckCircle2, title: "Tasdiqlash", desc: "Operatorimiz variantlarni va narxni tasdiqlaydi." },
  { icon: UserCheck, title: "Uchrashuv", desc: "Haydovchi belgilangan vaqtda va joyda sizni kutadi." },
];

const Chauffeur = () => {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCars = async () => {
      setLoading(true);
      try {
        const data = await fetchCarModels({ allows_chauffeur: true });
        setCars(data.results || []);
      } catch (err) {
        console.error("Fetch failed:", err);
      } finally {
        setLoading(false);
      }
    };
    loadCars();
  }, []);

  return (
    <div className="bg-[#0A0A0A] min-h-screen pb-48 overflow-hidden relative">
      
      {/* Hero Section with Background Image */}
      <section className="relative h-[65vh] md:h-[80vh] flex items-center justify-center overflow-hidden mb-32">
        {/* Background Image & Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/images/chauffeur_hero.jpg" 
            className="w-full h-full object-cover transition-transform duration-[15s] scale-105 hover:scale-110"
            alt="VIP Chauffeur Service"
          />
          <div className="absolute inset-0 bg-[#0A0A0A]/60" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0A0A0A]" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
          <ScrollReveal direction="up">
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-primary/20 bg-primary/5 text-[9px] font-black text-primary uppercase tracking-[0.3em] mb-8 shadow-[0_0_20px_rgba(239,55,42,0.1)]">
              <Sparkles className="w-3.5 h-3.5" />
              Eksklyuziv VIP Xizmat
            </div>
            
            <h1 className="font-display text-5xl md:text-8xl lg:text-[100px] font-black tracking-tighter mb-8 leading-[0.85] uppercase text-white drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
              Haydovchi <br />
              <span className="text-primary italic font-light lowercase">Bilan</span>
            </h1>

            <p className="max-w-xl mx-auto text-white/60 text-base md:text-lg font-light leading-relaxed mb-12">
              Biznes uchrashuvlar va maxsus tadbirlar uchun <br className="hidden md:block" /> professional haydovchilar jamoasi.
            </p>
            
            <div className="flex flex-wrap justify-center gap-4">
              <motion.a 
                whileHover={{ y: -5 }}
                whileTap={{ scale: 0.98 }}
                href="#fleet" 
                className="btn-primary px-10 h-16 rounded-2xl flex items-center gap-3 text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary/20"
              >
                Katalogga o'tish
                <ArrowRight className="w-4 h-4" />
              </motion.a>
              <motion.button 
                whileHover={{ y: -5 }}
                whileTap={{ scale: 0.98 }}
                className="px-10 h-16 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-3"
              >
                <Phone className="w-4 h-4 text-primary" />
                Konsultatsiya
              </motion.button>
            </div>
          </ScrollReveal>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-20">
          <div className="w-[1px] h-10 bg-white" />
          <span className="text-[7px] font-black uppercase tracking-[0.4em]">Scroll</span>
        </div>
      </section>

      {/* Decorative Background Elements (shifted down) */}
      <div className="absolute top-[100vh] right-0 w-[800px] h-[800px] bg-primary/[0.03] blur-[150px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/2" />

      {/* Benefits Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-48">
        {AFZALLIKLAR.map((item, i) => (
          <ScrollReveal key={i} direction="up" delay={i * 0.1}>
            <div className="card p-10 flex flex-col items-center text-center group hover:border-primary/30 transition-all duration-500">
               <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-8 group-hover:bg-primary/20 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500">
                  <item.icon className="w-7 h-7 text-primary" />
               </div>
               <h3 className="text-xl font-bold mb-4 tracking-tight group-hover:text-white transition-colors">{item.title}</h3>
               <p className="text-xs text-white/40 leading-relaxed font-light uppercase tracking-wider">{item.desc}</p>
            </div>
          </ScrollReveal>
        ))}
      </div>

      {/* Premium Fleet Section */}
      <section id="fleet" className="max-w-7xl mx-auto mb-48">
         <ScrollReveal direction="left">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
               <div>
                  <div className="text-primary text-[10px] font-black uppercase tracking-[0.3em] mb-4">— Avtoparkimiz</div>
                  <h2 className="text-4xl md:text-6xl font-extrabold tracking-tighter">
                     Tanlangan <span className="text-white/20 italic">Modellar</span>
                  </h2>
               </div>
               <p className="max-w-sm text-white/30 text-sm font-light leading-relaxed">
                  Haydovchi bilan xizmat ko'rsatish uchun maxsus tayyorlangan, yuqori darajadagi komfort va xavfsizlikka ega avtomobillarimiz.
               </p>
            </div>
         </ScrollReveal>

         <div className="grid grid-cols-1 gap-8">
            {loading ? (
               [...Array(3)].map((_, i) => (
                  <div key={i} className="h-[300px] bg-white/[0.02] animate-pulse rounded-[40px] border border-white/5" />
               ))
            ) : (
               cars.length > 0 ? (
                  cars.map((car, index) => (
                     <ChauffeurCarCard key={car.id} car={car} index={index} />
                  ))
               ) : (
                  <div className="py-20 text-center glass rounded-[40px] border border-white/5">
                     <p className="text-white/40 uppercase tracking-widest text-xs">Ayni damda mashinalar mavjud emas</p>
                  </div>
               )
            )}
         </div>
      </section>

      {/* Process Section */}
      <section className="max-w-7xl mx-auto mb-48">
         <div className="bg-white/[0.02] border border-white/5 rounded-[64px] p-12 md:p-24 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_100%_0%,rgba(0,217,126,0.05)_0%,transparent_50%)]" />
            
            <ScrollReveal direction="up">
               <div className="text-center mb-20">
                  <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6">Ishlash jarayoni</h2>
                  <p className="text-white/30 max-w-xl mx-auto">Siz uchun xizmat ko'rsatish jarayoni maksimal darajada sodda va tushunarli qilib tuzilgan.</p>
               </div>
            </ScrollReveal>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 relative z-10">
               {STEPS.map((step, i) => (
                  <ScrollReveal key={i} direction="up" delay={i * 0.1}>
                     <div className="relative group">
                        {i < STEPS.length - 1 && (
                           <ChevronRight className="absolute top-8 -right-6 w-6 h-6 text-white/5 hidden lg:block group-hover:text-primary transition-colors" />
                        )}
                        <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-8 group-hover:bg-primary group-hover:text-white transition-all duration-500">
                           <step.icon className="w-6 h-6" />
                        </div>
                        <h4 className="text-xl font-bold mb-4 tracking-tight">{step.title}</h4>
                        <p className="text-sm text-white/30 font-light leading-relaxed">{step.desc}</p>
                     </div>
                  </ScrollReveal>
               ))}
            </div>
         </div>
      </section>

      {/* Feature Section with Image */}
      <section className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center mb-48">
        <ScrollReveal direction="left">
           <div className="relative group">
              <div className="aspect-square rounded-[64px] overflow-hidden border border-white/10 shadow-2xl relative z-10 bg-[#111]">
                 <img 
                   src="/images/assets/driver_service.jpg" 
                   className="w-full h-full object-cover scale-110 group-hover:scale-100 transition-transform duration-[2s] ease-out" 
                   alt="Driver service" 
                 />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              </div>
              
              {/* Floating Profile Info */}
              <div className="absolute -bottom-10 -right-10 p-8 glass bg-black/40 border border-white/10 rounded-[32px] shadow-2xl z-20 backdrop-blur-2xl max-w-xs scale-90 md:scale-100">
                 <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                       <UserCheck className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                       <p className="text-xs font-bold text-white uppercase tracking-widest">Sertifikatlangan</p>
                       <p className="text-[10px] text-white/40">Professional Haydovchi</p>
                    </div>
                 </div>
                 <p className="text-[11px] text-white/60 leading-relaxed italic">
                    "Mening maqsadim — sizning safaringizning har bir daqiqasini xavfsiz va qulay qilish."
                 </p>
              </div>
           </div>
        </ScrollReveal>

        <div className="space-y-12">
          <ScrollReveal direction="right">
            <div className="text-[11px] text-primary font-black uppercase tracking-[0.4em] mb-6">— VIP Transfer Xizmati</div>
            <h2 className="font-display text-5xl md:text-7xl font-extrabold tracking-tighter leading-tight">
              Kutib olish va <br /><span className="text-white/20 italic">Kuzatib qo'yish</span>
            </h2>
            <p className="text-white/40 text-lg font-light leading-relaxed">
              Bizning haydovchilarimiz Toshkent xalqaro aeroportida kutib olish, mehmonxonalarga transfer va shaharlararo biznes sayohatlarni amalga oshiradilar.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6">
               {[
                  { icon: Briefcase, text: "Biznes Uchrashuvlar" },
                  { icon: Car, text: "Aeroport Transfer" },
                  { icon: MapPin, text: "Shahar bo'ylab sayohat" },
                  { icon: Crown, text: "Maxsus Tadbirlar" }
               ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-primary/20 transition-all">
                     <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                        <item.icon className="w-4 h-4 text-primary" />
                     </div>
                     <span className="text-xs font-bold text-white/50 tracking-widest uppercase">{item.text}</span>
                  </div>
               ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto">
        <ScrollReveal direction="scale">
           <div className="p-12 md:p-24 rounded-[64px] bg-gradient-to-br from-white/[0.03] to-transparent border border-white/10 flex flex-col md:flex-row items-center justify-between gap-16 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 blur-[120px] pointer-events-none rounded-full" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/5 blur-[100px] pointer-events-none rounded-full" />
              
              <div className="max-w-2xl text-center md:text-left relative z-10">
                 <h2 className="font-display text-4xl md:text-6xl font-extrabold mb-8 tracking-tighter">O'z safaringizni <br /><span className="text-primary italic">rejalarishtiring</span></h2>
                 <p className="text-white/40 text-lg font-light leading-relaxed mb-12">
                    Xizmat narxi tanlangan avtomobil, masofa va vaqtga qarab kelishuv asosida belgilanadi. 
                    Barcha haydovchilarimiz xalqaro standartlarga javob beradi.
                 </p>
                 <div className="flex flex-wrap gap-6 justify-center md:justify-start">
                    <a href="https://t.me/ridelux" className="px-12 h-16 rounded-[20px] bg-primary text-white text-xs font-black uppercase tracking-widest flex items-center gap-3 shadow-2xl shadow-primary/20 hover:scale-105 transition-transform">
                       <MessageCircle className="w-5 h-5" />
                       Telegram orqali
                    </a>
                    <a href="tel:+998901234567" className="px-12 h-16 rounded-[20px] bg-white text-black text-xs font-black uppercase tracking-widest flex items-center gap-3 shadow-2xl shadow-white/10 hover:scale-105 transition-transform">
                       <Phone className="w-5 h-5" />
                       Qo'ng'iroq qilish
                    </a>
                 </div>
              </div>

              <div className="grid grid-cols-1 gap-4 w-full md:w-80 relative z-10">
                  <div className="p-10 bg-white/5 backdrop-blur-3xl rounded-[32px] border border-white/10 text-center group hover:bg-primary/10 transition-all">
                     <p className="text-[10px] text-white/30 uppercase tracking-[0.2em] mb-4 font-bold">Shahar ichida</p>
                     <p className="text-lg font-display text-primary font-black uppercase tracking-widest">Kelishuv asosida</p>
                  </div>
                  <div className="p-10 bg-white/5 backdrop-blur-3xl rounded-[32px] border border-white/10 text-center group hover:bg-primary/10 transition-all">
                     <p className="text-[10px] text-white/30 uppercase tracking-[0.2em] mb-4 font-bold">Viloyatlarga</p>
                     <p className="text-lg font-display text-primary font-black uppercase tracking-widest">Kelishuv asosida</p>
                  </div>
              </div>
           </div>
        </ScrollReveal>
      </section>

    </div>
  );
};

// New icon for events
const Crown = ({ className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14" />
  </svg>
)

export default Chauffeur;
