import React from 'react';
import { motion } from 'framer-motion';
import { HelpCircle, ChevronDown, FileText, Info } from 'lucide-react';
import ScrollReveal from '../components/ScrollReveal';

const SAVOLLAR = [
  {
    savol: "Mashinani ijaraga olish uchun qanday hujjatlar kerak?",
    javob: "O'zbekiston fuqarolari uchun: Pasport (ID karta) va Haydovchilik guvohnomasi. Chet el fuqarolari uchun: Xorijiy pasport va xalqaro haydovchilik guvohnomasi talab qilinadi."
  },
  {
    savol: "Ijara uchun yosh va staj bo'yicha cheklovlar bormi?",
    javob: "Ha, haydovchining yoshi kamida 24 yosh, haydovchilik staji esa kamida 4 yil bo'lishi lozim."
  },
  {
    savol: "Depozit (garov) summasi qancha va u qachon qaytariladi?",
    javob: "Depozit summasi mashina modeliga qarab 1 000 000 so'mdan 5 000 000 so'mgacha bo'lishi mumkin. Mashina shikastlarsiz va jarimalarsiz qaytarilgandan so'ng, depozit darhol yoki 3 kun ichida (jarimalarni tekshirish uchun) qaytariladi."
  },
  {
    savol: "Kunlik masofa (probeg) limiti bormi?",
    javob: "Standart ijara shartlariga ko'ra, kunlik limit 300 km ni tashkil etadi. Limitdan oshgan har bir kilometr uchun qo'shimcha to'lov hisoblanadi."
  },
  {
    savol: "Mashinani aeroportga yetkazib berish xizmati bormi?",
    javob: "Albatta! Biz mashinani Toshkent xalqaro aeroportiga yoki siz ko'rsatgan manzilga yetkazib berishimiz mumkin. Bu xizmat uchun qo'shimcha to'lov olinadi."
  },
  {
    savol: "Sug'urta masalasi qanday hal qilingan?",
    javob: "Barcha mashinalarimiz majburiy sug'urta (OSAGO) qilingan. Ixtiyoriy ravishda VIP sug'urta paketini ham tanlashingiz mumkin."
  }
];

const Savollar = () => {
  return (
    <div className="pt-32 pb-20">
      <div className="container mx-auto px-6 max-w-4xl">
        <div className="text-center mb-16">
          <ScrollReveal direction="up">
            <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tighter">
               KO'P SO'RALADIGAN <span className="text-primary italic">SAVOLLAR</span>
            </h1>
            <p className="text-white/50 text-lg">
               Ijara jarayoni, to'lovlar va shartlar haqida barcha kerakli ma'lumotlar.
            </p>
          </ScrollReveal>
        </div>

        <div className="space-y-4">
          {SAVOLLAR.map((item, index) => (
            <ScrollReveal key={index} direction="up" delay={index * 0.1}>
              <details className="group glass-panel overflow-hidden border-white/5">
                <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary font-bold">
                        {index + 1}
                      </div>
                      <h3 className="text-lg font-bold group-hover:text-primary transition-colors">
                        {item.savol}
                      </h3>
                   </div>
                   <ChevronDown className="w-5 h-5 text-white/30 group-open:rotate-180 transition-transform duration-300" />
                </summary>
                <div className="px-6 pb-6 pt-2">
                   <p className="text-white/60 leading-relaxed pl-14">
                     {item.javob}
                   </p>
                </div>
              </details>
            </ScrollReveal>
          ))}
        </div>

        <div className="mt-20 p-8 glass-panel border-primary/20 bg-primary/5 flex flex-col md:flex-row items-center gap-8">
            <div className="p-4 bg-primary/20 rounded-2xl">
                <HelpCircle className="w-12 h-12 text-primary" />
            </div>
            <div className="flex-1 text-center md:text-left">
                <h3 className="text-2xl font-bold mb-2">Yana savollaringiz bormi?</h3>
                <p className="text-white/60 mb-4">Mutaxassislarimiz har doim yordamga tayyor.</p>
            </div>
            <div className="flex gap-4">
                <button className="btn-primary px-8">Bog'lanish</button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Savollar;
