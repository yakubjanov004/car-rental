import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, User, LogOut, Car, Heart, LayoutDashboard } from 'lucide-react';
import { SAYT } from '../data/constants';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Bosh sahifa', path: '/' },
    { name: 'Mashinalar', path: '/mashinalar' },
    { name: 'Biz haqimizda', path: '/biz-haqimizda' },
    { name: 'Aloqa', path: '/aloqa' },
  ];

  return (
    <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${
      scrolled ? 'bg-bg-dark/80 backdrop-blur-xl py-3 border-b border-white/5' : 'bg-transparent py-5'
    }`}>
      <div className="container mx-auto px-6 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center rotate-12 group-hover:rotate-0 transition-transform duration-300 shadow-lg shadow-primary/20">
            <Car className="text-white w-6 h-6" />
          </div>
          <span className="text-2xl font-heading font-black tracking-tighter uppercase">{SAYT.nomi}</span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`text-sm font-medium hover:text-primary transition-colors ${
                location.pathname === link.path ? 'text-primary' : 'text-white/70'
              }`}
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* User Actions */}
        <div className="hidden lg:flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-3">
              <Link to="/kabinet" className="btn-secondary px-4 py-2 text-sm">
                <User className="w-4 h-4" />
                Kabinet
              </Link>
              {user.is_staff && (
                <Link to="/admin-boshqaruv" className="btn-secondary px-4 py-2 text-sm bg-primary/10 border-primary/20 text-primary">
                  <LayoutDashboard className="w-4 h-4" />
                  Admin
                </Link>
              )}
              <button onClick={logout} className="p-2 text-white/50 hover:text-primary transition-colors">
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/kirish" className="text-sm font-medium hover:text-primary transition-colors pr-4 border-r border-white/10">
                Kirish
              </Link>
              <Link to="/royxatdan" className="btn-primary px-5 py-2 text-sm">
                Ro'yxatdan o'tish
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button onClick={() => setIsOpen(!isOpen)} className="lg:hidden text-white p-2">
          {isOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="lg:hidden absolute top-full left-0 w-full bg-bg-dark border-b border-white/5 animate-fade-in">
          <div className="flex flex-col p-6 gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`text-lg font-medium ${location.pathname === link.path ? 'text-primary' : 'text-white/70'}`}
              >
                {link.name}
              </Link>
            ))}
            <div className="h-px bg-white/5 my-2" />
            {user ? (
              <>
                <Link to="/kabinet" onClick={() => setIsOpen(false)} className="flex items-center gap-3 py-2 text-white/70">
                  <User className="w-5 h-5" /> Kabinet
                </Link>
                <button onClick={() => { logout(); setIsOpen(false); }} className="flex items-center gap-3 py-2 text-red-500">
                  <LogOut className="w-5 h-5" /> Chiqish
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-3 pt-2">
                <Link to="/kirish" onClick={() => setIsOpen(false)} className="btn-secondary">Kirish</Link>
                <Link to="/royxatdan" onClick={() => setIsOpen(false)} className="btn-primary">Ro'yxatdan o'tish</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
