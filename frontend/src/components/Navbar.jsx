import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Phone, ChevronDown, User, LogOut, LayoutDashboard, Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { fetchNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '../utils/api';

const NotificationList = ({ onRead }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const data = await fetchNotifications();
      setNotifications(Array.isArray(data) ? data.slice(0, 10) : []);
      setLoading(false);
    };
    load();
  }, []);

  const handleRead = async (id) => {
    try {
      await markNotificationAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? {...n, is_read: true} : n));
      onRead();
    } catch(e) {}
  };

  const getTypeLabel = (type) => {
    switch(type) {
      case 'booking_created': return 'Yangi buyurtma';
      case 'payment_completed': return "To'lov";
      case 'booking_approved': return 'Tasdiqlandi';
      case 'booking_rejected': return 'Rad etildi';
      case 'kyc_approved': return 'KYC tasdiqlandi';
      case 'kyc_rejected': return 'KYC rad etildi';
      case 'system': return 'Tizim';
      default: return type?.replace(/_/g, ' ') || 'Xabar';
    }
  };

  const getTypeColor = (type) => {
    if (type?.includes('approved') || type?.includes('completed')) return 'text-emerald-400 bg-emerald-500/15';
    if (type?.includes('rejected')) return 'text-red-400 bg-red-500/15';
    if (type?.includes('created') || type?.includes('submitted')) return 'text-amber-400 bg-amber-500/15';
    return 'text-blue-400 bg-blue-500/15';
  };

  if (loading) return <div className="p-10 text-center text-white/30 text-xs">Yuklanmoqda...</div>;
  if (notifications.length === 0) return <div className="p-10 text-center text-white/20 text-xs">Hozircha xabarlar yo'q</div>;

  return (
    <div className="flex flex-col">
      {notifications.map(n => (
        <div key={n.id} className={`px-4 py-3.5 border-b border-white/[0.06] last:border-0 hover:bg-white/[0.04] transition-colors relative ${!n.is_read ? '' : 'opacity-50'}`}>
           {!n.is_read && <div className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-full" />}
           <div className="flex justify-between items-center mb-1.5 pl-2">
              <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${getTypeColor(n.type)}`}>
                 {getTypeLabel(n.type)}
              </span>
              <span className="text-[9px] text-white/25 font-medium">{new Date(n.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
           </div>
           <div className="pl-2">
             <h4 className="text-[12px] font-semibold text-white/90 mb-0.5 leading-tight">{n.title}</h4>
             <p className="text-[11px] text-white/40 leading-relaxed line-clamp-2">{n.message}</p>
           </div>
           {!n.is_read && (
             <button onClick={() => handleRead(n.id)} className="ml-2 mt-1.5 text-[9px] font-bold uppercase text-white/25 hover:text-primary transition-colors">O'qildi</button>
           )}
        </div>
      ))}
    </div>
  );
};

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
  const [navDropdownOpen, setNavDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [lang, setLang] = useState('UZ');
  const [langOpen, setLangOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user, logout } = useAuth();
  const location = useLocation();
  const notifRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (user) {
      const getNotifications = async () => {
        try {
          const data = await fetchNotifications();
          const unread = data.filter(n => !n.is_read).length;
          setUnreadCount(unread);
        } catch (e) {}
      };
      getNotifications();
    }
  }, [user, location]);

  // Close notification dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
          <nav className="hidden md:flex items-center gap-1 relative">
            {NAV_LINKS.map((link, i) =>
              link.children ? (
                <div key={i} className="relative">
                  <button
                    onClick={() => { setNavDropdownOpen(!navDropdownOpen); setNotifOpen(false); setLangOpen(false); }}
                    className="flex items-center gap-1 px-4 py-2 text-sm text-white/60 hover:text-white rounded-xl hover:bg-white/5 transition-all font-medium"
                  >
                    {link.label}
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${navDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {navDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.96 }}
                        transition={{ duration: 0.18 }}
                        className="absolute top-full left-0 mt-2 w-52 bg-[#141414] border border-white/10 rounded-2xl overflow-hidden py-1.5 shadow-2xl shadow-black/50"
                      >
                        {link.children.map((child) => (
                          <NavLink
                            key={child.to}
                            to={child.to}
                            onClick={() => setNavDropdownOpen(false)}
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
                    <span className="relative inline-flex flex-col items-center">
                      {link.label}
                      {isActive && (
                        <motion.span
                          layoutId="nav-indicator"
                          className="absolute bottom-[-10px] left-1/2 -translate-x-1/2 w-4 h-0.5 bg-primary rounded-full shadow-[0_0_8px_rgba(255,107,1,0.5)]"
                        />
                      )}
                    </span>
                  )}
                </NavLink>
              )
            )}
          </nav>

          {/* Right actions */}
          <div className="hidden md:flex items-center gap-3">
            {/* Language Switcher */}
            <div className="relative mr-2">
              <button onClick={() => { setLangOpen(!langOpen); setNotifOpen(false); setNavDropdownOpen(false); }} className="flex items-center gap-1 text-sm text-white/55 hover:text-white transition-colors uppercase font-bold">
                {lang} <ChevronDown className={`w-3.5 h-3.5 transition-transform ${langOpen ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {langOpen && (
                  <motion.div initial={{opacity:0, y:8}} animate={{opacity:1, y:0}} exit={{opacity:0, y:8}} className="absolute top-full right-0 mt-2 bg-[#141414] rounded-xl border border-white/10 overflow-hidden w-24 shadow-2xl">
                     <button onClick={() => {setLang('UZ'); setLangOpen(false)}} className="w-full text-left px-4 py-2 text-xs hover:bg-white/10 text-white/70 hover:text-white">UZ</button>
                     <button onClick={() => {setLang('RU'); setLangOpen(false)}} className="w-full text-left px-4 py-2 text-xs hover:bg-white/10 text-white/70 hover:text-white">RU</button>
                     <button onClick={() => {setLang('EN'); setLangOpen(false)}} className="w-full text-left px-4 py-2 text-xs hover:bg-white/10 text-white/70 hover:text-white">EN</button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <a href="tel:+998901234567" className="flex items-center gap-2 text-sm text-white/55 hover:text-white transition-colors">
              <Phone className="w-4 h-4" />
              <span className="font-medium">+998 90 123-45-67</span>
            </a>
            
            {user ? (
              <div className="flex items-center gap-3">
                {/* Notification Bell */}
                <div className="relative" ref={notifRef}>
                  <button 
                    onClick={() => {
                        setNotifOpen(!notifOpen);
                        setLangOpen(false);
                        setNavDropdownOpen(false);
                    }}
                    className="relative p-2 text-white/40 hover:text-white transition-colors"
                  >
                     <Bell className="w-5 h-5" />
                     {unreadCount > 0 && (
                       <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full animate-pulse" />
                     )}
                  </button>

                  <AnimatePresence>
                    {notifOpen && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full right-0 mt-3 w-[340px] bg-[#111111] border border-white/10 rounded-2xl overflow-hidden shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)] z-[100]"
                      >
                        {/* Header */}
                        <div className="px-4 py-3 border-b border-white/[0.06] flex justify-between items-center bg-white/[0.03]">
                           <span className="text-[10px] font-bold uppercase tracking-widest text-white/50">Bildirishnomalar</span>
                           {unreadCount > 0 && (
                             <button 
                               onClick={async () => {
                                 await markAllNotificationsAsRead();
                                 setUnreadCount(0);
                               }}
                               className="text-[9px] font-bold uppercase tracking-wider text-primary hover:text-primary/80 transition-colors"
                             >
                               Hammasini o'qish
                             </button>
                           )}
                        </div>
                        {/* List */}
                        <div className="max-h-[360px] overflow-y-auto">
                           <NotificationList onRead={() => setUnreadCount(prev => Math.max(0, prev - 1))} />
                        </div>
                        {/* Footer */}
                        <Link 
                          to="/profile?tab=buyurtmalar" 
                          onClick={() => setNotifOpen(false)}
                          className="block px-4 py-3 text-center text-[10px] font-bold uppercase tracking-widest text-white/25 hover:text-primary border-t border-white/[0.06] bg-white/[0.02] transition-colors"
                        >
                           Barcha bildirishnomalar
                        </Link>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {!user.is_staff && (
                  <Link to="/profile" className="btn-secondary text-[10px] uppercase font-black tracking-widest px-4 py-2.5">
                    <User className="w-3.5 h-3.5" />
                    Profil
                  </Link>
                )}
                {user.is_staff && (
                  <Link to="/admin" className="btn-primary text-[10px] font-black uppercase tracking-widest px-4 py-2.5 flex items-center gap-2">
                    <LayoutDashboard className="w-3.5 h-3.5" />
                    Admin Panel
                  </Link>
                )}
                <button onClick={logout} className="p-2 text-white/40 hover:text-primary transition-colors">
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
                  user.is_staff ? (
                    <Link to="/admin" className="btn-primary flex-1 text-sm py-3.5">Admin Panel</Link>
                  ) : (
                    <Link to="/profile" className="btn-secondary flex-1 text-sm py-3.5">Profil</Link>
                  )
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
