import { useState, useEffect, useRef, useCallback } from 'react';
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
  useTransform,
} from 'framer-motion';

const SLOT_LABELS = {
  card_main: 'Asosiy',
  detail_background: 'Panorama',
  gallery_front: 'Old ko\'rinish',
  gallery_interior: 'Salon',
  gallery_rear: 'Orqa ko\'rinish',
};

const SLIDE_CONFIGS = [
  { xFrom: '0%', xTo: '-5%', scale: 1.08, blur: 0 },
  { xFrom: '-3%', xTo: '3%', scale: 1.12, blur: 0 },
  { xFrom: '2%', xTo: '-4%', scale: 1.1, blur: 0 },
  { xFrom: '-5%', xTo: '2%', scale: 1.06, blur: 2 },
  { xFrom: '0%', xTo: '-6%', scale: 1.1, blur: 0 },
];

const slideVariants = {
  enter: (direction) => ({
    x: direction > 0 ? '8%' : '-8%',
    opacity: 0,
    scale: 1.05,
  }),
  center: {
    x: '0%',
    opacity: 1,
    scale: 1,
    transition: {
      x: { type: 'spring', stiffness: 100, damping: 20 },
      opacity: { duration: 0.6, ease: 'easeOut' },
      scale: { duration: 0.8, ease: 'easeOut' },
    },
  },
  exit: (direction) => ({
    x: direction > 0 ? '-8%' : '8%',
    opacity: 0,
    scale: 0.97,
    transition: {
      x: { duration: 0.5, ease: 'easeIn' },
      opacity: { duration: 0.4 },
    },
  }),
};

const SwipeHandler = ({ onSwipeLeft, onSwipeRight }) => {
  const touchStart = useRef(null);

  return (
    <div
      className="absolute inset-0 z-10"
      onTouchStart={(e) => {
        touchStart.current = e.touches[0].clientX;
      }}
      onTouchEnd={(e) => {
        if (!touchStart.current) return;
        const diff = touchStart.current - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 50) {
          if (diff > 0) {
            onSwipeLeft();
          } else {
            onSwipeRight();
          }
        }
        touchStart.current = null;
      }}
    />
  );
};

const ImmersiveGallery = ({ images = [], autoPlay = true, interval = 6000, onSlideChange }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef(null);
  const containerRef = useRef(null);

  // Subtle 3D tilt driven by pointer position.
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useSpring(useTransform(mouseY, [-300, 300], [1.5, -1.5]), {
    stiffness: 50,
    damping: 20,
  });
  const rotateY = useSpring(useTransform(mouseX, [-500, 500], [-1.5, 1.5]), {
    stiffness: 50,
    damping: 20,
  });

  const goTo = useCallback(
    (index, dir = 1) => {
      setDirection(dir);
      setActiveIndex(index);
      if (onSlideChange) {
        onSlideChange(index);
      }
    },
    [onSlideChange]
  );

  const goNext = useCallback(() => {
    if (!images.length) return;
    goTo((activeIndex + 1) % images.length, 1);
  }, [activeIndex, images.length, goTo]);

  const goPrev = useCallback(() => {
    if (!images.length) return;
    goTo((activeIndex - 1 + images.length) % images.length, -1);
  }, [activeIndex, images.length, goTo]);

  useEffect(() => {
    if (!images.length) return;
    if (activeIndex > images.length - 1) {
      setActiveIndex(0);
    }
  }, [images.length, activeIndex]);

  useEffect(() => {
    if (!autoPlay || isPaused || images.length <= 1) return undefined;
    timerRef.current = setInterval(goNext, interval);
    return () => {
      clearInterval(timerRef.current);
    };
  }, [autoPlay, isPaused, goNext, interval, images.length]);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [goNext, goPrev]);

  useEffect(() => {
    if (!containerRef.current) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Pause autoplay when gallery is outside viewport.
        setIsPaused(!entry.isIntersecting);
      },
      { threshold: 0.45 }
    );

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (images.length <= 1) return undefined;

    const links = images.slice(1).map((img) => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.as = 'image';
      link.href = img.url;
      document.head.appendChild(link);
      return link;
    });

    return () => {
      links.forEach((link) => {
        if (link.parentNode) link.parentNode.removeChild(link);
      });
    };
  }, [images]);

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left - rect.width / 2);
    mouseY.set(e.clientY - rect.top - rect.height / 2);
  };

  if (!images.length) return null;

  const config = SLIDE_CONFIGS[activeIndex] || SLIDE_CONFIGS[0];

  return (
    <motion.div
      ref={containerRef}
      className="relative w-full overflow-hidden"
      style={{
        height: 'clamp(460px, 75vh, 700px)',
        rotateX,
        rotateY,
        perspective: 1000,
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => {
        setIsPaused(false);
        mouseX.set(0);
        mouseY.set(0);
      }}
    >
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={activeIndex}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          className="absolute inset-0"
        >
          <motion.div
            className="absolute inset-0 will-change-transform"
            initial={{ x: config.xFrom, scale: 1, filter: `blur(${config.blur}px)` }}
            animate={{ x: config.xTo, scale: config.scale, filter: `blur(${config.blur}px)` }}
            transition={{ duration: interval / 1000 + 1.2, ease: 'linear' }}
          >
            <img
              src={images[activeIndex]?.url}
              alt={SLOT_LABELS[images[activeIndex]?.slot] || 'Gallery'}
              className="w-full h-full object-cover"
              loading={activeIndex === 0 ? 'eager' : 'lazy'}
              decoding="async"
            />
          </motion.div>

          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-transparent to-black/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-transparent" />

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="absolute top-6 left-6 flex items-center gap-2"
          >
            <span className="bg-white/10 backdrop-blur-sm border border-white/20 text-white text-xs font-medium px-3 py-1.5 rounded-full">
              {SLOT_LABELS[images[activeIndex]?.slot] || 'Galereya'}
            </span>
            <span className="text-white/40 text-xs">
              {activeIndex + 1} / {images.length}
            </span>
          </motion.div>
        </motion.div>
      </AnimatePresence>

      <div className="absolute bottom-20 left-6 right-6 flex gap-1.5 z-20">
        {images.map((_, idx) => (
          <button
            key={idx}
            onClick={() => goTo(idx, idx > activeIndex ? 1 : -1)}
            className="relative h-0.5 flex-1 bg-white/20 rounded-full overflow-hidden"
            aria-label={`Slide ${idx + 1}`}
          >
            {idx === activeIndex && (
              <motion.div
                className="absolute inset-y-0 left-0 bg-white rounded-full"
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: interval / 1000, ease: 'linear' }}
                key={activeIndex}
              />
            )}
            {idx < activeIndex && <div className="absolute inset-0 bg-white rounded-full" />}
          </button>
        ))}
      </div>

      <div className="absolute bottom-4 left-6 right-6 flex gap-2 z-20 overflow-x-auto no-scrollbar">
        {images.map((img, idx) => (
          <motion.button
            key={idx}
            onClick={() => goTo(idx, idx > activeIndex ? 1 : -1)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`relative flex-shrink-0 rounded-lg overflow-hidden transition-all duration-300 ${
              idx === activeIndex
                ? 'ring-2 ring-primary w-16 h-10 opacity-100'
                : 'ring-1 ring-white/20 w-14 h-9 opacity-50 hover:opacity-80'
            }`}
          >
            <img src={img.url} alt={SLOT_LABELS[img.slot] || 'Thumb'} className="w-full h-full object-cover" loading="lazy" />
            {idx === activeIndex && <div className="absolute inset-0 bg-primary/10" />}
          </motion.button>
        ))}
      </div>

      <button
        onClick={goPrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white hover:bg-black/60 transition-colors"
        aria-label="Oldingi"
      >
        {'<'}
      </button>
      <button
        onClick={goNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white hover:bg-black/60 transition-colors"
        aria-label="Keyingi"
      >
        {'>'}
      </button>

      <SwipeHandler onSwipeLeft={goNext} onSwipeRight={goPrev} />
    </motion.div>
  );
};

export default ImmersiveGallery;
