import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Car, Truck, Users, Star, DollarSign, LayoutList } from 'lucide-react';

const KATEGORIYALAR = [
  { id: 'barchasi',  icon: <LayoutList className="w-5 h-5" />, nomi: 'Barchasi',    rang: '#6366f1' },
  { id: 'elektr',   icon: <Zap className="w-5 h-5 text-emerald-400" />,        nomi: '⚡ Elektr',   rang: '#00c896' },
  { id: 'crossover',icon: <Truck className="w-5 h-5 text-amber-400" />,       nomi: 'Krossover',   rang: '#f59e0b' },
  { id: 'suv',      icon: <Truck className="w-5 h-5 text-rose-400" />,       nomi: 'SUV',         rang: '#ef4444' },
  { id: 'sedan',    icon: <Car className="w-5 h-5 text-blue-400" />,         nomi: 'Sedan',       rang: '#3b82f6' },
  { id: 'premium',  icon: <Star className="w-5 h-5 text-purple-400" />,        nomi: 'Premium',     rang: '#8b5cf6' },
  { id: 'arzon',    icon: <DollarSign className="w-5 h-5 text-emerald-500" />,  nomi: 'Arzon',       rang: '#10b981' },
  { id: 'oilaviy',  icon: <Users className="w-5 h-5 text-orange-400" />,       nomi: 'Oilaviy',     rang: '#f97316' },
];

const CategoryFilter = ({ active, onChange }) => (
  <div className="flex gap-3 overflow-x-auto pb-4 pt-2 scrollbar-hide no-scrollbar -mx-6 px-6">
    {KATEGORIYALAR.map((kat) => (
      <motion.button
        key={kat.id}
        onClick={() => onChange(kat.id)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`flex items-center gap-2 px-6 py-4 rounded-2xl font-bold text-sm whitespace-nowrap transition-all border shadow-lg ${
          active === kat.id
            ? 'bg-primary text-white border-primary shadow-primary/20'
            : 'bg-white/5 text-white/50 border-white/10 hover:border-white/20 hover:text-white/80'
        }`}
      >
        {kat.icon}
        {kat.nomi}
      </motion.button>
    ))}
  </div>
);

export default CategoryFilter;
