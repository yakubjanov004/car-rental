import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import apiClient from '../services/api/apiClient';
import { User, Mail, Lock, UserPlus, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const registerSchema = z.object({
  first_name: z.string().min(2, "Ism kamida 2 ta harfdan iborat bo'lishi kerak"),
  last_name: z.string().min(2, "Familiya kamida 2 ta harfdan iborat bo'lishi kerak"),
  username: z.string().min(4, "Username kamida 4 ta harfdan iborat bo'lishi kerak"),
  email: z.string().email("Email formatini tekshiring"),
  password: z.string().min(8, "Parol kamida 8 ta belgidan iborat bo'lishi kerak"),
});

const Register = () => {
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data) => {
    try {
      await apiClient.post('/auth/register/', data);
      navigate('/login');
    } catch (err) {
      if (err.response?.data?.username) {
        setError('Bu username allaqachon mavjud');
      } else {
        setError('Xatolik yuz berdi. Iltimos qaytadan urinib ko\'ring.');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#121212] px-[8%] py-24">
      <div className="grid grid-cols-1 lg:grid-cols-2 max-w-7xl w-full bg-[#1e1f22] rounded-[40px] overflow-hidden shadow-2xl border border-gray-800">
        
        {/* Left Side: Brand Imagery */}
        <div className="hidden lg:block relative overflow-hidden group">
            <img 
               src="/Image/register-hero.jpg" 
               alt="Luxury Car" 
               className="h-full w-full object-cover transition-transform duration-[20000ms] scale-110 group-hover:scale-125" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-red-600/60 via-black/40 to-transparent"></div>
            <div className="absolute bottom-12 left-12">
                <h2 className="text-6xl font-black text-white bricolage-font uppercase tracking-tighter leading-none mb-6">Join the <br /><span className="text-red-600">Circle.</span></h2>
                <p className="text-white/80 font-medium max-w-xs text-sm leading-relaxed mb-10">Access Uzbekistan's most exclusive fleet and enjoy personalized experiences on every drive.</p>
                <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20"><UserPlus className="text-white" size={18} /></div>
                    <p className="text-white text-xs font-bold self-center uppercase tracking-widest">Premium Membership</p>
                </div>
            </div>
        </div>

        {/* Right Side: Form */}
        <div className="p-10 lg:p-20 relative">
          <div className="absolute top-0 right-0 w-40 h-40 bg-red-600/5 blur-[80px] rounded-full"></div>
          
          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
            <h2 className="text-3xl font-black text-white bricolage-font uppercase tracking-tighter mb-4">Create Account</h2>
            <p className="text-gray-500 font-bold text-[10px] uppercase tracking-widest mb-10 pb-6 border-b border-gray-800">Enter your details to register</p>

            <AnimatePresence>
                {error && (
                    <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="text-red-500 mb-6 text-xs font-bold text-center bg-red-600/10 py-3 rounded-xl border border-red-600/20">{error}</motion.p>
                )}
            </AnimatePresence>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-600 text-[10px] font-black uppercase tracking-widest mb-3">Ism</label>
                  <input
                    {...register('first_name')}
                    placeholder="Asadbek"
                    className={`w-full px-6 py-4 rounded-2xl bg-[#121212] text-white border transition-all font-bold text-sm outline-none ${errors.first_name ? 'border-red-600' : 'border-gray-700 focus:border-red-600'}`}
                  />
                  {errors.first_name && <p className="text-red-500 text-[10px] mt-2 font-bold">{errors.first_name.message}</p>}
                </div>
                <div>
                  <label className="block text-gray-600 text-[10px] font-black uppercase tracking-widest mb-3">Familiya</label>
                  <input
                    {...register('last_name')}
                    placeholder="Akramov"
                    className={`w-full px-6 py-4 rounded-2xl bg-[#121212] text-white border transition-all font-bold text-sm outline-none ${errors.last_name ? 'border-red-600' : 'border-gray-700 focus:border-red-600'}`}
                  />
                  {errors.last_name && <p className="text-red-500 text-[10px] mt-2 font-bold">{errors.last_name.message}</p>}
                </div>
              </div>

              <div>
                <label className="block text-gray-600 text-[10px] font-black uppercase tracking-widest mb-3">Identifikator (Username)</label>
                <div className="relative group">
                    <User className="absolute left-6 top-1/2 -translate-y-1/2 text-red-600 group-focus-within:scale-110 transition-all" size={18} />
                    <input
                    {...register('username')}
                    placeholder="username123"
                    className={`w-full pl-14 pr-6 py-4 rounded-2xl bg-[#121212] text-white border transition-all font-bold text-sm outline-none ${errors.username ? 'border-red-600' : 'border-gray-700 focus:border-red-600'}`}
                    />
                </div>
                {errors.username && <p className="text-red-500 text-[10px] mt-2 font-bold">{errors.username.message}</p>}
              </div>

              <div>
                <label className="block text-gray-600 text-[10px] font-black uppercase tracking-widest mb-3">Elektron Pochta</label>
                <div className="relative group">
                    <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-red-600 group-focus-within:scale-110 transition-all" size={18} />
                    <input
                    {...register('email')}
                    placeholder="email@example.com"
                    className={`w-full pl-14 pr-6 py-4 rounded-2xl bg-[#121212] text-white border transition-all font-bold text-sm outline-none ${errors.email ? 'border-red-600' : 'border-gray-700 focus:border-red-600'}`}
                    />
                </div>
                {errors.email && <p className="text-red-500 text-[10px] mt-2 font-bold">{errors.email.message}</p>}
              </div>

              <div>
                <label className="block text-gray-600 text-[10px] font-black uppercase tracking-widest mb-3">Xavfsiz Parol</label>
                <div className="relative group">
                    <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-red-600 group-focus-within:scale-110 transition-all" size={18} />
                    <input
                        {...register('password')}
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        className={`w-full pl-14 pr-16 py-4 rounded-2xl bg-[#121212] text-white border transition-all font-bold text-sm outline-none ${errors.password ? 'border-red-600' : 'border-gray-700 focus:border-red-600'}`}
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-600 hover:text-white transition-all">
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                </div>
                {errors.password && <p className="text-red-500 text-[10px] mt-2 font-bold">{errors.password.message}</p>}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-red-600 hover:bg-white hover:text-black text-white font-black py-5 rounded-[22px] transition-all shadow-xl shadow-red-600/20 uppercase tracking-[4px] text-xs disabled:opacity-50 active:scale-[0.98] flex items-center justify-center gap-3 mt-10"
              >
                {isSubmitting ? 'Shakllantirilmoqda...' : 'Create Account'} <ArrowRight size={14} />
              </button>
            </form>
            
            <p className="mt-12 text-center text-gray-500 text-xs font-bold uppercase tracking-widest">
              Hisobingiz bormi? <Link to="/login" className="text-red-600 hover:underline decoration-red-600/30 underline-offset-8">Sign In Now</Link>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Register;
