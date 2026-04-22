import { useTranslation } from 'react-i18next';
import React from 'react';
import { CreditCard, Trash2, Zap } from 'lucide-react';

const CardManagement = ({ paymentMethods, onRemoveCard, onShowAddModal }) => {
   const { t } = useTranslation();
   return (
      <div className="space-y-8">
         <h2 className="text-2xl font-bold tracking-tight mb-8">{t('profileComps.paymentCards')}</h2>
         <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {paymentMethods.map((method) => (
               <div key={method.id} className="relative group">
                  <div className="glass p-8 aspect-[1.6/1] rounded-[40px] border-white/10 flex flex-col justify-between overflow-hidden">
                     <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-all">
                        <button onClick={() => onRemoveCard(method.id)} className="w-10 h-10 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all">
                           <Trash2 className="w-4 h-4" />
                        </button>
                     </div>
                     <div className="flex justify-between items-start">
                        <div className="w-12 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                           <span className="text-[8px] font-black italic uppercase tracking-widest">{method.card_type}</span>
                        </div>
                        <div className="text-right">
                           <p className="text-[8px] text-white/30 font-black uppercase tracking-widest">{t('profileComps.cardStatus')}</p>
                           <p className="text-[10px] text-green-500 font-bold uppercase tracking-widest italic">{method.is_verified ? 'TASDIQLANGAN' : 'KUTILMOQDA'}</p>
                        </div>
                     </div>
                     <div className="space-y-4">
                        <p className="text-xl font-bold tracking-[0.2em] font-mono text-white/90">
                           {method.masked_pan || '•••• •••• •••• ••••'}
                        </p>
                        <div className="flex justify-between items-end">
                           <div className="space-y-1">
                              <p className="text-[8px] text-white/30 font-black uppercase tracking-widest">{t('profileComps.cardHolder')}</p>
                              <p className="text-xs font-bold text-white uppercase">{method.card_holder}</p>
                           </div>
                           <div className="space-y-1 text-right">
                              <p className="text-[8px] text-white/30 font-black uppercase tracking-widest">Muddati</p>
                              <p className="text-xs font-bold text-white">{method.expiry_month} / {method.expiry_year}</p>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            ))}

            <button onClick={onShowAddModal} className="flex flex-col items-center justify-center gap-6 glass rounded-[40px] border-white/5 border-dashed border-2 hover:border-primary/50 hover:bg-primary/5 transition-all group aspect-[1.6/1]">
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
               {t('profileComps.cardAutoVerify')}
            </p>
         </div>
      </div>
   );
};

export default CardManagement;
