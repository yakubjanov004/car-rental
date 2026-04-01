import React from 'react';
import { motion } from 'framer-motion';
import { UserCheck, Star, Shield, Clock, Coffee, MapPin, Briefcase, Car, ArrowRight, Sparkles } from 'lucide-react';
import ScrollReveal from '../components/ScrollReveal';

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

const Chauffeur = () => {
  return (
    <div className="bg-[#0A0A0A] min-h-screen pt-32 pb-32 px-6 overflow-hidden">
      
      {/* Hero */}
      <section className="max-w-4xl mx-auto mb-24 relative text-center">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[400px] bg-primary/[0.05] blur-[100px] rounded-full pointer-events-none" />
        
        <ScrollReveal direction="up">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-[10px] font-bold text-white/50 uppercase tracking-widest mb-8">
            <Sparkles className="w-3.5 h-3.5" />
            Eksklyuziv Xizmat
          </div>
          <h1 className="font-display text-5xl md:text-8xl font-extrabold tracking-tighter mb-8 leading-none">
            Haydovchi <br /><span className="text-white/40 italic">Bilan</span>
          </h1>
          <p className="max-w-2xl mx-auto text-white/40 text-lg md:text-xl font-light leading-relaxed">
            Biznes uchrashuvlar, maxsus tadbirlar yoki transferlar uchun. 
            Dam oling va rulni bizga topshiring.
          </p>
        </ScrollReveal>
      </section>

      {/* Benefits Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-32">
        {AFZALLIKLAR.map((item, i) => (
          <ScrollReveal key={i} direction="up" delay={i * 0.1}>
            <div className="card p-10 flex flex-col items-center text-center group hover:border-primary/20">
               <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                  <item.icon className="w-6 h-6 text-primary" />
               </div>
               <h3 className="text-xl font-bold mb-4 tracking-tight">{item.title}</h3>
               <p className="text-xs text-white/40 leading-relaxed font-light">{item.desc}</p>
            </div>
          </ScrollReveal>
        ))}
      </div>

      {/* Feature Section */}
      <section className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center mb-32">
        <ScrollReveal direction="left">
           <div className="relative">
              <div className="aspect-video md:aspect-[4/3] rounded-[48px] overflow-hidden border border-white/10 shadow-2xl relative z-10 bg-[#111]">
                 <img 
                   src="https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=1000&q=80" 
                   className="w-full h-full object-cover scale-110 hover:scale-100 transition-transform duration-1000" 
                   alt="Driver service" 
                 />
              </div>
              <div className="absolute -bottom-8 -right-8 p-10 glass bg-primary/10 border-primary/20 shadow-2xl z-20 hidden md:block">
                 <Star className="w-10 h-10 text-primary fill-primary animate-pulse" />
              </div>
           </div>
        </ScrollReveal>

        <div className="space-y-10">
          <ScrollReveal direction="right">
            <div className="text-[11px] text-primary font-bold uppercase tracking-widest">— VIP Transfer</div>
            <h2 className="font-display text-4xl md:text-5xl font-extrabold tracking-tight">Kutib olish va <span className="text-white/40">Kuzatib qo'yish</span></h2>
            <p className="text-white/50 text-lg font-light leading-relaxed">
              Bizning haydovchilarimiz Toshkent xalqaro aeroportida kutib olish, mehmonxonalarga transfer va shaharlararo biznes sayohatlarni amalga oshiradilar.
            </p>
            <div className="space-y-4 pt-6">
               <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                     <Briefcase className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-sm font-bold text-white/70 tracking-wide uppercase">Biznes Uchrashuvlar</span>
               </div>
               <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                     <Car className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-sm font-bold text-white/70 tracking-wide uppercase">Aeroportdan kutib olish</span>
               </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto">
        <ScrollReveal direction="scale">
           <div className="p-12 md:p-20 rounded-[48px] bg-white/[0.02] border border-white/5 flex flex-col md:flex-row items-center justify-between gap-12 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] pointer-events-none" />
              <div className="max-w-2xl text-center md:text-left">
                 <h2 className="font-display text-3xl md:text-4xl font-extrabold mb-6 tracking-tight">Xizmatni band qilish</h2>
                 <p className="text-white/40 text-lg font-light leading-relaxed mb-10">
                    Haydovchi bilan ijara narxi tanlangan mashina va muddatga qarab hisoblanadi. 
                    Barcha mashinalarimiz litsenziyaga ega.
                 </p>
                 <a href="/contact" className="btn-primary px-10 py-5 text-xs font-bold uppercase tracking-widest inline-flex items-center gap-2">
                    Hozir bog'laning
                    <ArrowRight className="w-4 h-4" />
                 </a>
              </div>
              <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
                  <div className="p-8 bg-[#111] rounded-3xl border border-white/10 text-center">
                     <p className="text-[10px] text-white/30 uppercase tracking-widest mb-1">Shahar ichida</p>
                     <p className="font-bold text-primary">Kelishuv asosida</p>
                  </div>
                  <div className="p-8 bg-[#111] rounded-3xl border border-white/10 text-center">
                     <p className="text-[10px] text-white/30 uppercase tracking-widest mb-1">Viloyatlarga</p>
                     <p className="font-bold text-primary">Kelishuv asosida</p>
                  </div>
              </div>
           </div>
        </ScrollReveal>
      </section>

    </div>
  );
};

export default Chauffeur;
