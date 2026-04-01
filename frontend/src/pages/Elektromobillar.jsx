import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Zap, ShieldCheck, BatteryCharging, Leaf, TrendingDown, DollarSign } from 'lucide-react';
import apiClient, { BASE_ORIGIN } from '../services/api/apiClient';
import CarCard from '../components/CarCard';
import ScrollReveal from '../components/ScrollReveal';

const ELEKTR_AFZALLIKLARI = [
  { 
    title: "Tejamkor yoqilgi", 
    desc: "1 km uchun ~200 so'm vs benzinli ~700 so'm",
    tejash: "72%",
    icon: <DollarSign className="w-8 h-8 text-emerald-400" />
  },
  { 
    title: "Past texnik xizmat", 
    desc: "Motor moyi yo'q, kamroq harakatlanuvchi qismlar",
    tejash: "60%",
    icon: <BatteryCharging className="w-8 h-8 text-blue-400" />
  },
  { 
    title: "Eco Friendly", 
    desc: "0 gramm CO₂ chiqarilishi, tabiatga zarar yetkazilmaydi",
    tejash: "100%",
    icon: <Leaf className="w-8 h-8 text-green-400" />
  },
];

const Elektromobillar = () => {
  const [mashinalar, setMashinalar] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // API data fetch for EVs
    apiClient.get('/cars/?fuel_type=elektro').then(res => {
      const mapped = res.data.results.map(car => ({
        id: car.id,
        brend: car.brand,
        model: car.model,
        yil: car.year,
        uzatma: car.transmission,
        yoqilgi: car.fuel_type,
        orinlar: car.seats,
        kunlik_narx: parseInt(car.daily_price),
        rasm: car.main_image 
          ? (car.main_image.startsWith('http') ? car.main_image : `${BASE_ORIGIN}${car.main_image}`)
          : "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800",
        reyting: car.rating,
        sharhlar_soni: car.review_count,
        elektr: true
      }));
      setMashinalar(mapped);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  return (
    <div className="pt-32 pb-20">
      <div className="container mx-auto px-6">
        {/* Hero Section */}
        <div className="text-center mb-20 relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/20 blur-[120px] rounded-full -z-10" />
            <ScrollReveal direction="up">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-sm font-bold mb-6">
                    <Zap className="w-4 h-4 fill-emerald-400" />
                    Kelajak energiyasi — O'zbekiston trendi 2025
                </div>
                <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tighter">
                   ELEKTRO<span className="text-primary italic">MOBILLAR</span>
                </h1>
                <p className="text-xl text-white/50 max-w-2xl mx-auto font-medium">
                   O'zbekistonda eng ommabop elektromobillar va gibridlar ijarasi. 
                   Tejamkorlik, qulaylik va yuqori texnologiyalar.
                </p>
            </ScrollReveal>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-32">
          {ELEKTR_AFZALLIKLARI.map((item, index) => (
            <ScrollReveal key={index} direction="up" delay={index * 0.1}>
              <div className="card-premium p-8 h-full flex flex-col items-center text-center group">
                <div className="p-4 bg-white/5 rounded-3xl mb-6 group-hover:bg-white/10 transition-colors">
                  {item.icon}
                </div>
                <h3 className="text-2xl font-bold mb-3">{item.title}</h3>
                <p className="text-white/50 mb-6 font-medium leading-relaxed">{item.desc}</p>
                <div className="mt-auto">
                    <span className="text-4xl font-black text-emerald-400">{item.tejash}</span>
                    <span className="text-xs text-white/30 block tracking-widest uppercase mt-1">Tejamkorlik</span>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* Calculator/Comparison Section */}
        <ScrollReveal direction="scale" className="mb-32">
            <div className="glass-panel p-10 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] rounded-full" />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div>
                        <h2 className="text-3xl font-black mb-6 tracking-tight">Qancha tejab qolasiz?</h2>
                        <p className="text-white/60 mb-8 text-lg">
                            Benzinli mashinaga qaraganda elektromobil ijarasi uzoq masofalarda sezilarli darajada arzonga tushadi. 
                            Yoqilg'i harajatlarini deyarli 4 barobarga qisqartiring.
                        </p>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/5">
                                <span className="text-white/60">Benzin (100 km uchun)</span>
                                <span className="font-bold text-red-400">~80 000 so'm</span>
                            </div>
                            <div className="flex justify-between items-center p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                                <span className="text-white/60">Elektr (100 km uchun)</span>
                                <span className="font-bold text-emerald-400">~15 000 so'm</span>
                            </div>
                        </div>
                    </div>
                    <div className="bg-bg-dark/50 p-8 rounded-3xl border border-white/5 flex items-center justify-center">
                        <div className="text-center">
                            <Zap className="w-16 h-16 text-emerald-400 mx-auto mb-4 animate-pulse" />
                            <p className="text-sm text-white/40 uppercase font-black tracking-widest mb-2">Sizning afzalligingiz</p>
                            <p className="text-6xl font-black text-emerald-400 tracking-tighter">65 000</p>
                            <p className="text-sm text-white/50 font-bold mt-1">Har 100 kilometrda tejash</p>
                        </div>
                    </div>
                </div>
            </div>
        </ScrollReveal>

        {/* Fleet Section */}
        <div>
          <ScrollReveal direction="up" className="mb-12">
            <h2 className="text-4xl font-black tracking-tight flex items-center gap-4">
               <Zap className="w-10 h-10 text-emerald-400" />
               ELEKTR KATALOGI
            </h2>
            <div className="h-1 w-24 bg-emerald-500 mt-4 rounded-full" />
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {mashinalar.map((car, index) => (
              <CarCard key={car.id} car={car} index={index} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Elektromobillar;
