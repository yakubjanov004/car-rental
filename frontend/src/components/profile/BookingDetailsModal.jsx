import { useTranslation } from 'react-i18next';
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XCircle, Calendar, User, Bell, Download } from 'lucide-react';

const BookingDetailsModal = ({ booking, isOpen, onClose, getImageUrl, onDownloadInvoice, downloadingInvoice }) => {
   if (!booking) return null;

   return (
      <AnimatePresence>
         {isOpen && (
            <div className="fixed inset-0 z-[110] flex items-center justify-center px-4">
               <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={onClose}
                  className="absolute inset-0 bg-black/99 backdrop-blur-xl"
               />
               <motion.div 
                  initial={{ opacity: 0, scale: 0.9, y: 30 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 30 }}
                  className="relative w-full max-w-2xl glass p-0 border-white/10 shadow-2xl overflow-hidden rounded-[48px]"
               >
                  <div className="relative h-64 overflow-hidden">
                     <img 
                        src={getImageUrl(booking?.car_info?.main_image)} 
                        className="w-full h-full object-cover" 
                        alt="" 
                     />
                     <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent" />
                     <button 
                        onClick={onClose}
                        className="absolute top-6 right-6 w-10 h-10 rounded-full bg-black/50 border border-white/10 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all"
                     >
                        <XCircle className="w-6 h-6" />
                     </button>
                     <div className="absolute bottom-8 left-10">
                        <div className="flex items-center gap-3 mb-2">
                           <span className="px-3 py-1 rounded-full bg-primary text-[8px] font-black text-white uppercase tracking-widest">
                              {booking?.car_info?.category || 'PREMIUM'}
                           </span>
                           <span className="text-[10px] text-white/40 font-black uppercase tracking-widest italic">{booking.booking_code}</span>
                        </div>
                        <h3 className="text-3xl font-black italic tracking-tighter uppercase text-white">
                           {booking?.car_info?.brand} {booking?.car_info?.model_name}
                        </h3>
                     </div>
                  </div>

                  <div className="p-10 space-y-8">
                     <div className="grid grid-cols-2 gap-10">
                        <div className="space-y-4">
                           <h4 className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Ijara Davri</h4>
                           <div className="space-y-3">
                              <div className="flex items-center gap-3">
                                 <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center">
                                    <Calendar className="w-4 h-4 text-white/40" />
                                 </div>
                                 <div>
                                    <p className="text-[8px] text-white/30 font-black uppercase tracking-widest">Olish Sanasi</p>
                                    <p className="text-xs font-bold">{new Date(booking.start_datetime).toLocaleString()}</p>
                                 </div>
                              </div>
                              <div className="flex items-center gap-3">
                                 <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center">
                                    <Calendar className="w-4 h-4 text-white/40" />
                                 </div>
                                 <div>
                                    <p className="text-[8px] text-white/30 font-black uppercase tracking-widest">Qaytarish Sanasi</p>
                                    <p className="text-xs font-bold">{new Date(booking.end_datetime).toLocaleString()}</p>
                                 </div>
                              </div>
                           </div>
                        </div>

                        <div className="space-y-4">
                           <h4 className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Bog'lanish Ma'lumotlari</h4>
                           <div className="space-y-3">
                              <div className="flex items-center gap-3">
                                 <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center">
                                    <User className="w-4 h-4 text-white/40" />
                                 </div>
                                 <div>
                                    <p className="text-[8px] text-white/30 font-black uppercase tracking-widest">Mijoz</p>
                                    <p className="text-xs font-bold uppercase tracking-tighter italic">{booking.full_name}</p>
                                 </div>
                              </div>
                              <div className="flex items-center gap-3">
                                 <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center">
                                    <Bell className="w-4 h-4 text-white/40" />
                                 </div>
                                 <div>
                                    <p className="text-[8px] text-white/30 font-black uppercase tracking-widest">Telefon</p>
                                    <p className="text-xs font-bold uppercase tracking-tighter italic">{booking.phone_number}</p>
                                 </div>
                              </div>
                           </div>
                        </div>
                     </div>

                     {booking.delivery_address && (
                        <div className="p-6 rounded-3xl bg-white/5 border border-white/5">
                           <p className="text-[9px] text-white/30 font-black uppercase tracking-widest mb-2">Yetkazib Berish Manzili</p>
                           <p className="text-xs font-bold italic">{booking.delivery_address}</p>
                        </div>
                     )}

                     <div className="pt-4 flex flex-col gap-4">
                        <div className="flex gap-4">
                           <button 
                              onClick={onClose}
                              className="btn-secondary w-full py-5 text-[10px] font-black tracking-widest uppercase"
                           >
                              Yopish
                           </button>
                           {booking.invoice_id && (
                              <button 
                                 onClick={() => onDownloadInvoice(booking.invoice_id, booking.invoice_number)}
                                 disabled={downloadingInvoice === booking.invoice_id}
                                 className="btn-primary w-full py-5 text-[10px] font-black tracking-widest uppercase flex items-center justify-center gap-2"
                              >
                                 {downloadingInvoice === booking.invoice_id ? 'YUKLANMOQDA...' : <><Download className="w-4 h-4" /> INVOYS</>}
                              </button>
                           )}
                        </div>
                     </div>
                  </div>
               </motion.div>
            </div>
         )}
      </AnimatePresence>
   );
};

export default BookingDetailsModal;
