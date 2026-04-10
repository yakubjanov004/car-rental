import React from 'react';
import { Link } from 'react-router-dom';
import { Car, ChevronLeft, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import ScrollReveal from '../components/ScrollReveal';

const NotFound = () => {
  const { t } = useTranslation();

  return (
    <div className="bg-[#0A0A0A] min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/[0.05] blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-primary/[0.03] blur-[100px] rounded-full pointer-events-none" />

      <div className="text-center relative z-10 max-w-2xl mx-auto">
        <ScrollReveal direction="up">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="relative inline-block mb-12"
          >
            <h1 className="font-display text-[12rem] md:text-[20rem] font-extrabold tracking-tighter leading-none text-white/[0.03] select-none">404</h1>
            <div className="absolute inset-0 flex items-center justify-center">
               <div className="w-32 h-32 md:w-48 md:h-48 bg-primary/10 rounded-full blur-3xl animate-pulse" />
               <Car className="w-24 h-24 md:w-32 md:h-32 text-primary" />
            </div>
          </motion.div>
        </ScrollReveal>

        <ScrollReveal direction="up" delay={0.2}>
          <h2 className="font-display text-4xl md:text-6xl font-extrabold tracking-tight mb-6">{t('notFound.title')}</h2>
          <p className="text-white/40 text-lg md:text-xl font-light mb-12 max-w-sm mx-auto leading-relaxed">
            {t('notFound.description')}
          </p>
          
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/" className="btn-primary px-10 py-5 text-xs font-bold uppercase tracking-widest inline-flex items-center gap-2 group">
              <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              {t('notFound.goHome')}
            </Link>
            <Link to="/fleet" className="btn-secondary px-10 py-5 text-xs font-bold uppercase tracking-widest inline-flex items-center gap-2 group">
              {t('nav.fleet')}
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </ScrollReveal>
      </div>

      {/* Floating text line */}
      <div className="absolute bottom-10 left-0 w-full overflow-hidden whitespace-nowrap opacity-[0.02] pointer-events-none">
        <div className="text-[15vh] font-black uppercase tracking-[0.5em] animate-marquee">
          ERROR 404 PAGE NOT FOUND ERROR 404 PAGE NOT FOUND ERROR 404 PAGE NOT FOUND
        </div>
      </div>
    </div>
  );
};

export default NotFound;
