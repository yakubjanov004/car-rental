import React from 'react';
import { ShieldCheck, Target, Users, Award, ChevronRight, Zap, Star } from 'lucide-react';
import { SAYT } from '../data/constants';

const BizHaqimizda = () => {
  return (
    <div className="pt-32 pb-32">
      <div className="container mx-auto px-6">
        
        {/* Hero */}
        <section className="flex flex-col lg:flex-row items-center gap-20 mb-32">
           <div className="flex-1 space-y-8">
              <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-[0.85]">
                Biz <span className="text-primary italic">Kimmiiz?</span>
              </h1>
              <p className="text-xl text-white/50 leading-relaxed max-w-xl">
                 Biz O'zbekistondagi eng innovatsion va mijozga yo'naltirilgan avtomobil ijarasi platformasimiz. Bizning maqsadimiz — har bir mijozga premium darajadagi xizmatni arzon narxlarda taqdim etish.
              </p>
              <div className="flex gap-4">
                 <a href="/mashinalar" className="btn-primary py-5 px-10 rounded-3xl font-black uppercase tracking-widest text-sm">Mashinalarni ko'rish</a>
                 <a href="/aloqa" className="btn-secondary py-5 px-10 rounded-3xl font-black uppercase tracking-widest text-sm">Bog'lanish</a>
              </div>
           </div>
           <div className="flex-1 relative">
              <div className="aspect-[4/5] rounded-[64px] overflow-hidden rotate-3 shadow-2xl relative z-10 border border-white/5">
                <img src="/images/about/about-team.jpg" className="w-full h-full object-cover" alt="Jamoa" onError={(e) => e.target.src = 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=2070'} />
              </div>
              <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-card-dark rounded-[48px] p-10 shadow-2xl z-20 border border-white/10 hidden md:block">
                 <h4 className="text-5xl font-black text-primary mb-2">10+</h4>
                 <p className="text-white/40 uppercase font-black text-[10px] tracking-widest">Yillik tajriba</p>
              </div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-primary/20 blur-[150px] -z-10 rounded-full"></div>
           </div>
        </section>

        {/* Vision & Mission */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-32">
           <div className="p-16 card-premium bg-primary text-white space-y-6">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-10">
                 <Target className="w-8 h-8" />
              </div>
              <h3 className="text-4xl font-black uppercase tracking-tighter">Bizning Missiyamiz</h3>
              <p className="text-white/70 text-lg leading-relaxed">Sifatli va xavfsiz avtomobil ijarasi orqali odamlarni bir-biriga yaqinlashtirish va sayohatlarni maroqli qilish.</p>
           </div>
           <div className="p-16 card-premium bg-white/5 border border-white/10 space-y-6">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-10 text-primary">
                 <ShieldCheck className="w-8 h-8" />
              </div>
              <h3 className="text-4xl font-black uppercase tracking-tighter">Bizning Maqsadimiz</h3>
              <p className="text-white/40 text-lg leading-relaxed">O'zbekistonning barcha viloyatlarida o'z xizmatlarimizni kengaytirish va raqamli platformamizni rivojlantirish.</p>
           </div>
        </section>

        {/* Team */}
        <section className="space-y-12 mb-32">
           <div className="text-center max-w-2xl mx-auto space-y-4">
              <h2 className="text-5xl font-black uppercase tracking-tighter">Bizning <span className="text-primary italic">Jamoa</span></h2>
              <p className="text-white/40">Loyihamiz ustida tunu-kun mehnat qilayotgan soha mutaxassislari.</p>
           </div>
           <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { name: 'Jamshid Karimov', role: 'Asoschi', img: 'https://i.pravatar.cc/300?img=11' },
                { name: 'Otabek Aliev', role: 'Dizayner', img: 'https://i.pravatar.cc/300?img=12' },
                { name: 'Malika Nosirova', role: 'Menejer', img: 'https://i.pravatar.cc/300?img=5' },
                { name: 'Sardor Rahimboev', role: 'Dasturchi', img: 'https://i.pravatar.cc/300?img=13' },
              ].map((member, i) => (
                <div key={i} className="group cursor-pointer">
                   <div className="aspect-[4/5] rounded-[40px] overflow-hidden mb-6 filter grayscale group-hover:grayscale-0 transition-all duration-700 relative">
                      <img src={member.img} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                      <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                   </div>
                   <h4 className="text-xl font-bold tracking-tight mb-1">{member.name}</h4>
                   <p className="text-xs text-white/30 uppercase font-black tracking-widest">{member.role}</p>
                </div>
              ))}
           </div>
        </section>

        {/* CTA */}
        <div className="p-20 card-premium bg-white/5 border border-white/5 text-center space-y-8 relative overflow-hidden">
           <div className="absolute top-0 left-0 w-full h-full bg-primary/5 blur-[100px] pointer-events-none"></div>
           <h3 className="text-5xl font-black uppercase tracking-tighter max-w-xl mx-auto leading-none">
             Siz bilan yangi ufqlar sari
           </h3>
           <p className="text-white/40 text-lg max-w-md mx-auto">Bizning xizmatlardan foydalanib ko'ring va premium sifatga o'zingiz guvoh bo'ling.</p>
           <button className="btn-primary py-5 px-12 rounded-3xl font-black uppercase text-sm mx-auto">Sayohatni boshlash</button>
        </div>

      </div>
    </div>
  );
};

export default BizHaqimizda;
