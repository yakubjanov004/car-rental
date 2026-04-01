import React, { useState, useEffect } from 'react';
import { User, Heart, Calendar, LogOut, ChevronRight, Settings, Clock, CheckCircle, XCircle, Info, Star, CreditCard, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { formatNarx } from '../utils/formatPrice';
// import { DEMO_MASHINALAR } from '../data/cars';
import { BRON_STATUSLARI } from '../data/constants';
import CarCard from '../components/CarCard';
import ScrollReveal from '../components/ScrollReveal';

const Profile = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('bronlar');
  const [loading, setLoading] = useState(true);

  // Demo bookings
  // Bookings and favorites should be fetched from API
  const [myBookings, setMyBookings] = useState([]);
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    setTimeout(() => setLoading(false), 600);
  }, []);

  const getStatusBadge = (status) => {
    const s = BRON_STATUSLARI[status] || { nomi: status, rang: 'gray' };
    const styles = {
      yellow: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
      green: 'bg-green-500/10 text-green-500 border-green-500/20',
      red: 'bg-red-500/10 text-red-500 border-red-500/20',
      gray: 'bg-white/5 text-white/40 border-white/10',
      blue: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    };
    return (
      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase border tracking-widest ${styles[s.rang]}`}>
        {s.nomi}
      </span>
    );
  };

  return (
    <div className="bg-[#0A0A0A] min-h-screen pt-32 pb-32 px-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-16">
          <ScrollReveal direction="up">
            <h1 className="font-display text-4xl md:text-6xl font-extrabold tracking-tighter mb-4">Shaxsiy <span className="text-white/40 italic">Profil</span></h1>
            <p className="text-white/40 text-sm font-medium">Barcha buyurtmalaringiz va sevimlilar bitta joyda.</p>
          </ScrollReveal>
        </div>

        <div className="grid lg:grid-cols-12 gap-12 items-start">
           
           {/* Sidebar */}
           <aside className="lg:col-span-3 space-y-8">
              <ScrollReveal direction="left">
                <div className="glass p-8 relative overflow-hidden border-white/10">
                   <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 blur-[40px] pointer-events-none" />
                   
                   <div className="flex flex-col items-center text-center mb-10">
                      <div className="w-20 h-20 rounded-[24px] bg-white/5 border border-white/10 flex items-center justify-center mb-4 group relative">
                         <User className="w-10 h-10 text-primary" />
                         <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-4 border-[#111] rounded-full" />
                      </div>
                      <h3 className="font-bold text-xl mb-1">{user?.first_name || 'Mijoz'} {user?.last_name || ''}</h3>
                      <p className="text-[10px] text-white/30 uppercase font-black tracking-widest">Premium Foydalanuvchi</p>
                   </div>

                   <nav className="space-y-2">
                      {[
                        { id: 'bronlar', label: 'Buyurtmalarim', icon: Calendar },
                        { id: 'sevimlilar', label: 'Sevimlilar', icon: Heart },
                        { id: 'profil', label: 'Sozlamalar', icon: Settings },
                      ].map(item => (
                        <button 
                          key={item.id}
                          onClick={() => setActiveTab(item.id)}
                          className={`w-full flex items-center gap-3 p-4 rounded-2xl transition-all text-sm font-bold ${
                            activeTab === item.id ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-white/40 hover:bg-white/5 hover:text-white'
                          }`}
                        >
                          <item.icon className="w-4 h-4" />
                          {item.label}
                        </button>
                      ))}
                      <div className="h-px bg-white/5 my-4" />
                      <button 
                        onClick={logout}
                        className="w-full flex items-center gap-3 p-4 rounded-2xl text-red-500/60 hover:bg-red-500/10 hover:text-red-500 transition-all text-sm font-bold"
                      >
                        <LogOut className="w-4 h-4" />
                        Chiqish
                      </button>
                   </nav>
                </div>

                {/* Promotional banner */}
                <div className="mt-8 p-8 rounded-[32px] bg-primary/5 border border-primary/20 relative overflow-hidden group">
                   <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-primary/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
                   <ShieldCheck className="w-10 h-10 text-primary mb-4" />
                   <h4 className="font-bold text-sm mb-2">Sizda 5% chegirma bor!</h4>
                   <p className="text-[10px] text-white/40 leading-relaxed capitalize">Keyingi elektromobil ijarasi uchun promo-koddan foydalaning.</p>
                </div>
              </ScrollReveal>
           </aside>

           {/* Content */}
           <main className="lg:col-span-9 min-h-[600px]">
              <AnimatePresence mode="wait">
                 {activeTab === 'bronlar' && (
                    <motion.div 
                      key="bronlar"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-8"
                    >
                       <div className="flex justify-between items-center mb-4">
                          <h2 className="text-2xl font-bold tracking-tight">Buyurtmalarim</h2>
                          <div className="text-[10px] text-white/20 uppercase font-black font-display tracking-widest">Jami {myBookings.length} ta</div>
                       </div>

                       {loading ? (
                          <div className="space-y-6">
                             {[1, 2].map(i => <div key={i} className="w-full h-40 bg-white/5 animate-pulse rounded-[32px] border border-white/5" />)}
                          </div>
                       ) : myBookings.length > 0 ? (
                          <div className="space-y-6">
                             {myBookings.map(b => (
                                <div key={b.id} className="glass p-6 md:p-8 flex flex-col md:flex-row gap-8 items-center border-white/10 hover:border-primary/20 transition-all group shadow-xl">
                                   <div className="w-full md:w-56 aspect-[16/10] rounded-2xl overflow-hidden border border-white/5 shrink-0 bg-[#111]">
                                      <img src={b.car.rasm} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                                   </div>
                                   <div className="flex-1 space-y-6 w-full">
                                      <div className="flex justify-between items-start">
                                         <div>
                                            <h3 className="text-xl font-bold mb-1">{b.car.brend} {b.car.model}</h3>
                                            <div className="text-[10px] text-white/30 uppercase font-black tracking-widest">ID #{b.id.toString().padStart(6, '0')}</div>
                                         </div>
                                         {getStatusBadge(b.status)}
                                      </div>
                                      
                                      <div className="grid grid-cols-2 md:grid-cols-3 gap-6 pt-6 border-t border-white/5">
                                         <div>
                                            <div className="text-[10px] text-white/30 uppercase font-black tracking-widest mb-1.5 flex items-center gap-1">
                                               <Calendar className="w-3 h-3" /> Muddat
                                            </div>
                                            <div className="text-xs font-bold text-white/80">{b.start_date} — {b.end_date}</div>
                                         </div>
                                         <div>
                                            <div className="text-[10px] text-white/30 uppercase font-black tracking-widest mb-1.5 flex items-center gap-1">
                                               <CreditCard className="w-3 h-3" /> Umumiy To'lov
                                            </div>
                                            <div className="text-xs font-bold text-primary">{formatNarx(b.total_price)}</div>
                                         </div>
                                      </div>
                                   </div>
                                   <div className="shrink-0 flex md:flex-col gap-3 w-full md:w-auto">
                                      <a href={`/car/${b.car.id}`} className="btn-secondary flex-1 py-3 px-8 text-[10px] font-bold">Batafsil</a>
                                      {b.status === 'pending' && <button className="flex-1 py-3 px-8 rounded-xl border border-red-500/20 text-red-500/60 hover:bg-red-500/10 hover:text-red-500 transition-all text-[10px] font-bold uppercase">Bekor qilish</button>}
                                   </div>
                                </div>
                             ))}
                          </div>
                       ) : (
                          <div className="glass p-20 flex flex-col items-center text-center opacity-50">
                             <Calendar className="w-16 h-16 mb-6 text-white/10" />
                             <h3 className="text-xl font-bold mb-2">Buyurtmalar hali yo'q</h3>
                             <p className="text-xs font-light max-w-sm mb-8">Siz hali hech qanday mashina bron qilmadingiz. Sayohatni bugun boshlang!</p>
                             <a href="/fleet" className="btn-primary px-10">MASHINALARNI KO'RISH</a>
                          </div>
                       )}
                    </motion.div>
                 )}

                 {activeTab === 'sevimlilar' && (
                    <motion.div 
                      key="sevimlilar"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                    >
                       <h2 className="text-2xl font-bold tracking-tight mb-8">Sevimlilar</h2>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          {favorites.map((car, i) => <CarCard key={car.id} car={car} index={i} />)}
                       </div>
                    </motion.div>
                 )}

                 {activeTab === 'profil' && (
                    <motion.div 
                      key="profil"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="max-w-2xl"
                    >
                       <h2 className="text-2xl font-bold tracking-tight mb-8">Profil Sozlamalari</h2>
                       <div className="glass p-10 space-y-10 border-white/10">
                          <div className="grid md:grid-cols-2 gap-8">
                             <div className="space-y-2">
                                <label className="text-[10px] text-white/30 uppercase font-black tracking-widest ml-1">Ism</label>
                                <input type="text" defaultValue={user?.first_name} className="w-full bg-[#111] border border-white/5 rounded-2xl py-4 px-4 text-sm focus:border-primary/50 outline-none" />
                             </div>
                             <div className="space-y-2">
                                <label className="text-[10px] text-white/30 uppercase font-black tracking-widest ml-1">Familiya</label>
                                <input type="text" defaultValue={user?.last_name} className="w-full bg-[#111] border border-white/5 rounded-2xl py-4 px-4 text-sm focus:border-primary/50 outline-none" />
                             </div>
                          </div>
                          <div className="space-y-2">
                             <label className="text-[10px] text-white/30 uppercase font-black tracking-widest ml-1">Email Manzil</label>
                             <input type="email" defaultValue={user?.email} readOnly className="w-full bg-white/[0.02] border border-white/5 rounded-2xl py-4 px-4 text-sm text-white/40 cursor-not-allowed outline-none" />
                          </div>
                          <div className="space-y-2">
                             <label className="text-[10px] text-white/30 uppercase font-black tracking-widest ml-1">Telefon Raqam</label>
                             <input type="tel" defaultValue={user?.phone || '+998'} className="w-full bg-[#111] border border-white/5 rounded-2xl py-4 px-4 text-sm focus:border-primary/50 outline-none" />
                          </div>
                          <div className="pt-6 border-t border-white/5 flex gap-4">
                             <button className="btn-primary px-10 py-4 text-xs font-bold">O'ZGARISHLARNI SAQLASH</button>
                             <button className="btn-secondary px-10 py-4 text-xs font-bold">PAROLNI O'ZGARTIRISH</button>
                          </div>
                       </div>
                    </motion.div>
                 )}
              </AnimatePresence>
           </main>
        </div>
      </div>
    </div>
  );
};

export default Profile;
