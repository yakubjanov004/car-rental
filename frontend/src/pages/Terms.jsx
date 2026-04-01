import React from 'react';
import { motion } from 'framer-motion';
import { Shield, FileWarning, Clock, MapPin, Search, Plane, Building, FileText, UserPlus, Milestone, ArrowRight, Gavel } from 'lucide-react';
import ScrollReveal from '../components/ScrollReveal';

const SHARTLAR = [
  {
    icon: UserPlus,
    title: "Yosh va Tajriba",
    items: [
      "Haydovchi kamida 24 yoshda bo'lishi kerak.",
      "Haydovchilik guvohnomasi kamida 4 yillik bo'lishi shart.",
      "Passport yoki ID-karta nusxasi talab etiladi."
    ]
  },
  {
    icon: Shield,
    title: "Sug'urta va Depozit",
    items: [
      "Zalog (Depozit): 1 000 000 so'mdan 5 000 000 so'mgacha.",
      "Sug'urta: OSAGO (majburiy) va ixtiyoriy VIP paketlar.",
      "Zarar yetkazilganda, depozit xarajatlar uchun ishlatilishi mumkin."
    ]
  },
  {
    icon: Milestone,
    title: "Masofa va Yoqilg'i",
    items: [
      "Limit: Kuniga o'rtacha 300 kilometr.",
      "Limitdan oshgan har bir kilometr uchun qo'shimcha to'lov.",
      "Yoqilg'i: Mashina to'liq bak bilan qaytarilishi kerak."
    ]
  },
  {
    icon: Clock,
    title: "Ijara Muddati",
    items: [
        "Minimal ijara vaqti: 24 soat (bir kun).",
        "Kech qaytarish: Har bir soat uchun qo'shimcha to'lov.",
        "Muddati uzaytirish kamida 6 soat oldin xabar berilishi shart."
    ]
  }
];

const Terms = () => {
  return (
    <div className="bg-[#0A0A0A] min-h-screen pt-32 pb-32 px-6 overflow-hidden">
      
      {/* Hero */}
      <section className="max-w-7xl mx-auto mb-24 relative text-center">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[400px] bg-primary/[0.05] blur-[120px] rounded-full pointer-events-none" />
        
        <ScrollReveal direction="up">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-[10px] font-bold text-white/50 uppercase tracking-widest mb-8">
            <Gavel className="w-3.5 h-3.5" />
            Shaffof va aniq qoidalar
          </div>
          <h1 className="font-display text-5xl md:text-8xl font-extrabold tracking-tighter mb-8 leading-none">
            Ijara <span className="text-white/40 italic">Shartlari</span>
          </h1>
          <p className="max-w-2xl mx-auto text-white/40 text-lg md:text-xl font-light leading-relaxed">
            Bizning barcha shartlarimiz qonun doirasida va mijozlarimiz foydasi uchun tuzilgan. 
            Iltimos, ijara shartnomasi bilan diqqat bilan tanishib chiqing.
          </p>
        </ScrollReveal>
      </section>

      {/* Grid */}
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-6 mb-32">
        {SHARTLAR.map((item, i) => (
          <ScrollReveal key={i} direction="up" delay={i * 0.1}>
            <div className="glass p-10 h-full border-white/10 hover:border-primary/20 transition-all group">
               <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                  <item.icon className="w-6 h-6 text-primary" />
               </div>
               <h3 className="text-2xl font-bold mb-6 tracking-tight">{item.title}</h3>
               <ul className="space-y-4">
                  {item.items.map((li, idx) => (
                    <li key={idx} className="flex gap-4 text-sm text-white/40 font-medium leading-relaxed">
                       <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                       {li}
                    </li>
                  ))}
               </ul>
            </div>
          </ScrollReveal>
        ))}
      </div>

      {/* CTA Box */}
      <section className="max-w-7xl mx-auto">
        <ScrollReveal direction="scale">
           <div className="p-12 md:p-20 rounded-[48px] bg-white/[0.02] border border-white/5 flex flex-col md:flex-row items-center justify-between gap-12 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] pointer-events-none" />
              <div className="max-w-2xl">
                 <h2 className="font-display text-3xl md:text-4xl font-extrabold mb-6 tracking-tight">Savollaringiz bormi?</h2>
                 <p className="text-white/40 text-lg font-light leading-relaxed mb-10">
                    Agar biror bir band tushunarsiz bo'lsa yoki qo'shimcha ma'lumot kerak bo'lsa, mutaxassislarimiz bilan bog'lanishingiz mumkin.
                 </p>
                 <a href="/contact" className="btn-primary px-10 py-5 text-xs font-bold uppercase tracking-widest inline-flex items-center gap-2">
                    Biz bilan bog'lanish
                    <ArrowRight className="w-4 h-4" />
                 </a>
              </div>
              <div className="p-10 bg-[#111] rounded-[40px] border border-white/10 flex flex-col items-center text-center">
                 <FileWarning className="w-16 h-16 text-yellow-500 mb-6 animate-pulse" />
                 <h4 className="font-bold mb-2">Huquqiy Kuch</h4>
                 <p className="text-[10px] text-white/30 uppercase tracking-widest leading-loose">Har bir ijara rasmiy shartnoma <br /> asosida amalga oshiriladi.</p>
              </div>
           </div>
        </ScrollReveal>
      </section>

    </div>
  );
};

export default Terms;
