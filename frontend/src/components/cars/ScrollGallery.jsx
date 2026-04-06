import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence, useScroll, useSpring, useTransform } from 'framer-motion';
import { ChevronDown, ChevronUp, Maximize2 } from 'lucide-react';

/**
 * ScrollGallery (Scrollytelling v5)
 * 
 * Features:
 * - Fullscreen (100dvh) navigation with scroll-snap
 * - IntersectionObserver for active slide detection
 * - Ken Burns cinematic image panning
 * - Animated storytelling text (fade/slide up)
 * - Vertical thumbnail strip + progress dots
 */
const ScrollGallery = ({ images = [], carTitle = '', carBrand = '', year = '' }) => {
  const [activeSlide, setActiveSlide] = useState(0);
  const slideRefs = useRef([]);

  // Initialize refs for each slide
  useEffect(() => {
    slideRefs.current = slideRefs.current.slice(0, images.length);
  }, [images]);

  // Intersection Observer to detect active slide
  useEffect(() => {
    const observers = slideRefs.current.map((ref, index) => {
      if (!ref) return null;
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting && entry.intersectionRatio > 0.6) {
            setActiveSlide(index);
          }
        },
        { threshold: 0.6 }
      );
      observer.observe(ref);
      return observer;
    }).filter(Boolean);

    return () => observers.forEach((obs) => obs.disconnect());
  }, [images.length]);

  const scrollToSlide = (index) => {
    slideRefs.current[index]?.scrollIntoView({ behavior: 'smooth' });
  };

  if (!images.length) return null;

  return (
    <div className="relative bg-[#0A0A0A]">
      {/* 1. SLIDES - Rendered in main flow */}
      {images.map((image, index) => (
        <section
          key={`${image.slot}-${index}`}
          ref={(el) => (slideRefs.current[index] = el)}
          className="relative h-screen w-full scroll-snap-align-start flex items-center justify-center overflow-hidden"
          style={{ scrollSnapAlign: 'start' }}
        >
          {/* Background Image with Ken Burns Effect */}
          <KenBurnsBackground 
            url={image.url} 
            isActive={activeSlide === index} 
            index={index} 
          />

          {/* Overlays */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80 z-10 pointer-events-none" />

          {/* Storytelling Content */}
          <div className="absolute inset-x-0 bottom-0 z-20 px-8 pb-16 lg:px-20 lg:pb-24 max-w-7xl mx-auto">
            <AnimatePresence mode="wait">
              {activeSlide === index && (
                <motion.div
                  key={`content-${index}`}
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -40 }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  className="space-y-6"
                >
                  <div className="flex items-center gap-4">
                    <span className="h-[2px] w-12 bg-primary" />
                    <span className="text-primary text-[10px] lg:text-xs font-black uppercase tracking-[0.5em]">
                      {image.label}
                    </span>
                  </div>

                  <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
                     <div className="space-y-4">
                        <h2 className="font-display text-5xl lg:text-8xl font-black tracking-tighter text-white uppercase italic leading-none">
                          {index === 0 ? carTitle : (image.title || carTitle)}
                        </h2>
                        {index === 0 && (
                          <p className="font-display text-xl lg:text-3xl font-bold italic text-white/50 uppercase tracking-tighter">
                            {carBrand} · {year} EDITION
                          </p>
                        )}
                        {(image.subtitle || image.description) && (
                           <p className="max-w-2xl text-sm lg:text-lg font-medium text-white/40 leading-relaxed uppercase tracking-widest italic">
                             {image.subtitle || image.description}
                           </p>
                        )}
                     </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>
      ))}

      {/* 2. PERSISTENT UI OVERLAYS (Fixed relative to viewport within this section) */}
      
      {/* Top Left: Slide Counter */}
      <div className="fixed top-24 left-8 z-[60] flex items-center gap-4 pointer-events-none">
         <div className="w-12 h-12 rounded-full border border-white/10 bg-black/40 backdrop-blur-xl flex items-center justify-center text-[10px] font-black text-white/80">
            {activeSlide + 1} <span className="mx-1 opacity-30">/</span> {images.length}
         </div>
      </div>


      {/* Right: Vertical Thumbnail Strip */}
      <div className="fixed right-8 top-1/2 -translate-y-1/2 z-[60] hidden lg:flex flex-col gap-3">
        {images.map((img, idx) => (
          <button
            key={`thumb-${idx}`}
            onClick={() => scrollToSlide(idx)}
            className={`group relative w-16 h-10 rounded-lg overflow-hidden border-2 transition-all duration-500 hover:scale-110 ${
              activeSlide === idx ? 'border-primary w-20' : 'border-white/10 opacity-40 hover:opacity-100'
            }`}
          >
            <img src={img.url} className="w-full h-full object-cover" alt="" />
            {activeSlide === idx && <div className="absolute inset-0 bg-primary/20" />}
          </button>
        ))}
      </div>

      {/* Bottom Right: Navigation Controls */}
      <div className="fixed bottom-10 right-8 z-[60] flex flex-col gap-2">
         <button 
           onClick={() => activeSlide > 0 && scrollToSlide(activeSlide - 1)}
           disabled={activeSlide === 0}
           className="w-12 h-12 rounded-xl bg-black/40 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white/40 hover:text-white disabled:opacity-0 transition-all"
         >
           <ChevronUp className="w-5 h-5" />
         </button>
         <button 
           onClick={() => activeSlide < images.length - 1 && scrollToSlide(activeSlide + 1)}
           disabled={activeSlide === images.length - 1}
           className="w-12 h-12 rounded-xl bg-black/40 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white/40 hover:text-white disabled:opacity-0 transition-all"
         >
           <ChevronDown className="w-5 h-5" />
         </button>
      </div>

      {/* Bottom Center: Horizontal Progress Bar */}
      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[60] flex gap-2">
         {images.map((_, idx) => (
           <div 
             key={`dot-${idx}`}
             onClick={() => scrollToSlide(idx)}
             className={`h-1 rounded-full transition-all duration-500 cursor-pointer ${
               activeSlide === idx ? 'w-12 bg-primary' : 'w-4 bg-white/20'
             }`}
           />
         ))}
      </div>
    </div>
  );
};

/**
 * Ken Burns Background Sub-component
 */
const KenBurnsBackground = ({ url, isActive, index }) => {
  return (
    <div className="absolute inset-0 overflow-hidden bg-black">
      <motion.div
        animate={{
          scale: isActive ? [1, 1.15] : 1,
          x: isActive ? (index % 2 === 0 ? ['0%', '-5%'] : ['0%', '5%']) : '0%',
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          repeatType: 'reverse',
          ease: 'linear',
        }}
        className="h-full w-full"
      >
        <img
          src={url}
          alt=""
          className="h-full w-full object-cover filter brightness-[0.7] contrast-[1.1]"
          loading={index === 0 ? 'eager' : 'lazy'}
        />
      </motion.div>
    </div>
  );
};

export default ScrollGallery;
