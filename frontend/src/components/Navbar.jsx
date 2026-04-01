import React, { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Phone, ChevronDown, User, LogOut, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const NAV_LINKS = [
  { to: '/', label: 'Bosh sahifa' },
  { to: '/fleet', label: 'Katalog' },
  { to: '/ev-fleet', label: '⚡ Elektro' },
  { to: '/chauffeur', label: 'Haydovchi bilan' },
  {
    label: 'Yana',
    children: [
      { to: '/about-us', label: 'Biz haqimizda' },
      { to: '/terms', label: 'Shartlar' },
      { to: '/faq', label: 'FAQ' },
      { to: '/contact', label: 'Aloqa' },
    ]
  }
];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setDropdownOpen(false);
  }, [location]);

  return (
    <>
      <motion.header
        animate={{
          backgroundColor: scrolled ? 'rgba(10,10,10,0.92)' : 'rgba(10,10,10,0)',
          backdropFilter: scrolled ? 'blur(20px)' : 'blur(0px)',
          borderBottomColor: scrolled ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0)',
        }}
        transition={{ duration: 0.35 }}
        className="fixed top-0 left-0 right-0 z-50 border-b"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center">
              <span className="text-white font-black text-sm font-display">R</span>
            </div>
            <span className="font-display font-extrabold text-lg tracking-tight">
              Ride<span className="text-primary">Lux</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link, i) =>
              link.children ? (
                <div key={i} className="relative">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-1 px-4 py-2 text-sm text-white/60 hover:text-white rounded-xl hover:bg-white/5 transition-all font-medium"
                  >
                    {link.label}
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {dropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.96 }}
                        transition={{ duration: 0.18 }}
                        className="absolute top-full left-0 mt-2 w-52 glass rounded-2xl overflow-hidden py-1.5 shadow-2xl shadow-black/50"
                      >
                        {link.children.map((child) => (
                          <NavLink
                            key={child.to}
                            to={child.to}
                            className={({ isActive }) =>
                              `block px-4 py-2.5 text-sm transition-colors ${
                                isActive ? 'text-primary bg-white/5' : 'text-white/60 hover:text-white hover:bg-white/5'
                              }`
                            }
                          >
                            {child.label}
                          </NavLink>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === '/'}
                  className={({ isActive }) =>
                    `relative px-4 py-2 text-sm rounded-xl font-medium transition-colors duration-200 ${
                      isActive ? 'text-white' : 'text-white/55 hover:text-white hover:bg-white/5'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {link.label}
                      {isActive && (
                        <motion.span
                          layoutId="nav-indicator"
                          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-primary rounded-full"
                        />
                      )}
                    </>
                  )}
                </NavLink>
              )
            )}
          </nav>

          {/* Right actions */}
          <div className="hidden md:flex items-center gap-3">
            <a href="tel:+998901234567" className="flex items-center gap-2 text-sm text-white/55 hover:text-white transition-colors">
              <Phone className="w-4 h-4" />
              <span className="font-medium">+998 90 123-45-67</span>
            </a>
            
            {user ? (
              <div className="flex items-center gap-2">
                <Link to="/profile" className="btn-secondary text-xs px-4 py-2.5">
                  <User className="w-3.5 h-3.5" />
                  Profil
                </Link>
                {user.is_staff && (
                  <Link to="/admin-management" className="btn-secondary text-xs px-4 py-2.5">
                    <LayoutDashboard className="w-3.5 h-3.5" />
                  </Link>
                )}
                <button onClick={logout} className="p-2 text-white/40 hover:text-primary">
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <>
                <Link to="/signin" className="btn-secondary text-xs px-4 py-2.5">Kirish</Link>
                <Link to="/fleet" className="btn-primary text-xs px-4 py-2.5">Bron qilish</Link>
              </>
            )}
          </div>

          {/* Mobile burger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 text-white/60 hover:text-white"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm md:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-[#0F0F0F] border-t border-white/8 rounded-t-3xl p-6 pb-10 md:hidden"
            >
              <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-6" />
              <nav className="flex flex-col gap-1">
                {NAV_LINKS.flatMap((l) => l.children || [l]).map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-4 py-3.5 rounded-2xl text-base font-medium transition-colors ${
                        isActive ? 'bg-primary/15 text-primary' : 'text-white/70 hover:bg-white/5 hover:text-white'
                      }`
                    }
                  >
                    {link.label}
                  </NavLink>
                ))}
              </nav>
              <div className="mt-6 flex gap-3">
                {user ? (
                  <Link to="/profile" className="btn-secondary flex-1 text-sm py-3.5">Profil</Link>
                ) : (
                  <>
                    <Link to="/signin" className="btn-secondary flex-1 text-sm py-3.5">Kirish</Link>
                    <Link to="/fleet" className="btn-primary flex-1 text-sm py-3.5">Bron qilish</Link>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
