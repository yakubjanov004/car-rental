import React from 'react';
import { motion } from 'framer-motion';
import { useComparison } from '../context/ComparisonContext';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  X, ArrowLeft, ArrowLeftRight, Users, Fuel, 
  Settings2, Star, Calendar, Trash2, ArrowRight 
} from 'lucide-react';
import { formatNarx } from '../utils/formatPrice';

const Compare = () => {
  const { t } = useTranslation();
  const { comparisonList, removeFromComparison, clearComparison } = useComparison();
  const navigate = useNavigate();

  if (comparisonList.length === 0) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center text-center px-6">
        <ArrowLeftRight className="w-20 h-20 text-white/10 mb-8" />
        <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter mb-4">{t('comparePage.emptyTitle')}</h1>
        <p className="text-sm text-white/30 max-w-sm mb-12">{t('comparePage.emptySub')}</p>
        <Link to="/fleet" className="btn-primary py-4 px-12 rounded-2xl text-xs font-black uppercase tracking-widest">{t('comparePage.backToFleet')}</Link>
      </div>
    );
  }

  const features = [
    { label: t('comparePage.brand'), key: 'brand' },
    { label: t('comparePage.model'), key: 'model' },
    { label: t('comparePage.year'), key: 'year' },
    { label: t('comparePage.category'), key: 'category' },
    { label: t('comparePage.dailyPrice'), key: 'dynamic_price', format: (val, car) => formatNarx(val || car.daily_price) },
    { label: t('comparePage.fuel'), key: 'fuel_type' },
    { label: t('comparePage.transmission'), key: 'transmission' },
    { label: t('comparePage.seats'), key: 'seats' },
    { label: t('comparePage.rating'), key: 'rating', icon: Star },
  ];

  return (
    <div className="bg-[#0A0A0A] min-h-screen pt-32 pb-40 px-6 overflow-hidden">
      <div className="max-w-7xl mx-auto relative">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div className="space-y-4">
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-white/40 hover:text-white transition-colors text-[10px] font-black uppercase tracking-[0.2em] mb-4">
              <ArrowLeft className="w-3 h-3" /> {t('comparePage.back')}
            </button>
            <h1 className="font-display text-6xl md:text-8xl font-extrabold tracking-tighter">
              {t('comparePage.title1')}<span className="text-primary">{t('comparePage.title2')}</span>
            </h1>
            <p className="text-white/30 text-sm font-medium uppercase tracking-[0.1em] italic">{t('comparePage.subtitle')}</p>
          </div>
          <button 
            onClick={clearComparison}
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-red-500/60 hover:text-red-500 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" /> {t('comparePage.clear')}
          </button>
        </div>

        {/* Table Wrapper */}
        <div className="overflow-x-auto pb-10 scrollbar-hide">
          <div className="min-w-[800px] grid" style={{ gridTemplateColumns: `200px repeat(${comparisonList.length}, 1fr)` }}>
            
            {/* Image & Title Header */}
            <div className="p-8 border-b border-white/5" />
            {comparisonList.map(car => (
              <div key={car.id} className="p-8 border-b border-white/5 space-y-6 relative group">
                <button 
                  onClick={() => removeFromComparison(car.id)}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500/20 hover:text-red-500"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="aspect-[16/10] rounded-3xl overflow-hidden border border-white/10" style={{ background: 'linear-gradient(180deg, #1a1a1a 0%, #0a0a0a 100%)' }}>
                   <img src={car.media?.card_main || car.main_image || car.rasm} className="w-full h-full object-contain" alt="" />
                </div>
                <div className="text-center">
                   <h3 className="text-xl font-black text-white italic uppercase tracking-tighter">{car.brand} {car.model}</h3>
                   <div className="text-[10px] text-primary italic font-black uppercase tracking-widest mt-1">{formatNarx(car.dynamic_price || car.daily_price)} / {t('comparePage.day')}</div>
                </div>
              </div>
            ))}

            {/* Comparison Rows */}
            {features.map((feature, idx) => (
              <React.Fragment key={idx}>
                <div className="p-6 text-[10px] font-black uppercase tracking-widest text-white/40 flex items-center bg-white/[0.01] border-b border-white/5 italic">
                   {feature.label}
                </div>
                {comparisonList.map(car => (
                  <div key={car.id} className="p-6 text-sm font-bold text-white border-b border-white/5 bg-white/[0.02]">
                    {feature.format ? feature.format(car[feature.key], car) : car[feature.key]}
                    {feature.icon && <feature.icon className="w-3 h-3 text-yellow-400 inline-block ml-2 mb-0.5 fill-yellow-400" />}
                  </div>
                ))}
              </React.Fragment>
            ))}

            {/* CTA Row */}
            <div className="p-8" />
            {comparisonList.map(car => (
              <div key={car.id} className="p-8">
                <Link 
                  to={`/car/${car.slug || car.id}`} 
                  className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-white/5 hover:bg-primary text-[10px] font-black uppercase tracking-widest transition-all group"
                >
                  {t('comparePage.details')} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Compare;
