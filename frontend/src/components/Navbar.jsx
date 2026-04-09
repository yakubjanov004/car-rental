import React, { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Phone, ChevronDown, User, LogOut, LayoutDashboard, Bell, Info } from 'lucide-react';
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

  if (loading) return <div className="p-10 text-center text-white/20 italic text-[10px] uppercase font-black">Yuklanmoqda...</div>;
  if (notifications.length === 0) return <div className="p-10 text-center text-white/10 italic text-[10px] uppercase font-bold">Hozircha xabarlar yo'q</div>;

  return (
    <div className="flex flex-col">
      {notifications.map(n => (
        <div key={n.id} className={`p-4 border-b border-white/5 last:border-0 hover:bg-white/[0.03] transition-colors relative ${!n.is_read ? 'bg-primary/[0.02]' : ''}`}>
           {!n.is_read && <div className="absolute left-1 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-full shadow-[0_0_10px_rgba(255,107,1,0.5)]" />}
           <div className="flex justify-between items-start mb-1">
              <span className={`text-[9px] font-black uppercase tracking-tighter ${n.type?.includes('kyc') ? 'text-blue-400' : 'text-primary'}`}>
                 {n.type?.replace(/_/g, ' ')}
              </span>
              <span className="text-[8px] text-white/20 font-medium">{new Date(n.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
           </div>
           <h4 className="text-[11px] font-bold text-white mb-1 leading-tight">{n.title}</h4>
           <p className="text-[10px] text-white/40 leading-relaxed line-clamp-2">{n.message}</p>
           {!n.is_read && (
             <button onClick={() => handleRead(n.id)} className="mt-2 text-[8px] font-black uppercase text-white/20 hover:text-white transition-colors underline underline-offset-4 pointer-events-auto">O'qildi</button>
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
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [lang, setLang] = useState('UZ');
  const [langOpen, setLangOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user, logout } = useAuth();
  const location = useLocation();

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
              <button onClick={() => setLangOpen(!langOpen)} className="flex items-center gap-1 text-sm text-white/55 hover:text-white transition-colors uppercase font-bold">
                {lang} <ChevronDown className={`w-3.5 h-3.5 transition-transform ${langOpen ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {langOpen && (
                  <motion.div initial={{opacity:0, y:8}} animate={{opacity:1, y:0}} exit={{opacity:0, y:8}} className="absolute top-full right-0 mt-2 bg-[#111] backdrop-blur-md rounded-xl border border-white/10 overflow-hidden w-24 shadow-2xl">
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
                <div className="relative">
                  <button 
                    onClick={() => {
                        setDropdownOpen(dropdownOpen === 'notifications' ? null : 'notifications');
                        setLangOpen(false);
                    }}
                    className="relative p-2 text-white/40 hover:text-white transition-colors group"
                  >
                     <Bell className="w-5 h-5" />
                     {unreadCount > 0 && (
                       <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full border border-bg-dark animate-pulse" />
                     )}
                  </button>

                  <AnimatePresence>
                    {dropdownOpen === 'notifications' && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute top-full right-0 mt-3 w-80 glass border-white/10 rounded-[24px] overflow-hidden shadow-2xl z-[100]"
                      >
                        <div className="p-4 border-b border-white/5 flex justify-between items-center bg-white/5">
                           <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Sizning Xabarlaringiz</span>
                           {unreadCount > 0 && (
                             <button 
                               onClick={async () => {
                                 await markAllNotificationsAsRead();
                                 setUnreadCount(0);
                               }}
                               className="text-[9px] font-black uppercase tracking-tighter text-primary hover:text-white transition-colors"
                             >
                               Hammasini o'qish
                             </button>
                           )}
                        </div>
                        <div className="max-h-[360px] overflow-y-auto scrollbar-hide">
                           <NotificationList onRead={() => setUnreadCount(prev => Math.max(0, prev - 1))} />
                        </div>
                        <Link to="/profile?tab=buyurtmalar" className="block p-4 text-center text-[10px] font-black uppercase tracking-widest text-white/20 hover:text-primary border-t border-white/5 bg-white/[0.02] transition-colors">
                           Barcha bildirishnomalar
                        </Link>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <Link to="/profile" className="btn-secondary text-[10px] uppercase font-black tracking-widest px-4 py-2.5">
                  <User className="w-3.5 h-3.5" />
                  Profil
                </Link>
                {user.is_staff && (
                  <Link to="/admin" className="btn-primary text-[10px] font-black uppercase tracking-widest px-4 py-2.5 flex items-center gap-2">
                    <LayoutDashboard className="w-3.5 h-3.5" />
                    Admin
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
