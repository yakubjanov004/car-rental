import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { fetchInsurancePlans } from '../../../services/api/insurance';

const Step2_Insurance = ({ selected, onSelect, onNext }) => {
  const [plans, setPlans] = useState([]);

  useEffect(() => {
    const loadPlans = async () => {
      try {
        const data = await fetchInsurancePlans();
        setPlans((Array.isArray(data) ? data : []).filter((plan) => plan.is_active !== false));
      } catch {
        setPlans([]);
      }
    };

    loadPlans();
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-4"
    >
      <div className="space-y-3">
        <button
          onClick={() => onSelect(null)}
          className={`relative w-full rounded-2xl border p-4 text-left transition-all overflow-hidden ${
            !selected ? 'border-primary bg-primary/10 shadow-[0_4px_20px_rgba(255,107,1,0.2)]' : 'border-white/10 bg-[#141414] hover:bg-white/5'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="font-black tracking-widest uppercase text-white">Sug'urtasiz</p>
              <p className="text-xs text-white/50 mt-1">Qo'shimcha sug'urta tanlanmaydi</p>
            </div>
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${!selected ? 'border-primary' : 'border-white/20'}`}>
              {!selected && <div className="w-3 h-3 rounded-full bg-primary" />}
            </div>
          </div>
        </button>

        {plans.map((plan) => {
          const active = selected?.id === plan.id;
          return (
            <button
              key={plan.id}
              onClick={() => onSelect(plan)}
              className={`relative w-full rounded-2xl border p-4 text-left transition-all overflow-hidden ${
                active ? 'border-primary bg-primary/10 shadow-[0_4px_20px_rgba(255,107,1,0.2)]' : 'border-white/10 bg-[#141414] hover:bg-white/5'
              }`}
            >
              {active && <div className="absolute top-0 right-0 w-16 h-16 bg-primary/20 blur-xl rounded-full" />}
              <div className="flex items-center justify-between relative z-10">
                <div>
                  <p className="font-black tracking-widest uppercase text-white">{plan.name}</p>
                  <p className="text-xs text-primary font-bold mt-1">+{Number(plan.daily_price).toLocaleString()} UZS <span className="text-white/50 text-[10px]">/ kun</span></p>
                </div>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${active ? 'border-primary' : 'border-white/20'}`}>
                  {active && <div className="w-3 h-3 rounded-full bg-primary" />}
                </div>
              </div>
            </button>
          );
        })}
      </div>
      
      <button 
        onClick={onNext} 
        className="w-full rounded-xl bg-primary py-4 font-black uppercase tracking-widest text-white mt-4 shadow-[0_4px_20px_rgba(255,107,1,0.4)] hover:bg-primary/90 transition-all active:scale-[0.98]"
      >
        To'lov bosqichi
      </button>
    </motion.div>
  );
};

export default Step2_Insurance;
