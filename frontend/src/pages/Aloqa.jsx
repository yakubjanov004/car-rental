import React, { useState } from 'react';
import { Send, MapPin, Phone, Mail, Instagram, Facebook, Clock, Plus, Minus } from 'lucide-react';
import { SAYT } from '../data/constants';

const Aloqa = () => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });

  return (
    <div className="pt-32 pb-32">
      <div className="container mx-auto px-6">
        
        <div className="text-center max-w-4xl mx-auto mb-24 space-y-8">
           <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-none">
             Biz bilan <span className="text-primary italic">Bog'laning</span>
           </h1>
           <p className="text-xl text-white/40 leading-relaxed">
             Savollaringiz yoki takliflaringiz bormi? Biz bilan bog'lanishdan tortinmang. Bizning jamoamiz doimo sizga yordam berishga tayyor.
           </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
           
           {/* Contact Info */}
           <div className="space-y-12">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 {[
                   { icon: <MapPin />, label: 'Manzil', value: SAYT.manzil },
                   { icon: <Phone />, label: 'Telefon', value: SAYT.telefon },
                   { icon: <Mail />, label: 'Email', value: SAYT.email },
                   { icon: <Clock />, label: 'Ish vaqti', value: SAYT.ish_vaqti },
                 ].map((item, i) => (
                   <div key={i} className="p-10 card-premium border border-white/5 hover:border-primary/20 transition-all group">
                      <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-primary mb-8 group-hover:bg-primary group-hover:text-white transition-all transform group-hover:scale-110">
                        {item.icon}
                      </div>
                      <h4 className="text-[10px] text-white/30 uppercase font-black tracking-[0.2em] mb-3">{item.label}</h4>
                      <p className="text-xl font-bold leading-relaxed">{item.value}</p>
                   </div>
                 ))}
              </div>

              {/* Socials */}
              <div className="p-10 bg-white/5 rounded-[48px] flex flex-wrap justify-between items-center gap-10">
                 <p className="text-xl font-black uppercase tracking-tighter">Ijtimoiy tarmoqlar</p>
                 <div className="flex gap-6">
                    <a href={SAYT.ijtimoiy.telegram} className="p-5 bg-white/5 rounded-3xl hover:bg-primary transition-colors duration-300">
                       <Send className="w-8 h-8" />
                    </a>
                    <a href={SAYT.ijtimoiy.instagram} className="p-5 bg-white/5 rounded-3xl hover:bg-primary transition-colors duration-300">
                       <Instagram className="w-8 h-8" />
                    </a>
                    <a href={SAYT.ijtimoiy.facebook} className="p-5 bg-white/5 rounded-3xl hover:bg-primary transition-colors duration-300">
                       <Facebook className="w-8 h-8" />
                    </a>
                 </div>
              </div>
           </div>

           {/* Contact Form */}
           <div className="card-premium p-10 md:p-16 border border-white/10 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[120px] pointer-events-none"></div>
              
              <h3 className="text-3xl font-black uppercase tracking-tighter mb-10">Xabar qoldirish</h3>
              
              <form className="space-y-8 relative z-10" onSubmit={(e) => { e.preventDefault(); alert('Xabar yuborildi!'); }}>
                 <div className="space-y-2">
                    <label className="text-[10px] text-white/30 uppercase font-black tracking-widest pl-2">Ismingiz</label>
                    <input 
                      type="text" 
                      className="input-premium py-5 px-6" 
                      placeholder="Masalan: Azizbek" 
                      required
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] text-white/30 uppercase font-black tracking-widest pl-2">Elektron pochta</label>
                    <input 
                      type="email" 
                      className="input-premium py-5 px-6" 
                      placeholder="Masalan: aziz@gmail.com" 
                      required
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] text-white/30 uppercase font-black tracking-widest pl-2">Xabaringiz</label>
                    <textarea 
                      className="input-premium py-5 px-6 min-h-[200px]" 
                      placeholder="Xabaringizni shu yerga yozing..." 
                      required
                    />
                 </div>
                 <button className="btn-primary w-full py-6 rounded-[32px] text-lg font-black uppercase tracking-widest flex items-center justify-center gap-4 group">
                    <Send className="w-6 h-6 group-hover:translate-x-2 group-hover:-translate-y-2 transition-transform" />
                    Yuborish
                 </button>
              </form>
           </div>
        </div>

        {/* Map Placeholder */}
        <div className="mt-32 w-full h-[600px] rounded-[64px] overflow-hidden grayscale invert border border-white/5 opacity-50 contrast-125">
           <iframe 
             src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d191885.2529851457!2d69.11410148705032!3d41.28259744654941!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x38ae8b0cc379e9c3%3A0xa5a997690eda4fe7!2sTashkent%2C%20Uzbekistan!5e0!3m2!1sen!2s!4v1711883651842!5m2!1sen!2s" 
             width="100%" 
             height="100%" 
             style={{ border: 0 }} 
             allowFullScreen="" 
             loading="lazy" 
             referrerPolicy="no-referrer-when-downgrade"
           ></iframe>
        </div>

      </div>
    </div>
  );
};

export default Aloqa;
