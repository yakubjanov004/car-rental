import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, ChevronRight, Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { formatNarx } from '../../utils/formatPrice';

const BookingHistory = ({ bookings, onSelectDetail }) => {
   const getStatusStyles = (status) => {
      switch (status) {
         case 'confirmed': return 'bg-green-500/10 text-green-500';
         case 'active': return 'bg-primary/10 text-primary';
         case 'pending': return 'bg-orange-500/10 text-orange-500';
         case 'payment_pending': return 'bg-blue-500/10 text-blue-500';
         case 'completed': return 'bg-white/10 text-white/40';
         case 'cancelled':
         case 'rejected': return 'bg-red-500/10 text-red-500';
         default: return 'bg-white/5 text-white/40';
      }
   };

   const getStatusIcon = (status) => {
      switch (status) {
         case 'confirmed': return <CheckCircle className="w-3 h-3" />;
         case 'active': return <Clock className="w-3 h-3 animate-pulse" />;
         case 'pending': return <AlertTriangle className="w-3 h-3" />;
         case 'cancelled':
         case 'rejected': return <XCircle className="w-3 h-3" />;
         default: return <Clock className="w-3 h-3" />;
      }
   };

   if (bookings.length === 0) {
      return (
         <div className="flex flex-col items-center justify-center py-24 glass rounded-[48px] border-white/5">
            <Calendar className="w-16 h-16 text-white/5 mb-6" />
            <p className="text-white/20 font-bold uppercase tracking-widest text-xs">Hozircha buyurtmalar yo'q</p>
         </div>
      );
   }

   return (
      <div className="space-y-6">
         <h2 className="text-2xl font-bold tracking-tight mb-8">Buyurtmalarim Tarixi</h2>
         <div className="grid gap-4">
            {bookings.map((booking) => (
               <div key={booking.id} className="glass p-6 md:p-8 rounded-[40px] border-white/10 hover:border-primary/20 transition-all group">
                  <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
                     <div className="w-full md:w-48 h-32 rounded-3xl overflow-hidden bg-white/5 shrink-0 relative">
                        <img 
                           src={booking.car_info?.main_image || 'https://images.unsplash.com/photo-1542282088-fe8426682b8f?w=800'} 
                           className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                           alt={booking.car_info?.model_name}
                        />
                        <div className="absolute top-3 left-3">
                           <div className={`px-3 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest flex items-center gap-2 backdrop-blur-md ${getStatusStyles(booking.status)}`}>
                              {getStatusIcon(booking.status)}
                              {booking.status.replace('_', ' ')}
                           </div>
                        </div>
                     </div>
                     
                     <div className="flex-1 space-y-4">
                        <div className="flex items-start justify-between">
                           <div>
                              <p className="text-[10px] text-white/30 font-black uppercase tracking-widest mb-1 italic">#{booking.booking_code}</p>
                              <h3 className="text-xl font-bold tracking-tighter uppercase italic">{booking.car_info?.brand} {booking.car_info?.model_name}</h3>
                           </div>
                           <div className="text-right">
                              <p className="text-[10px] text-white/30 font-black uppercase tracking-widest mb-1">UMUMIY NARX</p>
                              <p className="text-lg font-bold text-primary">{formatNarx(booking.total_price)}</p>
                           </div>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 pt-4 border-t border-white/5">
                           <div>
                              <p className="text-[8px] text-white/20 font-black uppercase tracking-widest mb-1">Olish sanasi</p>
                              <p className="text-[11px] font-bold text-white/80">{new Date(booking.start_datetime).toLocaleDateString()}</p>
                           </div>
                           <div>
                              <p className="text-[8px] text-white/20 font-black uppercase tracking-widest mb-1">Qaytarish sanasi</p>
                              <p className="text-[11px] font-bold text-white/80">{new Date(booking.end_datetime).toLocaleDateString()}</p>
                           </div>
                           <div className="flex items-center justify-end">
                              <button 
                                 onClick={() => onSelectDetail(booking)}
                                 className="flex items-center gap-2 text-[10px] font-black text-white/40 hover:text-white uppercase tracking-widest transition-colors"
                              >
                                 Tafsilotlar <ChevronRight className="w-4 h-4" />
                              </button>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            ))}
         </div>
      </div>
   );
};

export default BookingHistory;
