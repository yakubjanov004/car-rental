import { motion } from 'framer-motion';

const Step1_Summary = ({ booking, totalAmount, onNext }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="rounded-2xl border border-white/10 bg-[#141414] p-6 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/20 rounded-full blur-3xl pointer-events-none" />

        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-white font-black uppercase tracking-widest text-lg">Xulosa</h3>
            <p className="text-white/50 text-xs mt-1">Bron detallari</p>
          </div>
          <div className="bg-white/10 px-3 py-1 rounded-lg border border-white/5">
            <span className="text-xs font-mono font-bold text-white/80">#{booking?.id || '---'}</span>
          </div>
        </div>

        <div className="space-y-3 relative z-10">
          <div className="flex justify-between items-center text-sm border-b border-white/5 pb-3">
            <span className="text-white/60">Avtomobil</span>
            <span className="text-white font-medium">{booking?.car_info?.brand} {booking?.car_info?.model || 'Tanlanmagan'}</span>
          </div>
          <div className="flex justify-between items-center text-sm border-b border-white/5 pb-3">
            <span className="text-white/60">Ijara davri</span>
            <span className="text-white font-medium">
              {new Date(booking?.start_datetime).toLocaleDateString('uz-UZ')} - {new Date(booking?.end_datetime).toLocaleDateString('uz-UZ')}
            </span>
          </div>
          
          <div className="flex justify-between items-end pt-2">
            <span className="text-white/60 text-sm">Jami summa</span>
            <div className="text-right">
              <span className="text-2xl font-black text-primary block">
                {totalAmount?.toLocaleString?.() || totalAmount} <span className="text-sm text-primary/80">UZS</span>
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <button 
        onClick={onNext} 
        className="w-full rounded-xl bg-primary py-4 font-black uppercase tracking-widest text-white shadow-[0_4px_20px_rgba(255,107,1,0.4)] hover:bg-primary/90 transition-all active:scale-[0.98]"
      >
        Davom etish
      </button>
    </motion.div>
  );
};

export default Step1_Summary;
