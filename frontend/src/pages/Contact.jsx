import React, { useState } from 'react';
import apiClient from '../services/api/apiClient';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Phone, Mail, Send, CheckCircle, Info, ShieldCheck, Heart } from 'lucide-react';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
    subject: "Car Rental Inquiry"
  });
  const [status, setStatus] = useState(null); // 'submitting', 'success', 'error'

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('submitting');
    try {
      await apiClient.post('/contact/', formData);
      setStatus('success');
      setFormData({ name: "", email: "", message: "", subject: "Car Rental Inquiry" });
    } catch (err) {
      console.error(err);
      setStatus('error');
    }
  };

  return (
    <div className="bg-[#121212] min-h-screen pt-24 pb-20">
      {/* Header */}
      <div className="relative h-[350px] lg:h-[450px] flex items-center justify-center overflow-hidden px-[8%] lg:px-[12%]">
        <div className="absolute inset-0 bg-[url('/Image/contact-hero.jpg')] bg-cover bg-center bg-fixed opacity-30 scale-110"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-[#121212]/0 via-[#121212]/60 to-[#121212]"></div>
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="relative z-10 text-center">
            <h6 className="uppercase font-black text-xs lg:text-sm text-red-600 tracking-[8px] mb-6">- Get in Touch</h6>
            <h1 className="text-5xl lg:text-8xl font-black text-white bricolage-font tracking-tighter uppercase mb-4 leading-none">Contact <span className="text-red-600">Uz</span></h1>
            <p className="text-gray-400 text-sm lg:text-lg max-w-2xl mx-auto font-medium opacity-80 italic italic">Our dedicated concierge is available 24/7 to assist with your premium automotive requirements.</p>
        </motion.div>
      </div>

      <div className="max-w-7xl mx-auto px-[8%] lg:px-[12%] mt-[-50px] relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          
          {/* Contact Details */}
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
            <div className="space-y-12">
               <div>
                  <h2 className="text-4xl lg:text-5xl font-black text-white bricolage-font uppercase tracking-tighter mb-8 leading-none">Global Presence <br /><span className="text-red-600">Local Support.</span></h2>
                  <p className="text-gray-500 font-medium max-w-md leading-relaxed italic opacity-80">Whether you need a chauffeur, a luxury sedan, or a customized fleet package, our experts are ready to deliver excellence.</p>
               </div>

               <div className="space-y-8">
                  {[
                    { icon: <MapPin size={24} />, title: "Headquarters", info: "45 Amir Temur Street, Tashkent, Uzbekistan", col: "text-red-600" },
                    { icon: <Phone size={24} />, title: "Voice & Support", info: "+998 99 123 45 67", col: "text-red-600" },
                    { icon: <Mail size={24} />, title: "Electronic Mail", info: "concierge@ridelux.com", col: "text-red-600" }
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-6 group">
                        <div className={`p-4 rounded-2xl bg-white/5 border border-white/5 group-hover:border-red-600/50 group-hover:bg-red-600/10 transition-all ${item.col}`}>
                           {item.icon}
                        </div>
                        <div>
                           <p className="text-gray-600 text-[10px] uppercase font-black tracking-widest mb-1">{item.title}</p>
                           <p className="text-white font-bold text-lg">{item.info}</p>
                        </div>
                    </div>
                  ))}
               </div>

               <div className="pt-10 border-t border-gray-800 flex gap-6">
                  <div className="bg-red-600/10 p-6 rounded-3xl border border-red-600/20 max-w-[280px]">
                      <Heart size={20} className="text-red-600 mb-4" />
                      <h4 className="text-white font-black text-xs uppercase tracking-widest mb-2">Socially Engaged</h4>
                      <p className="text-gray-600 text-[10px] font-bold leading-relaxed mb-4">Follow us for exclusive fleet updates and luxury automotive events across Tashkent.</p>
                      <div className="flex gap-3">
                         <div className="w-8 h-8 rounded-lg bg-gray-800"></div>
                         <div className="w-8 h-8 rounded-lg bg-gray-800"></div>
                         <div className="w-8 h-8 rounded-lg bg-gray-800"></div>
                      </div>
                  </div>
               </div>
            </div>
          </motion.div>

          {/* Form */}
          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
            <div className="bg-[#1e1f22] p-10 lg:p-14 rounded-[40px] border border-gray-800 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-red-600/5 blur-[80px] rounded-full"></div>
                
                <h3 className="text-3xl font-black text-white bricolage-font uppercase tracking-tighter mb-10 border-b border-gray-800 pb-6">Direct Message</h3>

                {status === 'success' ? (
                   <div className="text-center py-20">
                      <div className="bg-green-500/10 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce">
                          <CheckCircle size={48} className="text-green-500" />
                      </div>
                      <h3 className="text-3xl font-bold text-white mb-4 bricolage-font">Message Sent!</h3>
                      <p className="text-gray-400 mb-10 text-sm leading-relaxed max-w-xs mx-auto">Thank you for reaching out. Our concierge will review your message and reply via email within 24 hours.</p>
                      <button onClick={() => setStatus(null)} className="text-red-600 font-black uppercase text-xs tracking-widest hover:underline decoration-red-600/30 underline-offset-8">Send another message</button>
                   </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-8">
                    <div>
                        <label className="block text-gray-600 text-[10px] font-black uppercase tracking-widest mb-4">Full Identity</label>
                        <input type="text" name="name" placeholder="John Doe" value={formData.name} onChange={handleChange} className="w-full bg-[#121212] border border-gray-700 rounded-2xl px-6 py-5 text-white outline-none focus:border-red-600 transition-all font-bold text-sm" required />
                    </div>
                    <div>
                        <label className="block text-gray-600 text-[10px] font-black uppercase tracking-widest mb-4">Email Address</label>
                        <input type="email" name="email" placeholder="john@example.com" value={formData.email} onChange={handleChange} className="w-full bg-[#121212] border border-gray-700 rounded-2xl px-6 py-5 text-white outline-none focus:border-red-600 transition-all font-bold text-sm" required />
                    </div>
                    <div>
                        <label className="block text-gray-600 text-[10px] font-black uppercase tracking-widest mb-4">Message Details</label>
                        <textarea rows="5" name="message" placeholder="Describe your request..." value={formData.message} onChange={handleChange} className="w-full bg-[#121212] border border-gray-700 rounded-2xl px-6 py-5 text-white outline-none focus:border-red-600 transition-all font-bold text-sm" required></textarea>
                    </div>

                    {status === 'error' && <p className="text-red-500 text-xs font-black text-center animate-shake">Error sending message! Please verify your information.</p>}

                    <button type="submit" disabled={status === 'submitting'} className="w-full bg-red-600 hover:bg-white hover:text-black text-white font-black py-5 rounded-[22px] transition-all shadow-xl shadow-red-600/30 flex items-center justify-center gap-4 uppercase tracking-[4px] text-xs disabled:opacity-50 active:scale-[0.98]">
                      {status === 'submitting' ? 'Transmitting...' : 'Dispatch Message'} <Send size={16} />
                    </button>
                  </form>
                )}

                <div className="mt-12 flex items-center justify-center gap-6 border-t border-gray-800 pt-8">
                    <div className="flex items-center gap-2 text-gray-600 hover:text-red-600 transition-all cursor-help"><Info size={16} /> <span className="text-[9px] font-bold uppercase tracking-widest">Privacy Guard</span></div>
                    <div className="w-px h-3 bg-gray-800"></div>
                    <div className="flex items-center gap-2 text-gray-600 hover:text-green-600 transition-all cursor-help"><ShieldCheck size={16} /> <span className="text-[9px] font-bold uppercase tracking-widest">Verified Contact</span></div>
                </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
