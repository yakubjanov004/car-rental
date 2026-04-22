import { useTranslation } from 'react-i18next';
import React from 'react';
import { motion } from 'framer-motion';
import { Bell, CheckCircle, Info, AlertTriangle, AlertCircle, Clock } from 'lucide-react';

const Notifications = ({ notifications, onMarkAsRead, onMarkAllAsRead, onDelete }) => {
   const { t } = useTranslation();
   const getTypeStyles = (type) => {
      switch (type) {
         case 'booking_approved':
         case 'kyc_approved':
         case 'payment_completed':
            return { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-500/10' };
         case 'booking_rejected':
         case 'kyc_rejected':
            return { icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-500/10' };
         case 'booking_created':
         case 'kyc_submitted':
            return { icon: Clock, color: 'text-orange-500', bg: 'bg-orange-500/10' };
         default:
            return { icon: Info, color: 'text-blue-500', bg: 'bg-blue-500/10' };
      }
   };

   return (
      <div className="space-y-8">
         <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold tracking-tight">{t('profileComps.notificationsTitle')}</h2>
            {notifications.length > 0 && (
               <button 
                  onClick={onMarkAllAsRead}
                  className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline"
               >
                  Barchasini o'qilgan deb belgilash
               </button>
            )}
         </div>

         {notifications.length > 0 ? (
            <div className="space-y-4">
               {notifications.map((n) => {
                  const styles = getTypeStyles(n.type);
                  const Icon = styles.icon;
                  
                  return (
                     <motion.div 
                        key={n.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`glass p-6 rounded-3xl border border-white/5 flex gap-6 relative group transition-all ${!n.is_read ? 'bg-white/[0.03] border-primary/20 shadow-[0_10px_30px_-15px_rgba(255,107,0,0.1)]' : 'opacity-60'}`}
                     >
                        <div className={`w-12 h-12 rounded-2xl ${styles.bg} flex items-center justify-center shrink-0`}>
                           <Icon className={`w-6 h-6 ${styles.color}`} />
                        </div>
                        <div className="flex-1 space-y-1">
                           <div className="flex items-center justify-between">
                              <h4 className="text-sm font-bold text-white uppercase tracking-tight">{n.title}</h4>
                              <span className="text-[10px] text-white/20 font-black uppercase tracking-widest leading-none">
                                 {new Date(n.created_at).toLocaleDateString()}
                              </span>
                           </div>
                           <p className="text-xs text-white/40 leading-relaxed font-medium">{n.message}</p>
                           {!n.is_read && (
                              <button 
                                 onClick={() => onMarkAsRead(n.id)}
                                 className="text-[9px] font-black uppercase tracking-[0.2em] text-primary pt-2 block hover:underline"
                              >
                                 O'qilgan deb belgilash
                              </button>
                           )}
                        </div>
                     </motion.div>
                  );
               })}
            </div>
         ) : (
            <div className="py-24 flex flex-col items-center justify-center glass rounded-[48px] border-white/5 opacity-50">
               <Bell className="w-16 h-16 text-white/10 mb-6" />
               <p className="text-[10px] font-black uppercase tracking-widest">{t('profileComps.noNotifications2')}</p>
            </div>
         )}
      </div>
   );
};

export default Notifications;
