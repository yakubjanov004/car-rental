import React, { useState, useEffect } from 'react';
import { motion, useSpring, useTransform, useMotionValue } from 'framer-motion';

const StatsCounter = ({ count, suffix = "", label }) => {
  const value = useMotionValue(0);
  const springValue = useSpring(value, {
    damping: 30,
    stiffness: 100,
  });

  const displayValue = useTransform(springValue, (latest) => Math.floor(latest).toLocaleString() + suffix);

  useEffect(() => {
    value.set(count);
  }, [count, value]);

  return (
    <div className="text-center group">
       <motion.div 
         className="text-6xl md:text-7xl font-heading font-black text-primary mb-2 tracking-tighter"
       >
         <motion.span>{displayValue}</motion.span>
       </motion.div>
       <p className="text-white/40 uppercase text-xs font-bold tracking-widest group-hover:text-white transition-colors">
         {label}
       </p>
    </div>
  );
};

export default StatsCounter;
