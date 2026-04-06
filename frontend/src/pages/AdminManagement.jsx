import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Car, Calendar, MessageSquare, Plus, Edit2, Trash2, 
  CheckCircle2, XCircle, Search, TrendingUp, Users, DollarSign, Filter, 
  RefreshCcw, ArrowRight, Activity, BarChart3, Settings
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatNarx } from '../utils/formatPrice';
import { useAuth } from '../context/AuthContext';
import ScrollReveal from '../components/ScrollReveal';

const AdminManagement = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('stats');
  const [loading, setLoading] = useState(true);

  const statsArr = [
    { label: 'Jami buyurtmalar', value: '142', icon: Calendar, color: '#3B82F6' },
    { label: 'Faol mashinalar', value: '12', icon: Car, color: '#00D97E' },
    { label: 'Kungi daromad', value: '3.4M', icon: DollarSign, color: '#F59E0B' },
    { label: 'Yangi xabarlar', value: '5', icon: MessageSquare, color: '#EF4444' },
  ];

  useEffect(() => {
    setTimeout(() => setLoading(false), 800);
  }, []);

  return (
    <div className="bg-[#0A0A0A] min-h-screen pt-32 pb-32 px-6 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-16">
          <ScrollReveal direction="left">
            <h1 className="font-display text-4xl md:text-5xl font-extrabold tracking-tighter">Admin <span className="text-white/40 italic">Paneli</span></h1>
            <p className="text-white/40 text-sm font-medium">Platformani to'liq boshqarish va nazorat qilish.</p>
          </ScrollReveal>
          <ScrollReveal direction="right">
            <div className="flex gap-3">
              <button className="btn-secondary py-3 px-6 text-[10px] font-bold">Hisobot yuklash</button>
              <button className="btn-primary py-3 px-6 text-[10px] font-bold flex items-center gap-2">
                <Plus className="w-3.5 h-3.5" />
                Yangi mashina
              </button>
            </div>
          </ScrollReveal>
        </div>

        <div className="grid lg:grid-cols-12 gap-12 items-start">
           
           {/* Sidebar */}
           <aside className="lg:col-span-3">
              <ScrollReveal direction="left">
                <div className="glass p-8 border-white/10 space-y-2">
                   {[
                     { id: 'stats', label: 'Boshqaruv', icon: Activity },
                     { id: 'bronlar', label: 'Buyurtmalar', icon: Calendar },
                     { id: 'mashinalar', label: 'Mashinalar', icon: Car },
                     { id: 'messages', label: 'Xabarlar', icon: MessageSquare },
                     { id: 'settings', label: 'Sozlamalar', icon: Settings },
                   ].map(item => (
                     <button 
                       key={item.id}
                       onClick={() => setActiveTab(item.id)}
                       className={`w-full flex items-center gap-3 p-4 rounded-xl transition-all text-sm font-bold ${
                         activeTab === item.id ? 'bg-primary text-white' : 'text-white/40 hover:bg-white/5 hover:text-white'
                       }`}
                     >
                       <item.icon className="w-4 h-4" />
                       {item.label}
                     </button>
                   ))}
                </div>
              </ScrollReveal>
           </aside>

           {/* Main Content */}
           <main className="lg:col-span-9">
              <AnimatePresence mode="wait">
                 {activeTab === 'stats' && (
                    <motion.div 
                      key="stats"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="space-y-12"
                    >
                       {/* Stats Cards */}
                       <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                          {statsArr.map((s, i) => (
                             <div key={i} className="glass p-8 flex flex-col items-center text-center group hover:border-primary/20">
                                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mb-4 transition-transform group-hover:scale-110">
                                   <s.icon className="w-4 h-4" style={{ color: s.color }} />
                                </div>
                                <div className="text-[10px] text-white/30 uppercase font-black tracking-widest mb-1">{s.label}</div>
                                <div className="text-2xl font-display font-extrabold" style={{ color: s.color }}>{s.value}</div>
                             </div>
                          ))}
                       </div>

                       {/* Large Chart Placeholder */}
                       <div className="glass p-10 h-96 border-white/10 flex flex-col items-center justify-center text-center relative overflow-hidden">
                          <div className="absolute top-0 left-0 w-full h-full bg-primary/[0.02] blur-[100px] pointer-events-none" />
                          <BarChart3 className="w-16 h-16 text-white/5 mb-6" />
                          <h3 className="font-bold text-xl mb-2 text-white/60">Faollik Grafigi</h3>
                          <p className="text-xs text-white/30 max-w-xs font-light">Oxirgi 30 kun ichidagi buyurtmalar va tushumlar vizualizatsiyasi.</p>
                       </div>
                    </motion.div>
                 )}

                 {activeTab === 'bronlar' && (
                    <motion.div 
                      key="bronlar"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="space-y-8"
                    >
                       <div className="glass border-white/10 overflow-hidden shadow-2xl">
                          <table className="w-full text-left">
                             <thead className="bg-white/5 text-[10px] uppercase font-black tracking-[0.2em] text-white/30">
                                <tr>
                                   <th className="p-6">Mashina</th>
                                   <th className="p-6">Mijoz / Tel</th>
                                   <th className="p-6">Sanalar</th>
                                   <th className="p-6">Holat</th>
                                   <th className="p-6">Amal</th>
                                </tr>
                             </thead>
                             <tbody className="divide-y divide-white/5">
                                 {[...Array(5)].map((_, i) => (
                                    <tr key={i} className="hover:bg-white/[0.02] transition-colors group">
                                       <td className="p-6">
                                          <div className="flex items-center gap-4">
                                             <div className="w-14 h-10 bg-[#111] rounded-lg overflow-hidden border border-white/5">
                                                <img src="/images/cars/car-fallback.jpg" className="w-full h-full object-cover" alt="" />
                                             </div>
                                             <span className="text-sm font-bold">Mashina modeli #{i+1}</span>
                                          </div>
                                       </td>
                                      <td className="p-6">
                                         <div className="text-sm font-bold">Mijoz #{1024 + i}</div>
                                         <div className="text-[10px] text-white/20">+998 90 555-44-33</div>
                                      </td>
                                      <td className="p-6">
                                         <div className="text-xs text-white/60">12.04 — 15.04</div>
                                      </td>
                                      <td className="p-6">
                                         <span className="px-3 py-1 rounded-full bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 text-[9px] font-bold uppercase tracking-widest">Kutilmoqda</span>
                                      </td>
                                      <td className="p-6">
                                         <div className="flex gap-2">
                                            <button className="p-3 bg-green-500/10 text-green-500 rounded-xl hover:bg-green-500 hover:text-white transition-all scale-90 group-hover:scale-100"><CheckCircle2 className="w-4 h-4" /></button>
                                            <button className="p-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all scale-90 group-hover:scale-100"><XCircle className="w-4 h-4" /></button>
                                         </div>
                                      </td>
                                   </tr>
                                ))}
                             </tbody>
                          </table>
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

export default AdminManagement;
