import { useEffect, useRef, useState } from 'react';

const Step4_OTP = ({ otp, onChange, onVerify, onResend, isProcessing, cardLast4, error }) => {
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
      {isProcessing ? <p className="text-center text-sm text-white/50">To'lov tasdiqlanmoqda...</p> : null}
      {error ? <p className="rounded-xl bg-red-500/10 p-3 text-sm text-red-400">{error}</p> : null}
      {countdown > 0 ? (
        <p className="text-center text-sm text-white/50">Qayta yuborish: {countdown}s</p>
      ) : (
        <button
          onClick={handleResend}
          disabled={isProcessing}
          className="w-full rounded-xl border border-white/10 py-3 text-white disabled:opacity-50"
        >
          Kodni qayta yuborish
        </button>
      )}
    </div>
  );
};

export default Step4_OTP;
