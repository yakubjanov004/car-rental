import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  CreditCard, ShieldCheck, CheckCircle2, ChevronRight, 
   Calendar, MapPin, QrCode, Lock, Zap, Clock, ArrowRight,
  Info, Sparkles, MessageSquare, Copy, Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatNarx } from '../utils/formatPrice';
import { kunlarFarqi } from '../utils/dateUtils';
import { fetchCarDetail, createBooking, validatePromoCode } from '../utils/api';
import { initiatePayment, verifyOtp, verifyPayment, fetchPaymentMethods } from '../services/api/payments';
import { fetchInsurancePlans, createBookingInsurance } from '../services/api/insurance';
import { calculateDynamicPrice } from '../services/api/pricing';
import { useAuth } from '../context/AuthContext';
import uzcardLogo from '../assets/icons/uzcard-logo.svg';
import humoLogo from '../assets/icons/humo-logo.svg';
import visaLogo from '../assets/icons/visa-logo.svg';
import mastercardLogo from '../assets/icons/mastercard-logo.svg';
import clickLogo from '../assets/icons/click-logo.svg';
import paymeLogo from '../assets/icons/payme-logo.svg';

const Checkout = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [randomOTP, setRandomOTP] = useState('');
  const [userInputOTP, setUserInputOTP] = useState('');
   const [countdown, setCountdown] = useState(900);
   const [paymentRef, setPaymentRef] = useState('');
   const [isProcessing, setIsProcessing] = useState(false);
   const [otpError, setOtpError] = useState('');
   const [isSMSModalOpen, setIsSMSModalOpen] = useState(false);
   const [transactionId, setTransactionId] = useState(null);
   const [pendingBookingId, setPendingBookingId] = useState(null);
   const [bookingCode, setBookingCode] = useState('');
   const [copied, setCopied] = useState(false); 
  const [cardData, setCardData] = useState({
    number: '',
    holder: '',
    expiry: '',
    cvv: ''
  });
   const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState({ type: 'percentage', value: 0, code: '' });
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoError, setPromoError] = useState('');
   const [insurancePlans, setInsurancePlans] = useState([]);
   const [selectedInsuranceId, setSelectedInsuranceId] = useState(null);
   const [pricingQuote, setPricingQuote] = useState(null);
   const [savedMethods, setSavedMethods] = useState([]);
   const [useSavedCard, setUseSavedCard] = useState(false);
   const [selectedMethodId, setSelectedMethodId] = useState(null);
   const [qrSeed, setQrSeed] = useState(0);
   const [checkoutUrl, setCheckoutUrl] = useState('');
   const [bookingError, setBookingError] = useState('');

  const bookingMeta = location.state || {
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 86400000).toISOString().split('T')[0]
  };

  useEffect(() => {
    const loadCar = async () => {
         const [carData, insuranceData, paymentMethods] = await Promise.all([
            fetchCarDetail(id),
            fetchInsurancePlans().catch(() => []),
            fetchPaymentMethods().catch(() => []),
         ]);

         if (carData) setCar(carData);
         if (Array.isArray(insuranceData)) {
            setInsurancePlans(insuranceData.filter((plan) => plan.is_active !== false));
         }
         if (Array.isArray(paymentMethods)) {
            setSavedMethods(paymentMethods);
            const defaultMethod = paymentMethods.find((method) => method.is_default) || paymentMethods[0];
            if (defaultMethod) {
              setSelectedMethodId(defaultMethod.id);
              setUseSavedCard(true);
            }
         }
      setLoading(false);
    };
    loadCar();
    window.scrollTo(0, 0);
  }, [id]);

   useEffect(() => {
      const loadPricing = async () => {
         if (!id || !bookingMeta.startDate || !bookingMeta.endDate) return;
         try {
            const quote = await calculateDynamicPrice({
               carId: id,
               startDate: bookingMeta.startDate,
               endDate: bookingMeta.endDate,
            });
            setPricingQuote(quote);
         } catch {
            setPricingQuote(null);
         }
      };

      loadPricing();
   }, [id, bookingMeta.startDate, bookingMeta.endDate]);

  const days = kunlarFarqi(bookingMeta.startDate, bookingMeta.endDate);
   const dailyPrice = Number(pricingQuote?.final_daily || car?.dynamic_price || car?.daily_price || 0);
  const deposit = car?.deposit || 0;
  const serviceFee = 50000;
   const selectedInsurance = insurancePlans.find((plan) => plan.id === selectedInsuranceId) || null;
   const insuranceCost = Number(selectedInsurance?.daily_price || 0) * days;

   const subtotal = (dailyPrice * days) + deposit + serviceFee + insuranceCost;
  let discountAmount = 0;
  if (discount.value > 0) {
    if (discount.type === 'percentage') {
      discountAmount = (subtotal * discount.value) / 100;
    } else {
      discountAmount = discount.value;
    }
  }
  const totalAmount = subtotal - discountAmount;

   const isQrMethod = ['payme', 'click', 'uzum'].includes(paymentMethod);

   useEffect(() => {
      if (!isQrMethod || step !== 4 || countdown <= 0) return undefined;
      const timer = setInterval(() => {
         setCountdown((current) => {
            if (current <= 1) return 0;
            return current - 1;
         });
      }, 1000);
      return () => clearInterval(timer);
   }, [countdown, isQrMethod, step]);

   const formatCountdown = (secs) => {
      const minutes = Math.floor(secs / 60)
         .toString()
         .padStart(2, '0');
      const seconds = (secs % 60).toString().padStart(2, '0');
      return `${minutes}:${seconds}`;
   };

   const detectCardType = (rawNumber) => {
      const number = (rawNumber || '').replace(/\D/g, '');
      if (number.startsWith('8600')) return 'UZCARD';
      if (number.startsWith('9860')) return 'HUMO';
      if (number.startsWith('4')) return 'VISA';
      if (number.startsWith('5')) return 'MASTERCARD';
      return '';
   };

   const formatCardNumber = (value) => {
      const clean = value.replace(/\D/g, '').slice(0, 16);
      return clean.replace(/(.{4})/g, '$1 ').trim();
   };

   const generateFakeQR = (seed, color = '#111111') => {
      const rand = (n) => {
         const x = Math.sin(seed + n) * 10000;
         return x - Math.floor(x);
      };

      const size = 21;
      const isCorner = (r, c) =>
         (r < 7 && c < 7) || (r < 7 && c >= size - 7) || (r >= size - 7 && c < 7);

      const cellSize = 128 / size;
      const blocks = [];

      for (let r = 0; r < size; r += 1) {
         for (let c = 0; c < size; c += 1) {
            const filled = isCorner(r, c)
               ? r === 0 || r === 6 || c === 0 || c === 6 || (r >= 2 && r <= 4 && c >= 2 && c <= 4)
               : rand(r * size + c) > 0.5;

            if (filled) {
               blocks.push(
                  `<rect x="${c * cellSize}" y="${r * cellSize}" width="${cellSize}" height="${cellSize}" fill="${color}"/>`
               );
            }
         }
      }

      return `<svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg"><rect width="128" height="128" fill="white"/>${blocks.join(
         ''
      )}</svg>`;
   };

  const handleApplyPromo = async () => {
    if (!promoCode) return;
    setPromoLoading(true);
    setPromoError('');
    try {
      const data = await validatePromoCode(promoCode);
      if (data.valid) {
        setDiscount({ type: data.discount_type, value: data.discount_value, code: data.code });
      }
    } catch (err) {
      setPromoError("Promo kod xato yoki muddati o'tgan");
    } finally {
      setPromoLoading(false);
    }
  };

   const nextStep = async () => {
      if (step === 1) {
         if (!user?.kyc || user.kyc.status !== 'approved') {
            alert(t('checkout.kycError'));
            navigate('/profile');
            return;
         }
      }

      if (step === 2) {
         if (!paymentMethod) return;

         setIsProcessing(true);
         setBookingError('');
         try {
            const startDt = bookingMeta.startDate.includes('T')
               ? bookingMeta.startDate
               : bookingMeta.startDate + 'T10:00:00';
            const endDt = bookingMeta.endDate.includes('T')
               ? bookingMeta.endDate
               : bookingMeta.endDate + 'T10:00:00';

            const booking = await createBooking({
               car: car.id,
               start_datetime: startDt,
               end_datetime: endDt,
               full_name: cardData.holder || (user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : '') || t('checkout.guest'),
               phone_number: user?.phone_number || '998901234567',
            });

            if (booking.booking_code) {
               setBookingCode(booking.booking_code);
            }

            if (selectedInsuranceId) {
              await createBookingInsurance({
                bookingId: booking.id,
                planId: selectedInsuranceId,
                expiresAt: bookingMeta.endDate,
              });
            }

            setPendingBookingId(booking.id);

            const providerMap = {
              card: 'mock',
              payme: 'payme',
              click: 'click',
              uzum: 'mock',
            };

            const initPayload = {
              booking_id: booking.id,
              provider: providerMap[paymentMethod] || 'mock',
              method: paymentMethod === 'card' ? 'card' : 'card',
            };

            if (paymentMethod === 'card') {
              if (useSavedCard && selectedMethodId) {
                initPayload.payment_method_id = selectedMethodId;
              } else {
                initPayload.card_number = cardData.number;
              }
            }

            const initResult = await initiatePayment(initPayload);
            setTransactionId(initResult.transaction_id);
            setPaymentRef(initResult.payment_ref || initResult.payment_code || '');
            setRandomOTP(initResult._dev_otp || '');
            setOtpError('');

            if (initResult.checkout_url) {
              setCheckoutUrl(initResult.checkout_url);
            }

            if (paymentMethod === 'card') {
              setIsSMSModalOpen(Boolean(initResult._dev_otp));
              setStep(3);
            } else {
              setCountdown(Number(initResult.expires_in || 900));
              setQrSeed((Date.now() + booking.id) % 100000);
              setStep(4);
            }
         } catch (err) {
            let errMsg = t('checkout.payError');
            const data = err?.response?.data;
            if (data) {
              if (data.message && typeof data.message === 'string' && data.message !== 'Xatolik yuz berdi') {
                errMsg = data.message;
              } else if (data.errors) {
                const errors = data.errors;
                if (Array.isArray(errors.non_field_errors)) {
                  errMsg = errors.non_field_errors[0];
                } else if (errors.error) {
                  errMsg = errors.error;
                } else if (typeof errors === 'object') {
                  const firstKey = Object.keys(errors)[0];
                  if (firstKey) {
                    const val = errors[firstKey];
                    errMsg = Array.isArray(val) ? val[0] : val;
                  }
                }
              } else if (typeof data === 'string') {
                errMsg = data;
              } else if (data.error) {
                errMsg = data.error;
              }
            }
            setBookingError(errMsg);
         } finally {
            setIsProcessing(false);
         }
         return;
      }

      if (step === 3 && paymentMethod === 'card') {
         if ((userInputOTP || '').length !== 6) {
            setOtpError(t('checkout.enter6Digit'));
            return;
         }

         setIsProcessing(true);
         setOtpError('');
         try {
            await verifyOtp({
               transaction_id: transactionId,
               otp_code: userInputOTP,
            });
            setIsSMSModalOpen(false);
            setStep(4);
         } catch (err) {
            setOtpError(err?.response?.data?.error || t('checkout.otpError'));
         } finally {
            setIsProcessing(false);
         }
         return;
      }

      setStep(step + 1);
   };

  const handleBookingConfirm = async () => {
    if (!transactionId) {
      setStep(5);
      return;
    }

    if (paymentMethod === 'card') {
      // Card already verified on step 3.
      setStep(5);
      return;
    }

    setIsProcessing(true);
    try {
      const verifyResult = await verifyPayment({
        transaction_id: transactionId,
        payment_type: paymentMethod,
      });

      if (verifyResult?.status === 'success') {
        setStep(5);
      }
    } catch (err) {
      alert(err?.response?.data?.error || "To'lovni tasdiqlashda xatolik");
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center"><div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="bg-[#0A0A0A] min-h-screen pt-32 pb-40 relative overflow-hidden">
      {/* Background Decorative Blur */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/5 blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-12 gap-12 relative">
        
        {/* Left Side: Step Content */}
        <div className="lg:col-span-8 space-y-10">
          
          {/* Header & Progress */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-white/40 mb-4">
              <Link to="/fleet" className="hover:text-white transition-colors text-xs font-black tracking-widest uppercase">Katalog</Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-white text-xs font-black tracking-widest uppercase italic">Checkout</span>
            </div>
            
            <h1 className="font-display text-5xl md:text-6xl font-extrabold tracking-tighter">
              {t('checkout.title1')} <span className="text-white/30 italic">{t('checkout.title2')}</span>
            </h1>

            <div className="flex gap-2 max-w-md pt-4">
               {[1, 2, 3, 4, 5].map(s => (
                 <div key={s} className="relative h-1.5 flex-1 rounded-full bg-white/5 overflow-hidden">
                    {step >= s && <motion.div layoutId="stepBar" className="absolute inset-0 bg-primary" />}
                 </div>
               ))}
            </div>
          </div>

          <AnimatePresence mode="wait">
             {step === 1 && (
               <motion.div 
                 key="step1" 
                 initial={{ opacity: 0, x: 20 }} 
                 animate={{ opacity: 1, x: 0 }} 
                 exit={{ opacity: 0, x: -20 }}
                 className="space-y-8"
               >
                 <div className="glass p-10 border-white/10 rounded-[48px] relative overflow-hidden bg-white/[0.02]">
                    <div className="flex flex-col md:flex-row gap-10">
                       <div className="w-full md:w-64 aspect-[16/10] rounded-3xl overflow-hidden border border-white/5" style={{ background: 'linear-gradient(180deg, #1a1a1a 0%, #0a0a0a 100%)' }}>
                          <img src={car.media?.booking_cover || car.media?.card_main || car.main_image} className="w-full h-full object-contain" alt="" />
                       </div>
                       <div className="flex-1 space-y-4">
                          <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase">{car.brand} {car.model}</h2>
                          <div className="flex items-center gap-4 text-white/40 text-xs font-bold">
                             <div className="flex items-center gap-2"><Calendar className="w-3.5 h-3.5" /> <span>{days} kun</span></div>
                             <div className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5" /> <span>{t('checkout.location')}</span></div>
                          </div>
                          <div className="pt-6 grid grid-cols-2 gap-4">
                             <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                                <p className="text-[10px] text-white/20 uppercase font-bold tracking-widest mb-1">{t('checkout.pickup')}</p>
                                <p className="text-sm font-bold text-white">{bookingMeta.startDate}</p>
                             </div>
                             <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                                <p className="text-[10px] text-white/20 uppercase font-bold tracking-widest mb-1">{t('checkout.return')}</p>
                                <p className="text-sm font-bold text-white">{bookingMeta.endDate}</p>
                             </div>
                          </div>
                       </div>
                    </div>
                 </div>
                 <div className="flex justify-end">
                    <button onClick={nextStep} className="btn-primary py-5 px-12 rounded-2xl flex items-center gap-3 text-[11px] font-black tracking-widest uppercase">{t('checkout.nextToPay')} <ArrowRight className="w-4 h-4" /></button>
                 </div>
               </motion.div>
             )}

             {step === 2 && (
               <motion.div 
                 key="step2" 
                 initial={{ opacity: 0, x: 20 }} 
                 animate={{ opacity: 1, x: 0 }} 
                 className="space-y-8"
               >
                 <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter mb-8">{t('checkout.payTypeTitle')}</h2>
                 
                 <div className="grid grid-cols-2 gap-6">
                    <button 
                       onClick={() => setPaymentMethod('card')}
                       className={`glass p-10 flex flex-col items-start gap-6 transition-all rounded-[32px] border-2 group ${paymentMethod === 'card' ? 'border-primary ring-4 ring-primary/20 bg-primary/5' : 'border-white/5 hover:border-white/20'}`}
                    >
                       <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${paymentMethod === 'card' ? 'bg-primary text-white' : 'bg-white/5 text-white/30 group-hover:bg-primary/20 group-hover:text-primary'}`}>
                          <CreditCard className="w-6 h-6" />
                       </div>
                       <div>
                          <h3 className="text-xl font-black text-white uppercase italic">{t('checkout.cardTitle')}</h3>
                          <p className="text-xs text-white/30 mt-1">{t('checkout.cardSub')}</p>
                       </div>
                    </button>

                    <button 
                       onClick={() => setPaymentMethod('payme')}
                       className={`glass p-10 flex flex-col items-start gap-6 transition-all rounded-[32px] border-2 group ${paymentMethod === 'payme' ? 'border-[#00ADEF] ring-4 ring-[#00ADEF]/20 bg-[#00ADEF]/5' : 'border-white/5 hover:border-[#00ADEF]/30'}`}
                    >
                       <div className="w-10 h-10 rounded-xl bg-[#00ADEF] flex items-center justify-center shadow-lg shadow-[#00ADEF]/30">
                          <span className="text-white font-black text-lg">P</span>
                       </div>
                       <div>
                          <h3 className="text-xl font-black text-white uppercase italic">{t('checkout.paymeTitle')}</h3>
                          <p className="text-xs text-white/30 mt-1">{t('checkout.paymeSub')}</p>
                       </div>
                    </button>

                    <button 
                       onClick={() => setPaymentMethod('click')}
                       className={`glass p-10 flex flex-col items-start gap-6 transition-all rounded-[32px] border-2 group ${paymentMethod === 'click' ? 'border-[#FF6B00] ring-4 ring-[#FF6B00]/20 bg-[#FF6B00]/5' : 'border-white/5 hover:border-[#FF6B00]/30'}`}
                    >
                       <div className="w-10 h-10 rounded-xl bg-[#FF6B00] flex items-center justify-center shadow-lg shadow-[#FF6B00]/30">
                          <span className="text-white font-black text-sm">C</span>
                       </div>
                       <div>
                          <h3 className="text-xl font-black text-white uppercase italic">{t('checkout.clickTitle')}</h3>
                          <p className="text-xs text-white/30 mt-1">{t('checkout.clickSub')}</p>
                       </div>
                    </button>

                    <button 
                       onClick={() => setPaymentMethod('uzum')}
                       className={`glass p-10 flex flex-col items-start gap-6 transition-all rounded-[32px] border-2 group ${paymentMethod === 'uzum' ? 'border-[#8B5CF6] ring-4 ring-[#8B5CF6]/20 bg-[#8B5CF6]/5' : 'border-white/5 hover:border-[#8B5CF6]/30'}`}
                    >
                       <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#8B5CF6] to-[#6D28D9] flex items-center justify-center shadow-lg shadow-[#8B5CF6]/30">
                          <span className="text-white font-black text-sm">U</span>
                       </div>
                       <div>
                          <h3 className="text-xl font-black text-white uppercase italic">{t('checkout.uzumTitle')}</h3>
                          <p className="text-xs text-white/30 mt-1">{t('checkout.uzumSub')}</p>
                       </div>
                    </button>
                 </div>

                 {isQrMethod && (
                   <motion.div
                     initial={{ opacity: 0, y: 20 }}
                     animate={{ opacity: 1, y: 0 }}
                     className="mt-6 glass border-white/5 rounded-[40px] p-10 flex flex-col items-center gap-6"
                   >
                     <div className={`p-4 rounded-2xl border-4 bg-white ${
                       paymentMethod === 'payme' ? 'border-[#00ADEF]' :
                       paymentMethod === 'click' ? 'border-[#FF6B00]' : 'border-[#8B5CF6]'
                     }`}>
                       <div
                         dangerouslySetInnerHTML={{
                           __html: generateFakeQR(
                             qrSeed || Date.now() % 10000,
                             paymentMethod === 'payme'
                               ? '#00ADEF'
                               : paymentMethod === 'click'
                               ? '#FF6B00'
                               : '#8B5CF6'
                           ),
                         }}
                         className="w-36 h-36"
                       />
                     </div>

                     <div className="text-center space-y-2">
                       <p className="text-white font-black text-2xl">{formatNarx(totalAmount)}</p>
                       <p className="text-white/30 text-xs font-bold uppercase tracking-widest">
                         {t('checkout.payId')} {paymentRef || 'RL-' + Math.random().toString(36).slice(2, 8).toUpperCase()}
                       </p>
                     </div>

                     <div className="text-center space-y-1">
                       <p className="text-white/50 text-sm">
                         {paymentMethod === 'payme'
                           ? t('checkout.paymeStep1')
                           : paymentMethod === 'click'
                           ? t('checkout.clickStep1')
                           : t('checkout.uzumStep1')}
                       </p>
                       <p className="text-white/50 text-sm">{t('checkout.step2')}</p>
                       <p className="text-white/50 text-sm">{t('checkout.step3')}</p>
                     </div>
                   </motion.div>
                 )}

                 {paymentMethod === 'card' && (
                    <motion.div 
                       initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                       className="glass p-10 border-white/5 rounded-[40px] space-y-6 mt-6"
                    >
                                  {savedMethods.length > 0 && (
                                     <div className="flex gap-2 p-1 bg-white/5 rounded-2xl mb-4">
                                        <button
                                           type="button"
                                           onClick={() => setUseSavedCard(true)}
                                           className={`flex-1 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${useSavedCard ? 'bg-primary text-white' : 'text-white/40'}`}
                                        >
                                           Saqlangan karta
                                        </button>
                                        <button
                                           type="button"
                                           onClick={() => setUseSavedCard(false)}
                                           className={`flex-1 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${!useSavedCard ? 'bg-primary text-white' : 'text-white/40'}`}
                                        >
                                           Yangi karta
                                        </button>
                                     </div>
                                  )}

                                  {useSavedCard && savedMethods.length > 0 ? (
                                     <div className="grid md:grid-cols-2 gap-4">
                                        {savedMethods.map((method) => (
                                           <button
                                              key={method.id}
                                              type="button"
                                              onClick={() => setSelectedMethodId(method.id)}
                                              className={`p-5 rounded-2xl border text-left transition-all ${selectedMethodId === method.id ? 'border-primary bg-primary/10' : 'border-white/10 hover:border-white/30'}`}
                                           >
                                              <p className="text-sm font-black text-white uppercase">{method.card_type}</p>
                                              <p className="text-[10px] text-white/40 mt-2 uppercase tracking-widest">{method.masked_pan}</p>
                                              <p className="text-[10px] text-white/40 mt-1 uppercase tracking-widest">{method.expiry_month}/{method.expiry_year}</p>
                                           </button>
                                        ))}
                                     </div>
                                  ) : (
                                     <div className="grid md:grid-cols-2 gap-6">
                                       {detectCardType(cardData.number) && (
                                          <div className="md:col-span-2">
                                             <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-black tracking-widest ${
                                                detectCardType(cardData.number) === 'UZCARD'
                                                   ? 'bg-green-500/15 text-green-400 border border-green-500/30'
                                                   : detectCardType(cardData.number) === 'HUMO'
                                                   ? 'bg-orange-500/15 text-orange-400 border border-orange-500/30'
                                                   : detectCardType(cardData.number) === 'VISA'
                                                   ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                                                   : 'bg-red-500/15 text-red-400 border border-red-500/30'
                                             }`}>
                                                {detectCardType(cardData.number)}
                                             </span>
                                          </div>
                                       )}
                          <div className="space-y-2">
                             <label className="text-[10px] text-white/20 uppercase font-black tracking-widest ml-1">{t('checkout.cardNumber')}</label>
                                           <input
                                              type="text"
                                              placeholder="8600 **** **** ****"
                                              className="w-full bg-[#111] border border-white/5 rounded-2xl p-5 text-sm outline-none focus:border-primary/50"
                                              value={cardData.number}
                                              onChange={e => setCardData({...cardData, number: formatCardNumber(e.target.value)})}
                                              maxLength={19}
                                           />
                          </div>
                          <div className="space-y-2">
                             <label className="text-[10px] text-white/20 uppercase font-black tracking-widest ml-1">{t('checkout.cardHolder')}</label>
                             <input type="text" placeholder="NAME SURNAME" className="w-full bg-[#111] border border-white/5 rounded-2xl p-5 text-sm outline-none focus:border-primary/50 uppercase" value={cardData.holder} onChange={e => setCardData({...cardData, holder: e.target.value})} />
                          </div>
                          <div className="space-y-2">
                              <label className="text-[10px] text-white/20 uppercase font-black tracking-widest ml-1">{t('checkout.expiryDate')}</label>
                              <input type="text" placeholder="MM/YY" className="w-full bg-[#111] border border-white/5 rounded-2xl p-5 text-sm outline-none focus:border-primary/50" value={cardData.expiry} onChange={e => setCardData({...cardData, expiry: e.target.value})} maxLength={5} />
                          </div>
                          <div className="space-y-2">
                              <label className="text-[10px] text-white/20 uppercase font-black tracking-widest ml-1">{t('checkout.cvv')}</label>
                              <input type="password" placeholder="***" className="w-full bg-[#111] border border-white/5 rounded-2xl p-5 text-sm outline-none focus:border-primary/50" value={cardData.cvv} onChange={e => setCardData({...cardData, cvv: e.target.value})} maxLength={3} />
                          </div>
                       </div>
                       )}
                       <div className="flex items-center gap-3 p-4 rounded-xl bg-primary/5 border border-primary/10 text-[9px] font-bold text-primary uppercase tracking-widest">
                          <ShieldCheck className="w-4 h-4" /> 
                          {t('checkout.secureText')}
                       </div>
                    </motion.div>
                 )}

                         <div className="glass p-10 border-white/5 rounded-[40px] space-y-6 mt-6">
                              <div className="flex items-center justify-between">
                                 <h4 className="text-lg font-black text-white uppercase italic tracking-tighter">{t('checkout.insuranceTitle')}</h4>
                                 <span className="text-[10px] text-white/30 font-black uppercase tracking-widest">{t('checkout.optional')}</span>
                              </div>
                              <div className="grid md:grid-cols-2 gap-4">
                                 <button
                                    type="button"
                                    onClick={() => setSelectedInsuranceId(null)}
                                    className={`p-5 rounded-2xl border text-left transition-all ${selectedInsuranceId === null ? 'border-primary bg-primary/10' : 'border-white/10 hover:border-white/30'}`}
                                 >
                                    <p className="text-sm font-black text-white uppercase">{t('checkout.noInsurance')}</p>
                                    <p className="text-[10px] text-white/40 mt-2 uppercase tracking-widest">{t('checkout.onlyDeposit')}</p>
                                 </button>
                                 {insurancePlans.map((plan) => (
                                    <button
                                       key={plan.id}
                                       type="button"
                                       onClick={() => setSelectedInsuranceId(plan.id)}
                                       className={`p-5 rounded-2xl border text-left transition-all ${selectedInsuranceId === plan.id ? 'border-primary bg-primary/10' : 'border-white/10 hover:border-white/30'}`}
                                    >
                                       <p className="text-sm font-black text-white uppercase">{plan.name}</p>
                                       <p className="text-[10px] text-white/40 mt-2 uppercase tracking-widest">{formatNarx(plan.daily_price)} / kun</p>
                                    </button>
                                 ))}
                              </div>
                         </div>


                 {bookingError && (
                    <div className="mt-6 p-5 rounded-2xl bg-red-500/10 border border-red-500/20 text-center">
                       <p className="text-red-400 text-sm font-bold">{bookingError}</p>
                    </div>
                 )}

                 <div className="flex justify-between items-center mt-12">
                    <button onClick={() => { setStep(1); setBookingError(''); }} className="text-white/40 hover:text-white transition-colors text-xs font-black uppercase tracking-widest">{t('checkout.back')}</button>
                    <button 
                       disabled={
                         !paymentMethod ||
                         isProcessing ||
                         (paymentMethod === 'card' && !savedMethods.length && (!cardData.number || !cardData.holder))
                       }
                       onClick={nextStep} 
                       className={`btn-primary py-5 px-12 rounded-2xl flex items-center gap-3 text-[11px] font-black tracking-widest uppercase ${(
                         !paymentMethod ||
                         isProcessing ||
                         (paymentMethod === 'card' && !savedMethods.length && (!cardData.number || !cardData.holder))
                       ) ? 'opacity-30 cursor-not-allowed' : ''}`}
                    >
                      {isProcessing ? t('checkout.loading') : paymentMethod === 'card' ? t('checkout.getOtp') : t('checkout.prepQr')}
                      <ArrowRight className="w-4 h-4" />
                    </button>
                 </div>
               </motion.div>
             )}

             {step === 3 && (
               <motion.div 
                 key="step3" 
                 initial={{ opacity: 0, x: 20 }} 
                 animate={{ opacity: 1, x: 0 }} 
                 className="flex flex-col items-center justify-center text-center py-20 bg-[#111] border border-white/5 rounded-[64px] shadow-2xl relative"
               >
                 <div className="absolute top-10 flex flex-col items-center gap-2">
                    <div className="flex gap-2">
                       <img src={uzcardLogo} alt="UZCARD" className="h-6" />
                       <img src={humoLogo} alt="HUMO" className="h-6" />
                    </div>
                 </div>

                 <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-10 border border-primary/20">
                    <Lock className="w-8 h-8 text-primary" />
                 </div>
                 
                 <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter mb-4">{t('checkout.codeConfirm')}</h3>
                 <p className="text-xs text-white/30 max-w-xs mb-10">{t('checkout.otpDesc')}</p>
                 
                 <div className="bg-white/5 border border-white/10 rounded-3xl p-6 mb-10">
                    <span className="text-[10px] text-white/20 uppercase font-black block mb-3">{t('checkout.simulation')}</span>
                    <span className="text-4xl font-display font-black text-primary tracking-[0.4em] blur-[1px] hover:blur-none transition-all">{randomOTP}</span>
                 </div>

                 <input 
                    type="text" 
                    placeholder="_ _ _ _ _ _" 
                    className="w-48 bg-[#0A0A0A] border-2 border-white/10 rounded-[32px] p-6 text-center text-2xl font-black text-white outline-none focus:border-primary tracking-[0.5em]"
                    value={userInputOTP}
                    onChange={e => {
                      setUserInputOTP(e.target.value.replace(/\D/g, ''));
                      setOtpError('');
                    }}
                    maxLength={6}
                 />

                 {otpError && <p className="mt-4 text-xs font-bold text-red-500">{otpError}</p>}

                 <div className="flex gap-4 mt-20">
                    <button onClick={() => setStep(2)} className="px-8 py-4 glass rounded-xl text-[10px] font-black uppercase text-white/40">{t('checkout.back')}</button>
                    <button disabled={isProcessing} onClick={nextStep} className="px-12 py-4 btn-primary rounded-xl text-[10px] font-black uppercase shadow-lg shadow-primary/20 disabled:opacity-50">{isProcessing ? t('checkout.loading2') : 'TASDIQLASH'}</button>
                 </div>
               </motion.div>
             )}

             {step === 4 && (
               <motion.div 
                 key="step4" 
                 initial={{ opacity: 0, x: 20 }} 
                 animate={{ opacity: 1, x: 0 }} 
                 className="space-y-10"
               >
                  <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter border-l-4 border-primary pl-6">{t('checkout.finalSummary')}</h2>
                  
                  <div className="glass p-10 border-white/5 rounded-[48px] space-y-8 bg-white/[0.02]">
                     <div className="grid md:grid-cols-2 gap-10">
                        <div className="space-y-4">
                           <p className="text-[10px] text-white/20 uppercase font-black tracking-widest italic">{t('checkout.payInfo')}</p>
                           <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5">
                              <CreditCard className="w-5 h-5 text-primary" />
                              <div>
                                 <p className="text-sm font-bold text-white uppercase tracking-widest">
                                   {paymentMethod === 'card'
                                     ? (useSavedCard
                                        ? `CARD: ${savedMethods.find((m) => m.id === selectedMethodId)?.masked_pan || 'Saved card'}`
                                        : `CARD: **** ${cardData.number.slice(-4)}`)
                                                       : `${paymentMethod.toUpperCase()} QR PAYMENT`}
                                 </p>
                                 <p className="text-[10px] text-white/30 uppercase font-black">{paymentMethod === 'card' && useSavedCard ? (savedMethods.find((m) => m.id === selectedMethodId)?.card_holder || 'Saved card') : (cardData.holder || t('checkout.guest'))}</p>
                              </div>
                           </div>
                        </div>
                        <div className="space-y-4">
                           <p className="text-[10px] text-white/20 uppercase font-black tracking-widest italic">{t('checkout.sumConfirm')}</p>
                           <h4 className="text-4xl font-black text-primary italic tracking-tighter">{formatNarx(totalAmount)}</h4>
                        </div>
                     </div>

                     <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row gap-6 items-center italic">
                        <div className="flex items-center gap-3 text-white/40 text-xs font-medium">
                           <ShieldCheck className="w-5 h-5 text-green-500" />
                           {t('checkout.datesConfirmed')}
                        </div>
                        <div className="flex items-center gap-3 text-white/40 text-xs font-medium lg:ml-auto">
                           <Clock className="w-5 h-5 text-orange-500" />
                           {t('checkout.support')}
                        </div>
                     </div>
                  </div>

                           {isQrMethod && (
                              <div className="glass p-10 border-white/5 rounded-[48px] space-y-6 bg-white/[0.02]">
                                 <div className="flex flex-col items-center gap-6">
                                    <div className={`p-4 rounded-2xl border-4 bg-white ${
                                       paymentMethod === 'payme' ? 'border-[#00ADEF]' :
                                       paymentMethod === 'click' ? 'border-[#FF6B00]' : 'border-[#8B5CF6]'
                                    }`}>
                                       <div
                                          dangerouslySetInnerHTML={{
                                             __html: generateFakeQR(
                                                qrSeed,
                                                paymentMethod === 'payme'
                                                   ? '#00ADEF'
                                                   : paymentMethod === 'click'
                                                   ? '#FF6B00'
                                                   : '#8B5CF6'
                                             ),
                                          }}
                                          className="w-36 h-36"
                                       />
                                    </div>

                                    <div className="text-center space-y-2">
                                       <p className="text-sm text-white/40 uppercase tracking-widest font-black">{t('checkout.payId')} {paymentRef || '-'}</p>
                                       <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-black ${
                                          countdown < 60 ? 'border-red-500/30 text-red-500 bg-red-500/10' : 'border-white/10 text-white/60'
                                       }`}>
                                          <Clock className="w-4 h-4" />
                                          {countdown > 0 ? formatCountdown(countdown) : t('checkout.qrExpired')}
                                       </div>
                                    </div>

                                    <div className="flex w-full gap-3">
                                       <button
                                          type="button"
                                          onClick={() => {
                                             setCountdown(900);
                                             setQrSeed((Date.now() + (pendingBookingId || 0)) % 100000);
                                          }}
                                          className="flex-1 py-3 rounded-xl border border-white/15 text-xs font-black uppercase tracking-widest text-white/70"
                                       >
                                          Yangilash
                                       </button>
                                       <button
                                          type="button"
                                          onClick={() => {
                                             setPaymentMethod('card');
                                             setStep(2);
                                          }}
                                          className="flex-1 py-3 rounded-xl border border-white/15 text-xs font-black uppercase tracking-widest text-white/70"
                                       >
                                          Boshqa usul
                                       </button>
                                    </div>
                                 </div>
                              </div>
                           )}

                           <button disabled={isProcessing || (isQrMethod && countdown === 0)} onClick={handleBookingConfirm} className="w-full btn-primary py-6 rounded-[32px] text-base font-black italic tracking-tighter flex items-center justify-center gap-4 shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50">
                               {isProcessing ? t('checkout.loading2') : isQrMethod ? "TO'LOV TASDIQLASH" : 'YAKUNLASH'} <ArrowRight className="w-5 h-5" />
                  </button>
               </motion.div>
             )}

             {step === 5 && (
               <motion.div 
                 key="step5" 
                 initial={{ opacity: 0, scale: 0.9 }} 
                 animate={{ opacity: 1, scale: 1 }} 
                 className="flex flex-col items-center justify-center text-center py-32 bg-white/[0.02] border border-white/5 rounded-[64px] shadow-2xl relative overflow-hidden"
               >
                  <div className="absolute top-0 right-0 w-96 h-96 bg-green-500/10 blur-[100px] pointer-events-none" />
                  <div className="w-32 h-32 bg-green-500/10 rounded-full flex items-center justify-center mb-10 border border-green-500/20 shadow-lg shadow-green-500/10">
                     <CheckCircle2 className="w-14 h-14 text-green-500" />
                  </div>
                  <h3 className="text-5xl font-black text-white italic uppercase tracking-tighter mb-4">TO'LOV <span className="text-green-500">MUVAFFAQIYATLI!</span></h3>
                  
                  {bookingCode && (
                    <motion.div 
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      className="mb-8 p-6 bg-white/5 border border-white/10 rounded-3xl flex flex-col items-center gap-3"
                    >
                      <p className="text-[10px] text-white/20 uppercase font-black tracking-[0.2em]">Sizning Broningiz Kodi</p>
                      <div className="flex items-center gap-4">
                        <span className="text-4xl font-display font-black text-primary tracking-widest italic">{bookingCode}</span>
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(bookingCode);
                            setCopied(true);
                            setTimeout(() => setCopied(false), 2000);
                          }}
                          className={`p-3 rounded-xl transition-all ${copied ? 'bg-green-500 text-white' : 'bg-white/10 hover:bg-white/20 text-white'}`}
                        >
                          {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                        </button>
                      </div>
                      <p className="text-[9px] text-white/40 font-bold uppercase italic">Ushbu kodni saqlab qo'ying, u loyiha referensi hisoblanadi.</p>
                    </motion.div>
                  )}

                  <p className="text-sm text-white/40 max-w-sm font-medium mb-16 leading-relaxed">
                     Sizning broningiz muvaffaqiyatli rasmiylashtirildi. Tez orada Adminlarimiz siz bilan bog'lanishadi.
                  </p>
                  
                  <div className="flex gap-4">
                     <button onClick={() => navigate('/profile')} className="px-12 py-5 btn-primary rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary/20">{t('checkout.goToProfile')}</button>
                     <button onClick={() => navigate('/')} className="px-12 py-5 glass rounded-2xl text-[10px] font-black uppercase tracking-widest border-white/10">BOSH SAHIFA</button>
                  </div>
               </motion.div>
             )}
          </AnimatePresence>
        </div>

        {/* Right Side: Order Summary Sticky */}
        <div className="lg:col-span-4">
          <div className="sticky top-40 space-y-10">
             <div className="glass p-10 border-white/5 rounded-[48px] relative overflow-hidden bg-white/[0.01]">
                <div className="absolute top-0 right-0 p-8">
                   <Info className="w-5 h-5 text-white/20" />
                </div>
                <h3 className="text-xl font-black text-white italic uppercase tracking-tighter mb-10 border-b border-white/5 pb-6">Hisob <span className="text-white/20">Xulosasi</span></h3>
                
                <div className="space-y-6">
                   <div className="flex justify-between items-center text-[11px] font-bold text-white/40 uppercase tracking-widest">
                      <span>Ijara ({days} kun)</span>
                      <span className="text-white">{formatNarx(dailyPrice * days)}</span>
                   </div>
                   <div className="flex justify-between items-center text-[11px] font-bold text-white/40 uppercase tracking-widest">
                      <span>Depozit (Humo/Uzcard)</span>
                      <span className="text-white">{formatNarx(deposit)}</span>
                   </div>
                   <div className="flex justify-between items-center text-[11px] font-bold text-white/40 uppercase tracking-widest">
                      <span>Xizmat haqi</span>
                      <span className="text-white">{formatNarx(serviceFee)}</span>
                   </div>
                   {selectedInsurance && (
                     <div className="flex justify-between items-center text-[11px] font-bold text-white/40 uppercase tracking-widest">
                        <span>Sug'urta ({selectedInsurance.name})</span>
                        <span className="text-white">{formatNarx(insuranceCost)}</span>
                     </div>
                   )}
                   
                   {discount.value > 0 && (
                     <motion.div initial={{opacity:0, height:0}} animate={{opacity:1, height:'auto'}} className="flex justify-between items-center text-[11px] font-bold text-green-500 uppercase tracking-widest">
                        <span>Chegirma ({discount.code})</span>
                        <span>-{formatNarx(discountAmount)}</span>
                     </motion.div>
                   )}

                   <div className="pt-8 mt-4 border-t border-white/5 flex justify-between items-center">
                      <span className="text-base font-black text-primary italic uppercase tracking-tighter">Jami Summa:</span>
                      <span className="text-2xl font-black text-primary italic tracking-tighter">{formatNarx(totalAmount)}</span>
                   </div>
                </div>

                {/* Promo Code Input */}
                <div className="mt-10 pt-10 border-t border-white/5 space-y-4">
                   <p className="text-[10px] text-white/20 uppercase font-black tracking-widest italic">Promo Kod</p>
                   <div className="flex gap-2">
                      <input 
                        type="text" 
                        placeholder="KOD" 
                        className="flex-1 bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-xs uppercase font-bold outline-none focus:border-primary/50 transition-all"
                        value={promoCode}
                        onChange={e => setPromoCode(e.target.value)}
                      />
                      <button 
                        onClick={handleApplyPromo}
                        disabled={promoLoading}
                        className="btn-primary px-6 py-3 text-[10px] uppercase font-black"
                      >
                        {promoLoading ? '...' : 'OK'}
                      </button>
                   </div>
                   {promoError && <p className="text-[9px] text-red-500 font-bold uppercase tracking-widest">{promoError}</p>}
                   {discount.value > 0 && <p className="text-[9px] text-green-500 font-bold uppercase tracking-widest">Promo kod qo'llanildi!</p>}
                </div>

                <div className="mt-12 flex items-start gap-4 p-5 rounded-3xl bg-white/[0.03] border border-white/5 group transition-all">
                   <Zap className="w-5 h-5 text-primary shrink-0 transition-transform group-hover:scale-125" />
                   <p className="text-[10px] text-white/40 leading-relaxed font-medium">
                      Depozit summasi mashina muvaffaqiyatli topshirilgandan keyin <span className="text-white font-bold italic">24 soat</span> ichida qaytariladi.
                   </p>
                </div>
             </div>

             <div className="px-10 flex items-center gap-4 text-white/20 group">
                <Sparkles className="w-5 h-5 group-hover:text-primary transition-colors" />
                <span className="text-[10px] font-black uppercase tracking-widest italic group-hover:text-white transition-colors">Premium Xizmat Kafolati</span>
             </div>
          </div>
        </div>
      </div>

      {/* SMS Simulation Modal */}
      <AnimatePresence>
        {isSMSModalOpen && (
          <div className="fixed top-12 right-6 md:right-12 z-[200] w-full max-w-sm">
            <motion.div 
              initial={{ x: 100, opacity: 0, scale: 0.8 }}
              animate={{ x: 0, opacity: 1, scale: 1 }}
              exit={{ x: 100, opacity: 0 }}
              className="bg-white rounded-[24px] p-6 shadow-2xl border-4 border-primary/20 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 blur-2xl rounded-full" />
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center shrink-0">
                  <MessageSquare className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-primary uppercase tracking-widest">YANGI XABAR</span>
                    <span className="text-[9px] text-black/20 font-bold">HOZIR</span>
                  </div>
                  <h4 className="text-sm font-black text-black">RENTAL CAR VERIFICATION</h4>
                  <p className="text-xs text-black/60 leading-relaxed font-medium">
                    Sizning to'lovni tasdiqlash kodingiz: <span className="font-black text-black text-lg ml-1 tracking-widest">{randomOTP}</span>
                  </p>
                  <button 
                    onClick={() => setIsSMSModalOpen(false)}
                    className="mt-4 w-full py-2 bg-black/5 hover:bg-black/10 text-[9px] font-black uppercase tracking-widest rounded-lg transition-colors text-black/40"
                  >
                    YOPISH
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Checkout;
