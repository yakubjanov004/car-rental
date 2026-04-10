import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, ChevronDown, FileText, Info, MessageCircle, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import ScrollReveal from '../components/ScrollReveal';

const FAQ = () => {
  const { t } = useTranslation();
  const items = t('faqPage.items', { returnObjects: true }) || [];

  return (
    <div className="bg-[#0A0A0A] min-h-screen pt-32 pb-32 px-6 overflow-hidden">
      
      {/* Header */}
      <section className="max-w-4xl mx-auto mb-24 relative text-center">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[400px] bg-primary/[0.05] blur-[100px] rounded-full pointer-events-none" />
        
        <ScrollReveal direction="up">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-[10px] font-bold text-white/50 uppercase tracking-widest mb-8">
            <HelpCircle className="w-3.5 h-3.5" />
            {t('faqPage.badge')}
          </div>
          <h1 className="font-display text-5xl md:text-7xl font-extrabold tracking-tighter mb-8 leading-none">
            {t('faqPage.title1')} <br /><span className="text-white/40 italic">{t('faqPage.title2')}</span>
          </h1>
          <p className="max-w-2xl mx-auto text-white/40 text-lg md:text-xl font-light leading-relaxed">
            {t('faqPage.description')}
          </p>
        </ScrollReveal>
      </section>

      {/* Accordion / FAQ List */}
      <div className="max-w-3xl mx-auto space-y-4">
        {items.map((item, i) => (
          <ScrollReveal key={i} direction="up" delay={i * 0.1}>
             <details className="group glass border-white/5 overflow-hidden transition-all duration-500 open:border-primary/20">
                <summary className="flex items-center justify-between p-7 cursor-pointer list-none select-none">
                   <div className="flex items-center gap-5">
                      <span className="text-xs font-bold text-white/20 font-display">0{i+1}</span>
                      <h3 className="text-lg font-bold group-hover:text-primary transition-colors pr-8 leading-tight">
                         {item.q}
                      </h3>
                   </div>
                   <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center shrink-0 group-open:rotate-180 transition-transform duration-500">
                      <ChevronDown className="w-4 h-4 text-white/40" />
                   </div>
                </summary>
                <div className="px-14 pb-8 -mt-2">
                   <p className="text-white/40 text-sm leading-relaxed font-light">
                      {item.a}
                   </p>
                </div>
             </details>
          </ScrollReveal>
        ))}
      </div>

      {/* Help Panel */}
      <section className="max-w-3xl mx-auto mt-24">
         <ScrollReveal direction="scale">
            <div className="p-10 rounded-[40px] bg-white/[0.02] border border-white/5 flex flex-col md:flex-row items-center gap-10 text-center md:text-left">
               <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <MessageCircle className="w-8 h-8 text-primary shadow-xl shadow-primary/20" />
               </div>
               <div className="flex-1">
                  <h4 className="font-bold text-xl mb-2">{t('faqPage.helpTitle')}</h4>
                  <p className="text-white/30 text-sm font-light">{t('faqPage.helpDesc')}</p>
               </div>
               <a href="/contact" className="btn-primary px-8 py-4 text-[10px] font-bold uppercase tracking-widest inline-flex items-center gap-2">
                  {t('faqPage.helpCta')}
                  <ArrowRight className="w-4 h-4" />
               </a>
            </div>
         </ScrollReveal>
      </section>

    </div>
  );
};

export default FAQ;
