import React, { useState, useEffect } from 'react';
import { User, Heart, Calendar, LogOut, ChevronRight, Settings, Clock, CheckCircle, XCircle, Info, Star } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { formatNarx } from '../utils/formatPrice';
import { DEMO_MASHINALAR } from '../data/mashinalar';
import { BRON_STATUSLARI } from '../data/constants';
import CarCard from '../components/CarCard';

const Kabinet = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('bronlar');
  const [loading, setLoading] = useState(true);

  // Demo data (in real app, fetch from API)
  const myBookings = [
    {
      id: 1,
      car: DEMO_MASHINALAR[0],
      start_date: '2026-04-10',
      end_date: '2026-04-13',
      total_price: 750000,
      status: 'pending',
      created_at: '2026-03-31T12:00:00Z'
    },
    {
      id: 2,
      car: DEMO_MASHINALAR[3],
      start_date: '2026-03-20',
      end_date: '2026-03-22',
      total_price: 300000,
      status: 'completed',
      created_at: '2026-03-15T09:30:00Z'
    }
  ];

  const favorites = DEMO_MASHINALAR.slice(0, 3);

  useEffect(() => {
    setTimeout(() => setLoading(false), 800);
  }, []);

  const getStatusBadge = (status) => {
    const s = BRON_STATUSLARI[status] || { nomi: status, rang: 'gray' };
    const colors = {
      yellow: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
      green: 'bg-green-500/10 text-green-500 border-green-500/20',
      red: 'bg-red-500/10 text-red-500 border-red-500/20',
      gray: 'bg-white/5 text-white/40 border-white/10',
      blue: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    };
    return (
      <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase border tracking-widest ${colors[s.rang]}`}>
        {s.nomi}
      </span>
    );
  };

  return (
    <div className="pt-32 pb-32 min-h-screen">
      <div className="container mx-auto px-6">
        
        <div className="flex flex-col lg:flex-row gap-12">
           
           {/* Sidebar */}
           <aside className="w-full lg:w-80 shrink-0 space-y-8">
              {/* User Profile Card */}
              <div className="card-premium p-10 text-center relative overflow-hidden">
                 <div className="absolute top-0 left-0 w-full h-24 bg-primary/20 -z-10 blur-3xl"></div>
                 <div className="w-24 h-24 bg-white/5 rounded-[32px] mx-auto mb-6 flex items-center justify-center border border-white/10 relative">
                   <User className="w-12 h-12 text-primary" />
                   <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 border-4 border-card-dark rounded-full"></div>
                 </div>
                 <h2 className="text-2xl font-black uppercase tracking-tighter mb-1">
                   {user?.first_name || 'Mijoz'} {user?.last_name || ''}
                 </h2>
                 <p className="text-white/30 text-sm font-medium mb-8">@{user?.username || 'login'}</p>
                 
                 <div className="flex flex-col gap-3">
                   <button 
                     onClick={() => setActiveTab('bronlar')}
                     className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all ${
                       activeTab === 'bronlar' ? 'bg-primary text-white' : 'hover:bg-white/5 text-white/50'
                     }`}
                   >
                     <div className="flex items-center gap-3">
                       <Calendar className="w-5 h-5" />
                       <span className="font-bold">Bronlarim</span>
                     </div>
                     <ChevronRight className="w-4 h-4" />
                   </button>
                   <button 
                     onClick={() => setActiveTab('sevimlilar')}
                     className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all ${
                       activeTab === 'sevimlilar' ? 'bg-primary text-white' : 'hover:bg-white/5 text-white/50'
                     }`}
                   >
                     <div className="flex items-center gap-3">
                       <Heart className="w-5 h-5" />
                       <span className="font-bold">Sevimlilarim</span>
                     </div>
                     <ChevronRight className="w-4 h-4" />
                   </button>
                   <button 
                     onClick={() => setActiveTab('profil')}
                     className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all ${
                       activeTab === 'profil' ? 'bg-primary text-white' : 'hover:bg-white/5 text-white/50'
                     }`}
                   >
                     <div className="flex items-center gap-3">
                       <Settings className="w-5 h-5" />
                       <span className="font-bold">Profilim</span>
                     </div>
                     <ChevronRight className="w-4 h-4" />
                   </button>
                 </div>

                 <div className="h-px bg-white/5 my-8" />

                 <button 
                   onClick={logout}
                   className="w-full flex items-center justify-center gap-3 p-4 rounded-2xl hover:bg-red-500/10 text-red-500 transition-all font-bold"
                 >
                   <LogOut className="w-5 h-5" />
                   Chiqish
                 </button>
              </div>

              {/* Staff/Admin Info */}
              {user?.is_staff && (
                <div className="p-8 bg-primary/10 border border-primary/20 rounded-[40px] text-center">
                  <h3 className="text-primary font-black uppercase text-lg mb-4">Admin Boshqaruvi</h3>
                  <p className="text-white/50 text-sm mb-6">Sizda administrator ruxsati bor. Bronlarni boshqarishga o'ting.</p>
                  <a href="/admin-boshqaruv" className="btn-primary py-3 rounded-2xl text-xs font-black uppercase tracking-widest">
                    O'tish
                  </a>
                </div>
              )}
           </aside>

           {/* Content */}
           <main className="flex-1 min-h-[600px]">
              
              {/* Tab: Bronlar */}
              {activeTab === 'bronlar' && (
                <div className="space-y-10 animate-fade-in">
                   <div className="flex justify-between items-end">
                      <h1 className="text-4xl font-black uppercase tracking-tighter">Mening Bronlarim</h1>
                      <span className="text-white/30 text-sm font-medium uppercase tracking-widest">{myBookings.length} ta umumiy</span>
                   </div>

                   {loading ? (
                     <div className="space-y-6">
                        {[...Array(2)].map((_, i) => <div key={i} className="w-full h-40 bg-white/5 animate-pulse rounded-[32px]" />)}
                     </div>
                   ) : myBookings.length > 0 ? (
                     <div className="space-y-6">
                        {myBookings.map((b) => (
                          <div key={b.id} className="card-premium p-6 md:p-10 flex flex-col md:flex-row gap-8 hover:border-primary/20">
                             <div className="w-full md:w-48 aspect-video md:aspect-square rounded-3xl overflow-hidden shrink-0 shadow-lg">
                                <img src={b.car.rasm} className="w-full h-full object-cover" alt="" />
                             </div>
                             <div className="flex-1 flex flex-col md:flex-row justify-between gap-8">
                                <div className="space-y-4">
                                   <div className="flex items-center gap-3">
                                      <h3 className="text-2xl font-black uppercase tracking-tight">{b.car.brend} {b.car.model}</h3>
                                      {getStatusBadge(b.status)}
                                   </div>
                                   <div className="grid grid-cols-2 gap-8 py-4 border-y border-white/5">
                                      <div>
                                         <p className="text-[10px] text-white/30 uppercase tracking-widest font-black mb-1">Muddati</p>
                                         <p className="font-bold flex items-center gap-2">
                                           <Clock className="w-4 h-4 text-primary" />
                                           {b.start_date} — {b.end_date}
                                         </p>
                                      </div>
                                      <div>
                                         <p className="text-[10px] text-white/30 uppercase tracking-widest font-black mb-1">Jami To'lov</p>
                                         <p className="font-black text-xl text-primary">{formatNarx(b.total_price)}</p>
                                      </div>
                                   </div>
                                   <div className="flex items-center gap-2 text-xs text-white/20">
                                      <Info className="w-3 h-3" />
                                      ID: {b.id.toString().padStart(5, '0')} | Band qilingan sana: {new Date(b.created_at).toLocaleDateString()}
                                   </div>
                                </div>
                                <div className="flex flex-col gap-3 justify-center shrink-0 min-w-40">
                                   <a href={`/mashina/${b.car.id}`} className="btn-secondary py-3 rounded-2xl text-xs font-black uppercase tracking-widest">Batafsil</a>
                                   {b.status === 'pending' && (
                                     <button className="py-3 px-6 rounded-2xl border border-red-500/20 text-red-500 hover:bg-red-500/10 transition-all text-xs font-black uppercase tracking-widest">Bekor qilish</button>
                                   )}
                                </div>
                             </div>
                          </div>
                        ))}
                     </div>
                   ) : (
                     <div className="card-premium p-20 text-center flex flex-col items-center">
                        <Calendar className="w-16 h-16 text-white/10 mb-8" />
                        <h3 className="text-2xl font-black uppercase tracking-tighter mb-2">Hali hech narsa yo'q</h3>
                        <p className="text-white/30 mb-8 max-w-sm">Siz hali birorta ham mashina band qilmadingiz. Sayohatni hoziroq masinani tanlashdan boshlang!</p>
                        <a href="/mashinalar" className="btn-primary">Mashina qidirish</a>
                     </div>
                   )}
                </div>
              )}

              {/* Tab: Sevimlilar */}
              {activeTab === 'sevimlilar' && (
                 <div className="space-y-10 animate-fade-in">
                    <div className="flex justify-between items-end">
                       <h1 className="text-4xl font-black uppercase tracking-tighter">Sevimlilarim</h1>
                       <span className="text-white/30 text-sm font-medium uppercase tracking-widest">{favorites.length} ta mashina</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       {favorites.map(car => <CarCard key={car.id} car={car} />)}
                    </div>
                 </div>
              )}

              {/* Tab: Profil */}
              {activeTab === 'profil' && (
                 <div className="space-y-10 animate-fade-in max-w-2xl">
                    <h1 className="text-4xl font-black uppercase tracking-tighter">Profil Ma'lumotlari</h1>
                    
                    <div className="card-premium p-10 space-y-10">
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="space-y-2">
                             <label className="text-[10px] text-white/30 uppercase tracking-widest font-black pl-2">Ismingiz</label>
                             <input type="text" value={user?.first_name || ''} className="input-premium py-4" placeholder="Kiriting..." />
                          </div>
                          <div className="space-y-2">
                             <label className="text-[10px] text-white/30 uppercase tracking-widest font-black pl-2">Familiyangiz</label>
                             <input type="text" value={user?.last_name || ''} className="input-premium py-4" placeholder="Kiriting..." />
                          </div>
                       </div>

                       <div className="space-y-2">
                          <label className="text-[10px] text-white/30 uppercase tracking-widest font-black pl-2">Elektron pochta</label>
                          <input type="email" value={user?.email || ''} readOnly className="input-premium py-4 opacity-50 cursor-not-allowed" />
                          <p className="text-[10px] text-primary mt-1 font-bold">Elektron pochtani o'zgartirish uchun biz bilan bog'laning.</p>
                       </div>

                       <div className="space-y-2">
                          <label className="text-[10px] text-white/30 uppercase tracking-widest font-black pl-2">Telefon raqam</label>
                          <input type="tel" value={user?.phone || '+998 '} className="input-premium py-4" placeholder="+998" />
                       </div>

                       <div className="h-px bg-white/5" />

                       <div className="flex gap-4 pt-4">
                          <button className="btn-primary px-10 py-5 rounded-3xl font-black uppercase text-sm tracking-widest">
                            Saqlash
                          </button>
                          <button className="btn-secondary px-10 py-5 rounded-3xl font-black uppercase text-sm tracking-widest">
                            Parolni yangilash
                          </button>
                       </div>
                    </div>
                 </div>
              )}

           </main>

        </div>

      </div>
    </div>
  );
};

export default Kabinet;
