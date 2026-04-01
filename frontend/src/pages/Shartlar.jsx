import React from 'react';
import { motion } from 'framer-motion';
import { Shield, FileWarning, Clock, MapPin, Search, Plane, Building, FileText, UserPlus, Milestone } from 'lucide-react';
import ScrollReveal from '../components/ScrollReveal';

const SHARTLAR = [
  {
    icon: <UserPlus className="w-8 h-8 text-primary" />,
    title: "Yosh va staj talablari",
    items: [
      "Haydovchining yoshi 24 yoshdan yuqori bo'lishi.",
      "Haydovchilik guvohnomasi kamida 4 yillik muddatda bo'lishi.",
      "Pasport yoki ID-karta nusxasi talab qilinadi."
    ]
  },
  {
    icon: <Shield className="w-8 h-8 text-primary" />,
    title: "Sug'urta va Depozit",
    items: [
      "Depozit: 1 000 000 so'mdan 5 000 000 so'mgacha (modelga qarab).",
      "Sug'urta: OSAGO (majburiy) va ixtiyoriy VIP paketlar.",
      "Shikast yetkazilganda depozit harajatga sarflanishi mumkin."
    ]
  },
  {
    icon: <Milestone className="w-8 h-8 text-primary" />,
    title: "Masofa va Yoqilg'i",
    items: [
      "Limit: Kuniga o'rtacha 300 kilometr.",
      "Limitdan oshgan har kilometr uchun 2 000 so'mdan qo'shimcha to'lov.",
      "Yoqilg'i: Mashina qaysi miqdorda yoqilg'i bilan berilsa, shuncha miqdorda qaytarilishi kerak."
    ]
  },
  {
    icon: <Clock className="w-8 h-8 text-primary" />,
    title: "Ijara davomiyligi",
    items: [
        "Minimal ijara vaqti: 24 soat.",
        "Kechiktirilganda: Har soat uchun kunlik ijaraning 10% miqdorida jarima qo'shiladi.",
        "Mashinani uzaytirish kamida 6 soat oldin xabar qilinishi kerak."
    ]
  }
];

const Shartlar = () => {
  return (
    <div className="pt-32 pb-20">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
            <ScrollReveal direction="up">
                <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tighter">
                   IJARA <span className="text-primary italic">SHARTLARI</span>
                </h1>
                <p className="text-white/50 text-lg max-w-2xl mx-auto">
                   Bizning shartlarimiz shaffof va oson tushunarli. Mashina ijarasidan oldin barcha qoidalar bilan tanishib chiqing.
                </p>
            </ScrollReveal>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
           {SHARTLAR.map((item, index) => (
             <ScrollReveal key={index} direction="up" delay={index * 0.1}>
                <div className="card-premium p-8 h-full bg-white/5 border border-white/5 hover:border-primary/30 transition-all group">
                    <div className="mb-6 p-4 bg-primary/10 rounded-2xl w-fit group-hover:bg-primary/20 transition-colors">
                        {item.icon}
                    </div>
                    <h3 className="text-2xl font-black mb-6 tracking-tight text-white/90">{item.title}</h3>
                    <ul className="space-y-4">
                        {item.items.map((li, i) => (
                            <li key={i} className="flex items-start gap-3 text-white/60 font-medium">
                                <div className="mt-1.5 w-1.5 h-1.5 bg-primary rounded-full shrink-0" />
                                {li}
                            </li>
                        ))}
                    </ul>
                </div>
             </ScrollReveal>
           ))}
        </div>

        <div className="p-8 md:p-12 glass-panel relative overflow-hidden bg-bg-dark/50 border-white/5 shadow-2xl">
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 blur-[150px] -mr-48 -mt-48 rounded-full" />
            <div className="flex flex-col md:flex-row items-center justify-between gap-10 relative">
                <div className="text-center md:text-left">
                    <h3 className="text-3xl font-black mb-4 tracking-tighter">Huquqiy masalalar</h3>
                    <p className="text-white/50 mb-6 text-lg font-medium leading-relaxed max-w-2xl">
                       Barcha mashinalarimiz litsenziyaga ega va vaqti-vaqti bilan texnik ko'rikdan o'tib turadi. 
                       Ijara shartnomasi qog'oz va elektron ko'rinishda taqdim etiladi.
                    </p>
                    <button className="btn-primary px-10 py-5 text-lg font-bold rounded-2xl shadow-xl shadow-primary/20">
                       <FileText className="w-5 h-5" />
                       Yuklab olish (Shartnoma namunasi)
                    </button>
                </div>
                <div className="p-10 bg-white/5 rounded-[40px] border border-white/5 flex flex-col items-center justify-center">
                    <FileWarning className="w-16 h-16 text-yellow-500 mb-4 animate-pulse" />
                    <p className="text-sm text-white/40 uppercase font-black tracking-widest mb-1 text-center">Diqqat!</p>
                    <p className="text-white/60 text-center font-medium max-w-xs">
                        Jarimalar va huquqbuzarliklar bo'yicha harajatlar haydovchi tomonidan qoplanadi.
                    </p>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Shartlar;
