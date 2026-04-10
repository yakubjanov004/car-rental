import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Lock, ChevronRight, Car, Send, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import ScrollReveal from '../components/ScrollReveal';

const SignIn = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const userData = await login(username, password);
      if (userData.is_staff) {
         navigate('/admin');
      } else {
         navigate('/profile');
      }
    } catch (err) {
      alert("Login yoki parol xato.");
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center pt-24 pb-20 px-6 relative overflow-hidden">
      {/* Ambient backgrounds */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/[0.08] blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-primary/[0.05] blur-[100px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <ScrollReveal direction="up">
          <div className="text-center mb-12">
            <Link to="/" className="inline-flex items-center gap-2 mb-8 group">
               <div className="w-14 h-14 bg-primary rounded-[20px] flex items-center justify-center rotate-6 group-hover:rotate-0 transition-all duration-500 shadow-xl shadow-primary/20">
                  <Car className="text-white w-8 h-8" />
               </div>
            </Link>
            <h1 className="font-display text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
              Xush <span className="text-white/40">kelibsiz</span>
            </h1>
            <p className="text-white/40 text-sm font-medium">Shaxsiy kabinetingiz orqali ijaralarni kuzatib boring.</p>
          </div>
        </ScrollReveal>

        <ScrollReveal direction="up" delay={0.1}>
          <div className="glass p-8 md:p-10 border-white/10 shadow-2xl">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label className="text-[10px] text-white/30 uppercase font-bold tracking-[0.2em] ml-1">Login</label>
                <div className="relative group">
                  <input 
                    type="text" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-[#111] border border-white/5 rounded-2xl py-4.5 pl-12 pr-4 text-sm focus:border-primary/50 transition-all outline-none"
                    placeholder="Loginni kiriting..." 
                    required
                  />
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-primary transition-colors" />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center mb-1 px-1">
                  <label className="text-[10px] text-white/30 uppercase font-bold tracking-[0.2em]">Parol</label>
                  <Link to="#" className="text-[10px] text-primary font-bold uppercase tracking-widest hover:text-white transition-colors">Tiklash?</Link>
                </div>
                <div className="relative group">
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#111] border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm focus:border-primary/50 transition-all outline-none"
                    placeholder="••••••••" 
                    required
                  />
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-primary transition-colors" />
                </div>
              </div>

              <button className="btn-primary w-full py-4 rounded-2xl text-sm font-bold uppercase tracking-widest flex items-center justify-center gap-2 group">
                KIRISH
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
            </form>

            <div className="mt-10 pt-8 border-t border-white/5 text-center">
              <p className="text-xs text-white/30 font-medium">
                Akkauntingiz yo'qmi?
                <Link to="/signup" className="text-primary font-bold ml-2 hover:text-white transition-colors">
                  Ro'yxatdan o'tish
                </Link>
              </p>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </div>
  );
};

export default SignIn;
