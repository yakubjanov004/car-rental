import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, ChevronDown, FileText, Info, MessageCircle, ArrowRight } from 'lucide-react';
import ScrollReveal from '../components/ScrollReveal';

const SAVOLLAR = [
  {
    savol: "Avtomobil ijarasi uchun qanday hujjatlar talab qilinadi?",
    javob: "O'zbekiston fuqarolari uchun: Pasport (yoki ID-karta) va Haydovchilik guvohnomasi. Xorijiy fuqarolar uchun: Xorijiy pasport va xalqaro haydovchilik guvohnomasi talab etiladi."
  },
  {
    savol: "Ijara uchun yosh va tajriba cheklovlari bormi?",
    javob: "Ha, haydovchi kamida 24 yoshda bo'lishi va kamida 4 yillik haydovchilik tajribasiga ega bo'lishi kerak. Bu xavfsizlik chorasidir."
  },
  {
    savol: "Zalog (depozit) miqdori qancha va u qachon qaytariladi?",
    javob: "Depozit miqdori modelga qarab 1 mln so'mdan 5 mln so'mgacha o'zgaradi. Mashina shikastlarsiz va jarimalarsiz qaytarilgandan so'ng, depozit to'liq qaytariladi."
  },
  {
    savol: "Kunlik yurish masofasi (limit) bormi?",
    javob: "Standart ijara shartlariga ko'ra, kunlik limit 300 km ni tashkil etadi. Agar siz uzoq masofali sayohatni rejalashtirgan bo'lsangiz, bizning maxsus 'unlimited' paketimizni tanlashingiz mumkin."
  },
  {
    savol: "Aeroportga yetkazib berish xizmati bormi?",
    javob: "Albatta! Biz mashinani Toshkent xalqaro aeroportiga yoki istalgan manzilga 24/7 yetkazib bera olamiz. Ushbu xizmat uchun qo'shimcha to'lov olinadi."
  },
];

const FAQ = () => {
  return (
    <div className="bg-[#0A0A0A] min-h-screen pt-32 pb-32 px-6 overflow-hidden">
      
      {/* Header */}
      <section className="max-w-4xl mx-auto mb-24 relative text-center">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[400px] bg-primary/[0.05] blur-[100px] rounded-full pointer-events-none" />
        
        <ScrollReveal direction="up">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-[10px] font-bold text-white/50 uppercase tracking-widest mb-8">
            <HelpCircle className="w-3.5 h-3.5" />
            Yordam Markazi
          </div>
          <h1 className="font-display text-5xl md:text-7xl font-extrabold tracking-tighter mb-8 leading-none">
            Ko'p Beriladigan <br /><span className="text-white/40 italic">Savollar</span>
          </h1>
          <p className="max-w-2xl mx-auto text-white/40 text-lg md:text-xl font-light leading-relaxed">
            Bizning xizmatlarimiz haqida eng ko'p so'raladigan savollarga javoblarni shu yerdan topishingiz mumkin.
          </p>
        </ScrollReveal>
      </section>

      {/* Accordion / FAQ List */}
      <div className="max-w-3xl mx-auto space-y-4">
        {SAVOLLAR.map((item, i) => (
          <ScrollReveal key={i} direction="up" delay={i * 0.1}>
             <details className="group glass border-white/5 overflow-hidden transition-all duration-500 open:border-primary/20">
                <summary className="flex items-center justify-between p-7 cursor-pointer list-none select-none">
                   <div className="flex items-center gap-5">
                      <span className="text-xs font-bold text-white/20 font-display">0{i+1}</span>
                      <h3 className="text-lg font-bold group-hover:text-primary transition-colors pr-8 leading-tight">
                         {item.savol}
                      </h3>
                   </div>
                   <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center shrink-0 group-open:rotate-180 transition-transform duration-500">
                      <ChevronDown className="w-4 h-4 text-white/40" />
                   </div>
                </summary>
                <div className="px-14 pb-8 -mt-2">
                   <p className="text-white/40 text-sm leading-relaxed font-light">
                      {item.javob}
                   </p>
                </div>
             </details>
          </ScrollReveal>
        ))}
      </div>

      {/* Help Panel */}
      <section className="max-w-3xl mx-auto mt-24">
         <ScrollReveal direction="scale">
            <div className="p-10 rounded-[40px] bg-white/[0.02] border border-white/5 flex flex-col md:flex-row items-center gap-10 text-center md:text-left">
               <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <MessageCircle className="w-8 h-8 text-primary shadow-xl shadow-primary/20" />
               </div>
               <div className="flex-1">
                  <h4 className="font-bold text-xl mb-2">Hali ham savollaringiz bormi?</h4>
                  <p className="text-white/30 text-sm font-light">Mutaxassislarimiz har doim javob berishga tayyor.</p>
               </div>
               <a href="/contact" className="btn-primary px-8 py-4 text-[10px] font-bold uppercase tracking-widest inline-flex items-center gap-2">
                  Biz bilan bog'lanish
                  <ArrowRight className="w-4 h-4" />
               </a>
            </div>
         </ScrollReveal>
      </section>

    </div>
  );
};

export default FAQ;
