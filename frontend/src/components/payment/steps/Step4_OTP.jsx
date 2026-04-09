import { useEffect, useRef, useState } from 'react';

const Step4_OTP = ({ otp, onChange, onVerify, onResend, isProcessing, cardLast4, devOtp, error }) => {
  const [countdown, setCountdown] = useState(60);
  const refs = useRef([]);

  useEffect(() => {
    refs.current[0]?.focus();
    const interval = setInterval(() => setCountdown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(interval);
  }, []);

  const handleResend = async () => {
    if (!onResend) return;
    await onResend();
    setCountdown(60);
    refs.current[0]?.focus();
  };

  const handleInput = (value, idx) => {
    const code = otp.split('');
    code[idx] = value.slice(-1);
    const next = code.join('');
    onChange(next);
    if (value && idx < 5) refs.current[idx + 1]?.focus();
    if (next.length === 6) onVerify(next);
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-white/70">•••• {cardLast4} kartaga yuborilgan kodni kiriting</p>
      <div className="flex justify-center gap-2">
        {Array.from({ length: 6 }).map((_, idx) => (
          <input
            key={idx}
            ref={(el) => (refs.current[idx] = el)}
            value={otp[idx] || ''}
            onChange={(e) => handleInput(e.target.value, idx)}
            maxLength={1}
            className="h-12 w-10 rounded-lg border border-white/10 bg-white/5 text-center text-xl text-white outline-none"
          />
        ))}
      </div>
      {isProcessing ? (
        <div className="flex flex-col items-center gap-4 py-4">
           <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
           <p className="text-center text-[10px] font-black uppercase tracking-widest text-primary italic animate-pulse">Tranzaksiya tasdiqlanmoqda...</p>
        </div>
      ) : null}
      {devOtp ? (
        <div className="rounded-2xl bg-white/5 border border-white/5 p-4 text-center">
          <p className="text-[10px] text-white/30 uppercase font-black tracking-widest mb-1">Demo OTP Code</p>
          <p className="text-2xl font-black text-primary tracking-[0.3em]">{devOtp}</p>
        </div>
      ) : null}
      {error ? <p className="rounded-xl bg-red-500/10 p-3 text-sm text-red-500 font-bold text-center">{error}</p> : null}
      {countdown > 0 ? (
        <div className="pt-4 border-t border-white/5">
           <p className="text-center text-[10px] font-black uppercase tracking-widest text-white/20 italic">Qayta yuborish: {countdown}s</p>
        </div>
      ) : (
        <button
          onClick={handleResend}
          disabled={isProcessing}
          className="btn-secondary w-full py-4 text-[10px] font-black tracking-widest uppercase mt-4"
        >
          Kodni qayta yuborish
        </button>
      )}
    </div>
  );
};

export default Step4_OTP;
