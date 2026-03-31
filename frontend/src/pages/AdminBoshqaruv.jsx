import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Car, Calendar, MessageSquare, Plus, Edit2, Trash2, CheckCircle2, XCircle, Search, TrendingUp, Users, DollarSign, Filter, RefreshCcw } from 'lucide-react';
import { DEMO_MASHINALAR } from '../data/mashinalar';
import { formatNarx } from '../utils/formatPrice';
import { useAuth } from '../hooks/useAuth';
import Skeleton from '../components/Skeleton';

const AdminBoshqaruv = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('stats');
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Example stats
  const stats = {
    total_bookings: 142,
    active_cars: 12,
    unread_messages: 5,
    today_revenue: 3450000,
    growth: '+12.5%'
  };

  useEffect(() => {
     // Check permissions
     // if (!user?.is_staff) navigate('/');
     setTimeout(() => setLoading(false), 1000);
  }, []);

  return (
    <div className="pt-32 pb-32 min-h-screen">
      <div className="container mx-auto px-6">
        
        <div className="flex flex-col lg:flex-row gap-12">
           
           {/* Sidebar */}
           <aside className="w-full lg:w-80 shrink-0 space-y-8">
              <div className="card-premium p-10 space-y-4">
                 <h2 className="text-2xl font-black uppercase tracking-tighter mb-8 flex items-center gap-3">
                   <LayoutDashboard className="text-primary w-7 h-7" /> Admin
                 </h2>
                 
                 {[
                   { id: 'stats', icon: <TrendingUp />, label: "Statistika" },
                   { id: 'bronlar', icon: <Calendar />, label: "Bronlar" },
                   { id: 'mashinalar', icon: <Car />, label: "Mashinalar" },
                   { id: 'xabarlar', icon: <MessageSquare />, label: "Xabarlar" },
                 ].map(tab => (
                   <button 
                     key={tab.id}
                     onClick={() => setActiveTab(tab.id)}
                     className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all font-bold ${
                       activeTab === tab.id ? 'bg-primary text-white shadow-xl shadow-primary/20' : 'hover:bg-white/5 text-white/50'
                     }`}
                   >
                     <div className="w-6">{tab.icon}</div>
                     <span>{tab.label}</span>
                   </button>
                 ))}
                 
                 <div className="h-px bg-white/5 my-6" />
                 
                 <a href="/" className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-white/5 text-white/30 transition-all text-xs uppercase font-black tracking-widest leading-none">
                    <Edit2 className="w-4 h-4" /> Saytga qaytish
                 </a>
              </div>
           </aside>

           {/* Content Area */}
           <main className="flex-1 space-y-12">
              
              {/* Tab: Stats */}
              {activeTab === 'stats' && (
                <div className="space-y-12 animate-fade-in">
                   <h1 className="text-4xl font-black uppercase tracking-tighter">Umumiy Statistika</h1>
                   
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                      {[
                        { label: 'Jami Bronlar', value: stats.total_bookings, icon: <Calendar />, color: 'blue' },
                        { label: 'Faol Mashinalar', value: stats.active_cars, icon: <Car />, color: 'green' },
                        { label: 'Bugungi tushum', value: formatNarx(stats.today_revenue), icon: <DollarSign />, color: 'primary' },
                        { label: 'Yangi xabarlar', value: stats.unread_messages, icon: <MessageSquare />, color: 'yellow' },
                      ].map((s, i) => (
                        <div key={i} className="card-premium p-10 space-y-6 relative overflow-hidden group">
                           <div className={`absolute -right-4 -top-4 w-24 h-24 bg-${s.color === 'primary' ? 'primary' : s.color + '-500'}/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700`}></div>
                           <div className={`w-14 h-14 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-${s.color === 'primary' ? 'primary' : s.color + '-500'}`}>
                              {s.icon}
                           </div>
                           <div>
                              <p className="text-[10px] text-white/30 uppercase tracking-widest font-black mb-1">{s.label}</p>
                              <p className="text-3xl font-black">{s.value}</p>
                           </div>
                        </div>
                      ))}
                   </div>
                </div>
              )}

              {/* Tab: Bronlar */}
              {activeTab === 'bronlar' && (
                 <div className="space-y-10 animate-fade-in">
                    <div className="flex justify-between items-end">
                       <h1 className="text-4xl font-black uppercase tracking-tighter">Bronlarni Boshqarish</h1>
                       <div className="flex gap-4">
                          <button className="btn-secondary px-4 py-3"><Filter className="w-5 h-5" /></button>
                          <button className="btn-secondary px-4 py-3"><RefreshCcw className="w-5 h-5" /></button>
                       </div>
                    </div>

                    <div className="card-premium overflow-x-auto bg-card-dark border border-white/10 p-4">
                       <table className="w-full text-left">
                          <thead className="text-[10px] uppercase font-black tracking-widest text-white/30 border-b border-white/5">
                             <tr>
                                <th className="p-6">Mashina</th>
                                <th className="p-6">Mijoz / Tel</th>
                                <th className="p-6">Sana</th>
                                <th className="p-6">Summa</th>
                                <th className="p-6">Status</th>
                                <th className="p-6">Harakat</th>
                             </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                             {[...Array(5)].map((_, i) => (
                               <tr key={i} className="hover:bg-white/5 transition-colors group">
                                  <td className="p-6">
                                     <div className="flex items-center gap-4">
                                        <div className="w-16 h-12 bg-white/10 rounded-xl overflow-hidden shrink-0">
                                           <img src={DEMO_MASHINALAR[i % 5].rasm} className="w-full h-full object-cover" alt="" />
                                        </div>
                                        <p className="font-bold">{DEMO_MASHINALAR[i % 5].model}</p>
                                     </div>
                                  </td>
                                  <td className="p-6">
                                     <p className="font-bold">Mijoz Ismi</p>
                                     <p className="text-xs text-white/30">+998 90 123 45 67</p>
                                  </td>
                                  <td className="p-6">
                                     <p className="font-bold">12.04 — 15.04</p>
                                     <p className="text-xs text-white/30">3 kun</p>
                                  </td>
                                  <td className="p-6 font-black text-primary">850 000</td>
                                  <td className="p-6">
                                     <span className="px-3 py-1.5 rounded-full bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 text-[10px] font-black uppercase">Kutilmoqda</span>
                                  </td>
                                  <td className="p-6">
                                     <div className="flex gap-2">
                                        <button className="p-3 bg-green-500/10 text-green-500 rounded-xl hover:bg-green-500 hover:text-white transition-all"><CheckCircle2 className="w-5 h-5" /></button>
                                        <button className="p-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"><XCircle className="w-5 h-5" /></button>
                                     </div>
                                  </td>
                               </tr>
                             ))}
                          </tbody>
                       </table>
                    </div>
                 </div>
              )}

              {/* Tab: Mashinalar */}
              {activeTab === 'mashinalar' && (
                 <div className="space-y-10 animate-fade-in">
                    <div className="flex justify-between items-center">
                       <h1 className="text-4xl font-black uppercase tracking-tighter">Mashinalar Bazasi</h1>
                       <button className="btn-primary flex items-center gap-3 py-4 rounded-3xl">
                          <Plus className="w-6 h-6" />
                          Yangi mashina qo'shish
                       </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                       {DEMO_MASHINALAR.map(car => (
                         <div key={car.id} className="card-premium group relative">
                            <img src={car.rasm} className="w-full aspect-video object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-700" alt="" />
                            <div className="p-6 space-y-4">
                               <div className="flex justify-between items-start">
                                  <h3 className="text-xl font-bold">{car.brend} {car.model}</h3>
                                  <p className="text-primary font-black uppercase text-sm">{formatNarx(car.kunlik_narx)}</p>
                               </div>
                               <div className="flex gap-2">
                                  <button className="flex-1 btn-secondary py-3 text-xs font-black uppercase tracking-widest"><Edit2 className="w-4 h-4" /> Tahrirlash</button>
                                  <button className="p-4 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all rounded-2xl"><Trash2 className="w-5 h-5" /></button>
                               </div>
                            </div>
                         </div>
                       ))}
                    </div>
                 </div>
              )}

           </main>

        </div>

      </div>
    </div>
  );
};

export default AdminBoshqaruv;
