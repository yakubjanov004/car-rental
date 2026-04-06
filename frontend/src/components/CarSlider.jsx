import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { fetchCars } from '../utils/api';

const CarSlider = () => {
  const [sliderCars, setSliderCars] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const all = await fetchCars();
        if (all && all.length > 0) {
          setSliderCars(all.slice(0, 5));
        }
      } catch (err) {
        console.error("Slider fetch error", err);
      }
    };
    load();
  }, []);

  if (sliderCars.length === 0) return null;

  return (
    <div className="absolute right-0 top-0 w-full md:w-3/4 h-full overflow-hidden opacity-40 pointer-events-none select-none">
      <div className="relative w-full h-full">
        {sliderCars.map((car, i) => (
          <motion.div
            key={car.id}
            className="absolute inset-0 flex items-center justify-center"
            initial={{ x: '100%', opacity: 0 }}
            animate={{ 
              x: ['100%', '0%', '-100%'],
              opacity: [0, 1, 0]
            }}
            transition={{
              duration: 10,
              delay: i * 8,
              repeat: Infinity,
              repeatDelay: (sliderCars.length - 1) * 8,
              ease: "easeInOut"
            }}
          >
            <img 
              src={car.media?.card_main || car.media?.detail_main} 
              className="w-full h-full object-contain md:object-cover scale-110 lg:scale-125" 
              alt={car.model} 
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
