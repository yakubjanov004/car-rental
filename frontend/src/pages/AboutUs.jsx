import React from 'react';
import { ShieldCheck, Target, Users, Award, ChevronRight, Zap, Star, ArrowRight, Heart, Globe, MousePointer2 } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';
import ScrollReveal from '../components/ScrollReveal';

const stats = [
  { label: 'Years Experience', value: '10+', color: '#3B82F6' },
  { label: 'Happy Clients', value: '5K+', color: '#00D97E' },
  { label: 'Fleet Size', value: '150+', color: '#F59E0B' },
  { label: 'Rating', value: '4.9', color: '#EF4444' },
];

const team = [
  { name: 'Jamshid Karimov', role: 'Founder & CEO', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80' },
  { name: 'Otabek Aliev', role: 'Head of Operations', img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80' },
  { name: 'Malika Nosirova', role: 'Marketing Director', img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80' },
  { name: 'Sardor Rahimboev', role: 'Tech Lead', img: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80' },
];

const AboutUs = () => {
  return (
    <div className="bg-[#0A0A0A] min-h-screen pt-32 pb-32 overflow-hidden">
      
      {/* === HERO SECTION === */}
      <section className="relative px-6 mb-32">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-[500px] bg-primary/[0.05] blur-[120px] rounded-full -z-10 pointer-events-none" />
        
        <div className="max-w-7xl mx-auto text-center">
          <ScrollReveal direction="up">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-[10px] font-bold text-white/50 uppercase tracking-widest mb-8">
              <Globe className="w-3.5 h-3.5" />
              Your journey — our goal 
            </div>
            <h1 className="font-display text-6xl md:text-8xl font-extrabold tracking-tighter mb-8 leading-[0.9]">
              Premium <span className="text-white/40 italic">Quality</span><br />
              Mobility
            </h1>
            <p className="max-w-2xl mx-auto text-white/40 text-lg md:text-xl font-light leading-relaxed mb-12">
              We are the most innovative car rental platform in Uzbekistan.
              Our goal is to turn every journey into an unforgettable premium experience.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* === STATS BENTO === */}
      <section className="px-6 mb-40">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {stats.map((stat, i) => (
            <ScrollReveal key={i} direction="up" delay={i * 0.1}>
              <div className="card p-10 flex flex-col items-center justify-center text-center group hover:scale-[1.02] transition-transform">
                <div className="font-display text-5xl md:text-6xl font-extrabold mb-3 tracking-tighter" style={{ color: stat.color }}>
                  {stat.value}
                </div>
                <div className="text-[10px] text-white/30 uppercase font-bold tracking-widest">{stat.label}</div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* === PHILOSOPHY === */}
      <section className="px-6 mb-40">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <ScrollReveal direction="left">
               <div className="relative">
                  <div className="aspect-[4/5] rounded-[48px] overflow-hidden border border-white/10 shadow-2xl relative z-10">
                     <img 
                       src="https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&q=80" 
                       alt="About us" 
                       className="w-full h-full object-cover scale-110 hover:scale-100 transition-transform duration-1000" 
                     />
                  </div>
                  {/* Decorative element */}
                  <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-primary rounded-[32px] flex items-center justify-center -rotate-6 z-20 shadow-xl hidden md:flex">
                     <Award className="w-16 h-16 text-white" />
                  </div>
               </div>
            </ScrollReveal>
            
            <div className="space-y-10">
              <ScrollReveal direction="right">
                <div className="text-[11px] text-primary font-bold uppercase tracking-widest">— Our Philosophy</div>
                <h2 className="font-display text-4xl md:text-5xl font-extrabold tracking-tight">Simplicity and <span className="text-white/40">Innovation</span></h2>
                <p className="text-white/50 text-lg font-light leading-relaxed italic">
                  "We don't just provide cars; we give you freedom and time.
                  Booking any car in 3 minutes via our digital platform — this is the way we chose."
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
                  <div className="flex gap-4 p-6 rounded-3xl bg-white/[0.03] border border-white/5">
                    <Target className="w-6 h-6 text-primary shrink-0" />
                    <div>
                      <h4 className="font-bold mb-1">Mission</h4>
                      <p className="text-xs text-white/40">Raising mobility standards in Uzbekistan to the highest level.</p>
                    </div>
                  </div>
                  <div className="flex gap-4 p-6 rounded-3xl bg-white/[0.03] border border-white/5">
                    <Heart className="w-6 h-6 text-primary shrink-0" />
                    <div>
                      <h4 className="font-bold mb-1">Values</h4>
                      <p className="text-xs text-white/40">Customer trust — our highest reward.</p>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </section>

      {/* === TEAM SECTION === */}
      <section className="px-6 mb-40">
        <div className="max-w-7xl mx-auto">
          <ScrollReveal direction="up">
            <div className="text-center mb-16">
              <h2 className="font-display text-4xl md:text-6xl font-extrabold tracking-tighter mb-4">Mutaxassislar <span className="text-white/40">Jamoasi</span></h2>
              <p className="text-white/40 text-sm tracking-widest uppercase font-medium">Sizga xizmat ko'rsatuvchi professionallar</p>
            </div>
          </ScrollReveal>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {team.map((member, i) => (
              <ScrollReveal key={i} direction="up" delay={i * 0.1}>
                <div className="group cursor-pointer">
                  <div className="aspect-[4/5] rounded-[32px] overflow-hidden mb-6 filter grayscale group-hover:grayscale-0 transition-all duration-700 border border-white/5">
                    <img src={member.img} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={member.name} />
                  </div>
                  <h4 className="font-bold mb-1 group-hover:text-primary transition-colors">{member.name}</h4>
                  <p className="text-[10px] text-white/30 uppercase font-bold tracking-widest">{member.role}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* === CTA PANEL === */}
      <section className="px-6">
        <div className="max-w-7xl mx-auto">
          <ScrollReveal direction="scale">
             <div className="glass p-12 md:p-24 text-center rounded-[48px] relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-primary/[0.03] blur-[120px] pointer-events-none" />
                <h3 className="font-display text-5xl md:text-7xl font-extrabold tracking-tighter mb-8 leading-none max-w-3xl mx-auto">
                  Reach new <span className="text-primary italic">Horizons</span> with us
                </h3>
                <p className="max-w-md mx-auto text-white/40 text-lg font-light mb-12">
                  Join our premium fleet and feel what real service is.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <a href="/fleet" className="btn-primary px-10 py-5 text-sm font-bold uppercase tracking-widest">VIEW FLEET</a>
                  <a href="/contact" className="btn-secondary px-10 py-5 text-sm font-bold uppercase tracking-widest">CONTACT US</a>
                </div>
             </div>
          </ScrollReveal>
        </div>
      </section>

    </div>
  );
};

export default AboutUs;
