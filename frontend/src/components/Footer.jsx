import React from 'react';
import { Link } from 'react-router-dom';
import { Car, Send, Instagram, Facebook, Mail, Phone, MapPin } from 'lucide-react';
import { SAYT } from '../data/constants';

const Footer = () => {
  const yil = new Date().getFullYear();

  return (
    <footer className="bg-card-dark pt-20 pb-10 border-t border-white/5">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand */}
          <div className="col-span-1 lg:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-6 group">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center rotate-12 group-hover:rotate-0 transition-transform duration-300">
                <Car className="text-white w-6 h-6" />
              </div>
              <span className="text-2xl font-heading font-black tracking-tighter uppercase">{SAYT.nomi}</span>
            </Link>
            <p className="text-white/50 mb-8 max-w-xs">{SAYT.shiori}</p>
            <div className="flex gap-4">
              <a href={SAYT.ijtimoiy.telegram} className="p-3 bg-white/5 rounded-2xl hover:bg-primary transition-colors duration-300">
                <Send className="w-5 h-5" />
              </a>
              <a href={SAYT.ijtimoiy.instagram} className="p-3 bg-white/5 rounded-2xl hover:bg-primary transition-colors duration-300">
                <Instagram className="w-5 h-5" />
              </a>
              <a href={SAYT.ijtimoiy.facebook} className="p-3 bg-white/5 rounded-2xl hover:bg-primary transition-colors duration-300">
                <Facebook className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-bold mb-6">Tezkor havolalar</h4>
            <ul className="flex flex-col gap-4">
              <li><Link to="/mashinalar" className="text-white/50 hover:text-primary transition-colors">Barcha mashinalar</Link></li>
              <li><Link to="/biz-haqimizda" className="text-white/50 hover:text-primary transition-colors">Biz haqimizda</Link></li>
              <li><Link to="/aloqa" className="text-white/50 hover:text-primary transition-colors">Aloqa</Link></li>
              <li><Link to="/royxatdan" className="text-white/50 hover:text-primary transition-colors">Ro'yxatdan o'tish</Link></li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-lg font-bold mb-6">Xizmatlar</h4>
            <ul className="flex flex-col gap-4 text-white/50">
              <li>Kafolatli sug'urta</li>
              <li>Tezkor yetkazish</li>
              <li>24/7 qo'llab-quvvatlash</li>
              <li>Hujjatlarni rasmiylashtirish</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-bold mb-6">Bog'lanish</h4>
            <ul className="flex flex-col gap-6">
              <li className="flex gap-4 items-start text-white/50">
                <MapPin className="w-6 h-6 text-primary shrink-0" />
                <span>{SAYT.manzil}</span>
              </li>
              <li className="flex gap-4 items-start text-white/50">
                <Phone className="w-6 h-6 text-primary shrink-0" />
                <span>{SAYT.telefon}</span>
              </li>
              <li className="flex gap-4 items-start text-white/50">
                <Mail className="w-6 h-6 text-primary shrink-0" />
                <span>{SAYT.email}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 text-white/30 text-sm">
          <p>© {yil} {SAYT.nomi}. Barcha huquqlar himoyalangan.</p>
          <div className="flex gap-8">
            <a href="#" className="hover:text-white transition-colors">Maxfiylik siyosati</a>
            <a href="#" className="hover:text-white transition-colors">Foydalanish shartlari</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
