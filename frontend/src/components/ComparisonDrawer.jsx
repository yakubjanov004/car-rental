import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useComparison } from '../context/ComparisonContext';
import { X, ArrowLeftRight, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ComparisonDrawer = () => {
  const { comparisonList, removeFromComparison, clearComparison } = useComparison();
  const navigate = useNavigate();

  if (comparisonList.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[60] w-full max-w-2xl px-6"
      >
        <div className="glass p-4 rounded-[32px] border-primary/20 shadow-2xl shadow-primary/10 flex items-center gap-4 bg-[#0F0F0F]/90">
          <div className="flex -space-x-4 overflow-hidden p-1">
            {comparisonList.map((car) => (
              <motion.div
                key={car.id}
                layout
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="relative group w-14 h-14 rounded-2xl border-2 border-[#111] overflow-hidden bg-[#111]"
              >
                <img src={car.media?.card_main} className="w-full h-full object-contain" alt="" />
                <button
                  onClick={() => removeFromComparison(car.id)}
                  className="absolute inset-0 bg-red-600/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </motion.div>
            ))}
          </div>

          <div className="flex-1 px-4">
            <h4 className="text-xs font-black uppercase tracking-widest text-white italic">Solishtirish</h4>
            <p className="text-[10px] text-white/40 font-bold uppercase">{comparisonList.length} ta mashina tanlandi</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={clearComparison}
              className="p-3 rounded-2xl hover:bg-white/5 text-white/20 hover:text-red-500 transition-all"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate('/compare')}
              className="btn-primary py-3 px-6 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2"
            >
              SOLISHTIRISH <ArrowLeftRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ComparisonDrawer;
