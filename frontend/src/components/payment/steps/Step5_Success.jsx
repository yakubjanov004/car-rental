import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, XCircle, Download, ArrowRight, Home, HeadphonesIcon } from 'lucide-react';
import { downloadInvoiceFile } from '../../../services/api/payments';
import toast from 'react-hot-toast';

// Tayyor CSS/Framer particle animatsiyasi
const CustomConfetti = () => {
  const colors = ['#FF6B01', '#00C853', '#007AFF', '#FFD600', '#FF2D55'];
  const particles = Array.from({ length: 30 }).map((_, i) => ({
    id: i,
    color: colors[i % colors.length],
    left: Math.random() * 100 + '%',
    duration: Math.random() * 1.5 + 1
  }));

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{ y: '100%', opacity: 1, scale: 0 }}
          animate={{
            y: '-20%',
            opacity: 0,
            scale: Math.random() * 1.5 + 0.5,
            x: (Math.random() - 0.5) * 200,
            rotate: Math.random() * 360
          }}
          transition={{ duration: p.duration, ease: 'easeOut', delay: Math.random() * 0.2 }}
          className="absolute bottom-0 w-2 h-2 rounded-full"
          style={{ backgroundColor: p.color, left: p.left }}
        />
      ))}
    </div>
  );
};

const Step5_Success = ({
  status,
  booking,
  totalAmount,
  paymentResult = {},
  onClose,
  onRetry
}) => {
  const navigate = useNavigate();
    const { t } = useTranslation();
  const [showCheck, setShowCheck] = useState(false);
  
  // Kutish qismi (status polling holatida kelsa yoki boshida animatsiya uchun)
  useEffect(() => {
    if (status === 'success') {
      const t = setTimeout(() => setShowCheck(true), 500); // 0.5s loading
      return () => clearTimeout(t);
    }
  }, [status]);

  const handleDownload = async () => {
    if (paymentResult?.invoice_id) {
      try {
         toast.loading(`Yuklanmoqda...`, { id: 'dl' });
         const blob = await downloadInvoiceFile(paymentResult.invoice_id);
         const url = window.URL.createObjectURL(blob);
         const link = document.createElement('a');
         link.href = url;
         link.setAttribute('download', `RENTAL CAR_Invoice_${paymentResult.invoice_number || paymentResult.invoice_id}.pdf`);
         document.body.appendChild(link);
         link.click();
         link.parentNode.removeChild(link);
         toast.success("Muvaffaqiyatli yuklandi!", { id: 'dl' });
      } catch (err) {
         toast.error("Chekni yuklab olishda xatolik yuz berdi.", { id: 'dl' });
      }
    } else {
      toast.error("Invoice ID topilmadi");
    }
  };

  const handleGoProfile = () => {
    onClose();
    navigate('/profile');
  };

  const handleGoHome = () => {
    onClose();
    navigate('/');
  };

  const formatMoney = (sum) => {
    return new Intl.NumberFormat('uz-UZ').format(sum || 0) + " so'm";
  };

  const now = new Date();
  const currentDate = now.toLocaleDateString('uz-UZ');
  const currentTime = now.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  return (
    <div className="relative w-full text-white min-h-[400px] flex flex-col justify-center">
      <AnimatePresence mode="wait">
        {/* XATO HOLATI */}
        {status === 'failed' || status === 'error' ? (
          <motion.div key="error" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center text-center pb-6">
            <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
               <XCircle className="w-12 h-12 text-red-500" />
            </div>
            <h2 className="text-2xl font-black uppercase tracking-widest text-red-500 mb-2">{t('checkoutModal.paymentFailed')}</h2>
            <p className="text-sm text-white/50 mb-8 max-w-[280px]">
               {paymentResult?.error || "Qandaydir xatolik yuz berdi. Iltimos kartangiz balansini tekshiring yoki boshqa karta orqali urining."}
            </p>
            
            <div className="w-full space-y-3">
              <button onClick={onRetry} className="w-full py-4 rounded-xl bg-primary text-white font-black uppercase tracking-widest hover:bg-primary/90 transition-colors shadow-[0_0_20px_rgba(255,107,1,0.3)]">
                Qayta urinish
              </button>
              <button className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-[#1A1A1A] border border-white/10 text-white font-bold uppercase tracking-widest hover:bg-white/5 transition-colors">
                <HeadphonesIcon className="w-4 h-4" />
                 Qo`llab-quvvatlash xizmati
              </button>
            </div>
          </motion.div>
        ) : (
          /* MUVAFFAQIYAT HOLATI */
          <motion.div key="success" className="relative z-10 w-full" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            
            {/* INITIAL LOADING (agar showCheck false bo'lsa) */}
            {!showCheck && (
              <motion.div exit={{ opacity: 0, scale: 0.8 }} className="absolute inset-0 flex flex-col items-center justify-center z-20">
                <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                <p className="mt-4 text-xs font-black text-primary uppercase tracking-widest animate-pulse">{t('checkoutModal.dataLoading')}</p>
              </motion.div>
            )}

            {/* CHECK DESIGN AND ANIMATION */}
            {showCheck && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: 'easeOut' }}>
                <CustomConfetti />
                
                <div className="flex flex-col items-center text-center relative z-10">
                   <motion.div
                     initial={{ scale: 0 }}
                     animate={{ scale: 1 }}
                     transition={{ type: "spring", stiffness: 200, damping: 20 }}
                     className="w-20 h-20 bg-[#00C853]/10 rounded-full flex items-center justify-center mb-3 shadow-[0_0_30px_rgba(0,200,83,0.3)]"
                   >
                     <motion.svg className="w-12 h-12 text-[#00C853]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <motion.path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }} />
                     </motion.svg>
                   </motion.div>
                   <h2 className="text-xl sm:text-2xl font-black uppercase tracking-widest text-[#00C853] drop-shadow-md mb-6">
                     To`lov amalga oshdi
                   </h2>
                </div>

                {/* PAYME/CLICK STYLIZED RECEIPT */}
                <div className="relative bg-[#1A1A1A] border-x border-y border-white/10 mx-auto w-full max-w-[320px] pb-6 pt-2 font-mono text-xs text-white/70 shadow-2xl overflow-hidden filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]">
                   
                   {/* Jagged top border using CSS radial gradients */}
                   <div className="absolute top-0 left-0 w-full h-[6px] bg-[#0A0A0A] translate-y-[-50%] mask-zigzag" style={{ maskImage: 'radial-gradient(circle at 50% 0, transparent 4px, black 5px)', maskSize: '12px 12px', maskRepeat: 'repeat-x' }} />
                   
                   <div className="px-5 space-y-4">
                      <div className="text-center pt-4 pb-2 border-b border-dashed border-white/20">
                        <div className="font-playfair text-lg text-white font-black italic mb-1 flex justify-center items-center gap-1">
                          <CheckCircle2 className="w-4 h-4 text-primary" /> RENTAL CAR
                        </div>
                        <p className="font-sans text-[9px] uppercase tracking-widest text-primary font-bold">{t('checkoutModal.paymentConfirmed')}</p>
                      </div>

                      <div className="space-y-1.5 border-b border-dashed border-white/20 pb-4 pt-2">
                        <div className="flex justify-between"><span>{t('checkoutModal.amount')}</span><span className="text-white font-bold text-[13px]">{formatMoney(totalAmount)}</span></div>
                        <div className="flex justify-between"><span>{t('checkoutModal.date')}</span><span>{currentDate}</span></div>
                        <div className="flex justify-between"><span>{t('checkoutModal.time')}</span><span>{currentTime}</span></div>
                        <div className="flex justify-between"><span>{t('checkoutModal.transaction')}</span><span className="text-white">#{paymentResult?.receipt_number || 'TXN-' + Math.floor(Math.random()*9999)}</span></div>
                        <div className="flex justify-between"><span>{t('checkoutModal.card')}</span><span>**** **** {paymentResult?.masked_pan?.slice(-4) || '****'}</span></div>
                      </div>

                      <div className="space-y-1.5 border-b border-dashed border-white/20 pb-4 pt-2">
                        <div className="flex justify-between"><span>{t('checkoutModal.bookingNum')}</span><span className="text-white">#{booking?.id ? `BKG-${booking.id}` : 'N/A'}</span></div>
                        <div className="flex justify-between"><span>{t('checkoutModal.car')}</span><span className="text-white truncate max-w-[120px]">{booking?.car_info?.brand} {booking?.car_info?.model}</span></div>
                        <div className="flex justify-between"><span>{t('checkoutModal.duration')}</span><span>{booking?.start_datetime ? new Date(booking?.start_datetime).toLocaleDateString('uz-UZ', {day:'2-digit', month:'2-digit'}) : ''} — {booking?.end_datetime ? new Date(booking?.end_datetime).toLocaleDateString('uz-UZ', {day:'2-digit', month:'2-digit'}) : ''}</span></div>
                        <div className="flex justify-between"><span>{t('checkoutModal.insurance')}</span><span className="text-primary font-bold">Premium</span></div>
                      </div>

                      <div className="space-y-1.5 pt-2 font-bold text-white/50">
                        <div className="flex justify-between"><span className="text-primary">{t('checkoutModal.loyalty')}</span><span className="text-primary">+{paymentResult?.loyalty_points_earned || Math.floor(totalAmount/10000)} ball</span></div>
                        <div className="flex justify-between text-[10px] items-center pt-2"><span>{t('checkoutModal.invoice')}</span><span className="tracking-tighter break-all ml-4 text-right">{paymentResult?.invoice_number || paymentResult?.invoice_id || 'INV-XXXX'}</span></div>
                      </div>
                   </div>

                   {/* Jagged bottom border */}
                   <div className="absolute bottom-0 left-0 w-full h-[6px] bg-[#0A0A0A] translate-y-[50%]" style={{ maskImage: 'radial-gradient(circle at 50% 100%, transparent 4px, black 5px)', maskSize: '12px 12px', maskRepeat: 'repeat-x' }} />
                </div>

                <div className="mt-8 space-y-3 relative z-10 w-full max-w-[320px] mx-auto">
                   <button onClick={handleGoProfile} className="w-full flex items-center justify-between px-6 py-4 rounded-xl bg-primary text-white font-black uppercase tracking-widest hover:bg-primary/90 transition-colors shadow-[0_0_20px_rgba(255,107,1,0.3)]">
                     <span>{t('checkoutModal.goBookings')}</span>
                     <ArrowRight className="w-4 h-4" />
                   </button>
                   
                   {paymentResult?.invoice_id && (
                     <button onClick={handleDownload} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-xs uppercase tracking-widest hover:bg-white/10 transition-colors">
                       <Download className="w-4 h-4" /> Invoysni yuklash
                     </button>
                   )}
                   
                   <button onClick={handleGoHome} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white/50 font-bold text-xs uppercase tracking-widest hover:text-white transition-colors">
                      <Home className="w-4 h-4" /> Bosh sahifaga qaytish
                   </button>
                </div>

              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Step5_Success;
