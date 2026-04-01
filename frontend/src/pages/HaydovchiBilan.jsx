import React from 'react';
import { motion } from 'framer-motion';
import { UserCheck, Star, Shield, Clock, Coffee, MapPin, Briefcase, Car } from 'lucide-react';
import ScrollReveal from '../components/ScrollReveal';

const AFZALLIKLAR = [
  {
    icon: <UserCheck className="w-8 h-8 text-primary" />,
    title: "Professional haydovchilar",
    desc: "Kamida 10 yillik tajribaga ega va odobli haydovchilar jamoasi."
  },
  {
    icon: <Clock className="w-8 h-8 text-primary" />,
    title: "Vaqtni tejash",
    desc: "Yo'l harakati va parkovkalar haqida qayg'urmasdan o'z ishingiz bilan mashg'ul bo'ling."
  },
  {
    icon: <Shield className="w-8 h-8 text-primary" />,
    title: "Xavfsizlik",
    desc: "Yo'ldagi to'liq javobgarlik haydovchi zimmasida bo'ladi."
  },
  {
    icon: <Coffee className="w-8 h-8 text-primary" />,
    title: "Maksimal qulaylik",
    desc: "Mehmonlarni kutib olish yoki uzoq masofali safarlar uchun ideal tanlov."
  }
];

const HaydovchiBilan = () => {
  return (
    <div className="pt-32 pb-20">
      <div className="container mx-auto px-6">
        <div className="text-center mb-20 relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/20 blur-[120px] rounded-full -z-10" />
            <ScrollReveal direction="up">
                <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tighter">
                   HAYDOVCHI BILAN <span className="text-primary italic">IJARA</span>
                </h1>
                <p className="text-xl text-white/50 max-w-2xl mx-auto font-medium">
                   Premium xizmat: haydovchi bilan birga mashina ijarasi. Biznes uchrashuvlar, transferlar va VIP mehmonlar uchun.
                </p>
            </ScrollReveal>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-32">
          {AFZALLIKLAR.map((item, index) => (
            <ScrollReveal key={index} direction="up" delay={index * 0.1}>
              <div className="card-premium p-8 h-full flex flex-col items-center text-center group">
                <div className="p-4 bg-white/5 rounded-3xl mb-6 group-hover:bg-primary/20 group-hover:text-primary transition-all">
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                <p className="text-white/50 font-medium leading-relaxed">{item.desc}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-32">
            <ScrollReveal direction="left">
                <div className="relative">
                    <img 
                        src="https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800" 
                        alt="Haydovchi" 
                        className="rounded-[40px] shadow-2xl border border-white/5" 
                    />
                    <div className="absolute -bottom-8 -right-8 p-8 glass-panel bg-primary/10 border-primary/20 shadow-2xl animate-bounce">
                        <Star className="w-10 h-10 text-primary fill-primary" />
                    </div>
                </div>
            </ScrollReveal>
            <ScrollReveal direction="right">
                <h2 className="text-4xl font-black mb-6 tracking-tight">VIP TRANSFER XIZMATI</h2>
                <div className="h-1 w-20 bg-primary mb-8 rounded-full" />
                <p className="text-white/60 mb-8 text-lg font-medium leading-relaxed">
                   Toshkent xalqaro aeroportidan mehmonlarni kutib olish va mehmonxonaga kuzatish, shuningdek, shaharlararo biznes safarlar uchun haydovchilarimiz xizmat ko'rsatishadi.
                </p>
                <div className="space-y-6 mb-10">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center">
                            <Briefcase className="w-6 h-6 text-primary" />
                        </div>
                        <span className="text-lg font-bold text-white/80">Biznes uchrashuvlar uchun</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center">
                            <Car className="w-6 h-6 text-primary" />
                        </div>
                        <span className="text-lg font-bold text-white/80">Aeroportdan kutib olish</span>
                    </div>
                </div>
                <button className="btn-primary px-10 py-5 text-xl font-black rounded-2xl shadow-xl shadow-primary/20">
                   Hoziroq Buyurtma Berish
                </button>
            </ScrollReveal>
        </div>

        <div className="glass-panel p-12 text-center relative overflow-hidden bg-white/5 border-white/5">
            <div className="absolute top-0 left-0 w-64 h-64 bg-primary/10 blur-[100px] -ml-32 -mt-32 rounded-full" />
            <ScrollReveal direction="scale">
                <h3 className="text-3xl font-black mb-4">Maxsus Narxlar</h3>
                <p className="text-white/50 mb-8 text-lg font-medium">Haydovchi bilan ijara narxi tanlangan mashina va vaqtga qarab alohida hisoblanadi.</p>
                <div className="flex flex-wrap justify-center gap-4">
                    <div className="px-6 py-4 bg-white/5 rounded-2xl border border-white/5 flex flex-col items-center">
                        <span className="text-xs text-white/40 uppercase font-black tracking-widest mb-1">Toshkent ichida</span>
                        <span className="text-2xl font-bold text-primary">Kelishiladi</span>
                    </div>
                    <div className="px-6 py-4 bg-white/5 rounded-2xl border border-white/5 flex flex-col items-center">
                        <span className="text-xs text-white/40 uppercase font-black tracking-widest mb-1">Shaharlararo</span>
                        <span className="text-2xl font-bold text-primary">Kelishiladi</span>
                    </div>
                </div>
            </ScrollReveal>
        </div>
      </div>
    </div>
  );
};

export default HaydovchiBilan;
