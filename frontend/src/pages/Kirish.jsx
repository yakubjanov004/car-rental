import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Lock, ChevronRight, Car, Send } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const Kirish = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(username, password);
      navigate('/kabinet');
    } catch (err) {
      alert("Foydalanuvchi nomi yoki parol xato.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center pt-20 pb-20 relative overflow-hidden">
      {/* Bg shapes */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-primary/5 blur-[150px] -z-10 rounded-full"></div>
      <div className="absolute bottom-0 left-0 w-1/3 h-1/2 bg-primary/10 blur-[120px] -z-10 rounded-full"></div>

      <div className="container mx-auto px-6">
        <div className="max-w-xl mx-auto space-y-12">
           <div className="text-center space-y-4">
              <Link to="/" className="inline-flex items-center gap-2 mb-6 group">
                <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center rotate-12 group-hover:rotate-0 transition-transform duration-300">
                  <Car className="text-white w-8 h-8" />
                </div>
              </Link>
              <h1 className="text-5xl font-black uppercase tracking-tighter">Tizimga Kirish</h1>
              <p className="text-white/40">Loyihamizga qaytganingizdan xursandmiz. Davom etish uchun login ma'lumotlarini kiriting.</p>
           </div>

           <div className="card-premium p-10 md:p-16 border border-white/10 shadow-2xl relative">
              <form className="space-y-8" onSubmit={handleSubmit}>
                 <div className="space-y-2">
                    <label className="text-[10px] text-white/30 uppercase font-black tracking-widest pl-2">Foydalanuvchi nomi</label>
                    <div className="relative">
                       <input 
                         type="text" 
                         value={username}
                         onChange={(e) => setUsername(e.target.value)}
                         className="input-premium py-5 pl-14" 
                         placeholder="Login..." 
                         required
                       />
                       <User className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-white/20" />
                    </div>
                 </div>

                 <div className="space-y-2">
                    <div className="flex justify-between items-end mb-2 pr-2">
                       <label className="text-[10px] text-white/30 uppercase font-black tracking-widest">Parol</label>
                       <a href="#" className="text-[10px] text-primary uppercase font-black tracking-widest hover:underline">Unutdingizmi?</a>
                    </div>
                    <div className="relative">
                       <input 
                         type="password" 
                         value={password}
                         onChange={(e) => setPassword(e.target.value)}
                         className="input-premium py-5 pl-14" 
                         placeholder="••••••••" 
                         required
                       />
                       <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-white/20" />
                    </div>
                 </div>

                 <button className="btn-primary w-full py-6 rounded-[32px] text-lg font-black uppercase tracking-widest flex items-center justify-center gap-4 group">
                    Kirish
                    <ChevronRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                 </button>
              </form>

              <div className="mt-12 text-center">
                 <p className="text-sm text-white/30">
                    Hali ro'yxatdan o'tmaganmisiz? <br />
                    <Link to="/royxatdan" className="text-primary font-black uppercase tracking-widest mt-4 inline-block hover:underline">
                      Ro'yxatdan o'tish →
                    </Link>
                 </p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Kirish;
