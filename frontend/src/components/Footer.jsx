import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="border-t border-white/[0.05] mt-auto" style={{ background: '#080808' }}>
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Logo + tavsif */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center">
                <span className="text-white font-black text-sm font-display">R</span>
              </div>
              <span className="font-display font-extrabold text-lg tracking-tight">
                Rental<span className="text-primary">Car</span>
              </span>
            </div>
            <p className="text-sm text-white/35 leading-relaxed max-w-xs">
              {t('footer.description')}
            </p>
            {/* Socials */}
            <div className="flex gap-3 mt-6">
              {['Telegram', 'Instagram', 'WhatsApp'].map((s) => (
                <a key={s} href="#" className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white transition-all text-xs font-bold">
                  {s[0]}
                </a>
              ))}
            </div>
          </div>
          {/* Links */}
          <div>
            <div className="text-[11px] uppercase tracking-wider text-white/30 font-semibold mb-4">{t('footer.pages')}</div>
            {[
              ['/fleet', t('footer.catalog')],
              ['/about-us', t('footer.aboutUs')],
              ['/terms', t('footer.rentalTerms')],
              ['/faq', t('footer.faq')],
              ['/contact', t('footer.contact')]
            ].map(([to, label]) => (
              <Link key={to} to={to} className="block text-sm text-white/40 hover:text-white mb-2.5 transition-colors">{label}</Link>
            ))}
          </div>
          {/* Aloqa */}
          <div>
            <div className="text-[11px] uppercase tracking-wider text-white/30 font-semibold mb-4">{t('footer.contactTitle')}</div>
            <div className="space-y-3 text-sm text-white/40">
              <div>📞 <a href="tel:+998901234567" className="hover:text-white transition-colors">+998 90 123-45-67</a></div>
              <div>✉️ <a href="mailto:info@rideluz.uz" className="hover:text-white transition-colors">info@rentalcar.uz</a></div>
              <div>📍 {t('footer.address')}</div>
              <div>🕐 {t('footer.schedule')}</div>
            </div>
          </div>
        </div>
        <div className="border-t border-white/[0.05] mt-12 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-[11px] text-white/20">
          <span>{t('footer.copyright', { year: new Date().getFullYear() })}</span>
          <span>{t('footer.location')}</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
