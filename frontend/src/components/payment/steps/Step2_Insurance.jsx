import { useEffect, useState } from 'react';
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
    <div className="space-y-3">
      <button
        onClick={() => onSelect(null)}
        className={`w-full rounded-xl border p-3 text-left transition ${
          !selected ? 'border-primary bg-primary/10' : 'border-white/10 bg-white/5'
        }`}
      >
        <p className="font-semibold text-white">Sug'urtasiz</p>
        <p className="text-sm text-white/60">Qo'shimcha sug'urta tanlanmaydi</p>
      </button>

      {plans.map((plan) => {
        const active = selected?.id === plan.id;
        return (
          <button
            key={plan.id}
            onClick={() => onSelect(plan)}
            className={`w-full rounded-xl border p-3 text-left transition ${
              active ? 'border-primary bg-primary/10' : 'border-white/10 bg-white/5'
            }`}
          >
            <p className="font-semibold text-white">{plan.name}</p>
            <p className="text-sm text-white/60">+{Number(plan.daily_price).toLocaleString()} UZS / kun</p>
          </button>
        );
      })}
      <button onClick={onNext} className="w-full rounded-xl bg-primary py-3 font-semibold text-white">
        To'lov bosqichiga o'tish
      </button>
    </div>
  );
};

export default Step2_Insurance;
