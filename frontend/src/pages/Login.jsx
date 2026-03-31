import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { User, Lock, ArrowRight, Eye, EyeOff, ShieldCheck, Mail } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await login(username, password);
      navigate('/dashboard');
    } catch (err) {
      setError('Username yoki parol noto\'g\'ri');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#121212] px-[8%] py-24">
      <div className="grid grid-cols-1 lg:grid-cols-2 max-w-7xl w-full bg-[#1e1f22] rounded-[40px] overflow-hidden shadow-2xl border border-gray-800">
        
        {/* Right Side: Form (Flipped for variety from Register) */}
        <div className="p-10 lg:p-20 relative order-2 lg:order-1">
          <div className="absolute top-0 left-0 w-40 h-40 bg-red-600/5 blur-[80px] rounded-full"></div>
          
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
            <div className="flex items-center gap-4 mb-10">
                <div className="bg-red-600/10 p-4 rounded-2xl border border-red-600/20"><ShieldCheck className="text-red-600" size={24} /></div>
                <div>
                   <h2 className="text-3xl font-black text-white bricolage-font uppercase tracking-tighter leading-none">Safe Access</h2>
                   <p className="text-gray-500 font-bold text-[10px] uppercase tracking-widest mt-1">Authorized Entry Only</p>
                </div>
            </div>

            <h3 className="text-4xl font-black text-white bricolage-font uppercase tracking-tighter mb-12">Welcome <br /><span className="text-red-600">Back.</span></h3>

            <AnimatePresence>
                {error && (
                    <motion.p initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="text-red-500 mb-8 text-xs font-bold text-center bg-red-600/10 py-4 rounded-2xl border border-red-600/20 px-6">{error}</motion.p>
                )}
            </AnimatePresence>
            
            <form onSubmit={handleSubmit} className="space-y-8">
              <div>
                <label className="block text-gray-600 text-[10px] font-black uppercase tracking-widest mb-4">Username</label>
                <div className="relative group">
                    <User className="absolute left-6 top-1/2 -translate-y-1/2 text-red-600 group-focus-within:scale-110 transition-all" size={18} />
                    <input
                        type="text"
                        placeholder="yourname"
                        className="w-full pl-16 pr-6 py-5 rounded-[22px] bg-[#121212] text-white border border-gray-700 focus:border-red-600 transition-all font-bold text-sm outline-none"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-4">
                    <label className="block text-gray-600 text-[10px] font-black uppercase tracking-widest">Secret Key</label>
                    <button type="button" className="text-[10px] font-bold text-gray-600 hover:text-red-600 transition-all uppercase tracking-widest">Forgot Pass?</button>
                </div>
                <div className="relative group">
                    <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-red-600 group-focus-within:scale-110 transition-all" size={18} />
                    <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        className="w-full pl-16 pr-16 py-5 rounded-[22px] bg-[#121212] text-white border border-gray-700 focus:border-red-600 transition-all font-bold text-sm outline-none"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-600 hover:text-white transition-all">
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-red-600 hover:bg-white hover:text-black text-white font-black py-6 rounded-[22px] transition-all shadow-xl shadow-red-600/30 uppercase tracking-[5px] text-xs disabled:opacity-50 active:scale-[0.98] flex items-center justify-center gap-4 mt-12"
              >
                {isSubmitting ? 'Verifying...' : 'Access My Account'} <ArrowRight size={14} />
              </button>
            </form>
            
            <p className="mt-12 text-center text-gray-500 text-xs font-bold uppercase tracking-widest">
              Yangi foydalanuvchimi? <Link to="/register" className="text-red-600 hover:underline decoration-red-600/30 underline-offset-8">Join the Fleet →</Link>
            </p>
          </motion.div>
        </div>

        {/* Left Side: Brand Imagery */}
        <div className="hidden lg:block relative overflow-hidden group order-1 lg:order-2">
            <img 
               src="/Image/login-hero.jpg" 
               alt="Luxury Car Interior" 
               className="h-full w-full object-cover transition-transform duration-[20000ms] scale-110 group-hover:scale-125" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-red-600/60 via-black/40 to-transparent"></div>
            <div className="absolute top-12 right-12 text-right">
                <div className="bg-white/10 backdrop-blur-md px-6 py-2 rounded-[20px] border border-white/20 inline-block">
                    <p className="text-white text-[10px] font-black uppercase tracking-widest">Global Authentication</p>
                </div>
            </div>
            <div className="absolute bottom-12 right-12 text-right">
                <h2 className="text-6xl font-black text-white bricolage-font uppercase tracking-tighter leading-none mb-6">Master <br /><span className="text-red-600">The Road.</span></h2>
                <p className="text-white/80 font-medium max-w-xs text-sm leading-relaxed mb-6 ml-auto">Log in to resume your exclusive rental journeys and manage your premium bookings.</p>
                <div className="flex gap-4 justify-end">
                    <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20"><Mail className="text-white" size={18} /></div>
                    <p className="text-white text-xs font-bold self-center uppercase tracking-widest">24/7 Digital Support</p>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
