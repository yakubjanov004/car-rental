import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, ChevronRight, CheckCircle2, ShieldCheck, Clock, Navigation } from 'lucide-react';
import { Link } from 'react-router-dom';
import { DEMO_MASHINALAR } from '../data/mashinalar';
import { TOSHKENT_TUMANLARI } from '../data/tumanlar';
import CarCard from '../components/CarCard';
import StatsCounter from '../components/StatsCounter';

const BoshSahifa = () => {
  const [filterTuman, setFilterTuman] = useState('');
  const [filterNarx, setFilterNarx] = useState(1000000);
  
  const mashhurMashinalar = DEMO_MASHINALAR.slice(0, 6);

  return (
    <div className="overflow-x-hidden pt-20">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center pt-8 pb-32">
        {/* Background Image */}
        <div className="absolute top-0 right-0 w-full md:w-3/4 h-full z-0 opacity-40">
           <img 
            src="/images/hero/hero-1.jpg" 
            alt="Hero background" 
            className="w-full h-full object-cover rounded-bl-[150px]"
            onError={(e) => e.target.src = 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=2070'}
           />
           <div className="absolute inset-0 bg-gradient-to-r from-bg-dark via-bg-dark/50 to-transparent"></div>
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl"
          >
            <h1 className="text-6xl md:text-8xl font-black mb-8 leading-[0.9] tracking-tighter uppercase">
              O'zbekistondagi <br />
              <span className="text-primary italic">Eng Ishonchli</span> <br />
              Avtomobil Ijarasi
            </h1>
            <p className="text-xl text-white/60 mb-12 max-w-xl leading-relaxed">
              Toshkent shahri bo'ylab eng yaxshi narxlarda, kafolatli va tezkor avtomobil ijarasi xizmati. Biz bilan sayohat qiling!
            </p>

            {/* Quick Filter */}
            <div className="glass-panel p-4 md:p-6 lg:p-8 flex flex-col md:flex-row gap-6 items-end">
              <div className="w-full md:w-1/3">
                <label className="text-xs text-white/40 uppercase mb-2 block font-bold">Tuman</label>
                <select 
                  className="input-premium py-4"
                  onChange={(e) => setFilterTuman(e.target.value)}
                >
                  <option value="">Barcha tumanlar</option>
                  {TOSHKENT_TUMANLARI.map(t => (
                    <option key={t.id} value={t.id}>{t.nomi}</option>
                  ))}
                </select>
              </div>
              <div className="w-full md:w-1/3">
                <div className="flex justify-between mb-2">
                   <label className="text-xs text-white/40 uppercase font-bold">Maksimal narx</label>
                   <span className="text-xs text-primary font-bold">{filterNarx.toLocaleString()} so'm</span>
                </div>
                <input 
                  type="range" 
                  min="100000" 
                  max="2000000" 
                  step="50000"
                  className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary"
                  value={filterNarx}
                  onChange={(e) => setFilterNarx(e.target.value)}
                />
              </div>
              <div className="w-full md:w-1/3">
                <button className="btn-primary w-full py-4 text-lg font-bold rounded-2xl group">
                  <Search className="w-6 h-6 group-hover:scale-110 transition-transform" />
                  Mashina qidirish
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-primary/5">
        <div className="container mx-auto px-6">
           <div className="grid grid-cols-2 lg:grid-cols-4 gap-12">
              <StatsCounter count={250} suffix="+" label="Mashinalar soni" />
              <StatsCounter count={15000} suffix="+" label="Mijozlarimiz" />
              <StatsCounter count={12} label="Tumanlar bo'yicha" />
              <StatsCounter count={24} suffix="/7" label="Mijoz qo'llab-quvvatlash" />
           </div>
        </div>
      </section>

      {/* Featured Cars */}
      <section className="py-32">
        <div className="container mx-auto px-6">
          <div className="flex justify-between items-end mb-16">
            <div>
              <h2 className="text-4xl md:text-5xl uppercase mb-4 tracking-tighter">Mashhur Mashinalar</h2>
              <div className="w-24 h-1.5 bg-primary"></div>
            </div>
            <Link to="/mashinalar" className="btn-secondary group">
              Barchasini ko'rish
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {mashhurMashinalar.map(car => (
              <CarCard key={car.id} car={car} />
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-32 bg-card-dark rounded-t-[100px] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/5 blur-[120px]"></div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-20">
             <h2 className="text-4xl md:text-5xl uppercase mb-6 tracking-tighter">Nega aynan biz?</h2>
             <p className="text-white/50 text-lg">Mijozlarimizga eng yuqori darajadagi servis va ishonchli avtomobillarni taqdim etamiz.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
             {[
               { icon: <ShieldCheck className="w-10 h-10" />, title: "Kafolatli sug'urta", desc: "Har bir ijara to'liq sug'urta ostida bo'ladi." },
               { icon: <Navigation className="w-10 h-10" />, title: "Tez yetkazish", desc: "Siz aytgan nuqtaga mashinani tezda yetkazamiz." },
               { icon: <Clock className="w-10 h-10" />, title: "24/7 Xizmat", desc: "Har qanday vaziyatda biz bilan bog'lanishingiz mumkin." },
               { icon: <CheckCircle2 className="w-10 h-10" />, title: "Shaffof narxlar", desc: "Hech qanday yashirin to'lovlar va ortiqcha sarf yo'q." },
             ].map((item, i) => (
               <div key={i} className="p-10 bg-white/5 border border-white/5 hover:border-primary/30 transition-all duration-500 rounded-[48px] group">
                  <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mb-8 text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500 transform group-hover:rotate-12">
                    {item.icon}
                  </div>
                  <h3 className="text-2xl font-bold mb-4">{item.title}</h3>
                  <p className="text-white/40 leading-relaxed">{item.desc}</p>
               </div>
             ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32">
        <div className="container mx-auto px-6">
           <div className="relative p-12 md:p-24 bg-primary rounded-[64px] overflow-hidden flex flex-col md:flex-row items-center justify-between text-center md:text-left gap-12">
              <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none">
                 <img src="/images/cars/cobalt.jpg" className="w-full h-full object-contain -rotate-12 translate-x-12 translate-y-12" alt="" />
              </div>
              <div className="relative z-10 max-w-2xl">
                 <h2 className="text-4xl md:text-7xl font-black uppercase mb-8 leading-[0.85] tracking-tighter">
                   Sayohatni <br />
                   Biz bilan boshlang
                 </h2>
                 <p className="text-white/80 text-xl font-medium">Hoziroq avtomobilni band qiling va 10% chegirmaga ega bo'ling!</p>
              </div>
              <div className="relative z-10">
                 <Link to="/mashinalar" className="px-12 py-8 bg-white text-primary rounded-[32px] font-black text-2xl uppercase hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-black/20">
                   Hoziroq band qilish
                 </Link>
              </div>
           </div>
        </div>
      </section>
    </div>
  );
};

export default BoshSahifa;
