import React from 'react';
import { motion } from 'framer-motion';

const SLIDER_CARS = [
  { rasm: '/images/cars/tracker.jpg', nomi: 'Chevrolet Tracker 2' },
  { rasm: '/images/cars/malibu.jpg', nomi: 'Chevrolet Malibu 2' },
  { rasm: '/images/cars/byd-atto3.jpg', nomi: 'BYD Atto 3' },
  { rasm: '/images/cars/captiva.jpg', nomi: 'Chevrolet Captiva' },
  { rasm: '/images/cars/equinox.jpg', nomi: 'Chevrolet Equinox' },
];

// Mashinalar chap-o'ng yo'nalishida animatsiya bilan o'tadigan slider
const CarSlider = () => {
  return (
    <div className="absolute right-0 top-0 w-full md:w-3/4 h-full overflow-hidden opacity-40 pointer-events-none select-none">
      <div className="relative w-full h-full">
        {SLIDER_CARS.map((car, i) => (
          <motion.div
            key={i}
            className="absolute inset-0 flex items-center justify-center"
            initial={{ x: '100%', opacity: 0 }}
            animate={{ 
              x: ['100%', '0%', '-100%'],
              opacity: [0, 1, 0]
            }}
            transition={{
              duration: 6,
              delay: i * 6,        // har biri 6 soniyadan keyin
              repeat: Infinity,
              repeatDelay: (SLIDER_CARS.length - 1) * 6,
              ease: "easeInOut"
            }}
          >
            <img 
              src={car.rasm} 
              alt={car.nomi} 
              className="w-full h-full object-contain md:object-cover scale-110 lg:scale-125" 
            />
          </motion.div>
        ))}
      </div>
      {/* Vignette effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-bg-dark via-transparent to-bg-dark/10" />
      <div className="absolute inset-0 bg-gradient-to-t from-bg-dark via-transparent to-transparent" />
    </div>
  );
};

export default CarSlider;
