import { User, Heart, Calendar, LogOut, ChevronRight, Settings, Clock, CheckCircle, XCircle, Info, Star, CreditCard, ShieldCheck, AlertTriangle, Bell, Upload, Trash2, Zap, FileText, Download, FileDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { formatNarx } from '../utils/formatPrice';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient, { BASE_ORIGIN } from '../services/api/apiClient';
import { fetchMyLoyaltyAccount, fetchLoyaltyTiers } from '../services/api/loyalty';
import { fetchMyKyc, updateKycDocuments, submitKyc } from '../services/api/kyc';
import { updateProfile } from '../utils/api';
import { fetchInvoices, downloadInvoiceFile } from '../services/api/payments';
import { CreditCard as CardIcon } from 'lucide-react';

// Sub-components
import ProfileOverview from '../components/profile/ProfileOverview';
import BookingHistory from '../components/profile/BookingHistory';
import KYCSection from '../components/profile/KYCSection';
import CardManagement from '../components/profile/CardManagement';
import BillingHistory from '../components/profile/BillingHistory';
import ProfileSettings from '../components/profile/ProfileSettings';
import BookingDetailsModal from '../components/profile/BookingDetailsModal';
import NotificationsSection from '../components/profile/Notifications';

const Profile = () => {
   const { user, logout } = useAuth();
   const [activeTab, setActiveTab] = useState('buyurtmalar');
   const [bookings, setBookings] = useState([]);
   const [loading, setLoading] = useState(true);
   const [showCardModal, setShowCardModal] = useState(false);
   const [paymentMethods, setPaymentMethods] = useState([]);
   const [loyaltyAccount, setLoyaltyAccount] = useState(null);
   const [loyaltyTiers, setLoyaltyTiers] = useState([]);
   const [kycData, setKycData] = useState(null);
   const [invoices, setInvoices] = useState([]);
   const [notifications, setNotifications] = useState([]);
   const [downloadingInvoice, setDownloadingInvoice] = useState(null);
   const [profileForm, setProfileForm] = useState({
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      phone_number: user?.phone_number || '',
      address: user?.address || '',
      passport_number: user?.passport_number || '',
      driver_license: user?.driver_license || ''
   });
   const [newCard, setNewCard] = useState({ pan: '', expiry: '', holder: '', card_type: 'uzcard' });
   const [uploading, setUploading] = useState({ passport: false, license: false, selfie: false, profile: false });
   const [selectedBooking, setSelectedBooking] = useState(null);

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
            const [bookingsResult, methodsResult, loyaltyResult, tiersResult, kycResult, invoicesResult, notificationsResult] = await Promise.allSettled([
               apiClient.get('/bookings/my/'),
               apiClient.get('/payments/methods/'),
               fetchMyLoyaltyAccount(),
               fetchLoyaltyTiers(),
               fetchMyKyc(),
               fetchInvoices(),
               apiClient.get('/users/notifications/'),
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
            if (kycResult.status === 'fulfilled') {
               setKycData(kycResult.value);
            }
            if (invoicesResult.status === 'fulfilled') {
               setInvoices(extractCollection(invoicesResult.value));
            }
            if (notificationsResult.status === 'fulfilled') {
               setNotifications(extractCollection(notificationsResult.value.data));
            }
         } catch (error) {
            console.error('Error loading profile data:', error);
         } finally {
            setLoading(false);
         }
      };

      fetchProfileData();
   }, []);

   const handleFileUpload = async (type, file) => {
      if (!file) return;
      setUploading({ ...uploading, [type]: true });
      try {
         const formData = new FormData();
         if (type === 'passport') formData.append('passport_front_image', file);
         if (type === 'license') formData.append('license_image', file);
         
         const updated = await updateKycDocuments(formData);
         setKycData(updated);
      } catch (error) {
         alert('Yuklashda xatolik!');
      } finally {
         setUploading({ ...uploading, [type]: false });
      }
   };

   const handleSubmitKyc = async () => {
      try {
         const updated = await submitKyc();
         setKycData(updated);
         alert('Hujjatlar ko\'rib chiqish uchun yuborildi!');
      } catch (error) {
         const msg = error.response?.data?.error || 'Xatolik yuz berdi!';
         alert(msg);
      }
   };

   const handleAddCard = async (e) => {
      e.preventDefault();
      try {
         const [exp_month, exp_year] = (newCard.expiry || '').split('/');
         if (!exp_month || !exp_year) throw new Error('Invalid expiry');
         
         const payload = {
            pan: newCard.pan,
            holder: newCard.holder,
            expiry_month: exp_month.trim(),
            expiry_year: exp_year.trim(),
            card_type: newCard.card_type
         };
         await apiClient.post('/payments/methods/', payload);
         const res = await apiClient.get('/payments/methods/');
         setPaymentMethods(extractCollection(res.data));
         setShowCardModal(false);
         setNewCard({ pan: '', expiry: '', holder: '', card_type: 'uzcard' });
      } catch (error) {
         alert('Xatolik! Ma\'lumotlarni tekshiring.');
      }
   };

   const handleRemoveCard = async (id) => {
      if (!confirm('Ushbu kartani o\'chirishni xohlaysizmi?')) return;
      try {
         await apiClient.delete(`/payments/methods/${id}/`);
         setPaymentMethods(prev => prev.filter(m => m.id !== id));
      } catch (error) {
         alert('O\'chirishda xatolik!');
      }
   };

   const handleDownloadInvoice = async (invoiceId, invoiceNumber) => {
      setDownloadingInvoice(invoiceId);
      try {
         const blob = await downloadInvoiceFile(invoiceId);
         const url = URL.createObjectURL(blob);
         const a = document.createElement('a');
         a.href = url;
         a.download = `${invoiceNumber || 'invoice'}.pdf`;
         document.body.appendChild(a);
         a.click();
         a.remove();
         URL.revokeObjectURL(url);
      } catch (error) {
         alert('Yuklab olishda xatolik!');
      } finally {
         setDownloadingInvoice(null);
      }
   };

   const handleSaveProfile = async (e) => {
      e.preventDefault();
      setUploading({ ...uploading, profile: true });
      try {
         await updateProfile(profileForm);
         alert('Profil ma\'lumotlari saqlandi!');
      } catch (error) {
         alert('Xatolik yuz berdi!');
      } finally {
         setUploading({ ...uploading, profile: false });
      }
   };

   const handleMarkAllNotificationsRead = async () => {
      try {
         await apiClient.post('/users/notifications/read-all/');
         setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      } catch (error) {
         console.error(error);
      }
   };

   const handleMarkNotificationRead = async (id) => {
      try {
         await apiClient.post(`/users/notifications/${id}/read/`);
         setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
      } catch (error) {
         console.error(error);
      }
   };

   const tabs = [
      { id: 'buyurtmalar', label: 'BUYURTMALARIM', icon: Calendar },
      { id: 'hujjatlar', label: 'HUJJATLAR', icon: ShieldCheck },
      { id: 'kartalar', label: 'TO\'LOV KARTALARI', icon: CreditCard },
      { id: 'to\'lovlar', label: 'TO\'LOVLAR TARIXI', icon: CardIcon },
      { id: 'bildirishnomalar', label: 'BILDIRISHNOMALAR', icon: Bell },
      { id: 'sevimlilar', label: 'SEVIMLILAR', icon: Heart },
      { id: 'profil', label: 'PROFIL', icon: Settings },
   ];

   if (loading) {
      return (
         <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
            <div className="flex flex-col items-center gap-6">
               <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
               <p className="text-[10px] font-black tracking-[0.3em] text-white/20 uppercase">Ma'lumotlar yuklanmoqda</p>
            </div>
         </div>
      );
   }

   return (
      <div className="min-h-screen bg-[#0A0A0A] text-white py-32 px-4 md:px-10">
         <div className="container mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 px-4">
               <div className="space-y-4">
                  <div className="flex items-center gap-4 text-primary">
                     <div className="h-px w-12 bg-primary/30" />
                     <span className="text-[10px] font-black uppercase tracking-[0.4em] italic">Shaxsiy Kabinet</span>
                  </div>
                  <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter uppercase italic">
                     Salom, {user?.first_name || user?.username}
                  </h1>
               </div>
               <button onClick={logout} className="group flex items-center gap-4 text-white/30 hover:text-white transition-all pb-2">
                  <span className="text-[10px] font-black uppercase tracking-widest">Tizimdan chiqish</span>
                  <div className="w-10 h-10 rounded-full bg-white/5 border border-white/5 flex items-center justify-center group-hover:bg-red-500 group-hover:border-red-500 transition-all">
                     <LogOut className="w-4 h-4" />
                  </div>
               </button>
            </div>

            <div className="grid lg:grid-cols-12 gap-16">
               {/* Sidebar */}
               <div className="lg:col-span-3 space-y-2">
                  {tabs.map((tab) => {
                     const unreadCount = tab.id === 'bildirishnomalar' ? notifications.filter(n => !n.is_read).length : 0;
                     
                     return (
                        <button
                           key={tab.id}
                           onClick={() => setActiveTab(tab.id)}
                           className={`w-full flex items-center gap-4 px-8 py-5 rounded-2xl transition-all duration-500 group relative ${
                              activeTab === tab.id 
                              ? 'bg-primary text-white shadow-[0_20px_40px_-15px_rgba(255,107,0,0.3)]' 
                              : 'hover:bg-white/5 border border-transparent hover:border-white/5'
                           }`}
                        >
                           <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-white' : 'text-white/20 group-hover:text-white/50'}`} />
                           <span className={`text-[10px] font-black uppercase tracking-widest ${activeTab === tab.id ? 'text-white' : 'text-white/30 group-hover:text-white'}`}>
                              {tab.label}
                           </span>
                           {unreadCount > 0 && (
                              <span className="ml-auto w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center text-[9px] font-black shadow-lg shadow-orange-500/20">
                                 {unreadCount}
                              </span>
                           )}
                        </button>
                     );
                  })}
               </div>

               {/* Content */}
               <div className="lg:col-span-9">
                  <AnimatePresence mode="wait">
                     {activeTab === 'buyurtmalar' && (
                        <motion.div key="buyurtmalar" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                           <ProfileOverview 
                              user={user} 
                              loyaltyAccount={loyaltyAccount} 
                              loyaltyTiers={loyaltyTiers} 
                              bookingsCount={bookings.length}
                              favoriteCount={0}
                           />
                           <BookingHistory bookings={bookings} onSelectDetail={setSelectedBooking} />
                        </motion.div>
                     )}

                     {activeTab === 'hujjatlar' && (
                        <motion.div key="hujjatlar" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                           <KYCSection 
                              kycData={kycData} 
                              uploading={uploading} 
                              onFileUpload={handleFileUpload} 
                              onSubmit={handleSubmitKyc}
                              getImageUrl={getImageUrl} 
                           />
                        </motion.div>
                     )}

                     {activeTab === 'kartalar' && (
                         <motion.div key="kartalar" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                            <CardManagement 
                               paymentMethods={paymentMethods} 
                               onRemoveCard={handleRemoveCard} 
                               onShowAddModal={() => setShowCardModal(true)} 
                            />
                         </motion.div>
                      )}

                     {activeTab === 'to\'lovlar' && (
                        <motion.div key="to'lovlar" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                           <BillingHistory 
                              invoices={invoices} 
                              downloadingInvoice={downloadingInvoice} 
                              onDownload={handleDownloadInvoice} 
                           />
                        </motion.div>
                     )}

                     {activeTab === 'bildirishnomalar' && (
                        <motion.div key="bildirishnomalar" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                           <NotificationsSection 
                              notifications={notifications} 
                              onMarkAsRead={handleMarkNotificationRead} 
                              onMarkAllAsRead={handleMarkAllNotificationsRead} 
                           />
                        </motion.div>
                     )}

                     {activeTab === 'sevimlilar' && (
                        <motion.div key="sevimlilar" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                           <h2 className="text-2xl font-bold tracking-tight mb-8">Saralangan Avtomobillar</h2>
                           <div className="flex flex-col items-center justify-center py-24 glass rounded-[48px] border-white/5">
                              <Heart className="w-16 h-16 text-white/5 mb-6" />
                              <p className="text-white/20 font-bold uppercase tracking-widest text-xs">Hozircha sevimlilar yo'q</p>
                           </div>
                        </motion.div>
                     )}

                     {activeTab === 'profil' && (
                        <motion.div key="profil" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                           <ProfileSettings 
                              profileForm={profileForm} 
                              onChange={setProfileForm} 
                              onSave={handleSaveProfile} 
                              uploading={uploading.profile} 
                           />
                        </motion.div>
                     )}
                  </AnimatePresence>
               </div>
            </div>
         </div>

         {/* New Card Modal */}
         <AnimatePresence>
            {showCardModal && (
               <div className="fixed inset-0 z-[120] flex items-center justify-center px-4">
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowCardModal(false)} className="absolute inset-0 bg-black/90 backdrop-blur-xl" />
                  <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="relative w-full max-w-md glass p-10 border-white/10 rounded-[40px]">
                     <h3 className="text-2xl font-black italic tracking-tighter uppercase mb-2">Yangi Karta</h3>
                     <p className="text-[10px] text-white/30 uppercase font-black tracking-widest mb-10 italic">Tasdiqlash uchun amaldagi kartani kiriting</p>
                     <form onSubmit={handleAddCard} className="space-y-6">
                        <div className="space-y-2">
                           <label className="text-[10px] text-white/30 uppercase font-black tracking-widest ml-1">Karta turi</label>
                           <div className="grid grid-cols-2 gap-4">
                              {['uzcard', 'humo'].map(type => (
                                 <button key={type} type="button" onClick={() => setNewCard({...newCard, card_type: type})} className={`py-4 rounded-xl border-2 transition-all text-xs font-bold uppercase ${newCard.card_type === type ? 'border-primary bg-primary/10 text-white' : 'border-white/5 bg-white/5 text-white/40'}`}>
                                    {type}
                                 </button>
                              ))}
                           </div>
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] text-white/30 uppercase font-black tracking-widest ml-1">Karta raqami</label>
                           <input type="text" value={newCard.pan} onChange={e => setNewCard({...newCard, pan: e.target.value})} placeholder="8600 ...." className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm outline-none focus:border-primary/50" />
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                           <div className="space-y-2">
                               <label className="text-[10px] text-white/30 uppercase font-black tracking-widest ml-1">Muddati</label>
                               <input type="text" value={newCard.expiry} onChange={e => setNewCard({...newCard, expiry: e.target.value})} placeholder="MM/YY" className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm outline-none focus:border-primary/50" />
                           </div>
                           <div className="space-y-2">
                               <label className="text-[10px] text-white/30 uppercase font-black tracking-widest ml-1">Egasi</label>
                               <input type="text" value={newCard.holder} onChange={e => setNewCard({...newCard, holder: e.target.value.toUpperCase()})} placeholder="FULL NAME" className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm outline-none focus:border-primary/50" />
                           </div>
                        </div>
                        <button type="submit" className="btn-primary w-full py-5 text-[10px] font-black tracking-widest mt-4 uppercase">KARTANI BOG'LASH</button>
                     </form>
                  </motion.div>
               </div>
            )}
         </AnimatePresence>

         <BookingDetailsModal 
            booking={selectedBooking} 
            isOpen={!!selectedBooking} 
            onClose={() => setSelectedBooking(null)} 
            getImageUrl={getImageUrl} 
            onDownloadInvoice={handleDownloadInvoice} 
            downloadingInvoice={downloadingInvoice} 
         />
      </div>
   );
};

export default Profile;
