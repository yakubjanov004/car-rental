import { User, Heart, Calendar, LogOut, ChevronRight, Settings, Clock, CheckCircle, XCircle, Info, Star, CreditCard, ShieldCheck, AlertTriangle, Bell, Upload, Trash2, Zap, FileText, Download, FileDown, Lock } from 'lucide-react';
import carPlaceholder from '../assets/car-placeholder.png';
import uzcardLogo from '../assets/icons/uzcard-logo.svg';
import humoLogo from '../assets/icons/humo-logo.svg';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { formatNarx } from '../utils/formatPrice';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
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
   const { t } = useTranslation();
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
   const [favorites, setFavorites] = useState([]);
   const [downloadingInvoice, setDownloadingInvoice] = useState(null);
   const [showOtpModal, setShowOtpModal] = useState(false);
   const [randomOTP, setRandomOTP] = useState('');
   const [userInputOTP, setUserInputOTP] = useState('');
   const [otpError, setOtpError] = useState('');
   const [pendingCardPayload, setPendingCardPayload] = useState(null);
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
      if (!rawUrl) return carPlaceholder;
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
               apiClient.get('/favorites/my/')
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
            if (favoritesResult.status === 'fulfilled') {
               setFavorites(extractCollection(favoritesResult.value.data));
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
         const cleanPan = newCard.pan.replace(/\D/g, '');
         if (cleanPan.length !== 16) throw new Error('Karta raqami 16 ta raqamdan iborat bo\'lishi kerak');
         
         // Prefix validation based on user's request: humo: 8600, uzcard: 5614
         if (newCard.card_type === 'humo' && !cleanPan.startsWith('8600')) {
            throw new Error('Humo kartasi 8600 bilan boshlanishi kerak');
         }
         if (newCard.card_type === 'uzcard' && !cleanPan.startsWith('5614')) {
            throw new Error('Uzcard kartasi 5614 bilan boshlanishi kerak');
         }

         const [exp_month, exp_year] = (newCard.expiry || '').split('/');
         if (!exp_month || !exp_year || exp_month.length !== 2 || exp_year.length !== 2) {
            throw new Error('Amal qilish muddati noto\'g\'ri (MM/YY)');
         }
         
         const month = parseInt(exp_month);
         if (month < 1 || month > 12) throw new Error('Oy noto\'g\'ri (01-12)');

         if (!newCard.holder.trim()) throw new Error('Karta egasini kiriting');
         if (newCard.holder.trim().split(' ').length < 2) throw new Error('Ism va familiyani to\'liq kiriting');
         
         if (!user?.phone_number) {
            alert("Sizning profilingizda telefon raqam yo'q. Iltimos, oldin PROFIL bo'limidan telefon raqamingizni kiriting!");
            return;
         }

         const payload = {
            pan: cleanPan,
            card_holder: newCard.holder.trim(),
            expiry_month: exp_month.trim(),
            expiry_year: exp_year.trim(),
            card_type: newCard.card_type,
            masked_pan: `${cleanPan.slice(0, 4)} **** **** ${cleanPan.slice(12)}`
         };
         
         setPendingCardPayload(payload);
         setRandomOTP(Math.floor(100000 + Math.random() * 900000).toString());
         setUserInputOTP('');
         setOtpError('');
         setShowCardModal(false);
         setShowOtpModal(true);
      } catch (error) {
         alert(error.message || 'Xatolik! Ma\'lumotlarni tekshiring.');
      }
   };

   const handleVerifyOtp = async () => {
      if ((userInputOTP || '').length !== 6) {
         setOtpError('6 xonali kodni kiriting.');
         return;
      }
      
      if (userInputOTP !== randomOTP) {
         setOtpError("Noto'g'ri kod! Qaytadan urinib ko'ring.");
         return;
      }

      try {
         await apiClient.post('/payments/methods/', pendingCardPayload);
         const res = await apiClient.get('/payments/methods/');
         setPaymentMethods(extractCollection(res.data));
         setShowOtpModal(false);
         setPendingCardPayload(null);
         setNewCard({ pan: '', expiry: '', holder: '', card_type: 'uzcard' });
         alert("Karta muvaffaqiyatli bog'landi!");
      } catch (error) {
         alert(error.message || 'Xatolik! Ma\'lumotlarni tekshiring.');
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
      { id: 'buyurtmalar', label: t('profile.tabs.buyurtmalar'), icon: Calendar },
      { id: 'hujjatlar', label: t('profile.tabs.hujjatlar'), icon: ShieldCheck },
      { id: 'kartalar', label: t('profile.tabs.kartalar'), icon: CreditCard },
      { id: 'to\'lovlar', label: t('profile.tabs.tolovlar'), icon: CardIcon },
      { id: 'bildirishnomalar', label: t('profile.tabs.bildirishnomalar'), icon: Bell },
      { id: 'sevimlilar', label: t('profile.tabs.sevimlilar'), icon: Heart },
      { id: 'profil', label: t('profile.tabs.profil'), icon: Settings },
   ];

   if (loading) {
      return (
         <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
            <div className="flex flex-col items-center gap-6">
               <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
               <p className="text-[10px] font-black tracking-[0.3em] text-white/20 uppercase">{t('profile.loading')}</p>
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
                     <span className="text-[10px] font-black uppercase tracking-[0.4em] italic">{t('profile.cabinet')}</span>
                  </div>
                  <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter uppercase italic">
                     {t('profile.hello')}{user?.first_name || user?.username}
                  </h1>
               </div>
               <button onClick={logout} className="group flex items-center gap-4 text-white/30 hover:text-white transition-all pb-2">
                  <span className="text-[10px] font-black uppercase tracking-widest">{t('profile.logout')}</span>
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
               <div className="lg:col-span-9 relative">
                  <AnimatePresence mode="wait">
                     {activeTab === 'buyurtmalar' && (
                        <motion.div key="buyurtmalar" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                           <ProfileOverview 
                              user={user} 
                              loyaltyAccount={loyaltyAccount} 
                              loyaltyTiers={loyaltyTiers} 
                              bookingsCount={bookings.length}
                              favoriteCount={favorites.length}
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
                           <h2 className="text-2xl font-bold tracking-tight mb-8">{t('profile.favorites.title')}</h2>
                           
                           {favorites.length === 0 ? (
                              <div className="flex flex-col items-center justify-center py-24 glass rounded-[48px] border-white/5">
                                 <Heart className="w-16 h-16 text-white/5 mb-6" />
                                 <p className="text-white/20 font-bold uppercase tracking-widest text-xs">{t('profile.favorites.empty')}</p>
                              </div>
                           ) : (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                 {favorites.map((fav) => (
                                    <div key={fav.id} className="glass p-6 rounded-3xl border border-white/10 flex items-center gap-6 group hover:border-primary/20 transition-all">
                                       <div className="w-32 h-24 rounded-2xl bg-white/5 overflow-hidden border border-white/5 relative">
                                          <img 
                                             src={getImageUrl(fav.car_info?.main_image || fav.car_info?.media?.card_main)} 
                                             className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                                             alt="" 
                                          />
                                       </div>
                                       <div className="flex-1">
                                          <p className="text-[10px] text-white/30 uppercase font-black tracking-widest mb-1 italic">{fav.car_info?.brand || 'Brand'}</p>
                                          <h4 className="text-lg font-bold uppercase tracking-tighter mb-2 text-white group-hover:text-primary transition-colors">{fav.car_info?.model || 'Model'}</h4>
                                          <div className="flex items-center justify-between">
                                             <span className="text-[10px] font-black uppercase text-primary tracking-widest">{formatNarx(fav.car_info?.dynamic_price || 0)}</span>
                                             <button 
                                                onClick={async () => {
                                                   try {
                                                      await apiClient.delete(`/favorites/${fav.car}/`);
                                                      setFavorites(prev => prev.filter(f => f.id !== fav.id));
                                                   } catch (e) {
                                                      console.error(e);
                                                   }
                                                }}
                                                className="w-8 h-8 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"
                                             >
                                                <Trash2 className="w-3 h-3" />
                                             </button>
                                          </div>
                                       </div>
                                    </div>
                                 ))}
                              </div>
                           )}
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
                     <h3 className="text-2xl font-black italic tracking-tighter uppercase mb-2">{t('profile.newCard.title')}</h3>
                     <p className="text-[10px] text-white/30 uppercase font-black tracking-widest mb-10 italic">{t('profile.newCard.desc')}</p>
                     <form onSubmit={handleAddCard} className="space-y-6">
                        <div className="space-y-2">
                           <label className="text-[10px] text-white/30 uppercase font-black tracking-widest ml-1">{t('profile.newCard.type')}</label>
                           <div className="grid grid-cols-2 gap-4">
                              {[{type: 'uzcard', logo: uzcardLogo}, {type: 'humo', logo: humoLogo}].map(({type, logo}) => (
                                 <button key={type} type="button" onClick={() => setNewCard({...newCard, card_type: type})} className={`py-4 rounded-xl border-2 transition-all flex items-center justify-center gap-3 ${newCard.card_type === type ? 'border-primary bg-primary/10' : 'border-white/5 bg-white/5'}`}>
                                    <img src={logo} alt={type} className="h-6" />
                                 </button>
                              ))}
                           </div>
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] text-white/30 uppercase font-black tracking-widest ml-1">{t('profile.newCard.number')}</label>
                           <input 
                              type="text" 
                              value={newCard.pan.replace(/(\d{4})(?=\d)/g, '$1 ')} 
                              onChange={e => {
                                 const val = e.target.value.replace(/\D/g, '').slice(0, 16);
                                 setNewCard({...newCard, pan: val});
                              }} 
                              placeholder="0000 0000 0000 0000" 
                              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm outline-none focus:border-primary/50" 
                           />
                        </div>
                         <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] text-white/30 uppercase font-black tracking-widest ml-1">{t('profile.newCard.expiry')}</label>
                                <input 
                                   type="text" 
                                   value={newCard.expiry} 
                                   onChange={e => {
                                      let val = e.target.value.replace(/\D/g, '');
                                      if (val.length > 4) val = val.slice(0, 4);
                                      if (val.length >= 2) {
                                         val = val.slice(0, 2) + '/' + val.slice(2);
                                      }
                                      setNewCard({...newCard, expiry: val});
                                   }} 
                                   placeholder="MM/YY" 
                                   className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm outline-none focus:border-primary/50" 
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] text-white/30 uppercase font-black tracking-widest ml-1">{t('profile.newCard.holder')}</label>
                                <input 
                                   type="text" 
                                   value={newCard.holder} 
                                   onChange={e => {
                                      const val = e.target.value.replace(/[^A-Za-z\s]/g, '').toUpperCase();
                                      setNewCard({...newCard, holder: val});
                                   }} 
                                   placeholder="ISM FAMILIYA" 
                                   className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm outline-none focus:border-primary/50" 
                                />
                            </div>
                         </div>
                         <button type="submit" className="btn-primary w-full py-5 text-[10px] font-black tracking-widest mt-4 uppercase">{t('profile.newCard.btn')}</button>
                     </form>
                  </motion.div>
               </div>
            )}
         </AnimatePresence>

         {/* Verification OTP Modal */}
         <AnimatePresence>
            {showOtpModal && (
               <div className="fixed inset-0 z-[130] flex items-center justify-center px-4">
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowOtpModal(false)} className="absolute inset-0 bg-black/90 backdrop-blur-xl" />
                  <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="relative w-full max-w-md bg-[#111] border border-white/5 rounded-[64px] shadow-2xl p-10 flex flex-col items-center text-center">
                     <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-10 border border-primary/20">
                        <Lock className="w-8 h-8 text-primary" />
                     </div>
                     <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter mb-4">{t('profile.otp.title')}</h3>
                     <p className="text-xs text-white/30 max-w-xs mb-10">Sizning <strong className="text-white">{user?.phone_number}</strong> {t('profile.otp.desc')}</p>
                     
                     <div className="bg-white/5 border border-white/10 rounded-3xl p-6 mb-10 w-full">
                        <span className="text-[10px] text-white/20 uppercase font-black block mb-3">{t('profile.otp.sim')}</span>
                        <span className="text-4xl font-display font-black text-primary tracking-[0.4em] blur-[1px] hover:blur-none transition-all">{randomOTP}</span>
                     </div>

                     <input 
                        type="text" 
                        placeholder="_ _ _ _ _ _" 
                        className="w-48 bg-[#0A0A0A] border-2 border-white/10 rounded-[32px] p-6 text-center text-2xl font-black text-white outline-none focus:border-primary tracking-[0.5em]"
                        value={userInputOTP}
                        onChange={e => {
                          setUserInputOTP(e.target.value.replace(/\D/g, ''));
                          setOtpError('');
                        }}
                        maxLength={6}
                     />

                     {otpError && <p className="mt-4 text-xs font-bold text-red-500">{otpError}</p>}

                     <div className="flex gap-4 w-full mt-12">
                        <button onClick={() => { setShowOtpModal(false); setShowCardModal(true); }} className="flex-1 py-4 glass rounded-[20px] text-[10px] font-black uppercase text-white/40">{t('profile.otp.back')}</button>
                        <button onClick={handleVerifyOtp} className="flex-[2] py-4 btn-primary rounded-[20px] text-[10px] font-black uppercase shadow-lg shadow-primary/20">{t('profile.otp.confirm')}</button>
                     </div>
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
