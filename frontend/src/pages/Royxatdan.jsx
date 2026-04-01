import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Lock, Mail, Phone, ChevronRight, Car, UserCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Royxatdan = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    phone: '',
    password: '',
    confirm_password: ''
  });
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirm_password) {
       alert("Parollar mos emas!");
       return;
    }
    // In real app, call API
    alert("Muvaffaqiyatli ro'yxatdan o'tdingiz! Endi tizimga kirishingiz mumkin.");
    navigate('/kirish');
  };

  return (
    <div className="min-h-screen flex items-center justify-center pt-32 pb-32 relative overflow-hidden">
      {/* Bg shapes */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-primary/10 blur-[150px] -z-10 rounded-full"></div>
      <div className="absolute bottom-0 left-0 w-1/3 h-1/2 bg-primary/5 blur-[120px] -z-10 rounded-full"></div>

      <div className="container mx-auto px-6">
        <div className="max-w-3xl mx-auto space-y-12">
           <div className="text-center space-y-4">
              <Link to="/" className="inline-flex items-center gap-2 mb-4 group">
                <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center rotate-12 group-hover:rotate-0 transition-transform duration-300">
                  <Car className="text-white w-8 h-8" />
                </div>
              </Link>
              <h1 className="text-5xl font-black uppercase tracking-tighter">Ro'yxatdan O'tish</h1>
              <p className="text-white/40">RIDELUX oilasiga qo'shiling va imkoniyatlardan foydalaning.</p>
           </div>

           <div className="card-premium p-10 md:p-16 border border-white/10 shadow-2xl relative">
              <form className="grid grid-cols-1 md:grid-cols-2 gap-8" onSubmit={handleSubmit}>
                 
                 <div className="space-y-6">
                    <div className="space-y-2">
                       <label className="text-[10px] text-white/30 uppercase font-black tracking-widest pl-2">Ismingiz</label>
                       <div className="relative">
                          <input 
                            type="text" 
                            className="input-premium py-5 pl-14" 
                            placeholder="Ism..." 
                            required
                            onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                          />
                          <UserCircle className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-white/20" />
                       </div>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] text-white/30 uppercase font-black tracking-widest pl-2">Familiyangiz</label>
                       <input 
                         type="text" 
                         className="input-premium py-5 px-6" 
                         placeholder="Familiya..." 
                         required
                         onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] text-white/30 uppercase font-black tracking-widest pl-2">Elektron pochta</label>
                       <div className="relative">
                          <input 
                            type="email" 
                            className="input-premium py-5 pl-14" 
                            placeholder="Email..." 
                            required
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                          />
                          <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-white/20" />
                       </div>
                    </div>
                 </div>

                 <div className="space-y-6">
                    <div className="space-y-2">
                       <label className="text-[10px] text-white/30 uppercase font-black tracking-widest pl-2">Foydalanuvchi nomi</label>
                       <div className="relative">
                          <input 
                            type="text" 
                            className="input-premium py-5 pl-14" 
                            placeholder="Login..." 
                            required
                            onChange={(e) => setFormData({...formData, username: e.target.value})}
                          />
                          <User className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-white/20" />
                       </div>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] text-white/30 uppercase font-black tracking-widest pl-2">Telefon raqam</label>
                       <div className="relative">
                          <input 
                            type="tel" 
                            className="input-premium py-5 pl-14" 
                            placeholder="+998" 
                            required
                            onChange={(e) => setFormData({...formData, phone: e.target.value})}
                          />
                          <Phone className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-white/20" />
                       </div>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] text-white/30 uppercase font-black tracking-widest pl-2">Parol</label>
                       <div className="relative">
                          <input 
                            type="password" 
                            className="input-premium py-5 pl-14" 
                            placeholder="••••••••" 
                            required
                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                          />
                          <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-white/20" />
                       </div>
                    </div>
                 </div>

                 <div className="md:col-span-2 pt-6">
                    <div className="space-y-2 mb-10">
                       <label className="text-[10px] text-white/30 uppercase font-black tracking-widest pl-2">Parolni tasdiqlash</label>
                       <input 
                         type="password" 
                         className="input-premium py-5 px-6" 
                         placeholder="••••••••" 
                         required
                         onChange={(e) => setFormData({...formData, confirm_password: e.target.value})}
                       />
                    </div>

                    <button className="btn-primary w-full py-6 rounded-[32px] text-lg font-black uppercase tracking-widest flex items-center justify-center gap-4 group">
                       Ro'yxatdan o'tish
                       <ChevronRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                    </button>
                 </div>
              </form>

              <div className="mt-12 text-center">
                 <p className="text-sm text-white/30">
                    Hisobingiz bormi? <br />
                    <Link to="/kirish" className="text-primary font-black uppercase tracking-widest mt-4 inline-block hover:underline">
                      Kirish →
                    </Link>
                 </p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Royxatdan;
