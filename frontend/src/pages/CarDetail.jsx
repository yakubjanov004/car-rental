import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Users, Fuel, Settings2, Calendar, 
  CheckCircle2, ChevronLeft, 
  ShieldCheck, ArrowRight, Clock, AlertCircle, Zap, Sparkles,
  LayoutGrid, Gauge, Car
} from 'lucide-react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { formatNarx } from '../utils/formatPrice';
import { kunlarFarqi } from '../utils/dateUtils';
import { useAuth } from '../context/AuthContext';
import ScrollReveal from '../components/ScrollReveal';
import CheckoutModal from '../components/payment/CheckoutModal';
import { fetchCarDetail, MEDIA_BASE_URL, createBooking, fetchCarAvailability } from '../utils/api';
import './CarDetail.css';

/* ─── Reveal wrapper using IntersectionObserver ─── */
const Reveal = ({ children, className = '', delay = 0 }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
};

/* ─── Info Card (specs) ─── */
const InfoCard = ({ icon: Icon, label, val, delay = 0 }) => (
  <Reveal delay={delay}>
    <div className="cd-info-card">
      <div className="cd-info-card__icon">
        <Icon size={18} color="#E8372A" />
      </div>
      <div>
        <div className="cd-info-card__label">{label}</div>
        <div className="cd-info-card__value">{val}</div>
      </div>
    </div>
  </Reveal>
);

/* ─── Floating Spec Badge ─── */
const FloatingBadge = ({ label, value, className = '' }) => (
  <div className={`cd-hero__badge ${className}`}>
    <div className="cd-hero__badge-label">{label}</div>
    <div className="cd-hero__badge-value">{value}</div>
  </div>
);

/* ─── Bento Grid Cell ─── */
const BentoCell = ({ icon: Icon, label, value, delay = 0 }) => (
  <Reveal delay={delay}>
    <div className="cd-bento__cell">
      <div className="cd-bento__cell-icon">
        <Icon size={20} />
      </div>
      <div>
        <div className="cd-bento__cell-label">{label}</div>
        <div className="cd-bento__cell-value">{value}</div>
      </div>
    </div>
  </Reveal>
);


/* ═══════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════ */
const CarDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [availability, setAvailability] = useState({ booked_dates: [], booked_ranges: [] });
  
  const [bookingData, setBookingData] = useState({
    startDate: '',
    endDate: '',
    fullName: user?.first_name ? `${user.first_name} ${user.last_name || ''}` : '',
    phone_number: user?.phone || '',
  });

  const [dateError, setDateError] = useState('');
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [currentBooking, setCurrentBooking] = useState(null);

  /* Scroll-driven transforms */
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const heroCarY = useTransform(scrollYProgress, [0, 0.15], [0, 150]);
  const heroCarScale = useTransform(scrollYProgress, [0, 0.15], [1, 0.88]);
  const heroCarOpacity = useTransform(scrollYProgress, [0.08, 0.2], [1, 0]);
  const heroContentY = useTransform(scrollYProgress, [0, 0.2], [0, -100]);
  
  const detailBgY = useTransform(scrollYProgress, [0.1, 0.4], [100, -100]);
  const rearY = useTransform(scrollYProgress, [0.3, 0.6], [120, -120]);

  const [isScrolled, setIsScrolled] = useState(false);
  useEffect(() => {
    return scrollYProgress.on("change", v => setIsScrolled(v > 0.05));
  }, [scrollYProgress]);

  /* Media resolver */
  const resolveMediaUrl = (url) => {
    if (!url || typeof url !== 'string') return null;
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    
    // Ensure one slash between base and path
    const base = MEDIA_BASE_URL.replace(/\/$/, '');
    const path = url.startsWith('/') ? url : `/${url}`;
    
    return `${base}${path}`;
  };

  /* Build gallery from all 5 slots */
  const gallery = useMemo(() => {
    if (!car) return {};
    const images = {};
    
    // Base image
    if (car.main_image) images.card_main = resolveMediaUrl(car.main_image);
    
    // Car media slots
    if (car.media) {
      Object.entries(car.media).forEach(([slot, url]) => {
        if (url && typeof url === 'string') images[slot] = resolveMediaUrl(url);
      });
    }

    // Model specific images (overrides)
    const modelImages = Array.isArray(car.model_info?.images) ? car.model_info.images : [];
    modelImages.forEach(img => {
      if (img.slot && img.image) images[img.slot] = resolveMediaUrl(img.image);
    });

    // Final hero fallback
    if (!images.card_main) {
      images.card_main = resolveMediaUrl(car.media?.card_main || car.main_image) || '/images/assets/car_fallback.jpg';
    }
    
    return images;
  }, [car]);

  /* Data fetching */
  useEffect(() => {
    const loadCarData = async () => {
      if (!id || id === 'undefined') {
        setError("Noto'g'ri URL");
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const [carData, availData] = await Promise.all([
          fetchCarDetail(id),
          fetchCarAvailability(id)
        ]);
        if (carData) {
          setCar(carData);
          setAvailability(availData || { booked_dates: [], booked_ranges: [] });
        } else {
          setError("Mashina topilmadi");
        }
      } catch (err) {
        setError("Ma'lumotlarni yuklashda xatolik");
      } finally {
        setLoading(false);
      }
    };
    loadCarData();
    window.scrollTo(0, 0);
  }, [id]);

  /* ─── Date validation & booking ─── */
  const isDateBooked = (dateStr) => availability.booked_dates.includes(dateStr);

  const validateDates = (start, end) => {
    if (!start || !end) return true;
    const s = new Date(start), e = new Date(end);
    if (e <= s) { setDateError("Qaytarish sanasi olish sanasidan keyin bo'lishi kerak."); return false; }
    let cur = new Date(s);
    while (cur <= e) {
      if (isDateBooked(cur.toISOString().split('T')[0])) {
        setDateError(`${cur.toISOString().split('T')[0]} sanasi allaqachon band.`);
        return false;
      }
      cur.setDate(cur.getDate() + 1);
    }
    setDateError('');
    return true;
  };

  const handleBooking = async () => {
    if (!user) { navigate('/signin'); return; }
    if (!validateDates(bookingData.startDate, bookingData.endDate)) return;
    try {
      const res = await createBooking({
        car: car.id,
        start_date: bookingData.startDate,
        end_date: bookingData.endDate,
        total_price: (car.daily_price || 0) * (kunlarFarqi(bookingData.startDate, bookingData.endDate) || 1),
        full_name: bookingData.fullName,
        phone_number: bookingData.phone_number,
      });
      if (res?.id) { setCurrentBooking(res); setIsCheckoutOpen(true); }
    } catch { alert("Xatolik yuz berdi. Iltimos qaytadan urinib ko'ring."); }
  };

  /* Loading / Error states */
  if (loading) return (
    <div className="cd-loader">
      <div className="cd-loader__spinner" />
    </div>
  );

  if (error || !car) return (
    <div className="cd-error">
      <AlertCircle size={64} className="cd-error__icon" />
      <h2 className="cd-error__title">Mashina <span>topilmadi</span></h2>
      <Link to="/fleet" className="cd-error__btn">Katalogga qaytish</Link>
    </div>
  );

  const brand = car.brand || "CHEVROLET";
  const model = car.model || "Unknown";
  const year = car.year || 2024;
  const price = car.daily_price || 0;

  /* ═══════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════ */
  return (
    <div ref={containerRef} className={`cd-root ${isScrolled ? 'scrolled' : ''}`}>

      {/* ──────────────────────────────────────
          1. HERO — White Studio
          ────────────────────────────────────── */}
      <section className="cd-hero">
        <div className="cd-hero__grid" />
        
        {/* Floating Specs */}
        <FloatingBadge label="Power Output" value={`${car.power || '460'} HP`} className="cd-hero__badge--top-left" />
        <FloatingBadge label="Top Speed" value={`${car.top_speed || '250'} KMH`} className="cd-hero__badge--top-right" />
        <FloatingBadge label="Engine Type" value={car.engine_type?.toUpperCase() || car.fuel_type?.toUpperCase() || 'V8 BITURBO'} className="cd-hero__badge--bottom-left" />

        {/* Dropping Car */}
        <div className="cd-hero__car-wrap">
          <motion.div
            className="cd-hero__car-inner"
            style={{ y: heroCarY, scale: heroCarScale, opacity: heroCarOpacity }}
          >
            <div className="cd-hero__car-anim">
              <img src={gallery.card_main} className="cd-hero__car-img" alt={model} />
            </div>
          </motion.div>
          <div className="cd-hero__shadow" />
        </div>

        {/* Title overlay */}
        <motion.div className="cd-hero__content" style={{ y: heroContentY }}>
          <h1 className="cd-hero__title">
            {brand}<span>{model}</span>
          </h1>
          <p className="cd-hero__subtitle">
            {car.model_info?.detail_title || "Premium sport sedan — yuqori tezlik va barqarorlik ramzi."}
          </p>
        </motion.div>

        {/* Gradient to black */}
        <div className="cd-hero__gradient" />

        {/* Scroll indicator */}
        <div className="cd-hero__scroll">
          <span className="cd-hero__scroll-label">Scroll</span>
          <div className="cd-hero__scroll-line">
            <div className="cd-hero__scroll-dot" />
          </div>
        </div>

        {/* Back button */}
        <motion.div
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <Link to="/fleet" className="cd-back-btn">
            <span>Back to fleet</span>
            <ChevronLeft size={16} />
          </Link>
        </motion.div>
      </section>

      {/* ──────────────────────────────────────
          2. DESCRIPTION — detail_background
          ────────────────────────────────────── */}
      <section className="cd-desc">
        <motion.div className="cd-desc__bg" style={{ y: detailBgY }}>
          {gallery.detail_background && (
            <>
              <img src={gallery.detail_background} alt="" />
              <div className="cd-desc__bg-overlay" />
            </>
          )}
        </motion.div>

        <div className="cd-desc__grid">
          <Reveal className="cd-desc__hero">
            <div>
              <div className="cd-desc__accent" />
              <h2 className="cd-desc__title">
                {car.model_info?.detail_title || `${brand} ${model} — bu kuch, texnologiya va dizayn uyg'unligi.`}
              </h2>
              <p className="cd-desc__text">
                {car.model_info?.detail_summary || "Zamonaviy klassika bilan boyitilgan tizim va maksimal darajadagi komfort."}
              </p>
            </div>
          </Reveal>

          <div className="cd-info-grid">
            <InfoCard icon={Zap} label="KUCH" val={`${car.power || '600'} OT`} delay={0} />
            <InfoCard icon={ShieldCheck} label="TEZLANISH" val={car.acceleration || "4.5s"} delay={0.1} />
            <InfoCard icon={Fuel} label="SARF" val={car.fuel_consumption || "12.5 L"} delay={0.15} />
            <InfoCard icon={Users} label="O'RINLAR" val={`${car.seats || 5} TA`} delay={0.2} />
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────
          3. REAR VIEW — gallery_rear (Parallax)
          ────────────────────────────────────── */}
      <section className="cd-rear">
        <motion.div className="cd-rear__img-wrap" style={{ y: rearY }}>
          {gallery.gallery_rear && <img src={gallery.gallery_rear} alt="Rear view" />}
        </motion.div>
        <div className="cd-rear__overlay" />

        <div className="cd-rear__content">
          <Reveal>
            <div style={{ maxWidth: '32rem' }}>
              <div className="cd-rear__tag">
                <div className="cd-rear__tag-line" />
                REAR PROFILE
              </div>
              <h3 className="cd-rear__heading">
                {car.rear_title ? (
                  <>
                    {car.rear_title.split(' ').slice(0, -1).join(' ')}<br />
                    <span>{car.rear_title.split(' ').slice(-1)}</span>
                  </>
                ) : (
                  <>XARAKTER VA<br /><span>BARQARORLIK</span></>
                )}
              </h3>
              <p className="cd-rear__body">
                {car.rear_description || "Har bir detal mukammallikka intilgan. RideLux faqat eng yaxshi xususiyatlarni taqdim etadi."}
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ──────────────────────────────────────
          4. BENTO GRID — gallery_front + specs
          ────────────────────────────────────── */}
      <section className="cd-bento">
        <div className="cd-bento__header">
          <Reveal>
            <div>
              <h2 className="cd-bento__heading">Asosiy <span>xususiyatlar</span></h2>
              <div className="cd-bento__accent" />
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="cd-bento__subtitle">
              TEXNIK KO'RSATKICHLAR VA QULAYLIKLARNING ENG YUQORI DARAJASI
            </p>
          </Reveal>
        </div>

        <div className="cd-bento__grid">
          {/* Left: image + spec cells */}
          <div className="cd-bento__main">
            <Reveal>
              <div className="cd-bento__img-card">
                {gallery.gallery_front && <img src={gallery.gallery_front} alt="Front view" />}
                <div className="cd-bento__img-overlay" />
                <div className="cd-bento__img-label">
                  <span>Dynamic View</span>
                  <h4>AERODINAMIK DIZAYN</h4>
                </div>
              </div>
            </Reveal>

            <div style={{ display: 'grid', gridTemplateRows: '1fr 1fr', gap: '1.5rem' }}>
              <BentoCell icon={Settings2} label="Yuritma" value={car.drive_type?.toUpperCase() || 'AWD'} delay={0.05} />
              <BentoCell icon={Fuel} label="Hajmi" value={car.cargo_capacity || '500 L'} delay={0.1} />
            </div>
          </div>

          {/* Right: sidebar details */}
          <Reveal delay={0.15}>
            <div className="cd-bento__sidebar">
              <div>
                <h5 className="cd-bento__sidebar-title">
                  <Sparkles size={14} color="#E8372A" /> MODEL INFO
                </h5>
                <div>
                  <div className="cd-bento__sidebar-row">
                    <span className="cd-bento__sidebar-row-label">Variant</span>
                    <span className="cd-bento__sidebar-row-value">{car.color_name}</span>
                  </div>
                  <div className="cd-bento__sidebar-row">
                    <span className="cd-bento__sidebar-row-label">Yil</span>
                    <span className="cd-bento__sidebar-row-value">{year}</span>
                  </div>
                  <div className="cd-bento__sidebar-row">
                    <span className="cd-bento__sidebar-row-label">Status</span>
                    <span className="cd-bento__sidebar-row-value" style={{ color: '#22c55e' }}>ACTIVE</span>
                  </div>
                </div>
              </div>

              <div>
                <h5 className="cd-bento__sidebar-title">LOYIHA UNITLARI</h5>
                <div className="cd-bento__colors">
                  {car.same_model_units?.map((unit) => (
                    <motion.button
                      key={unit.id}
                      whileHover={{ scale: 1.1, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => navigate(`/car/${unit.slug}`)}
                      className={`cd-bento__color-btn ${unit.id === car.id ? 'cd-bento__color-btn--active' : ''}`}
                      style={{ backgroundColor: unit.color_hex }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ──────────────────────────────────────
          5. INTERIOR — gallery_interior
          ────────────────────────────────────── */}
      <section className="cd-interior">
        <div className="cd-interior__ghost">CHANCE LUXURY</div>

        <div style={{ maxWidth: '80rem', margin: '0 auto', position: 'relative', zIndex: 10 }}>
          <Reveal>
            <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
              <h2 className="cd-interior__heading">
                {car.interior_title ? (
                  <>
                    {car.interior_title.split(' ').slice(0, -1).join(' ')} <span>{car.interior_title.split(' ').slice(-1)}</span>
                  </>
                ) : (
                  <>SALON <span>PREMIUM KLASS</span></>
                )}
              </h2>
              <p className="cd-interior__body">
                {car.interior_description || "Har bir harakatda qulaylikni his eting. Yuqori sifatli materiallar va eng zamonaviy elektronika."}
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="cd-interior__frame">
              {gallery.gallery_interior && (
                <motion.img 
                  src={gallery.gallery_interior} 
                  alt="Interior"
                  initial={{ scale: 1.1 }}
                  whileInView={{ scale: 1 }}
                  transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }}
                />
              )}
              <div className="cd-interior__frame-overlay" />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ──────────────────────────────────────
          6. BOOKING & CALENDAR
          ────────────────────────────────────── */}
      <section className="cd-booking">
        <div className="cd-booking__grid">
          {/* Calendar Side */}
          <div className="cd-booking__calendar-side">
            <Reveal>
              <div>
                <h3 className="cd-booking__heading">
                  BANDLIK <span>KALENDARI</span>
                </h3>
                <p className="cd-booking__sub">
                  Sayohat rejasini hoziroq tuzing. Mashina bo'sh sanalarini ko'rib chiqing.
                </p>

                <div className="cd-calendar">
                  {['Dush', 'Sesh', 'Chor', 'Pay', 'Jum', 'Shan', 'Yak'].map(d => (
                    <div key={d} className="cd-calendar__day-header">{d}</div>
                  ))}
                  {Array.from({ length: 35 }).map((_, i) => {
                    const day = i - 3;
                    const booked = i > 10 && i < 15;
                    if (day < 1 || day > 31) return <div key={i} />;
                    return (
                      <div
                        key={i}
                        className={`cd-calendar__day ${booked ? 'cd-calendar__day--booked' : ''}`}
                      >
                        {day}
                      </div>
                    );
                  })}
                </div>

                <div className="cd-calendar__legend">
                  <div className="cd-calendar__legend-item">
                    <div className="cd-calendar__legend-dot cd-calendar__legend-dot--booked" />
                    <span className="cd-calendar__legend-text">BAND QILINGAN</span>
                  </div>
                  <div className="cd-calendar__legend-item">
                    <div className="cd-calendar__legend-dot cd-calendar__legend-dot--free" />
                    <span className="cd-calendar__legend-text">BO'SH SANALAR</span>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>

          {/* Booking Form Side */}
          <div className="cd-booking__form-side">
            <div className="cd-form-card">
              <Reveal delay={0.1}>
                <div className="cd-form">
                  <div className="cd-form__glow" />

                  <div className="cd-form__header">
                    <div>
                      <div className="cd-form__price-label">Kunlik Narxi</div>
                      <div className="cd-form__price">{formatNarx(price)}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div className="cd-form__location-label">Manzil</div>
                      <div className="cd-form__location">TOSHKENT, UZ</div>
                    </div>
                  </div>

                  <div>
                    <h4 className="cd-form__section-title">RESERVATION DETAILS</h4>
                    <div className="cd-form__row" style={{ marginBottom: '1rem' }}>
                      <input
                        type="date"
                        className="cd-form__input"
                        value={bookingData.startDate}
                        onChange={(e) => setBookingData({ ...bookingData, startDate: e.target.value })}
                      />
                      <input
                        type="date"
                        className="cd-form__input"
                        value={bookingData.endDate}
                        onChange={(e) => setBookingData({ ...bookingData, endDate: e.target.value })}
                      />
                    </div>
                    <input
                      type="text"
                      placeholder="FULL NAME"
                      className="cd-form__input cd-form__input--full"
                      value={bookingData.fullName}
                      onChange={(e) => setBookingData({ ...bookingData, fullName: e.target.value })}
                      style={{ marginBottom: '1rem' }}
                    />
                    <input
                      type="tel"
                      placeholder="+998 90 123 45 67"
                      className="cd-form__input cd-form__input--full"
                      value={bookingData.phone_number}
                      onChange={(e) => setBookingData({ ...bookingData, phone_number: e.target.value })}
                      style={{ marginBottom: '1.5rem' }}
                    />

                    {dateError && <p className="cd-form__error">{dateError}</p>}

                    <motion.button 
                      className="cd-form__submit" 
                      onClick={handleBooking}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <span className="cd-form__submit-text">RESERVE THIS ASSET</span>
                      <ArrowRight size={20} className="cd-form__submit-icon" />
                    </motion.button>
                  </div>

                  <div className="cd-form__footer">
                    <p>RIDE LUXURY · SECURED TRANSACTION</p>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="cd-footer">
        <div className="cd-footer__text">{brand} {model} / {year} EDITION</div>
      </footer>

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => { setIsCheckoutOpen(false); navigate('/profile'); }}
        booking={currentBooking}
      />
    </div>
  );
};

export default CarDetail;
