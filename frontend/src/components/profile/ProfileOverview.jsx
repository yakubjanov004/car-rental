import { useTranslation } from 'react-i18next';
import React from 'react';
import { Star, Zap, Calendar, Heart } from 'lucide-react';
import { formatNarx } from '../../utils/formatPrice';

const ProfileOverview = ({ user, loyaltyAccount, loyaltyTiers, bookingsCount, favoriteCount }) => {
   const currentTier = loyaltyTiers.find(t => t.id === loyaltyAccount?.tier) || loyaltyTiers[0];
   
   return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
         {/* Loyalty Card */}
         <div className="lg:col-span-2 glass p-8 rounded-[48px] border-white/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[100px] rounded-full -mr-32 -mt-32 group-hover:bg-primary/30 transition-all duration-700" />
            <div className="relative z-10">
               <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center">
                     <Star className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                     <p className="text-[10px] text-white/30 font-black uppercase tracking-widest italic">{currentTier?.name || 'TAYANCH'} DARAJA</p>
                     <h3 className="text-2xl font-black italic tracking-tighter uppercase italic">Sodiqlik Ballari</h3>
                  </div>
               </div>
               <div className="flex items-end gap-3">
                  <span className="text-6xl font-black italic tracking-tighter text-white">{loyaltyAccount?.points || 0}</span>
                  <span className="text-sm font-bold text-white/40 mb-2 uppercase tracking-widest italic">Ball to'plangan</span>
               </div>
               <div className="mt-8 pt-8 border-t border-white/5 flex items-center justify-between">
                  <div className="flex gap-2">
                     {loyaltyTiers.map((t, idx) => (
                        <div 
                           key={idx} 
                           className={`h-1.5 w-12 rounded-full transition-all ${
                              (loyaltyAccount?.points || 0) >= t.min_points ? 'bg-primary' : 'bg-white/5'
                           }`} 
                        />
                     ))}
                  </div>
                  <p className="text-[10px] text-white/20 font-black uppercase tracking-widest">Keyingi darajaga: {currentTier?.next_tier_points_needed || 0} ball</p>
               </div>
            </div>
         </div>

         {/* Stats */}
         <div className="glass p-8 rounded-[48px] border-white/5 flex flex-col justify-between">
            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center">
               <Calendar className="w-6 h-6 text-white/20" />
            </div>
            <div>
               <p className="text-4xl font-black italic tracking-tighter mb-2">{bookingsCount}</p>
               <p className="text-[10px] text-white/20 font-black uppercase tracking-widest italic">Jami Buyurtmalar</p>
            </div>
         </div>

         <div className="glass p-8 rounded-[48px] border-white/5 flex flex-col justify-between">
            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center">
               <Heart className="w-6 h-6 text-white/20" />
            </div>
            <div>
               <p className="text-4xl font-black italic tracking-tighter mb-2">{favoriteCount}</p>
               <p className="text-[10px] text-white/20 font-black uppercase tracking-widest italic">Sevimlilar</p>
            </div>
         </div>
      </div>
   );
};

export default ProfileOverview;
