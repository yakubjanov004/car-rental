import { useEffect, useState, useRef } from 'react';
import { useInView } from 'framer-motion';

const StatsCounter = ({ count, suffix = '', prefix = '' }) => {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const duration = 1800;
    const step = (timestamp) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      setVal(Math.floor(progress * count));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [isInView, count]);

  return (
    <div ref={ref} className="font-display font-extrabold text-3xl md:text-4xl text-white">
      {prefix}{val.toLocaleString()}{suffix}
    </div>
  );
};

export default StatsCounter;
