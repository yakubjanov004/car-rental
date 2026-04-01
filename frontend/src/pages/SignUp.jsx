import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Lock, Mail, Phone, ChevronRight, Car, UserCircle, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import ScrollReveal from '../components/ScrollReveal';

const SignUp = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    phone_number: '',
    password: '',
    confirm_password: ''
  });
  const navigate = useNavigate();

  const { register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirm_password) {
       alert("Parollar mos kelmadi!");
       return;
    }
    
    try {
      const { confirm_password, ...regData } = formData;
      await register(regData);
      alert("Ro'yxatdan muvaffaqiyatli o'tdingiz! Endi kirishingiz mumkin.");
      navigate('/signin');
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.username?.[0] || err.response?.data?.detail || "Ro'yxatdan o'tishda xatolik yuz berdi.");
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center pt-24 pb-20 px-6 relative overflow-hidden">
      {/* Ambient backgrounds */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/[0.08] blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-primary/[0.05] blur-[100px] rounded-full pointer-events-none" />

      <div className="w-full max-w-2xl relative z-10">
        <ScrollReveal direction="up">
          <div className="text-center mb-12">
            <Link to="/" className="inline-flex items-center gap-2 mb-8 group">
               <div className="w-14 h-14 bg-primary rounded-[20px] flex items-center justify-center rotate-6 group-hover:rotate-0 transition-all duration-500 shadow-xl shadow-primary/20">
                  <Car className="text-white w-8 h-8" />
               </div>
            </Link>
            <h1 className="font-display text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
              Ro'yxatdan <span className="text-white/40">o'tish</span>
            </h1>
            <p className="text-white/40 text-sm font-medium">RIDELUX oilasiga qo'shiling va premium xizmatlardan bahramand bo'ling.</p>
          </div>
        </ScrollReveal>

        <ScrollReveal direction="up" delay={0.1}>
          <div className="glass p-8 md:p-10 border-white/10 shadow-2xl">
            <form className="grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={handleSubmit}>
              
              <div className="space-y-2">
                <label className="text-[10px] text-white/30 uppercase font-bold tracking-[0.2em] ml-1">Ism</label>
                <input 
                  type="text" 
                  required
                  className="w-full bg-[#111] border border-white/5 rounded-2xl py-4 px-4 text-sm focus:border-primary/50 transition-all outline-none"
                  placeholder="Ismingiz..."
                  onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] text-white/30 uppercase font-bold tracking-[0.2em] ml-1">Familiya</label>
                <input 
                  type="text" 
                  required
                  className="w-full bg-[#111] border border-white/5 rounded-2xl py-4 px-4 text-sm focus:border-primary/50 transition-all outline-none"
                  placeholder="Familiyangiz..."
                  onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] text-white/30 uppercase font-bold tracking-[0.2em] ml-1">Email</label>
                <input 
                  type="email" 
                  required
                  className="w-full bg-[#111] border border-white/5 rounded-2xl py-4 px-4 text-sm focus:border-primary/50 transition-all outline-none"
                  placeholder="email@example.com"
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] text-white/30 uppercase font-bold tracking-[0.2em] ml-1">Telefon</label>
                <input 
                  type="tel" 
                  required
                  className="w-full bg-[#111] border border-white/5 rounded-2xl py-4 px-4 text-sm focus:border-primary/50 transition-all outline-none"
                  placeholder="+998"
                  onChange={(e) => setFormData({...formData, phone_number: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] text-white/30 uppercase font-bold tracking-[0.2em] ml-1">Login</label>
                <input 
                  type="text" 
                  required
                  className="w-full bg-[#111] border border-white/5 rounded-2xl py-4 px-4 text-sm focus:border-primary/50 transition-all outline-none"
                  placeholder="Login..."
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] text-white/30 uppercase font-bold tracking-[0.2em] ml-1">Parol</label>
                <input 
                  type="password" 
                  required
                  className="w-full bg-[#111] border border-white/5 rounded-2xl py-4 px-4 text-sm focus:border-primary/50 transition-all outline-none"
                  placeholder="••••••••"
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="text-[10px] text-white/30 uppercase font-bold tracking-[0.2em] ml-1">Parolni tasdiqlash</label>
                <input 
                  type="password" 
                  required
                  className="w-full bg-[#111] border border-white/5 rounded-2xl py-4 px-4 text-sm focus:border-primary/50 transition-all outline-none"
                  placeholder="••••••••"
                  onChange={(e) => setFormData({...formData, confirm_password: e.target.value})}
                />
              </div>

              <div className="md:col-span-2 pt-4">
                <button className="btn-primary w-full py-4 rounded-2xl text-sm font-bold uppercase tracking-widest flex items-center justify-center gap-2 group">
                  RO'YXATDAN O'TISH
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            </form>

            <div className="mt-10 pt-8 border-t border-white/5 text-center">
              <p className="text-xs text-white/30 font-medium">
                Akkauntingiz bormi?
                <Link to="/signin" className="text-primary font-bold ml-2 hover:text-white transition-colors">
                  Kirish
                </Link>
              </p>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </div>
  );
};

export default SignUp;
