import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, ShieldCheck, Phone, CheckCircle2 } from 'lucide-react';

const Step4_OTP = ({
  otp,
  onChange,
  onVerify,
  onResend,
  isProcessing,
  transactionId,
  cardLast4,
  devOtp,
  error,
  phoneNumber = 'XX',
  paymentMethod,
  isPolling // preserving this for specific flows if needed
}) => {
    const { t } = useTranslation();
  const [expiryTime, setExpiryTime] = useState(5 * 60); // 04:59
  const [canResend, setCanResend] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false); 
  const refs = useRef([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setExpiryTime((prev) => {
        if (prev <= 1) return 0;
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (expiryTime <= 4.5 * 60) {
      setCanResend(true);
    }
  }, [expiryTime]);

  useEffect(() => {
    if (!isPolling && !isProcessing) {
      setTimeout(() => refs.current[0]?.focus(), 100);
    }
  }, [isPolling, isProcessing]);

  // Trigger verify automatically
  useEffect(() => {
    if (otp.length === 6 && !isProcessing && !error) {
      onVerify(otp);
    }
  }, [otp, isProcessing, error, onVerify]);

  const handleResend = async () => {
    if (!canResend || !onResend) return;
    await onResend();
    setExpiryTime(5 * 60);
    setCanResend(false);
    onChange('');
    refs.current[0]?.focus();
  };

  const handleInput = (val, idx) => {
    const newVal = val.replace(/[^0-9]/g, '').slice(-1);
    const code = otp.padEnd(6, ' ').split('');
    code[idx] = newVal || ' ';
    
    const nextOtp = code.join('').trim();
    onChange(nextOtp);

    if (newVal && idx < 5) {
      refs.current[idx + 1]?.focus();
    }
  };

  const handleKeyDown = (e, idx) => {
    if (e.key === 'Backspace') {
      const code = otp.padEnd(6, ' ').split('');
      if (!code[idx] || code[idx] === ' ') {
        if (idx > 0) {
          code[idx - 1] = ' ';
          onChange(code.join('').trim());
          refs.current[idx - 1]?.focus();
        }
      } else {
        code[idx] = ' ';
        onChange(code.join('').trim());
      }
    }
    if (e.key === 'ArrowLeft' && idx > 0) {
      refs.current[idx - 1]?.focus();
    }
    if (e.key === 'ArrowRight' && idx < 5) {
      refs.current[idx + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, 6);
    if (pasted) {
      onChange(pasted);
      if (pasted.length === 6) {
        refs.current[5]?.focus();
      } else {
        refs.current[pasted.length]?.focus();
      }
    }
  };

  const formatTimer = (timeStr) => {
    const m = Math.floor(timeStr / 60).toString().padStart(2, '0');
    const s = (timeStr % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // Determine shake effect
  const isError = !!error;

  return (
    <div className="space-y-6 relative">
      {/* 1. DIZAYN - PAYME USLUBI */}
      <div className="text-center flex flex-col items-center">
        {/* Yuqori badge */}
        <div className="inline-flex items-center gap-2 bg-[#1A1A1A] border border-white/10 px-4 py-2 rounded-full mb-6 text-xs font-black uppercase tracking-widest text-[#007AFF] shadow-[0_0_15px_rgba(0,122,255,0.1)]">
          <CreditCard className="w-4 h-4" />
          <span>{paymentMethod || 'BANK KARTASI'}</span>
        </div>

        <h2 className="text-2xl font-black text-white uppercase tracking-widest leading-tight">{t('checkoutModal.otpTitle').split('\n').map((l, i) => <span key={i}>{l}{i===0?<br/>:''}</span>)}</h2>
        
        <div className="flex items-center justify-center gap-2 mt-4 text-white/50 text-sm bg-white/5 px-4 py-2 rounded-lg">
          <Phone className="w-4 h-4" />
          <span>{t('checkoutModal.smsSent')} <strong className="text-white tracking-widest ml-1">+998 ** *** **{phoneNumber.slice(-2)}</strong></span>
        </div>
      </div>

      {/* 2. OTP INPUT */}
      <motion.div 
        animate={isError ? { x: [-10, 10, -10, 10, -5, 5, 0] } : {}}
        transition={{ duration: 0.4 }}
        className="flex justify-center gap-2 sm:gap-3 my-8"
      >
        {Array.from({ length: 6 }).map((_, idx) => {
          const char = otp[idx] || '';
          return (
            <input
              key={idx}
              ref={(el) => (refs.current[idx] = el)}
              type="tel"
              value={char}
              onChange={(e) => handleInput(e.target.value, idx)}
              onKeyDown={(e) => handleKeyDown(e, idx)}
              onPaste={handlePaste}
              maxLength={1}
              autoComplete="one-time-code"
              disabled={isProcessing}
              className={`w-12 h-14 sm:w-14 sm:h-16 rounded-xl border-2 text-center text-2xl font-black outline-none transition-all duration-300 shadow-inner ${
                isError 
                  ? 'border-red-500 bg-red-500/10 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)]' 
                  : char 
                    ? 'border-primary bg-primary/5 text-primary shadow-[0_0_15px_rgba(255,107,1,0.2)]'
                    : 'border-white/10 bg-[#1A1A1A] text-white focus:border-primary/50 focus:bg-[#222]'
              } disabled:opacity-50`}
            />
          );
        })}
      </motion.div>

      {/* ERROR MESSAGE */}
      <AnimatePresence>
        {error && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-center pb-2">
             <p className="text-xs font-bold text-red-500 uppercase tracking-widest">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. COUNTDOWN TIMER */}
      <div className="flex flex-col items-center justify-center space-y-3 pt-2 border-t border-white/5">
         {!isProcessing ? (
           <>
            <div className="text-sm font-bold text-white/40 tracking-widest uppercase">
              {t('checkoutModal.codeExpiry')} <span className="text-white font-mono ml-2 text-lg">{formatTimer(expiryTime)}</span>
            </div>
            
            <button 
              onClick={handleResend}
              disabled={!canResend}
              className={`text-xs font-black uppercase tracking-widest transition-all duration-300 ${
                canResend ? 'text-primary hover:text-white' : 'text-white/20 cursor-not-allowed'
              }`}
            >
              Yangi kod so'rash
            </button>
           </>
         ) : null}
      </div>

      {/* 4. ANIMATSIYALAR & DEV HELPER */}
      <AnimatePresence>
        {isProcessing && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} 
            animate={{ opacity: 1, scale: 1 }} 
            className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#0f0f0f]/90 backdrop-blur-sm rounded-3xl"
          >
             <div className="relative flex justify-center items-center w-20 h-20 mb-4">
               <div className="absolute inset-0 border-4 border-primary/20 rounded-full" />
               <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin" />
               <ShieldCheck className="w-6 h-6 text-primary absolute animate-pulse" />
             </div>
             <p className="text-xs font-black uppercase tracking-widest text-primary animate-pulse">{t('checkoutModal.bankChecking')}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 5. DEV HELPER */}
      {devOtp && !isProcessing && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8 p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center gap-3">
           <div className="text-[10px] uppercase font-black tracking-widest text-[#00C853] flex items-center gap-1">
             <div className="w-1.5 h-1.5 rounded-full bg-[#00C853] animate-pulse" />
             DEV HELPER
           </div>
           <p className="font-mono text-xl tracking-[0.3em] font-black">{devOtp}</p>
           <button 
             onClick={() => {
               onChange(devOtp);
               if(devOtp.length === 6) onVerify(devOtp);
             }}
             className="px-6 py-2.5 rounded-xl bg-[#00C853]/10 text-[#00C853] text-[10px] font-black uppercase tracking-widest border border-[#00C853]/20 hover:bg-[#00C853] hover:text-white transition-all shadow-[0_0_15px_rgba(0,200,83,0.2)]"
           >
             Avtomatik to'ldirish
           </button>
        </motion.div>
      )}
    </div>
  );
};

export default Step4_OTP;
