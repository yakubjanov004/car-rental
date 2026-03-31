import React from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Zap, Globe, Award, Users, Heart, Target, Star, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

const About = () => {
  return (
    <div className="bg-[#121212] min-h-screen">
      {/* Hero Header */}
      <section className="relative h-[450px] lg:h-[600px] flex items-center justify-center overflow-hidden px-[8%] lg:px-[12%]">
        <div className="absolute inset-0 bg-[url('/Image/about-hero.jpg')] bg-cover bg-center bg-fixed opacity-30 scale-110"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-[#121212]/0 via-[#121212]/60 to-[#121212]"></div>
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="relative z-10 text-center">
            <h6 className="uppercase font-black text-xs lg:text-sm text-red-600 tracking-[8px] mb-6">- Since 2024</h6>
            <h1 className="text-5xl lg:text-8xl font-black text-white bricolage-font tracking-tighter uppercase mb-4 leading-none">Redefining <br />The <span className="text-red-600">Standard.</span></h1>
            <p className="text-gray-400 text-sm lg:text-lg max-w-2xl mx-auto font-medium opacity-80 italic">We are not just a car rental company. We are your gateway to a premium automotive lifestyle in Uzbekistan.</p>
        </motion.div>
      </section>

      {/* Philosophy Section */}
      <section className="py-32 px-[8%] lg:px-[12%]">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
            <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }} className="relative">
                <div className="rounded-[50px] overflow-hidden border border-gray-800 shadow-2xl relative group">
                    <img src="/Image/about-side.jpg" alt="Luxury Interior" className="w-full h-auto grayscale group-hover:grayscale-0 transition-all duration-1000" />
                    <div className="absolute inset-0 bg-red-600/10 mix-blend-overlay"></div>
                </div>
                <div className="absolute -bottom-10 -right-10 bg-red-600 p-12 rounded-[40px] shadow-2xl hidden xl:block">
                    <Award size={40} className="text-white mb-4" />
                    <p className="text-white font-black text-3xl leading-none bricolage-font">Elite <br />Rating</p>
                </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }} className="space-y-10">
                <div>
                   <h6 className="uppercase font-black text-[10px] text-red-600 tracking-[5px] mb-6">- Our Philosophy</h6>
                   <h2 className="text-4xl lg:text-5xl font-black text-white bricolage-font uppercase tracking-tighter leading-none mb-8">Crafting Memories <br /><span className="text-red-600">Across the Road.</span></h2>
                   <p className="text-gray-500 font-medium leading-relaxed italic opacity-80 mb-6">At Ridelux, we believe that every journey should be an occasion. Our fleet is hand-curated to ensure only the finest examples of automotive engineering are available for our clients.</p>
                   <p className="text-gray-500 font-medium leading-relaxed italic opacity-80">From the moment you browse our collection to the final drop-off, our dedicated concierge team ensures a seamless, high-touch experience that honors your time and status.</p>
                </div>

                <div className="grid grid-cols-2 gap-8 pt-8 border-t border-gray-800">
                    {[
                        { icon: <ShieldCheck className="text-red-600" />, title: "Full Security", desc: "Premium insurance coverage." },
                        { icon: <Zap className="text-red-600" />, title: "Rapid Delivery", desc: "Door-to-door in 1 hour." },
                        { icon: <Globe className="text-red-600" />, title: "Global Luxury", desc: "Imported elite fleet." },
                        { icon: <Heart className="text-red-600" />, title: "Client First", desc: "Personalized concierge." }
                    ].map((item, i) => (
                        <div key={i} className="space-y-2">
                            <div className="flex items-center gap-3">
                                {item.icon}
                                <h6 className="text-white font-black text-xs uppercase tracking-widest">{item.title}</h6>
                            </div>
                            <p className="text-gray-600 text-[10px] uppercase font-bold pl-8">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-[#1e1f22] py-24 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-[8%] lg:px-[12%] grid grid-cols-2 lg:grid-cols-4 gap-12 text-center">
            {[
                { val: "250+", lab: "Active Vehicles" },
                { val: "15k+", lab: "Happy Clients" },
                { val: "24/7", lab: "Digital Support" },
                { val: "100%", lab: "Insurance Cover" }
            ].map((stat, i) => (
                <div key={i} className="space-y-4 group">
                    <p className="text-5xl lg:text-7xl font-black text-white bricolage-font tracking-tighter group-hover:text-red-600 transition-colors">{stat.val}</p>
                    <p className="text-gray-600 text-[10px] font-black uppercase tracking-[4px]">{stat.lab}</p>
                </div>
            ))}
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="py-32 px-[8%] lg:px-[12%]">
         <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} className="bg-[#1e1f22] p-16 rounded-[40px] border border-gray-800 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-40 h-40 bg-red-600/5 blur-[80px] rounded-full group-hover:bg-red-600/10 transition-all"></div>
                <Target size={48} className="text-red-600 mb-10" />
                <h3 className="text-3xl font-black text-white bricolage-font uppercase tracking-tighter mb-6">Our Vision</h3>
                <p className="text-gray-500 font-medium leading-relaxed italic opacity-80">To become Central Asia's unrivaled destination for luxury mobility, setting the benchmark for automotive excellence and digital rental innovation.</p>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-[#1e1f22] p-16 rounded-[40px] border border-gray-800 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-40 h-40 bg-red-600/5 blur-[80px] rounded-full group-hover:bg-red-600/10 transition-all"></div>
                <Star size={48} className="text-red-600 mb-10" />
                <h3 className="text-3xl font-black text-white bricolage-font uppercase tracking-tighter mb-6">Our Mission</h3>
                <p className="text-gray-500 font-medium leading-relaxed italic opacity-80">Empowering individuals to explore Uzbekistan with style and confidence by providing access to the world's finest vehicles through an effortless digital platform.</p>
            </motion.div>
         </div>
      </section>

      {/* CTA Wrapper */}
      <section className="py-40 px-[8%] lg:px-[12%] text-center">
            <h2 className="text-5xl lg:text-7xl font-black text-white bricolage-font tracking-tighter leading-none uppercase mb-12">
                Join our <span className="text-red-600">Legendary Journey.</span>
            </h2>
            <Link to="/cars" className="bg-red-600 text-white px-16 py-7 rounded-[30px] font-black uppercase text-sm tracking-[4px] hover:bg-white hover:text-black transition-all shadow-2xl shadow-red-600/20 active:scale-95 inline-flex items-center gap-4">Start Your Drive <ChevronRight /></Link>
      </section>
    </div>
  );
};

export default About;
