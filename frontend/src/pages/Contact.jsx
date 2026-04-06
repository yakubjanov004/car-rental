import React, { useState } from 'react';
import { Send, MapPin, Phone, Mail, Instagram, Facebook, Clock, Plus, Minus, ArrowRight, MessageSquare, Twitter } from 'lucide-react';
import { motion } from 'framer-motion';
import ScrollReveal from '../components/ScrollReveal';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const contactInfo = [
  { icon: MapPin, label: 'Manzil', val: 'Toshkent sh., Chilonzor tumani', color: '#3B82F6' },
  { icon: Phone, label: 'Telefon', val: '+998 90 123 45 67', color: '#00D97E' },
  { icon: Mail, label: 'Email', val: 'info@ridelux.uz', color: '#F59E0B' },
  { icon: Clock, label: 'Ish vaqti', val: '24/7 Xizmat', color: '#EF4444' },
];

const Contact = () => {
  return (
    <div className="bg-[#0A0A0A] min-h-screen pt-32 pb-32 overflow-hidden">
      
      {/* === HERO === */}
      <section className="px-6 mb-32 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[400px] bg-primary/[0.05] blur-[120px] rounded-full pointer-events-none" />
        
        <div className="max-w-7xl mx-auto text-center">
          <ScrollReveal direction="up">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-[10px] font-bold text-white/50 uppercase tracking-widest mb-8">
              <MessageSquare className="w-3.5 h-3.5" />
              Biz har doim aloqadamiz
            </div>
            <h1 className="font-display text-6xl md:text-8xl font-extrabold tracking-tighter mb-8 leading-none">
              Biz bilan <span className="text-white/40 italic">Bog'laning</span>
            </h1>
            <p className="max-w-2xl mx-auto text-white/40 text-lg md:text-xl font-light leading-relaxed mb-12">
              Savollaringiz bormi? Jamoamiz istalgan vaqtda yordam berishga tayyor.
              Quyidagi formani to'ldiring yoki bizga qo'ng'iroq qiling.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* === CONTACT GRID === */}
      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-12 gap-16 items-start">
        
        {/* Left Side: Info & Form */}
        <div className="lg:col-span-12 space-y-24">
          
          {/* Info Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {contactInfo.map((item, i) => (
              <ScrollReveal key={i} direction="up" delay={i * 0.1}>
                 <div className="card p-8 md:p-10 flex flex-col items-center justify-center text-center group hover:border-primary/20">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                       <item.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="text-[10px] text-white/30 uppercase font-bold tracking-widest mb-2">{item.label}</div>
                    <div className="text-sm font-bold">{item.val}</div>
                 </div>
              </ScrollReveal>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-16 items-start">
            {/* Form */}
            <ScrollReveal direction="left">
               <div className="glass p-10 md:p-16 relative overflow-hidden border-white/10 border shardow-2xl">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[60px] pointer-events-none" />
                  
                  <h2 className="font-display text-3xl font-extrabold mb-10 tracking-tight">Xabar yuborish</h2>
                  
                  <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                    <div className="space-y-2">
                       <label className="text-[10px] text-white/30 uppercase font-bold tracking-widest ml-1">Ism</label>
                       <input 
                         type="text" 
                         className="w-full bg-[#111] border border-white/5 rounded-2xl py-4 px-4 text-sm focus:border-primary/50 outline-none transition-colors"
                         placeholder="Ismingiz..."
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] text-white/30 uppercase font-bold tracking-widest ml-1">Email</label>
                       <input 
                         type="email" 
                         className="w-full bg-[#111] border border-white/5 rounded-2xl py-4 px-4 text-sm focus:border-primary/50 outline-none transition-colors"
                         placeholder="email@example.com"
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] text-white/30 uppercase font-bold tracking-widest ml-1">Xabar</label>
                       <textarea 
                         rows="5"
                         className="w-full bg-[#111] border border-white/5 rounded-2xl py-4 px-4 text-sm focus:border-primary/50 outline-none transition-colors"
                         placeholder="Xabaringiz..."
                       />
                    </div>
                    <button className="btn-primary w-full py-4 rounded-2xl text-sm font-bold uppercase tracking-widest flex items-center justify-center gap-2 group">
                       XABAR YUBORISH
                       <Send className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </button>
                  </form>
               </div>
            </ScrollReveal>

            {/* Socials & CTA */}
            <div className="space-y-12">
               <ScrollReveal direction="right">
                  <h3 className="font-display text-2xl font-extrabold mb-8 tracking-tight">Bizni <span className="text-white/40">Kuzating</span></h3>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { icon: Send, label: 'Telegram', link: '#', color: '#0088CC' },
                      { icon: Instagram, label: 'Instagram', link: '#', color: '#E1306C' },
                      { icon: Facebook, label: 'Facebook', link: '#', color: '#1877F2' },
                      { icon: Twitter, label: 'Twitter', link: '#', color: '#1DA1F2' },
                    ].map((s, i) => (
                      <a 
                        key={i} href={s.link} 
                        className="flex items-center gap-4 p-6 rounded-3xl bg-white/[0.03] border border-white/5 hover:border-white/10 hover:bg-white/[0.05] transition-all group"
                      >
                        <s.icon className="w-5 h-5 text-white/40 group-hover:text-primary transition-colors" />
                        <span className="text-sm font-bold text-white/60">{s.label}</span>
                      </a>
                    ))}
                  </div>
               </ScrollReveal>

               <ScrollReveal direction="right" delay={0.2}>
                  <div className="p-10 rounded-[32px] bg-primary/5 border border-primary/20 flex flex-col items-center text-center">
                     <p className="text-xs text-primary font-bold uppercase tracking-widest mb-4">Tezkor Bog'lanish</p>
                     <h4 className="font-display text-3xl font-extrabold mb-6">+998 (90) 123-45-67</h4>
                     <a href="tel:+998901234567" className="btn-primary px-8 py-4 text-xs font-bold uppercase">Hozir qo'ng'iroq qilish</a>
                  </div>
               </ScrollReveal>
            </div>
          </div>
        </div>
      </div>

      {/* === MAP SECTION === */}
      <section className="mt-40 px-6">
        <div className="max-w-7xl mx-auto h-[500px] rounded-[48px] overflow-hidden border border-white/10 shadow-2xl relative">
           <MapContainer center={[41.2995, 69.2401]} zoom={12} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
             <TileLayer
               url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
               attribution='&copy; <a href="https://carto.com/">CARTO</a>'
             />
             <Marker position={[41.2995, 69.2401]}>
               <Popup>
                 Bizning bosh ofisimiz. Sizni kutamiz!
               </Popup>
             </Marker>
             <Marker position={[41.32, 69.28]}>
               <Popup>
                 Yunusobod filiali (Tez kunda!)
               </Popup>
             </Marker>
           </MapContainer>
        </div>
      </section>

    </div>
  );
};

export default Contact;
