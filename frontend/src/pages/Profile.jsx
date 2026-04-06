import { User, Heart, Calendar, LogOut, ChevronRight, Settings, Clock, CheckCircle, XCircle, Info, Star, CreditCard, ShieldCheck, AlertTriangle, Bell, Upload, Trash2, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { formatNarx } from '../utils/formatPrice';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient, { BASE_ORIGIN } from '../services/api/apiClient';
import { fetchMyLoyaltyAccount, fetchLoyaltyTiers } from '../services/api/loyalty';

const Profile = () => {
   const { user, logout } = useAuth();
   const [activeTab, setActiveTab] = useState('buyurtmalar');
   const [bookings, setBookings] = useState([]);
   const [loading, setLoading] = useState(true);
   const [showCardModal, setShowCardModal] = useState(false);
   const [paymentMethods, setPaymentMethods] = useState([]);
   const [loyaltyAccount, setLoyaltyAccount] = useState(null);
   const [loyaltyTiers, setLoyaltyTiers] = useState([]);
   const [newCard, setNewCard] = useState({ pan: '', expiry: '', holder: '', card_type: 'uzcard' });
   const [uploading, setUploading] = useState({ passport: false, license: false });

   const extractCollection = (payload) => {
      if (Array.isArray(payload)) return payload;
      if (Array.isArray(payload?.results)) return payload.results;
      return [];
   };

   const getImageUrl = (rawUrl) => {
      if (!rawUrl) return 'https://images.unsplash.com/photo-1542282088-fe8426682b8f?w=800';
      if (rawUrl.startsWith('http')) return rawUrl;
      return `${BASE_ORIGIN}${rawUrl}`;
   };

   useEffect(() => {
      const fetchProfileData = async () => {
         try {
            const [bookingsResult, methodsResult, loyaltyResult, tiersResult] = await Promise.allSettled([
               apiClient.get('/bookings/my/'),
               apiClient.get('/payments/methods/'),
               fetchMyLoyaltyAccount(),
               fetchLoyaltyTiers(),
            ]);

            if (bookingsResult.status === 'fulfilled') {
               setBookings(extractCollection(bookingsResult.value.data));
            }

            if (methodsResult.status === 'fulfilled') {
               setPaymentMethods(extractCollection(methodsResult.value.data));
            }

            if (loyaltyResult.status === 'fulfilled') {
               setLoyaltyAccount(loyaltyResult.value);
            }

            if (tiersResult.status === 'fulfilled') {
               setLoyaltyTiers(extractCollection(tiersResult.value));
            }
         } catch (error) {
            console.error('Error loading profile data:', error);
         } finally {
            setLoading(false);
         }
      };

      fetchProfileData();
   }, []);

   const parseExpiry = (expiry) => {
      const [monthRaw, yearRaw] = (expiry || '').split('/');
      const month = (monthRaw || '').replace(/\D/g, '').slice(0, 2);
      const year = (yearRaw || '').replace(/\D/g, '').slice(0, 2);

      if (!month || !year) return null;
      const monthNumber = Number(month);
      if (Number.isNaN(monthNumber) || monthNumber < 1 || monthNumber > 12) return null;

      return { month, year };
   };

   const getMaskedPan = (pan) => {
      const digits = (pan || '').replace(/\D/g, '').slice(0, 16);
      if (digits.length < 8) return '';
      return `${digits.slice(0, 4)} **** **** ${digits.slice(-4)}`;
   };

   const handleAddCard = async (e) => {
      e.preventDefault();

      const parsedExpiry = parseExpiry(newCard.expiry);
      const maskedPan = getMaskedPan(newCard.pan);
      if (!parsedExpiry || !maskedPan) {
         alert('Karta ma\'lumotlari noto\'g\'ri. Iltimos tekshiring.');
         return;
      }

      try {
         const response = await apiClient.post('/payments/methods/', {
            card_type: newCard.card_type,
            masked_pan: maskedPan,
            expiry_month: parsedExpiry.month,
            expiry_year: parsedExpiry.year,
            card_holder: newCard.holder.trim(),
         });

         setPaymentMethods((prev) => [response.data, ...prev]);
         setNewCard({ pan: '', expiry: '', holder: '', card_type: 'uzcard' });
         alert('Karta muvaffaqiyatli qo\'shildi!');
         setShowCardModal(false);
      } catch (error) {
         alert('Xatolik yuz berdi!');
      }
   };

   const handleFileUpload = async (type, file) => {
      if (!file) return;
      setUploading({ ...uploading, [type]: true });
      const formData = new FormData();
      formData.append(type === 'passport' ? 'passport_image' : 'driver_license_image', file);

      try {
         await apiClient.post('/users/me/upload-documents/', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
         });
         alert('Hujjat yuklandi!');
      } catch (error) {
         alert('Yuklashda xatolik!');
      } finally {
         setUploading({ ...uploading, [type]: false });
      }
   };

   const tabs = [
      { id: 'buyurtmalar', label: 'BUYURTMALARIM', icon: Calendar },
      { id: 'hujjatlar', label: 'HUJJATLAR', icon: ShieldCheck },
      { id: 'kartalar', label: 'TO\'LOV KARTALARI', icon: CreditCard },
      { id: 'sevimlilar', label: 'SEVIMLILAR', icon: Heart },
      { id: 'profil', label: 'PROFIL', icon: Settings },
   ];

   const currentPoints = loyaltyAccount?.points ?? user?.loyalty_points ?? 0;
   const currentLifetimePoints = loyaltyAccount?.lifetime_points ?? currentPoints;
   const currentTierName = loyaltyAccount?.tier?.name || 'Bronze';
   const nextTier = loyaltyTiers.find((tier) => tier.min_points > currentLifetimePoints);
   const pointsToNextTier = nextTier ? Math.max(0, nextTier.min_points - currentLifetimePoints) : 0;

   return (
      <div className="bg-[#0A0A0A] min-h-screen text-white pt-32 pb-40">
         <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col lg:flex-row gap-12">
               {/* Sidebar */}
               <aside className="w-full lg:w-80 space-y-8">
                  <div className="glass p-8 rounded-[40px] border-white/10 relative overflow-hidden">
                     <div className="absolute top-0 right-0 p-4">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                     </div>
                     <div className="flex items-center gap-6 mb-8">
                        <div className="w-20 h-20 rounded-3xl bg-primary/10 border-2 border-primary/20 flex items-center justify-center p-1">
                           <img src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.first_name}&background=random`} className="w-full h-full object-cover rounded-2xl" alt="" />
                        </div>
                        <div>
                           <h3 className="text-xl font-black italic tracking-tighter uppercase">{user?.first_name} {user?.last_name}</h3>
                           <p className="text-[10px] text-white/40 font-bold tracking-widest uppercase">{user?.is_corporate ? 'Korporativ Mijoz' : 'Premium Mijoz'}</p>
                        </div>
                     </div>
                     <div className="space-y-2">
                        {tabs.map(tab => (
                           <button
                              key={tab.id}
                              onClick={() => setActiveTab(tab.id)}
                              className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all group ${activeTab === tab.id ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'hover:bg-white/5 text-white/40 hover:text-white'}`}
                           >
                              <div className="flex items-center gap-4">
                                 <tab.icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${activeTab === tab.id ? 'text-white' : 'text-white/20'}`} />
                                 <span className="text-[10px] font-black tracking-widest uppercase">{tab.label}</span>
                              </div>
                              <ChevronRight className={`w-4 h-4 transition-transform ${activeTab === tab.id ? 'translate-x-1' : 'opacity-0 group-hover:opacity-100'}`} />
                           </button>
                        ))}
                        <button onClick={logout} className="w-full flex items-center gap-4 p-4 rounded-2xl text-red-500/50 hover:text-red-500 hover:bg-red-500/5 transition-all mt-4">
                           <LogOut className="w-5 h-5" />
                           <span className="text-[10px] font-black tracking-widest uppercase">CHIQISH</span>
                        </button>
                     </div>
                  </div>

                  <div className="glass p-8 rounded-[40px] border-white/5 bg-primary/5">
                     <div className="flex items-center gap-4 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                           <Star className="w-5 h-5 text-white" />
                        </div>
                        <div>
                           <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Loyallik Ballari</p>
                           <p className="text-2xl font-black italic tracking-tighter text-primary">{currentPoints} PTS</p>
                           <p className="text-[9px] text-white/30 font-black uppercase tracking-widest mt-1">Tier: {currentTierName}</p>
                        </div>
                     </div>
                     <p className="text-[9px] text-white/30 leading-relaxed font-black uppercase tracking-widest">
                        {nextTier ? `Keyingi ${nextTier.name} tiergacha yana ${pointsToNextTier} ball qoldi.` : 'Siz eng yuqori tierdasiz.'}
                     </p>
                  </div>
               </aside>

               {/* Main Content */}
               <main className="flex-1 min-h-[600px] relative">
                  <AnimatePresence mode="wait">
                     {activeTab === 'buyurtmalar' && (
                        <motion.div
                           key="buyurtmalar"
                           initial={{ opacity: 0, x: 20 }}
                           animate={{ opacity: 1, x: 0 }}
                           exit={{ opacity: 0, x: -20 }}
                           className="space-y-6"
                        >
                           <div className="flex items-center justify-between mb-8">
                              <h2 className="text-2xl font-bold tracking-tight">Mening Buyurtmalarim</h2>
                              <div className="flex gap-2">
                                 <span className="px-4 py-2 rounded-full bg-white/5 border border-white/5 text-[10px] font-bold uppercase tracking-widest text-white/40">Barchasi ({bookings.length})</span>
                              </div>
                           </div>

                           {loading ? (
                              <div className="grid gap-6">
                                 {[1, 2, 3].map(i => <div key={i} className="h-40 glass animate-pulse border-white/5 rounded-3xl" />)}
                              </div>
                           ) : bookings.length === 0 ? (
                              <div className="flex flex-col items-center justify-center py-24 glass rounded-[48px] border-white/5 border-dashed border-2">
                                 <Clock className="w-16 h-16 text-white/5 mb-6" />
                                 <p className="text-white/20 font-bold uppercase tracking-widest text-xs">Hozircha buyurtmalar yo'q</p>
                                 <Link to="/fleet" className="mt-8 btn-primary px-10 py-4 text-[10px] font-black tracking-widest uppercase">Katalogga o'tish</Link>
                              </div>
                           ) : (
                              <div className="grid gap-6">
                                 {bookings.map(booking => (
                                    <div key={booking.id} className="glass p-8 rounded-[40px] border-white/10 group hover:border-primary/30 transition-all">
                                       <div className="flex flex-col md:flex-row gap-8">
                                          <div className="w-full md:w-56 aspect-[16/10] rounded-3xl overflow-hidden border border-white/5 relative">
                                             <img src={getImageUrl(booking?.car_info?.main_image)} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                                             <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                                             <div className="absolute bottom-4 left-4">
                                                <span className="px-3 py-1 rounded-full bg-primary/90 text-[8px] font-black text-white uppercase tracking-widest">Premium</span>
                                             </div>
                                          </div>
                                          <div className="flex-1 space-y-6">
                                             <div className="flex justify-between items-start">
                                                <div>
                                                   <h3 className="text-2xl font-black italic tracking-tighter uppercase mb-1">{booking?.car_info?.brand} {booking?.car_info?.model}</h3>
                                                   <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest mb-4">#BOOK-{String(booking.id).padStart(6, '0')} • ID: {booking.id}</p>
                                                </div>
                                                <div className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2 ${
                                                   booking.status === 'completed' ? 'bg-green-500/10 text-green-500' :
                                                      booking.status === 'pending' ? 'bg-orange-500/10 text-orange-500' :
                                                         booking.status === 'cancelled' ? 'bg-red-500/10 text-red-500' : 'bg-primary/10 text-primary'
                                                }`}>
                                                   {booking.status === 'completed' ? <CheckCircle className="w-3 h-3" /> :
                                                      booking.status === 'cancelled' ? <XCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                                                   {booking.status}
                                                </div>
                                             </div>
                                             <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                                                <div>
                                                   <p className="text-[9px] text-white/20 uppercase font-black tracking-widest mb-2">Ijara Sanasi</p>
                                                   <p className="text-sm font-bold text-white/80">{booking.start_date} — {booking.end_date}</p>
                                                </div>
                                                <div>
                                                   <p className="text-[9px] text-white/20 uppercase font-black tracking-widest mb-2">Jami Summa</p>
                                                   <p className="text-sm font-bold text-primary italic">{formatNarx(booking.total_price)}</p>
                                                </div>
                                                <div className="flex items-end md:justify-end">
                                                   <button className="flex items-center gap-2 text-[10px] font-black text-white/40 hover:text-white uppercase tracking-widest transition-colors">
                                                      Tafsilotlar <ChevronRight className="w-4 h-4" />
                                                   </button>
                                                </div>
                                             </div>
                                          </div>
                                       </div>
                                    </div>
                                 ))}
                              </div>
                           )}
                        </motion.div>
                     )}

                     {activeTab === 'hujjatlar' && (
                        <motion.div
                           key="hujjatlar"
                           initial={{ opacity: 0, x: 20 }}
                           animate={{ opacity: 1, x: 0 }}
                           exit={{ opacity: 0, x: -20 }}
                           className="space-y-8"
                        >
                           <h2 className="text-2xl font-bold tracking-tight mb-8">Hujjatlarni Tasdiqlash</h2>
                           <div className="grid md:grid-cols-2 gap-8">
                              <div className="glass p-10 space-y-6 border-white/10 relative overflow-hidden group">
                                 <div className="flex items-center justify-between">
                                    <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center">
                                       <ShieldCheck className="w-6 h-6 text-primary" />
                                    </div>
                                    {user?.verification_status === 'verified' && <CheckCircle className="text-green-500 w-6 h-6" />}
                                 </div>
                                 <div>
                                    <h3 className="text-xl font-black italic tracking-tighter uppercase mb-2">Passport / ID Karta</h3>
                                    <p className="text-xs text-white/30 leading-relaxed font-medium">Shaxsingizni tasdiqlash uchun passportingizning asosiy sahifasini yuklang.</p>
                                 </div>
                                 <div className="relative pt-4">
                                    <input
                                       type="file"
                                       id="passport-upload"
                                       className="hidden"
                                       accept="image/*"
                                       onChange={(e) => handleFileUpload('passport', e.target.files[0])}
                                    />
                                    <label
                                       htmlFor="passport-upload"
                                       className={`flex items-center justify-center gap-3 w-full py-5 rounded-2xl border-2 border-dashed transition-all cursor-pointer ${uploading.passport ? 'border-primary/50 bg-primary/5' : 'border-white/10 hover:border-primary/30 hover:bg-white/5'}`}
                                    >
                                       {uploading.passport ? (
                                          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                       ) : (
                                          <><Upload className="w-5 h-5 text-white/20" /> <span className="text-[10px] font-black uppercase tracking-widest">Rasm yuklash</span></>
                                       )}
                                    </label>
                                 </div>
                                 {user?.verification_status === 'verified' && (
                                    <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-100 transition-opacity">
                                       <div className="px-3 py-1 rounded-full bg-green-500/20 text-green-500 text-[8px] font-black uppercase tracking-widest">Tasdiqlangan</div>
                                    </div>
                                 )}
                              </div>

                              <div className="glass p-10 space-y-6 border-white/10 relative overflow-hidden group">
                                 <div className="flex items-center justify-between">
                                    <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center">
                                       <CreditCard className="w-6 h-6 text-primary" />
                                    </div>
                                 </div>
                                 <div>
                                    <h3 className="text-xl font-black italic tracking-tighter uppercase mb-2">Haydovchilik Guvohnomasi</h3>
                                    <p className="text-xs text-white/30 leading-relaxed font-medium">Mashina ijaraga olish uchun guvohnomangizning ikki tarafdan rasmini yuklang.</p>
                                 </div>
                                 <div className="relative pt-4">
                                    <input
                                       type="file"
                                       id="license-upload"
                                       className="hidden"
                                       accept="image/*"
                                       onChange={(e) => handleFileUpload('license', e.target.files[0])}
                                    />
                                    <label
                                       htmlFor="license-upload"
                                       className={`flex items-center justify-center gap-3 w-full py-5 rounded-2xl border-2 border-dashed transition-all cursor-pointer ${uploading.license ? 'border-primary/50 bg-primary/5' : 'border-white/10 hover:border-primary/30 hover:bg-white/5'}`}
                                    >
                                       {uploading.license ? (
                                          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                       ) : (
                                          <><Upload className="w-5 h-5 text-white/20" /> <span className="text-[10px] font-black uppercase tracking-widest">Rasm yuklash</span></>
                                       )}
                                    </label>
                                 </div>
                              </div>
                           </div>

                           <div className="p-8 rounded-[32px] bg-white/5 border border-white/5 flex items-start gap-6 italic">
                              <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center shrink-0">
                                 <AlertTriangle className="w-5 h-5 text-orange-500" />
                              </div>
                              <p className="text-xs text-white/40 leading-relaxed font-medium">
                                 Hujjatlaringiz maxfiy ravishda saqlanadi va faqat shaxsingizni tasdiqlash uchun ishlatiladi. Tasdiqlash jarayoni <span className="text-white font-bold">24 soatgacha</span> vaqt olishi mumkin.
                              </p>
                           </div>
                        </motion.div>
                     )}

                     {activeTab === 'kartalar' && (
                        <motion.div
                           key="kartalar"
                           initial={{ opacity: 0, x: 20 }}
                           animate={{ opacity: 1, x: 0 }}
                           exit={{ opacity: 0, x: -20 }}
                           className="space-y-8"
                        >
                           <div className="flex items-center justify-between mb-8">
                              <h2 className="text-2xl font-bold tracking-tight">To'lov Kartalari</h2>
                              <button onClick={() => setShowCardModal(true)} className="btn-primary px-8 py-4 text-[10px] font-black tracking-widest uppercase flex items-center gap-3">
                                 <CreditCard className="w-4 h-4" /> YANGI KARTA
                              </button>
                           </div>

                           <div className="grid md:grid-cols-2 gap-8">
                              {paymentMethods.map((method) => (
                                 <div key={method.id} className="relative group cursor-pointer h-64">
                                    <div className="absolute inset-0 bg-gradient-to-br from-[#111] to-black rounded-[40px] border-2 border-primary shadow-2xl p-10 overflow-hidden transform group-hover:scale-[1.02] transition-all duration-500">
                                       <div className="absolute top-0 right-0 w-80 h-80 bg-primary/10 blur-[80px] rounded-full -mr-40 -mt-40" />
                                       <div className="relative h-full flex flex-col justify-between">
                                          <div className="flex justify-between items-start">
                                             <div className="flex gap-2">
                                                <div className="w-16 h-8 bg-white/10 rounded flex items-center justify-center text-[10px] font-black uppercase text-white/40 tracking-widest">
                                                   {method.card_type}
                                                </div>
                                                {method.is_default && (
                                                   <div className="w-16 h-8 bg-green-600 rounded flex items-center justify-center text-[8px] font-black uppercase text-white tracking-widest shadow-lg shadow-green-500/20">
                                                      DEFAULT
                                                   </div>
                                                )}
                                             </div>
                                             <Trash2 className="w-5 h-5 text-white/10" />
                                          </div>
                                          <div>
                                             <p className="text-2xl font-display font-black text-white tracking-[0.2em] mb-4">{(method.masked_pan || '').replace(/\*/g, '•')}</p>
                                             <div className="flex justify-between items-center">
                                                <div>
                                                   <p className="text-[8px] text-white/20 uppercase font-black tracking-widest mb-1">Karta Egasi</p>
                                                   <p className="text-xs font-bold text-white uppercase italic">{method.card_holder || `${user?.first_name || ''} ${user?.last_name || ''}`}</p>
                                                </div>
                                                <div className="text-right">
                                                   <p className="text-[8px] text-white/20 uppercase font-black tracking-widest mb-1">Amal Qilish</p>
                                                   <p className="text-xs font-bold text-white">{method.expiry_month} / {method.expiry_year}</p>
                                                </div>
                                             </div>
                                          </div>
                                       </div>
                                    </div>
                                 </div>
                              ))}

                              <button onClick={() => setShowCardModal(true)} className="flex flex-col items-center justify-center gap-6 glass rounded-[40px] border-white/5 border-dashed border-2 hover:border-primary/50 hover:bg-primary/5 transition-all group">
                                 <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                                    <CreditCard className="w-8 h-8 text-white/20 group-hover:text-white" />
                                 </div>
                                 <p className="text-[10px] font-black text-white/20 group-hover:text-primary uppercase tracking-widest">Yangi karta bog'lash</p>
                              </button>
                           </div>

                           <div className="p-8 rounded-[32px] glass border-white/5 flex items-center gap-6">
                              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                 <Zap className="w-5 h-5 text-primary" />
                              </div>
                              <p className="text-[10px] text-white/30 leading-relaxed font-black uppercase tracking-widest italic">
                                 Birinchi to'lovdan so'ng kartangiz avtomatik tarzda tasdiqlanadi.
                              </p>
                           </div>
                        </motion.div>
                     )}

                     {activeTab === 'sevimlilar' && (
                        <motion.div
                           key="sevimlilar"
                           initial={{ opacity: 0, x: 20 }}
                           animate={{ opacity: 1, x: 0 }}
                           exit={{ opacity: 0, x: -20 }}
                        >
                           <h2 className="text-2xl font-bold tracking-tight mb-8">Saralangan Avtomobillar</h2>
                           <div className="flex flex-col items-center justify-center py-24 glass rounded-[48px] border-white/5">
                              <Heart className="w-16 h-16 text-white/5 mb-6" />
                              <p className="text-white/20 font-bold uppercase tracking-widest text-xs">Hozircha sevimlilar yo'q</p>
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
                              <div className="grid md:grid-cols-2 gap-8">
                                 <div className="space-y-2">
                                    <label className="text-[10px] text-white/30 uppercase font-black tracking-widest ml-1">Haydovchilik guvohnomasi</label>
                                    <input type="text" defaultValue={user?.driver_license} placeholder="Masalan: AF 1234567" className="w-full bg-[#111] border border-white/5 rounded-2xl py-4 px-4 text-sm focus:border-primary/50 outline-none" />
                                 </div>
                                 <div className="space-y-2">
                                    <label className="text-[10px] text-white/30 uppercase font-black tracking-widest ml-1">Pasport yoki ID Karta</label>
                                    <input type="text" defaultValue={user?.passport_number} placeholder="Masalan: AA 1234567" className="w-full bg-[#111] border border-white/5 rounded-2xl py-4 px-4 text-sm focus:border-primary/50 outline-none" />
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

                  {/* Add Card Modal */}
                  <AnimatePresence>
                     {showCardModal && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
                           <motion.div 
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              onClick={() => setShowCardModal(false)}
                              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                           />
                           <motion.div 
                              initial={{ opacity: 0, scale: 0.9, y: 20 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.9, y: 20 }}
                              className="relative w-full max-w-lg glass p-10 border-white/10 shadow-2xl"
                           >
                              <h3 className="text-2xl font-bold mb-8">Yangi Karta Qo'shish</h3>
                              <form onSubmit={handleAddCard} className="space-y-6">
                                 <div className="flex gap-4 p-1 bg-white/5 rounded-2xl mb-8">
                                    <button 
                                       type="button"
                                       onClick={() => setNewCard({...newCard, card_type: 'uzcard'})}
                                       className={`flex-1 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${newCard.card_type === 'uzcard' ? 'bg-primary text-white' : 'text-white/40'}`}
                                    >Uzcard</button>
                                    <button 
                                       type="button"
                                       onClick={() => setNewCard({...newCard, card_type: 'humo'})}
                                       className={`flex-1 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${newCard.card_type === 'humo' ? 'bg-primary text-white' : 'text-white/40'}`}
                                    >Humo</button>
                                 </div>

                                 <div className="space-y-2">
                                    <label className="text-[10px] text-white/30 uppercase font-black tracking-widest ml-1">Karta Raqami</label>
                                    <input 
                                       type="text" 
                                       required
                                       placeholder="8600 **** **** ****"
                                       value={newCard.pan}
                                       onChange={(e) => setNewCard({...newCard, pan: e.target.value.replace(/\D/g, '').slice(0, 16)})}
                                       className="w-full bg-[#111] border border-white/5 rounded-2xl py-4 px-4 text-sm focus:border-primary/50 outline-none font-mono tracking-widest" 
                                    />
                                 </div>

                                 <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                       <label className="text-[10px] text-white/30 uppercase font-black tracking-widest ml-1">Amal Qilish Muddati</label>
                                       <input 
                                          type="text" 
                                          required
                                          placeholder="MM/YY"
                                          value={newCard.expiry}
                                          onChange={(e) => setNewCard({...newCard, expiry: e.target.value.replace(/[^0-9/]/g, '').slice(0, 5)})}
                                          className="w-full bg-[#111] border border-white/5 rounded-2xl py-4 px-4 text-sm focus:border-primary/50 outline-none font-mono" 
                                       />
                                    </div>
                                    <div className="space-y-2">
                                       <label className="text-[10px] text-white/30 uppercase font-black tracking-widest ml-1">Karta Egasi</label>
                                       <input 
                                          type="text" 
                                          required
                                          placeholder="ISM FAMILIYA"
                                          value={newCard.holder}
                                          onChange={(e) => setNewCard({...newCard, holder: e.target.value.toUpperCase()})}
                                          className="w-full bg-[#111] border border-white/5 rounded-2xl py-4 px-4 text-sm focus:border-primary/50 outline-none" 
                                       />
                                    </div>
                                 </div>

                                 <div className="pt-6 flex gap-4">
                                    <button type="button" onClick={() => setShowCardModal(false)} className="btn-secondary flex-1 py-4 text-xs font-bold">BEKOR QILISH</button>
                                    <button type="submit" className="btn-primary flex-1 py-4 text-xs font-bold">SAQLASH</button>
                                 </div>
                              </form>
                           </motion.div>
                        </div>
                     )}
                  </AnimatePresence>
               </main>
            </div>
         </div>
      </div>
   );
};

export default Profile;
