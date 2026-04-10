import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import apiClient from "../services/api/apiClient";
import { useNavigate, Link } from "react-router-dom";
import {
   Users,
   User,
   BarChart,
   Package,
   MessageSquare,
   ClipboardCheck,
   Settings,
   Edit,
   Trash2,
   CheckCircle,
   XCircle,
   X,
   Clock,
   ShieldCheck,
   CreditCard,
   Search,
   Filter,
   Eye,
   Download,
   Calendar,
   MoreVertical,
   Activity,
   Sparkles,
   Star,
   ArrowUpRight,
   TrendingUp,
   Wallet,
   History,
   AlertCircle,
   Mail,
   Phone,
   MapPin
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import { formatNarx } from "../utils/formatPrice";
import { MEDIA_BASE_URL } from "../utils/api";

const AdminPanel = () => {
   const { user } = useAuth();
   const navigate = useNavigate();
   const [activeTab, setActiveTab] = useState("dashboard");
   const [bookings, setBookings] = useState([]);
   const [cars, setCars] = useState([]);
   const [messages, setMessages] = useState([]);
   const [users, setUsers] = useState([]);
   const [kycSubmissions, setKycSubmissions] = useState([]);
   const [transactions, setTransactions] = useState([]);
   const [stats, setStats] = useState(null);
   const [loading, setLoading] = useState(true);
   const [searchTerm, setSearchTerm] = useState("");
   const [editCarModal, setEditCarModal] = useState({ isOpen: false, car: null });
   const [maintenanceModal, setMaintenanceModal] = useState({ isOpen: false, carId: null });

   const [statusFilter, setStatusFilter] = useState("all");
   const [showFilterDropdown, setShowFilterDropdown] = useState(false);

   const [userModal, setUserModal] = useState({ isOpen: false, user: null, view: 'profile' });

   const exportToCSV = (data, fileName) => {
      if (!data || data.length === 0) {
         alert("Eksport qilish uchun ma'lumot yo'q!");
         return;
      }
      
      const sanitizedData = data.map(item => {
         const clean = {};
         Object.keys(item).forEach(key => {
            if (typeof item[key] !== 'object' || item[key] === null) {
               clean[key] = item[key];
            } else if (key === 'car_info') {
               clean['car'] = `${item[key].brand} ${item[key].model}`;
            }
         });
         return clean;
      });

      const headers = Object.keys(sanitizedData[0]).join(",");
      const rows = sanitizedData.map(obj => Object.values(obj).map(val => 
         typeof val === 'string' ? `"${val.replace(/"/g, '""')}"` : 
         val === null ? "" : val
      ).join(","));
      
      const csvContent = headers + "\n" + rows.join("\n");
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `${fileName}_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
   };

   useEffect(() => {
      if (!user || !user.is_staff) {
         navigate("/");
         return;
      }

      const fetchData = async () => {
         setLoading(true);
         try {
            const results = await Promise.allSettled([
               apiClient.get("/bookings/all/"),
               apiClient.get("/cars/"),
               apiClient.get("/contact/list/"),
               apiClient.get("/admin-panel/stats/"),
               apiClient.get("/users/admin/users/"),
               apiClient.get("/users/admin/kyc/"),
               apiClient.get("/payments/transactions/")
            ]);

            const safe = (r) => r.status === 'fulfilled' ? (r.value.data.results || r.value.data || []) : [];
            const safeObj = (r) => r.status === 'fulfilled' ? (r.value.data || null) : null;

            setBookings(safe(results[0]));
            setCars(safe(results[1]));
            setMessages(safe(results[2]));
            setStats(safeObj(results[3]));
            setUsers(safe(results[4]));
            setKycSubmissions(safe(results[5]));
            setTransactions(safe(results[6]));
         } catch (err) {
            console.error("Admin data fetch error", err);
         } finally {
            setLoading(false);
         }
      };
      fetchData();
   }, [user, navigate]);

   const updateBookingStatus = async (id, status, reason = "") => {
      try {
         const response = await apiClient.patch(`/bookings/${id}/status/`, { status, rejection_reason: reason });
         setBookings(prev => prev.map(b => b.id === id ? { ...b, status: response.data.status } : b));
      } catch (err) {
         console.error(err);
         alert("Xatolik yuz berdi!");
      }
   };

   const handleReviewKyc = async (kycId, status, reason = "") => {
      try {
         await apiClient.post(`/users/admin/kyc/${kycId}/review/`, { status, rejection_reason: reason });
         setKycSubmissions(prev => prev.filter(k => k.id !== kycId));
         const usersRes = await apiClient.get("/users/admin/users/");
         setUsers(usersRes.data.results || usersRes.data || []);
      } catch (err) {
         console.error(err);
         alert("Xatolik!");
      }
   };

   const submitMaintenance = async (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const reason = formData.get('reason');
      const start = formData.get('start_datetime');
      const end = formData.get('end_datetime');
      const carId = maintenanceModal.carId;

      if (!start || !end || !reason) return;

      try {
         await apiClient.post('/cars/maintenance/', {
            car: carId,
            reason,
            start_datetime: new Date(start).toISOString(),
            end_datetime: new Date(end).toISOString()
         });
         await apiClient.patch(`/cars/${carId}/`, { status: 'maintenance', is_available: false });
         setCars(prev => prev.map(c => c.id === carId ? { ...c, status: 'maintenance', is_available: false } : c));
         setMaintenanceModal({ isOpen: false, carId: null });
      } catch (err) {
         console.error(err);
         alert("Xatolik! Sana formatini tekshiring.");
      }
   };

   const deleteCar = async (carId) => {
      if (!window.confirm("Haqiqatan ham bu avtomobilni o'chirmoqchimisiz?")) return;
      try {
         await apiClient.delete(`/cars/${carId}/`);
         setCars(prev => prev.filter(c => c.id !== carId));
      } catch (err) {
         console.error(err);
         alert("Xatolik yuz berdi! O'chirish imkonsiz bo'lishi mumkin.");
      }
   };

   const submitEditCar = async (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const newPrice = formData.get('daily_price');
      const newStatus = formData.get('status');
      const car = editCarModal.car;

      try {
         await apiClient.patch(`/cars/${car.id}/`, { 
            daily_price: newPrice, 
            status: newStatus,
            is_available: newStatus === 'available'
         });
         setCars(prev => prev.map(c => c.id === car.id ? { ...c, daily_price: newPrice, status: newStatus, is_available: newStatus === 'available' } : c));
         setEditCarModal({ isOpen: false, car: null });
      } catch (err) {
         console.error(err);
         alert("Xatolik yuz berdi!");
      }
   };

   if (!user || !user.is_staff) return null;

   const tabs = [
      { id: "dashboard", icon: <BarChart size={18} />, label: "Dashboard" },
      { id: "bookings", icon: <ClipboardCheck size={18} />, label: "Bronlar" },
      { id: "verifikatsiya", icon: <ShieldCheck size={18} />, label: "Verifikatsiya" },
      { id: "payments", icon: <CreditCard size={18} />, label: "To'lovlar" },
      { id: "crm", icon: <Users size={18} />, label: "Mijozlar" },
      { id: "cars", icon: <Package size={18} />, label: "Flot" },
      { id: "messages", icon: <MessageSquare size={18} />, label: "Xabarlar" },
   ];

   const filteredUsers = users.filter(u => {
      const matchesSearch = u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
         (u.first_name + ' ' + u.last_name).toLowerCase().includes(searchTerm.toLowerCase()) ||
         u.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || u.verification_status === statusFilter;
      return matchesSearch && matchesStatus;
   });

   const filteredBookings = bookings.filter(b => {
      const matchesSearch = (
         b.car_info?.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
         b.car_info?.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
         b.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
         b.id.toString().includes(searchTerm)
      );
      const matchesStatus = statusFilter === "all" || b.status === statusFilter;
      return matchesSearch && matchesStatus;
   });

   const filteredTransactions = transactions.filter(tx => {
      const matchesSearch = tx.id.toString().includes(searchTerm) || 
         tx.payment_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
         tx.user?.toString().includes(searchTerm);
      const matchesStatus = statusFilter === "all" || tx.status === statusFilter;
      return matchesSearch && matchesStatus;
   });

   const filteredCars = cars.filter(car => {
      const matchesSearch = car.brand.toLowerCase().includes(searchTerm.toLowerCase()) || 
         car.model.toLowerCase().includes(searchTerm.toLowerCase()) || 
         car.plate_number?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || 
         (statusFilter === "available" ? car.is_available : statusFilter === "rented" ? !car.is_available : true);
      return matchesSearch && matchesStatus;
   });

   return (
      <div className="min-h-screen bg-[#0A0A0A] flex flex-col lg:flex-row pt-20 relative overflow-hidden text-white/90">

         {/* BACKGROUND STUDIO GLOWS */}
         <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[150px] rounded-full pointer-events-none -z-10" />
         <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none -z-10" />

         {/* Sidebar Navigation */}
         <aside className="w-full lg:w-[280px] h-fit lg:min-h-[calc(100vh-80px)] bg-[#111]/40 backdrop-blur-3xl p-6 border-r border-white/5 flex flex-col z-20">
            <div className="mb-10 px-4">
               <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg shadow-primary/20">
                     <Activity className="w-5 h-5 text-white" />
                  </div>
                  <div>
                     <h2 className="text-xl font-black text-white uppercase tracking-tighter leading-none">RIDELUX</h2>
                     <p className="text-[10px] text-white/30 font-black uppercase tracking-widest mt-1">HQ v3.0</p>
                  </div>
               </div>
            </div>

            <nav className="flex-1 space-y-1.5">
               {tabs.map(tab => (
                  <button
                     key={tab.id}
                     onClick={() => setActiveTab(tab.id)}
                     className={`w-full flex items-center gap-3 px-5 py-3.5 rounded-2xl transition-all duration-500 group relative overflow-hidden ${activeTab === tab.id
                           ? "text-white"
                           : "text-white/40 hover:bg-white/5 hover:text-white"
                        }`}
                  >
                     {activeTab === tab.id && (
                        <motion.div
                           layoutId="active-nav-bg"
                           className="absolute inset-0 bg-gradient-to-r from-primary to-primary/80 -z-10"
                           transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                        />
                     )}
                     <span className={`transition-transform duration-500 ${activeTab === tab.id ? "scale-110" : "group-hover:scale-110"}`}>{tab.icon}</span>
                     <span className="font-bold text-sm tracking-tight">{tab.label}</span>
                     {tab.id === 'verifikatsiya' && kycSubmissions.length > 0 && (
                        <span className="ml-auto w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center text-[9px] font-black shadow-lg shadow-orange-500/20">{kycSubmissions.length}</span>
                     )}
                  </button>
               ))}
            </nav>

            <div className="mt-10 pt-8 border-t border-white/5">
               <div className="flex items-center gap-3 px-4 py-4 rounded-3xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.05] transition-colors cursor-pointer group">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary/20 to-transparent flex items-center justify-center text-primary border border-primary/20 group-hover:scale-105 transition-transform">
                     <User className="w-5 h-5" />
                  </div>
                  <div className="overflow-hidden">
                     <p className="text-xs font-black text-white uppercase tracking-tight truncate">{user?.first_name} {user?.last_name}</p>
                     <div className="flex items-center gap-1.5">
                        <div className="w-1 h-1 rounded-full bg-green-500" />
                        <p className="text-[10px] text-white/30 font-black uppercase tracking-widest">Master Admin</p>
                     </div>
                  </div>
               </div>
            </div>
         </aside>

         {/* Main Content Area */}
         <main className="flex-1 p-6 lg:p-10 bg-[#0A0A0A] overflow-x-hidden">

            {/* Header Section */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
               <div>
                  <h1 className="text-3xl font-black text-white uppercase tracking-tighter mb-2 italic">
                     {tabs.find(t => t.id === activeTab)?.label} <span className="text-white/20 not-italic">Moduli</span>
                  </h1>
                  <div className="flex items-center gap-3 text-[10px] text-white/30 uppercase font-black tracking-widest">
                     <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                     Siz hozir admin rejimidasiz
                  </div>
               </div>

               <div className="flex items-center gap-4 w-full md:w-auto">
                  <div className="relative flex-1 md:w-80">
                     <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                     <input
                        type="text"
                        placeholder="Qidiruv..."
                        className="w-full bg-white/5 border border-white/5 rounded-2xl py-3 pl-12 pr-4 text-sm focus:border-primary/50 outline-none"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                     />
                  </div>
               </div>
            </header>

            {loading ? (
               <div className="flex flex-col items-center justify-center py-40">
                  <motion.div
                     animate={{ rotate: 360 }}
                     transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                     className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full mb-6"
                  />
                  <p className="text-[10px] text-white/20 uppercase font-black tracking-widest">API'dan ma'lumotlar olinmoqda...</p>
               </div>
            ) : (
               <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                  <AnimatePresence mode="wait">
                     {/* Dashboard Tab */}
                     {activeTab === "dashboard" && stats && (
                        <motion.div
                           key="dashboard"
                           initial={{ opacity: 0, y: 20 }}
                           animate={{ opacity: 1, y: 0 }}
                           exit={{ opacity: 0, y: -20 }}
                           transition={{ duration: 0.5 }}
                           className="space-y-12"
                        >
                           {/* STATS BENTO GRID */}
                           <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                              {/* Large Main Stat */}
                              <div className="lg:col-span-2 bg-gradient-to-br from-[#111] to-[#0A0A0A] p-10 rounded-[48px] border border-white/5 relative overflow-hidden group shadow-2xl">
                                 <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] pointer-events-none group-hover:bg-primary/20 transition-all duration-1000" />
                                 <div className="flex justify-between items-start mb-12">
                                    <div className="w-16 h-16 rounded-3xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform duration-700">
                                       <CreditCard className="w-6 h-6 text-primary" />
                                    </div>
                                    <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-full">
                                       <TrendingUp className="w-3.5 h-3.5 text-green-500" />
                                       <span className="text-[10px] text-green-500 font-black uppercase tracking-widest">+18.2%</span>
                                    </div>
                                 </div>
                                 <p className="text-white/30 text-[11px] font-black uppercase tracking-[0.3em] mb-4">UMUMIY TUSHUM</p>
                                 <h4 className="text-5xl font-black text-white italic tracking-tighter mb-4">{formatNarx(stats.total_revenue)}</h4>
                                 <p className="text-[10px] text-white/20 font-medium max-w-[300px]">Oxirgi 30 kun ichidagi barcha tranzaksiyalarning umumiy summasi.</p>
                              </div>

                              {/* Middle Stats Column */}
                              <div className="grid grid-cols-1 gap-6 lg:col-span-1">
                                 <div className="bg-[#111]/60 backdrop-blur-3xl p-8 rounded-[40px] border border-white/5 relative overflow-hidden group hover:border-primary/30 transition-all duration-500">
                                    <div className="flex items-center gap-4 mb-6">
                                       <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center border border-white/5 group-hover:bg-primary/10 transition-colors">
                                          <ClipboardCheck className="w-5 h-5 text-white/40 group-hover:text-primary transition-colors" />
                                       </div>
                                       <span className="text-[10px] text-white/30 font-black uppercase tracking-widest">BRONLAR</span>
                                    </div>
                                    <h5 className="text-3xl font-black text-white italic tracking-tight">{stats.total_bookings}</h5>
                                    <p className="text-[9px] text-white/10 uppercase font-bold mt-2 tracking-widest">Active reservations</p>
                                 </div>
                                 <div className="bg-[#111]/60 backdrop-blur-3xl p-8 rounded-[40px] border border-white/5 relative overflow-hidden group hover:border-blue-500/30 transition-all duration-500">
                                    <div className="flex items-center gap-4 mb-6">
                                       <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center border border-white/5 group-hover:bg-blue-500/10 transition-colors">
                                          <Package className="w-5 h-5 text-white/40 group-hover:text-blue-500 transition-colors" />
                                       </div>
                                       <span className="text-[10px] text-white/30 font-black uppercase tracking-widest">FLOT</span>
                                    </div>
                                    <h5 className="text-3xl font-black text-white italic tracking-tight">{stats.active_cars} <span className="text-base text-white/20 not-italic">avto</span></h5>
                                    <p className="text-[9px] text-white/10 uppercase font-bold mt-2 tracking-widest">Available inventory</p>
                                 </div>
                              </div>

                              {/* Messages / Right Stat */}
                              <div className="lg:col-span-1 bg-[#111]/60 backdrop-blur-3xl p-8 rounded-[40px] border border-white/5 relative overflow-hidden group flex flex-col justify-between hover:border-orange-500/30 transition-all duration-500">
                                 <div>
                                    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-6 border border-white/5 group-hover:scale-110 transition-transform">
                                       <MessageSquare className="w-6 h-6 text-orange-500" />
                                    </div>
                                    <p className="text-[10px] text-white/30 font-black uppercase tracking-widest mb-2">XABARLAR</p>
                                    <h5 className="text-4xl font-black text-white italic">{stats.unread_messages}</h5>
                                 </div>
                                 <button onClick={() => setActiveTab('messages')} className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-widest mt-8 group/btn hover:gap-4 transition-all">
                                    HAMMASI <ArrowUpRight className="w-4 h-4 group-hover/btn:rotate-45 transition-transform" />
                                 </button>
                              </div>
                           </div>

                           {/* VISUAL CHARTS SECTION */}
                           <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
                              <div className="bg-[#111]/40 backdrop-blur-xl p-10 rounded-[64px] border border-white/5 shadow-2xl relative overflow-hidden">
                                 <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-transparent opacity-20" />
                                 <div className="flex items-center justify-between mb-12">
                                    <div>
                                       <h3 className="text-xl font-black text-white uppercase italic tracking-tighter mb-1">Oylik <span className="text-white/20">Dinamiqa</span></h3>
                                       <p className="text-[10px] text-white/30 uppercase font-bold tracking-widest">Revenue performance report</p>
                                    </div>
                                    <div className="px-4 py-2 rounded-2xl bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest">2024</div>
                                 </div>
                                 <div className="h-[360px] w-full relative -ml-8 min-w-0">
                                    <ResponsiveContainer width="100%" height={360}>
                                       <AreaChart data={stats.monthly_revenue || []}>
                                          <defs>
                                             <linearGradient id="colorRevMaster" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#EF372A" stopOpacity={0.4} />
                                                <stop offset="95%" stopColor="#EF372A" stopOpacity={0} />
                                             </linearGradient>
                                          </defs>
                                          <XAxis dataKey="month" stroke="#222" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, { month: 'short' })} />
                                          <YAxis stroke="#222" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => `${val / 1e6}M`} />
                                          <Tooltip
                                             contentStyle={{ backgroundColor: 'rgba(20,20,20,0.9)', backdropFilter: 'blur(20px)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.08)', padding: '15px', color: '#fff' }}
                                             itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                                          />
                                          <Area
                                             type="monotone"
                                             dataKey="revenue"
                                             stroke="#EF372A"
                                             strokeWidth={6}
                                             fillOpacity={1}
                                             fill="url(#colorRevMaster)"
                                             activeDot={{ r: 10, stroke: '#fff', strokeWidth: 3 }}
                                          />
                                       </AreaChart>
                                    </ResponsiveContainer>
                                 </div>
                              </div>

                              <div className="bg-[#111]/40 backdrop-blur-xl p-10 rounded-[64px] border border-white/5 shadow-2xl relative overflow-hidden">
                                 <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-l from-primary/30 to-transparent opacity-20" />
                                 <div className="mb-12">
                                    <h3 className="text-xl font-black text-white uppercase italic tracking-tighter mb-1">Bron <span className="text-white/20">Strukturasi</span></h3>
                                    <p className="text-[10px] text-white/30 uppercase font-bold tracking-widest">Booking status distribution</p>
                                 </div>
                                 <div className="h-[360px] w-full relative flex items-center justify-center min-w-0">
                                    <ResponsiveContainer width="100%" height={360}>
                                       <PieChart>
                                          <Pie
                                             data={stats.status_counts}
                                             dataKey="count"
                                             nameKey="status"
                                             cx="50%"
                                             cy="50%"
                                             innerRadius={90}
                                             outerRadius={140}
                                             paddingAngle={10}
                                             stroke="none"
                                          >
                                             {stats.status_counts && stats.status_counts.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={['#EF372A', '#00D97E', '#FFB800', '#3B82F6'][index % 4]} cornerRadius={16} />
                                             ))}
                                          </Pie>
                                          <Tooltip
                                             contentStyle={{ backgroundColor: 'rgba(20,20,20,0.9)', backdropFilter: 'blur(20px)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.08)' }}
                                          />
                                       </PieChart>
                                    </ResponsiveContainer>
                                    <div className="space-y-6 pl-6 border-l border-white/5">
                                       {stats.status_counts && stats.status_counts.map((s, i) => (
                                          <div key={i} className="flex flex-col gap-1">
                                             <div className="flex items-center gap-3">
                                                <div className="w-2.5 h-2.5 rounded-full shadow-[0_0_10px_currentColor]" style={{ backgroundColor: ['#EF372A', '#00D97E', '#FFB800', '#3B82F6'][i % 4], color: ['#EF372A', '#00D97E', '#FFB800', '#3B82F6'][i % 4] }} />
                                                <span className="text-[11px] text-white font-black uppercase tracking-widest italic">{s.status}</span>
                                             </div>
                                             <span className="text-[9px] text-white/20 uppercase font-black tracking-[0.2em] ml-5">{s.count} buyurtma</span>
                                          </div>
                                       ))}
                                    </div>
                                 </div>
                              </div>
                           </div>
                        </motion.div>
                     )}

                     {activeTab === "verifikatsiya" && (
                        <div key="verifikatsiya" className="space-y-8">
                           <div className="flex items-center justify-between mb-2">
                              <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">Hujjatlarni <span className="text-white/20">Tekshirish</span></h3>
                              <div className="px-4 py-2 bg-white/5 rounded-2xl border border-white/5 text-[10px] font-black text-white/40 uppercase tracking-widest leading-none">
                                 {kycSubmissions.length} ariza kutilmoqda
                              </div>
                           </div>

                           {kycSubmissions.length > 0 ? (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                 {kycSubmissions.map(k => (
                                    <div key={k.id} className="bg-[#111]/60 backdrop-blur-3xl p-10 rounded-[56px] border border-white/5 space-y-10 group hover:border-primary/20 transition-all duration-700 relative overflow-hidden shadow-2xl">
                                       <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl pointer-events-none group-hover:bg-primary/10 transition-all" />

                                       <div className="flex justify-between items-start">
                                          <div className="flex items-center gap-5">
                                             <div className="w-16 h-16 rounded-[28px] bg-gradient-to-br from-white/10 to-transparent border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-700">
                                                <User className="w-8 h-8 text-white/40" />
                                             </div>
                                             <div className="overflow-hidden">
                                                <h4 className="text-xl font-black text-white uppercase italic truncate tracking-tighter mb-1">{k.full_name || k.user_info?.username || `User #${k.user}`}</h4>
                                                <p className="text-[10px] text-white/30 uppercase font-black tracking-widest">KYC ID #{String(k.id).padStart(6, '0')}</p>
                                             </div>
                                          </div>
                                          <div className="px-5 py-2.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-500 text-[9px] font-black uppercase tracking-[0.2em] shadow-[0_0_20px_rgba(249,115,22,0.1)]">MODERATSIYA</div>
                                       </div>

                                       <div className="grid grid-cols-2 gap-8">
                                          <div className="space-y-4">
                                             <div className="flex items-center gap-2 mb-1">
                                                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                                <span className="text-[9px] text-white/30 uppercase font-black tracking-widest">Pasport (Old)</span>
                                             </div>
                                             <div className="aspect-[16/10] bg-white/[0.02] rounded-[32px] overflow-hidden relative group/img cursor-pointer border border-white/5 hover:border-primary/40 transition-all duration-700 shadow-xl">
                                                {k.passport_front_image ? (
                                                   <img src={k.passport_front_image} className="w-full h-full object-cover opacity-60 group-hover/img:scale-110 group-hover/img:opacity-100 transition-all duration-1000" alt="" />
                                                ) : (
                                                   <div className="w-full h-full flex flex-col items-center justify-center italic text-[10px] text-white/10 uppercase gap-3">
                                                      <AlertCircle className="w-6 h-6" /> Rasm mavjud emas
                                                   </div>
                                                )}
                                                <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                                                   <Eye className="w-8 h-8 text-white scale-90 group-hover/img:scale-100 transition-transform" />
                                                </div>
                                             </div>
                                          </div>
                                          <div className="space-y-4">
                                             <div className="flex items-center gap-2 mb-1">
                                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                                <span className="text-[9px] text-white/30 uppercase font-black tracking-widest">Haydovchilik guvohnomasi</span>
                                             </div>
                                             <div className="aspect-[16/10] bg-white/[0.02] rounded-[32px] overflow-hidden relative group/img cursor-pointer border border-white/5 hover:border-blue-500/40 transition-all duration-700 shadow-xl">
                                                {k.license_image ? (
                                                   <img src={k.license_image} className="w-full h-full object-cover opacity-60 group-hover/img:scale-110 group-hover/img:opacity-100 transition-all duration-1000" alt="" />
                                                ) : (
                                                   <div className="w-full h-full flex flex-col items-center justify-center italic text-[10px] text-white/10 uppercase gap-3">
                                                      <AlertCircle className="w-6 h-6" /> Rasm mavjud emas
                                                   </div>
                                                )}
                                                <div className="absolute inset-0 bg-blue-500/20 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                                                   <Eye className="w-8 h-8 text-white scale-90 group-hover/img:scale-100 transition-transform" />
                                                </div>
                                             </div>
                                          </div>
                                       </div>

                                       <div className="flex gap-4 pt-8 border-t border-white/5">
                                          <button
                                             onClick={() => handleReviewKyc(k.id, 'approved')}
                                             className="flex-1 py-5 rounded-[28px] bg-white text-black text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all duration-500 flex items-center justify-center gap-3 shadow-xl"
                                          >
                                             <CheckCircle className="w-4 h-4" /> TASDIQLASH
                                          </button>
                                          <button
                                             onClick={() => {
                                                const r = prompt("Rad etish sababi:");
                                                if (r) handleReviewKyc(k.id, 'rejected', r);
                                             }}
                                             className="flex-1 py-5 rounded-[28px] bg-red-500/10 text-red-500 text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all duration-500 flex items-center justify-center gap-3"
                                          >
                                             <XCircle className="w-4 h-4" /> RAD ETISH
                                          </button>
                                       </div>
                                    </div>
                                 ))}
                              </div>
                           ) : (
                              <div className="bg-[#111]/30 p-32 rounded-[64px] border border-white/5 flex flex-col items-center text-center backdrop-blur-xl">
                                 <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-10">
                                    <ShieldCheck className="w-12 h-12 text-white/10" />
                                 </div>
                                 <h3 className="text-2xl font-black uppercase tracking-tighter mb-4 text-white italic">Hamma hujjatlar <span className="text-white/20">tekshirilgan</span></h3>
                                 <p className="text-xs font-medium max-w-sm text-white/30 tracking-wide uppercase leading-relaxed">Hozirda Moderatsiya navbatida yangi arizalar mavjud emas. Tizim to'liq nazorat ostida.</p>
                              </div>
                           )}
                        </div>
                     )}

                     {/* Payments Tab (New) */}
                     {activeTab === "payments" && (
                        <div key="payments" className="space-y-10">
                           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                              <div className="bg-green-500/10 border border-green-500/20 p-8 rounded-[32px]">
                                 <p className="text-green-500/60 text-[9px] font-black uppercase tracking-[0.2em] mb-2">Tushgan to'lovlar (24h)</p>
                                 <h4 className="text-2xl font-black text-green-500 italic">45,800,000 so'm</h4>
                              </div>
                              <div className="bg-orange-500/10 border border-orange-500/20 p-8 rounded-[32px]">
                                 <p className="text-orange-500/60 text-[9px] font-black uppercase tracking-[0.2em] mb-2">Ushlab turilgan depozitlar</p>
                                 <h4 className="text-2xl font-black text-orange-500 italic">12,100,000 so'm</h4>
                              </div>
                           </div>

                           <div className="bg-[#111] rounded-[48px] border border-white/5 overflow-hidden">
                              <div className="px-10 py-8 border-b border-white/5 flex justify-between items-center">
                                 <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">Barcha <span className="text-white/20">Tranzaksiyalar</span></h3>
                                 <button 
                                    onClick={() => exportToCSV(filteredTransactions, 'tranzaksiyalar')}
                                    className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-2 hover:underline"
                                 >
                                    <Download className="w-3.5 h-3.5" /> EKSPORT CSV
                                 </button>
                              </div>
                              <table className="w-full text-left">
                                 <thead className="bg-white/[0.02]">
                                    <tr>
                                       <th className="px-10 py-5 text-[9px] font-black uppercase tracking-[0.2em] text-white/20 border-b border-white/5">ID</th>
                                       <th className="px-10 py-5 text-[9px] font-black uppercase tracking-[0.2em] text-white/20 border-b border-white/5">MIJOZ</th>
                                       <th className="px-10 py-5 text-[9px] font-black uppercase tracking-[0.2em] text-white/20 border-b border-white/5">SANA</th>
                                       <th className="px-10 py-5 text-[9px] font-black uppercase tracking-[0.2em] text-white/20 border-b border-white/5">TUR</th>
                                       <th className="px-10 py-5 text-[9px] font-black uppercase tracking-[0.2em] text-white/20 border-b border-white/5">SUMMA</th>
                                       <th className="px-10 py-5 text-[9px] font-black uppercase tracking-[0.2em] text-white/20 border-b border-white/5 text-right">STATUS</th>
                                    </tr>
                                 </thead>
                                 <tbody className="divide-y divide-white/5">
                                    {filteredTransactions.map(tx => (
                                       <tr key={tx.id} className="hover:bg-white/[0.02] transition-all group">
                                          <td className="px-10 py-6 text-[10px] font-black text-white/40">#{tx.id.toString().padStart(6, '0')}</td>
                                          <td className="px-10 py-6">
                                             <div className="text-xs font-bold text-white mb-0.5">#{tx.user}</div>
                                             <div className="text-[8px] text-white/20 uppercase font-black tracking-widest">User ID Reference</div>
                                          </td>
                                          <td className="px-10 py-6 text-[10px] font-bold text-white/40">{new Date(tx.created_at).toLocaleDateString()}</td>
                                          <td className="px-10 py-6">
                                             <span className="text-[9px] font-black uppercase tracking-widest text-primary italic border-b border-primary/20 pb-0.5">{tx.payment_type}</span>
                                          </td>
                                          <td className="px-10 py-6 text-xs font-black text-white">{formatNarx(tx.amount)}</td>
                                          <td className="px-10 py-6 text-right">
                                             <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${tx.status === 'paid' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                                {tx.status}
                                             </span>
                                          </td>
                                       </tr>
                                    ))}
                                 </tbody>
                              </table>
                           </div>
                        </div>
                     )}

                     {/* CRM / Foydalanuvchilar Tab (New) */}
                     {activeTab === "crm" && (
                        <div key="crm" className="space-y-8">
                           <div className="flex items-center justify-between mb-2">
                              <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">Mijozlar <span className="text-white/20">Boshqaruvi</span></h3>
                              <div className="flex gap-4">
                                 <div className="relative">
                                    <button 
                                       onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                                       className={`flex items-center gap-2 px-4 py-2 rounded-2xl border text-[9px] font-black uppercase transition-all ${showFilterDropdown ? 'bg-primary border-primary text-white' : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10'}`}
                                    >
                                       <Filter className="w-3.5 h-3.5" /> FILTRLAR
                                    </button>
                                    <AnimatePresence>
                                       {showFilterDropdown && (
                                          <motion.div 
                                             initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                             animate={{ opacity: 1, y: 0, scale: 1 }}
                                             exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                             className="absolute right-0 mt-2 w-48 bg-[#1A1A1A] border border-white/10 rounded-2xl p-2 shadow-2xl z-50 overflow-hidden"
                                          >
                                             {['all', 'verified', 'pending'].map((f) => (
                                                <button
                                                   key={f}
                                                   onClick={() => { setStatusFilter(f); setShowFilterDropdown(false); }}
                                                   className={`w-full text-left px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${statusFilter === f ? 'bg-primary text-white' : 'text-white/40 hover:bg-white/5 hover:text-white'}`}
                                                >
                                                   {f === 'all' ? 'HAMMASI' : f.toUpperCase()}
                                                </button>
                                             ))}
                                          </motion.div>
                                       )}
                                    </AnimatePresence>
                                 </div>
                                 <button 
                                    onClick={() => exportToCSV(filteredUsers, 'mijozlar')}
                                    className="flex items-center gap-2 px-4 py-2 bg-primary/20 rounded-2xl border border-primary/20 text-[9px] font-black text-primary uppercase hover:bg-primary/30 transition-all"
                                 >
                                    <Download className="w-3.5 h-3.5" /> EKSPORT
                                 </button>
                              </div>
                           </div>
                           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                           {filteredUsers.map(u => {
                              const userBookingsCount = bookings.filter(b => b.user === u.id || b.user_email === u.email).length;
                              const avatarUrl = u.avatar ? (u.avatar.startsWith('http') ? u.avatar : `${MEDIA_BASE_URL}${u.avatar}`) : null;
                              
                              return (
                              <div key={u.id} className="bg-[#111] p-10 rounded-[48px] border border-white/5 hover:border-primary/20 transition-all group relative overflow-hidden flex flex-col">
                                 <div className="absolute top-0 right-0 p-10 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <MoreVertical className="w-5 h-5 text-white/20" />
                                 </div>
                                 <div className="flex flex-col items-center text-center flex-1">
                                    <div className="w-24 h-24 rounded-[32px] bg-white/5 border border-white/5 flex items-center justify-center mb-6 relative group-hover:scale-105 transition-all duration-700 overflow-hidden">
                                       {avatarUrl ? (
                                          <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
                                       ) : (
                                          <User className="w-10 h-10 text-white/20 group-hover:text-primary transition-colors" />
                                       )}
                                       <div className={`absolute -bottom-1 -right-1 w-6 h-6 border-4 border-[#111] rounded-full ${u.verification_status === 'verified' ? 'bg-green-500' : 'bg-white/10'}`} />
                                    </div>
                                    <h4 className="text-xl font-black text-white uppercase italic tracking-tighter mb-1">{u.first_name} {u.last_name}</h4>
                                    <div className="flex items-center gap-2 mb-8">
                                       <Mail size={10} className="text-white/20" />
                                       <p className="text-[10px] text-white/30 truncate max-w-[150px]">{u.email}</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 w-full pt-8 border-t border-white/5">
                                       <div className="text-center border-r border-white/5">
                                          <p className="text-[10px] text-white/20 uppercase font-black tracking-widest mb-1">Bronlar</p>
                                          <p className="text-sm font-bold text-white">{userBookingsCount}</p>
                                       </div>
                                       <div className="text-center">
                                          <p className="text-[10px] text-white/20 uppercase font-black tracking-widest mb-1">Puan</p>
                                          <p className="text-sm font-bold text-primary italic">{u.loyalty_points || 0}</p>
                                       </div>
                                    </div>
                                 </div>

                                 <div className="mt-10 flex gap-3">
                                    <button 
                                       onClick={() => {
                                          setUserModal({ isOpen: true, user: u, view: 'profile' });
                                       }}
                                       className="flex-1 py-4 bg-white/5 hover:bg-white/10 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                                    >
                                       <User size={12} className="text-primary" /> PROFIL
                                    </button>
                                    <button 
                                       onClick={() => {
                                          setUserModal({ isOpen: true, user: u, view: 'history' });
                                       }}
                                       className="flex-1 py-4 bg-white/5 hover:bg-white/10 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                                    >
                                       <History size={12} className="text-primary" /> TARIX
                                    </button>
                                 </div>
                              </div>
                              );
                           })}
                           </div>
                        </div>
                     )}

                     {/* Bookings Tab (Original Expanded) */}
                     {activeTab === "bookings" && (
                        <div key="bookings" className="space-y-8">
                           <div className="flex items-center justify-between mb-2">
                              <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">Barcha <span className="text-white/20">Buyurtmalar</span></h3>
                              <div className="flex gap-4">
                                 <div className="relative">
                                    <button 
                                       onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                                       className={`flex items-center gap-2 px-4 py-2 rounded-2xl border text-[9px] font-black uppercase transition-all ${showFilterDropdown ? 'bg-primary border-primary text-white' : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10'}`}
                                    >
                                       <Filter className="w-3.5 h-3.5" /> FILTRLAR
                                    </button>
                                    <AnimatePresence>
                                       {showFilterDropdown && (
                                          <motion.div 
                                             initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                             animate={{ opacity: 1, y: 0, scale: 1 }}
                                             exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                             className="absolute right-0 mt-2 w-48 bg-[#1A1A1A] border border-white/10 rounded-2xl p-2 shadow-2xl z-50 overflow-hidden"
                                          >
                                             {['all', 'pending', 'confirmed', 'completed', 'rejected'].map((f) => (
                                                <button
                                                   key={f}
                                                   onClick={() => { setStatusFilter(f); setShowFilterDropdown(false); }}
                                                   className={`w-full text-left px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${statusFilter === f ? 'bg-primary text-white' : 'text-white/40 hover:bg-white/5 hover:text-white'}`}
                                                >
                                                   {f === 'all' ? 'HAMMASI' : f.toUpperCase()}
                                                </button>
                                             ))}
                                          </motion.div>
                                       )}
                                    </AnimatePresence>
                                 </div>
                                 <button 
                                    onClick={() => exportToCSV(filteredBookings, 'bronlar')}
                                    className="flex items-center gap-2 px-4 py-2 bg-primary/20 rounded-2xl border border-primary/20 text-[9px] font-black text-primary uppercase hover:bg-primary/30 transition-all"
                                 >
                                    <Download className="w-3.5 h-3.5" /> EKSPORT
                                 </button>
                              </div>
                           </div>

                           {filteredBookings.map(b => (
                              <div key={b.id} className="group relative">
                                 <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700 rounded-[56px] -z-10" />
                                 <div className="bg-[#111]/40 backdrop-blur-3xl p-8 rounded-[56px] border border-white/5 group-hover:border-primary/20 transition-all duration-700 flex flex-col xl:flex-row gap-10 shadow-2xl overflow-hidden relative">
                                    <div className="w-full xl:w-72 h-44 rounded-[40px] overflow-hidden border border-white/5 shrink-0 relative" style={{ background: 'linear-gradient(180deg, #1a1a1a 0%, #0a0a0a 100%)' }}>
                                       <img src={b.car_info?.media?.card_main || b.car_info?.main_image || "/images/assets/car_fallback.jpg"} alt="" className="w-full h-full object-contain group-hover:scale-110 transition-all duration-1000 opacity-80 group-hover:opacity-100" />
                                       <div className="absolute top-4 left-4">
                                          <div className="px-3 py-1 bg-black/60 backdrop-blur-md rounded-full border border-white/10 text-[8px] font-black text-white/40 uppercase">ID #{b.id}</div>
                                       </div>
                                    </div>

                                    <div className="flex-1 flex flex-col justify-between py-2">
                                       <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                                          <div>
                                             <h4 className="text-2xl font-black text-white italic tracking-tighter uppercase mb-2 group-hover:text-primary transition-colors duration-500">{b.car_info?.brand} {b.car_info?.model}</h4>
                                             <div className="flex flex-wrap items-center gap-6">
                                                <div className="flex items-center gap-3">
                                                   <div className="w-9 h-9 rounded-2xl bg-white/5 flex items-center justify-center text-white/30 border border-white/5"><User size={16} /></div>
                                                   <div>
                                                      <p className="text-xs font-black text-white/80 uppercase">{b.full_name}</p>
                                                      <p className="text-[10px] text-white/20 font-medium">{b.phone_number}</p>
                                                   </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                   <div className="w-9 h-9 rounded-2xl bg-white/5 flex items-center justify-center text-white/30 border border-white/5"><Wallet size={16} /></div>
                                                   <div>
                                                      <p className="text-xs font-black text-primary italic leading-none">{Number(b.total_price).toLocaleString()} so'm</p>
                                                      <p className="text-[10px] text-white/20 font-bold uppercase mt-1">To'lov</p>
                                                   </div>
                                                </div>
                                             </div>
                                          </div>

                                          <div className="flex flex-col items-end gap-3">
                                             <div className={`px-5 py-2 rounded-full text-[9px] font-bold uppercase tracking-[0.2em] shadow-lg ${b.status === 'approved' ? 'bg-green-500/10 text-green-500 border border-green-500/20 shadow-green-500/10' :
                                                   b.status === 'pending' ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20 shadow-orange-500/10' :
                                                      'bg-red-500/10 text-red-500 border border-red-500/20'
                                                }`}>
                                                {b.status === 'confirmed' ? 'TASDIQLANGAN' :
                                                   b.status === 'payment_pending' ? 'TO\'LOV KUTILMOQDA' :
                                                      b.status === 'pending' ? 'MODERATSIYA' : b.status.toUpperCase()}
                                             </div>
                                             {b.is_chauffeur && (
                                                <div className="px-5 py-2 rounded-full bg-gradient-to-r from-primary to-orange-600 text-white text-[8px] font-black uppercase tracking-[0.2em] flex items-center gap-2 shadow-[0_0_20px_rgba(239,55,42,0.4)] border border-white/20 animate-pulse">
                                                   <Sparkles className="w-3.5 h-3.5" /> HAYDOVCHI BILAN
                                                </div>
                                             )}
                                          </div>
                                       </div>

                                       <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-6 pt-8 border-t border-white/5 mt-8">
                                          <div className="flex items-center gap-10">
                                             <div className="flex flex-col gap-1">
                                                <p className="text-[9px] text-white/30 uppercase font-black tracking-widest italic">Qachondan</p>
                                                <p className="text-xs font-bold text-white/80 flex items-center gap-2">
                                                   <Calendar className="w-3 h-3 text-primary" /> {b.start_datetime ? new Date(b.start_datetime).toLocaleDateString() : 'N/A'}
                                                </p>
                                             </div>
                                             <div className="w-10 h-0.5 bg-white/5 rounded-full" />
                                             <div className="flex flex-col gap-1">
                                                <p className="text-[9px] text-white/30 uppercase font-black tracking-widest italic">Qachongacha</p>
                                                <p className="text-xs font-bold text-white/80 flex items-center gap-2">
                                                   <History className="w-3 h-3 text-primary" /> {b.end_datetime ? new Date(b.end_datetime).toLocaleDateString() : 'N/A'}
                                                </p>
                                             </div>
                                          </div>
                                          <div className="flex gap-3">
                                             {b.status === 'pending' && (
                                                <>
                                                   <button
                                                      onClick={() => updateBookingStatus(b.id, 'confirmed')}
                                                      className="h-14 w-14 bg-white/5 text-green-500 rounded-3xl hover:bg-green-500 hover:text-white transition-all duration-700 flex items-center justify-center border border-white/5 shadow-xl hover:shadow-green-500/30"
                                                   >
                                                      <CheckCircle size={20} />
                                                   </button>
                                                   <button
                                                      onClick={() => {
                                                         const reason = prompt("Rad etish sababini kiriting:");
                                                         if (reason) updateBookingStatus(b.id, 'rejected', reason);
                                                      }}
                                                      className="h-14 w-14 bg-white/5 text-red-500 rounded-3xl hover:bg-red-500 hover:text-white transition-all duration-700 flex items-center justify-center border border-white/5 shadow-xl hover:shadow-red-500/30"
                                                   >
                                                      <XCircle size={20} />
                                                   </button>
                                                </>
                                             )}
                                             <button
                                                onClick={() => updateBookingStatus(b.id, 'completed')}
                                                className="h-14 px-8 bg-white/5 text-white/40 rounded-3xl hover:bg-white/10 hover:text-white transition-all duration-700 text-[10px] font-black uppercase tracking-widest border border-white/5"
                                             >
                                                YAKUNLASH
                                             </button>
                                          </div>
                                       </div>
                                    </div>
                                 </div>
                              </div>
                           ))}
                           {bookings.length === 0 && (
                              <div className="bg-[#111]/40 backdrop-blur-3xl p-32 rounded-[64px] border border-white/5 flex flex-col items-center text-center">
                                 <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-10">
                                    <ClipboardCheck className="w-12 h-12 text-white/10" />
                                 </div>
                                 <h3 className="text-2xl font-black uppercase tracking-tighter italic text-white/60">Arxiv bo'sh <span className="text-white/20">holatda</span></h3>
                                 <p className="text-xs font-medium max-w-sm text-white/20 mt-4 uppercase tracking-widest">Hozirda barcha buyurtmalar ko'rib chiqilgan.</p>
                              </div>
                           )}
                        </div>
                     )}

                     {/* Cars Tab (Original Enhanced) */}
                     {activeTab === "cars" && (
                        <div key="cars">
                           <div className="flex items-center justify-between mb-8">
                              <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">Avtomobillar <span className="text-white/20">Ro'yxati</span></h3>
                              <div className="flex gap-4">
                                 <div className="relative">
                                    <button 
                                       onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                                       className={`flex items-center gap-2 px-4 py-2 rounded-2xl border text-[9px] font-black uppercase transition-all ${showFilterDropdown ? 'bg-primary border-primary text-white' : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10'}`}
                                    >
                                       <Filter className="w-3.5 h-3.5" /> FILTRLAR
                                    </button>
                                    <AnimatePresence>
                                       {showFilterDropdown && (
                                          <motion.div 
                                             initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                             animate={{ opacity: 1, y: 0, scale: 1 }}
                                             exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                             className="absolute right-0 mt-2 w-48 bg-[#1A1A1A] border border-white/10 rounded-2xl p-2 shadow-2xl z-50 overflow-hidden"
                                          >
                                             {['all', 'available', 'rented'].map((f) => (
                                                <button
                                                   key={f}
                                                   onClick={() => { setStatusFilter(f); setShowFilterDropdown(false); }}
                                                   className={`w-full text-left px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${statusFilter === f ? 'bg-primary text-white' : 'text-white/40 hover:bg-white/5 hover:text-white'}`}
                                                >
                                                   {f === 'all' ? 'HAMMASI' : f.toUpperCase()}
                                                </button>
                                             ))}
                                          </motion.div>
                                       )}
                                    </AnimatePresence>
                                 </div>
                                 <button 
                                    onClick={() => exportToCSV(filteredCars, 'avtomobillar')}
                                    className="flex items-center gap-2 px-4 py-2 bg-primary/20 rounded-2xl border border-primary/20 text-[9px] font-black text-primary uppercase hover:bg-primary/30 transition-all"
                                 >
                                    <Download className="w-3.5 h-3.5" /> EKSPORT
                                 </button>
                              </div>
                           </div>
                           <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                              {filteredCars.map(car => (
                                 <div key={car.id} className="bg-[#111] rounded-[48px] overflow-hidden border border-white/5 group hover:border-primary/20 transition-all shadow-2xl relative">
                                    <div className="aspect-[16/10] overflow-hidden relative" style={{ background: 'linear-gradient(180deg, #1a1a1a 0%, #0a0a0a 100%)' }}>
                                       <img src={car.media?.card_main || car.main_image || "/images/cars/car-fallback.jpg"} alt={car.model} className="w-full h-full object-contain group-hover:scale-110 transition-all duration-700 opacity-80 group-hover:opacity-100" />
                                       <div className="absolute top-6 right-6 bg-black/60 backdrop-blur-xl px-5 py-2.5 rounded-2xl text-primary font-black text-xs italic tracking-tighter border border-white/10">
                                          {formatNarx(car.daily_price)}
                                       </div>
                                       <div className={`absolute top-6 left-6 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${car.is_available ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                                          {car.is_available ? 'BO\'SH' : 'BAND'}
                                       </div>
                                    </div>
                                    <div className="p-10">
                                       <div className="flex justify-between items-start mb-10">
                                          <div>
                                             <h4 className="text-2xl font-black text-white italic tracking-tighter uppercase mb-1">{car.brand} {car.model}</h4>
                                             <div className="flex items-center gap-3">
                                                <span className="px-2 py-0.5 bg-white/10 rounded border border-white/20 font-mono font-bold text-[10px] text-white uppercase tracking-widest">{car.plate_number || 'NO PLATE'}</span>
                                                <p className="text-[10px] text-white/30 font-black uppercase tracking-[0.2em]">{car.category} / {car.gearbox}</p>
                                             </div>
                                          </div>
                                          <div className="flex items-center gap-1.5 text-primary">
                                             <Star size={14} fill="currentColor" />
                                             <span className="text-sm font-black italic">{car.rating}</span>
                                          </div>
                                       </div>

                                       <div className="flex flex-wrap items-center gap-3">
                                          <button onClick={() => setEditCarModal({ isOpen: true, car })} className="flex-1 py-4 bg-white/5 hover:bg-white/10 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all text-white/60 hover:text-white flex items-center justify-center gap-2">
                                             <Edit size={14} /> TAHRIRLASH
                                          </button>
                                          <button onClick={() => setMaintenanceModal({ isOpen: true, carId: car.id })} className="flex-1 py-4 bg-orange-500/10 hover:bg-orange-500/20 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all text-orange-500 flex items-center justify-center gap-2">
                                             <Clock size={14} /> MAINTENANCE
                                          </button>
                                          <button onClick={() => deleteCar(car.id)} className="w-14 h-14 bg-white/5 hover:bg-red-500/10 hover:text-red-500 rounded-2xl text-white/40 transition-all flex items-center justify-center border border-white/5">
                                             <Trash2 size={18} />
                                          </button>
                                       </div>
                                    </div>
                                 </div>
                              ))}
                           </div>
                        </div>
                     )}

                     {/* Messages Tab */}
                     {activeTab === "messages" && (
                        <div key="messages" className="space-y-6">
                           {messages.map(m => (
                              <div key={m.id} className="bg-[#111] p-10 rounded-[48px] border border-white/5 hover:border-primary/20 transition-all shadow-xl relative overflow-hidden group">
                                 <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 blur-3xl pointer-events-none group-hover:bg-primary/5 transition-all" />
                                 <div className="flex justify-between items-start mb-10 pb-6 border-b border-white/5">
                                    <div className="flex items-center gap-4">
                                       <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-white/20">
                                          <MessageSquare className="w-6 h-6" />
                                       </div>
                                       <div>
                                          <h4 className="text-xl font-black text-white italic uppercase tracking-tighter mb-1">{m.name}</h4>
                                          <p className="text-[10px] text-white/30 font-black uppercase tracking-widest">{m.email} <span className="mx-2">|</span> {m.phone}</p>
                                       </div>
                                    </div>
                                    <span className="text-white/10 text-[9px] font-black uppercase tracking-widest">{new Date(m.created_at).toLocaleString()}</span>
                                 </div>
                                 <p className="text-sm font-medium text-white/60 leading-relaxed italic border-l-2 border-primary/30 pl-8 mb-6">"{m.message}"</p>
                                 <div className="flex justify-end">
                                    <button className="px-6 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-all">JAVOB QAYTARISH</button>
                                 </div>
                              </div>
                           ))}
                           {messages.length === 0 && <p className="text-gray-500 text-center py-20 bg-[#1e1f22] rounded-3xl border border-gray-800">No messages found.</p>}
                        </div>
                     )}

                  </AnimatePresence>
               </motion.div>
            )}

            {/* MODALS */}
            <AnimatePresence>
               {editCarModal.isOpen && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                     <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="bg-[#111] border border-white/10 p-8 rounded-[32px] w-full max-w-md relative flex flex-col">
                        <button onClick={() => setEditCarModal({ isOpen: false, car: null })} className="absolute top-6 right-6 text-white/30 hover:text-white transition-colors">
                           <X size={20} />
                        </button>
                        <h3 className="text-xl font-black text-white italic tracking-tighter uppercase mb-6">Tahrirlash: {editCarModal.car?.brand} {editCarModal.car?.model} <span className="text-white/40 text-sm">({editCarModal.car?.plate_number})</span></h3>
                        <form onSubmit={submitEditCar} className="space-y-6 flex-1 flex flex-col">
                           <div>
                              <label className="block text-[10px] font-black text-white/40 uppercase tracking-widest mb-2">Kunlik narx (so'm)</label>
                              <input type="number" name="daily_price" defaultValue={editCarModal.car?.daily_price} required className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 text-sm font-bold text-white focus:border-primary/50 focus:outline-none" />
                           </div>
                           <div>
                              <label className="block text-[10px] font-black text-white/40 uppercase tracking-widest mb-2">Status</label>
                              <select name="status" defaultValue={editCarModal.car?.status || 'available'} className="w-full bg-[#1A1A1A] border border-white/5 rounded-2xl p-4 text-sm font-bold text-white focus:border-primary/50 focus:outline-none pb-3 appearance-none">
                                 <option value="available">Available (Bo'sh)</option>
                                 <option value="rented">Rented (Band)</option>
                                 <option value="maintenance">Maintenance (Ta'mirda)</option>
                                 <option value="hidden">Hidden (Yashirin)</option>
                              </select>
                           </div>
                           <button type="submit" className="w-full py-4 mt-auto bg-primary text-white font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-orange-600 transition-colors">SAQLASH</button>
                        </form>
                     </motion.div>
                  </motion.div>
               )}

               {maintenanceModal.isOpen && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                     <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="bg-[#111] border border-white/10 p-8 rounded-[32px] w-full max-w-md relative flex flex-col">
                        <button onClick={() => setMaintenanceModal({ isOpen: false, carId: null })} className="absolute top-6 right-6 text-white/30 hover:text-white transition-colors">
                           <X size={20} />
                        </button>
                        <h3 className="text-xl font-black text-orange-500 italic tracking-tighter uppercase mb-6">TEXNIK XIZMAT</h3>
                        <form onSubmit={submitMaintenance} className="space-y-6 flex-1 flex flex-col">
                           <div>
                              <label className="block text-[10px] font-black text-white/40 uppercase tracking-widest mb-2">Sabab</label>
                              <input type="text" name="reason" placeholder="Masalan: Moy almashtirish..." required className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 text-sm font-bold text-white focus:border-orange-500/50 focus:outline-none" />
                           </div>
                           <div className="grid grid-cols-2 gap-4">
                              <div>
                                 <label className="block text-[10px] font-black text-white/40 uppercase tracking-widest mb-2">Boshlanish</label>
                                 <input type="datetime-local" name="start_datetime" required className="w-full bg-white/5 border border-white/5 rounded-xl p-3 text-[11px] font-bold text-white focus:border-orange-500/50 focus:outline-none" />
                              </div>
                              <div>
                                 <label className="block text-[10px] font-black text-white/40 uppercase tracking-widest mb-2">Tugash</label>
                                 <input type="datetime-local" name="end_datetime" required className="w-full bg-white/5 border border-white/5 rounded-xl p-3 text-[11px] font-bold text-white focus:border-orange-500/50 focus:outline-none" />
                              </div>
                           </div>
                           <button type="submit" className="w-full py-4 mt-auto bg-orange-500 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-orange-600 transition-colors shadow-[0_0_20px_rgba(249,115,22,0.1)]">TASDIQLASH</button>
                        </form>
                     </motion.div>
                  </motion.div>
               )}
            </AnimatePresence>

         </main>
         {/* User Detail Modal */}
         <AnimatePresence>
            {userModal.isOpen && (
               <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setUserModal({ isOpen: false, user: null, view: 'profile' })} className="absolute inset-0 bg-black/80 backdrop-blur-xl" />
                  <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="bg-[#111] border border-white/5 w-full max-w-2xl max-h-[85vh] rounded-[56px] overflow-hidden relative shadow-2xl flex flex-col">
                     <button onClick={() => setUserModal({ isOpen: false, user: null, view: 'profile' })} className="absolute top-8 right-8 text-white/20 hover:text-white transition-colors z-10">
                        <X size={24} />
                     </button>
                     
                     <div className="p-10 border-b border-white/5 bg-white/[0.02]">
                        <div className="flex items-center gap-6">
                           <div className="w-20 h-20 rounded-[24px] bg-white/5 border border-white/5 flex items-center justify-center overflow-hidden">
                              {userModal.user?.avatar ? (
                                 <img src={userModal.user.avatar.startsWith('http') ? userModal.user.avatar : `${MEDIA_BASE_URL}${userModal.user.avatar}`} alt="" className="w-full h-full object-cover" />
                              ) : (
                                 <User size={32} className="text-white/20" />
                              )}
                           </div>
                           <div>
                              <h3 className="text-3xl font-black text-white italic tracking-tighter uppercase">{userModal.user?.first_name} {userModal.user?.last_name}</h3>
                              <p className="text-xs text-white/30 font-bold uppercase tracking-widest">{userModal.user?.email}</p>
                           </div>
                        </div>

                        <div className="flex gap-4 mt-8">
                           <button 
                              onClick={() => setUserModal(prev => ({ ...prev, view: 'profile' }))}
                              className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${userModal.view === 'profile' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-white/5 text-white/30 hover:bg-white/10'}`}
                           >
                              Profil Ma'lumotlari
                           </button>
                           <button 
                              onClick={() => setUserModal(prev => ({ ...prev, view: 'history' }))}
                              className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${userModal.view === 'history' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-white/5 text-white/30 hover:bg-white/10'}`}
                           >
                              Bronlar Tarixi ({bookings.filter(b => b.user === userModal.user?.id || b.user_email === userModal.user?.email).length})
                           </button>
                        </div>
                     </div>

                     <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
                        {userModal.view === 'profile' ? (
                           <div className="space-y-8">
                              <div className="grid grid-cols-2 gap-8">
                                 <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/5">
                                    <p className="text-[10px] text-white/20 uppercase font-black tracking-widest mb-2">Telefon Raqami</p>
                                    <p className="text-sm font-bold text-white flex items-center gap-2"><Phone size={14} className="text-primary" /> {userModal.user?.phone_number || 'Noma\'lum'}</p>
                                 </div>
                                 <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/5">
                                    <p className="text-[10px] text-white/20 uppercase font-black tracking-widest mb-2">Loyallik Puanlari</p>
                                    <p className="text-sm font-bold text-primary italic flex items-center gap-2"><Star size={14} fill="currentColor" /> {userModal.user?.loyalty_points || 0} XP</p>
                                 </div>
                              </div>
                              <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/5">
                                 <p className="text-[10px] text-white/20 uppercase font-black tracking-widest mb-2">Yashash Manzili</p>
                                 <p className="text-sm font-bold text-white flex items-center gap-2"><MapPin size={14} className="text-primary" /> {userModal.user?.address || 'Noma\'lum'}</p>
                              </div>
                              <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/5">
                                 <p className="text-[10px] text-white/20 uppercase font-black tracking-widest mb-2">Status</p>
                                 <div className="flex items-center gap-3">
                                    <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase ${userModal.user?.verification_status === 'verified' ? 'bg-green-500/20 text-green-500' : 'bg-white/10 text-white/40'}`}>
                                       {userModal.user?.verification_status === 'verified' ? 'TASDIQLANGAN' : 'TASDIQLANMAGAN'}
                                    </span>
                                    <span className="text-[10px] text-white/20 italic">ID #{userModal.user?.id}</span>
                                 </div>
                              </div>
                           </div>
                        ) : (
                           <div className="space-y-4">
                              {bookings.filter(b => b.user === userModal.user?.id || b.user_email === userModal.user?.email).length > 0 ? (
                                 bookings.filter(b => b.user === userModal.user?.id || b.user_email === userModal.user?.email).map(b => (
                                    <div key={b.id} className="p-6 rounded-3xl bg-white/[0.03] border border-white/5 flex items-center justify-between hover:bg-white/5 transition-all">
                                       <div className="flex items-center gap-4">
                                          <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
                                             <History size={20} className="text-primary" />
                                          </div>
                                          <div>
                                             <p className="text-xs font-black text-white uppercase italic tracking-tighter">{b.car_brand} {b.car_model}</p>
                                             <p className="text-[9px] text-white/30 uppercase font-bold tracking-widest">{b.start_datetime?.split('T')[0]} — {b.end_datetime?.split('T')[0]}</p>
                                          </div>
                                       </div>
                                       <div className="text-right">
                                          <p className="text-xs font-black text-primary italic tracking-tighter">{formatNarx(b.total_price)}</p>
                                          <p className={`text-[8px] font-black uppercase italic ${b.status === 'completed' ? 'text-green-500' : 'text-orange-400'}`}>{b.status}</p>
                                       </div>
                                    </div>
                                 ))
                              ) : (
                                 <div className="py-20 text-center">
                                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 opacity-20">
                                       <History size={24} />
                                    </div>
                                    <p className="text-xs text-white/20 font-black uppercase tracking-widest italic">Hech qanday buyurtma topilmadi</p>
                                 </div>
                              )}
                           </div>
                        )}
                     </div>
                  </motion.div>
               </div>
            )}
         </AnimatePresence>

      </div>
   );
};

export default AdminPanel;
