import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, Lock, ShieldCheck, Zap } from 'lucide-react';

// Oddiy formatlash funksiyasi: barcha son bo'lmagan belgilarni olib tashlaydi
const formatCardNumber = (value) => {
  const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
  const matches = v.match(/\d{4,16}/g);
  const match = (matches && matches[0]) || '';
  const parts = [];
  for (let i = 0, len = match.length; i < len; i += 4) {
    parts.push(match.substring(i, i + 4));
  }
  if (parts.length) {
    return parts.join(' ');
  } else {
    return value;
  }
};

const getCardBrand = (number = '') => {
  const cleanNumber = number.replace(/\s/g, '');
  if (cleanNumber.startsWith('8600')) return 'UZCARD';
  if (cleanNumber.startsWith('9860')) return 'HUMO';
  if (cleanNumber.startsWith('4')) return 'VISA';
  if (cleanNumber.startsWith('5')) return 'MASTERCARD';
  return 'UNKNOWN';
};

const getCardBgGradient = (brand) => {
  switch (brand) {
    case 'UZCARD': return 'from-blue-700 via-blue-500 to-yellow-400';
    case 'HUMO': return 'from-orange-600 via-orange-400 to-yellow-500';
    case 'VISA': return 'from-indigo-900 via-blue-900 to-blue-800';
    case 'MASTERCARD': return 'from-red-800 via-red-600 to-orange-500';
    default: return 'from-[#1A1A1A] via-[#222222] to-[#333333]';
  }
};

const Step3_CardInput = ({
  cardData,
  onChange,
  savedMethods = [],
  useSavedMethod = false,
  onToggleSavedMethod,
  selectedMethodId,
  onSelectMethodId,
  onSubmit,
  isProcessing,
  error,
  paymentTab,
  onTabChange,
  phoneNumber,
  onPhoneChange,
}) => {
  const [focused, setFocused] = useState(null);
  const [saveCard, setSaveCard] = useState(false);
  const [paymeTimer, setPaymeTimer] = useState(15 * 60);

  const cardBrand = getCardBrand(cardData.number);

  useEffect(() => {
    let interval;
    if (paymentTab === 'payme') {
      interval = setInterval(() => {
        setPaymeTimer((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [paymentTab]);

  const canSubmit = 
    paymentTab !== 'card' || 
    (useSavedMethod && selectedMethodId) ||
    (!useSavedMethod && cardData.number?.length >= 16 && cardData.expiry?.length >= 5 && cardData.cvv?.length === 3 && cardData.holder);

  const formatTimer = (time) => {
    const m = Math.floor(time / 60).toString().padStart(2, '0');
    const s = (time % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleExpiryChange = (e) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length >= 2) {
      val = val.slice(0, 2) + '/' + val.slice(2, 4);
    }
    onChange({ ...cardData, expiry: val });
  };

  return (
    <div className="space-y-6">
      {/* 1. TO'LOV USULI TANLASH PANELI */}
      <div className="flex gap-2 rounded-2xl bg-[#141414] p-1.5 border border-white/5">
        <button
          type="button"
          onClick={() => onTabChange('card')}
          className={`flex-[1.2] flex items-center justify-center gap-2 rounded-xl py-3 px-2 transition-all duration-300 ${
            paymentTab === 'card' ? 'bg-[#1C1C1E] border border-white/10 shadow-[0_0_15px_rgba(255,107,1,0.2)]' : 'hover:bg-white/5 border border-transparent'
          }`}
        >
          <CreditCard className={`w-4 h-4 ${paymentTab === 'card' ? 'text-primary' : 'text-white/40'}`} />
          <span className={`text-[11px] font-black uppercase tracking-widest ${paymentTab === 'card' ? 'text-white' : 'text-white/40'}`}>
            Karta bilan
          </span>
        </button>

        <button
          type="button"
          onClick={() => onTabChange('payme')}
          className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-3 px-2 transition-all duration-300 ${
            paymentTab === 'payme' ? 'bg-[#007AFF]/10 border border-[#007AFF]/20 shadow-[0_0_15px_rgba(0,122,255,0.2)]' : 'hover:bg-white/5 border border-transparent'
          }`}
        >
          <svg className="h-4" viewBox="0 0 100 30" fill="none">
             <path d="M10,20 L10,10 L25,10 C30,10 30,20 25,20 Z" fill={paymentTab === 'payme' ? '#007AFF' : 'rgba(255,255,255,0.3)'} />
             <text x="35" y="20" fontFamily="Arial, sans-serif" fontWeight="900" fontSize="18" fill={paymentTab === 'payme' ? '#007AFF' : 'rgba(255,255,255,0.4)'}>Payme QR</text>
          </svg>
        </button>

        <button
          type="button"
          onClick={() => onTabChange('click')}
          className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-3 px-2 transition-all duration-300 ${
            paymentTab === 'click' ? 'bg-[#00C853]/10 border border-[#00C853]/20 shadow-[0_0_15px_rgba(0,200,83,0.2)]' : 'hover:bg-white/5 border border-transparent'
          }`}
        >
          <Zap className={`w-4 h-4 ${paymentTab === 'click' ? 'text-[#00C853]' : 'text-white/40'}`} />
          <span className={`text-[11px] font-black uppercase tracking-widest ${paymentTab === 'click' ? 'text-[#00C853]' : 'text-white/40'}`}>
            Click
          </span>
        </button>
      </div>

      <AnimatePresence mode="wait">
        {/* ===================== KARTA KIRITISH (CARD) ===================== */}
        {paymentTab === 'card' && (
          <motion.div key="card" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-5">
            {savedMethods.length > 0 && (
              <div className="flex gap-2 rounded-xl bg-white/5 p-1 border border-white/10">
                <button type="button" onClick={() => onToggleSavedMethod(true)} className={`flex-1 rounded-lg py-2.5 text-xs font-bold uppercase tracking-widest transition ${useSavedMethod ? 'bg-primary/20 text-primary' : 'text-white/40 hover:text-white/70'}`}>Saqlanganlar</button>
                <button type="button" onClick={() => onToggleSavedMethod(false)} className={`flex-1 rounded-lg py-2.5 text-xs font-bold uppercase tracking-widest transition ${!useSavedMethod ? 'bg-primary/20 text-primary' : 'text-white/40 hover:text-white/70'}`}>Yangi Karta</button>
              </div>
            )}

            {useSavedMethod && savedMethods.length > 0 ? (
              <div className="space-y-3">
                {savedMethods.map((method) => (
                  <button key={method.id} type="button" onClick={() => onSelectMethodId(method.id)} className={`w-full relative flex items-center gap-4 rounded-2xl border p-4 transition-all duration-300 overflow-hidden ${selectedMethodId === method.id ? 'border-primary bg-primary/10 shadow-[0_0_20px_rgba(255,107,1,0.2)]' : 'border-white/10 bg-[#1A1A1A] hover:bg-[#222]'}`}>
                    {selectedMethodId === method.id && <div className="absolute top-0 right-0 w-20 h-20 bg-primary/20 blur-2xl rounded-full mix-blend-screen" />}
                    
                    <div className="w-14 h-10 rounded-lg bg-gradient-to-tr from-white/10 to-white/5 border border-white/10 flex items-center justify-center p-1 relative z-10">
                      {method.card_type === 'UZCARD' && <div className="w-full h-full bg-blue-600 rounded flex items-center justify-center text-[7px] font-black text-yellow-400">UZCARD</div>}
                      {method.card_type === 'HUMO' && <div className="w-full h-full bg-orange-500 rounded flex items-center justify-center text-[7px] font-black text-white">HUMO</div>}
                      {method.card_type === 'VISA' && <div className="text-[10px] font-black text-blue-500 italic">VISA</div>}
                      {method.card_type === 'MASTERCARD' && <div className="flex gap-0.5"><div className="w-3 h-3 rounded-full bg-red-500"/><div className="w-3 h-3 rounded-full bg-yellow-500 opacity-80 -ml-1.5"/></div>}
                      {(!['UZCARD', 'HUMO', 'VISA', 'MASTERCARD'].includes(method.card_type)) && <CreditCard className="w-5 h-5 text-white/50" />}
                    </div>

                    <div className="flex-1 text-left relative z-10">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-black uppercase text-white tracking-widest">{method.card_type || 'Karta'}</p>
                        {method.is_default && <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary text-[8px] uppercase tracking-widest font-black border border-primary/30">Asosiy</span>}
                      </div>
                      <p className="text-xs text-white/60 tracking-[0.2em] font-mono mt-0.5">**** **** **** {method.masked_pan.slice(-4)}</p>
                    </div>

                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors relative z-10 ${selectedMethodId === method.id ? 'border-primary' : 'border-white/20'}`}>
                      {selectedMethodId === method.id && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="space-y-5 px-1 pb-1">
                {/* 3D KARTA ANIMATSIYASI */}
                <div className="relative perspective-1000">
                  <motion.div 
                    animate={{ rotateY: focused === 'cvv' ? 180 : 0 }}
                    transition={{ type: 'spring', damping: 20, stiffness: 100 }}
                    className="w-full h-48 sm:h-52 rounded-[20px] p-6 relative preserve-3d text-white shadow-2xl"
                  >
                    {/* Yuz qismi */}
                    <div className={`absolute inset-0 backface-hidden rounded-[20px] bg-gradient-to-tr ${getCardBgGradient(cardBrand)} border border-white/10 p-5 flex flex-col justify-between overflow-hidden shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] transition-colors duration-500`}>
                      <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 blur-3xl rounded-full transform translate-x-1/3 -translate-y-1/3 pointer-events-none" />
                      
                      <div className="flex justify-between items-start relative z-10">
                        <div className="w-12 h-9 rounded-md bg-gradient-to-br from-yellow-200 via-yellow-400 to-yellow-600 opacity-90 shadow-sm" />
                        <div className="h-8 flex items-center">
                          {cardBrand === 'UZCARD' && <span className="px-2 py-1 bg-blue-600 rounded text-yellow-400 font-black text-xs">UZCARD</span>}
                          {cardBrand === 'HUMO' && <span className="px-2 py-1 bg-orange-500 rounded text-white font-black text-xs">HUMO</span>}
                          {cardBrand === 'VISA' && <span className="text-xl font-black italic text-white mix-blend-overlay">VISA</span>}
                          {cardBrand === 'MASTERCARD' && <div className="flex gap-1"><div className="w-6 h-6 rounded-full bg-red-500 mix-blend-screen"/><div className="w-6 h-6 rounded-full bg-yellow-400 mix-blend-screen -ml-3"/></div>}
                        </div>
                      </div>

                      <div className="relative z-10 w-full mt-auto space-y-4">
                        <p className="text-xl sm:text-2xl tracking-[0.2em] font-mono font-medium drop-shadow-md">
                          {cardData.number ? cardData.number : '#### #### #### ####'}
                        </p>
                        <div className="flex justify-between items-end gap-4">
                          <div className="flex-1 overflow-hidden">
                            <p className="text-[8px] uppercase tracking-widest text-white/50 mb-0.5">Card Holder</p>
                            <p className="text-sm font-semibold tracking-wider truncate uppercase">{cardData.holder || 'ISMI SHARIFI'}</p>
                          </div>
                          <div>
                            <p className="text-[8px] uppercase tracking-widest text-white/50 mb-0.5 text-right">Expires</p>
                            <p className="text-sm font-semibold tracking-wider font-mono">{cardData.expiry || 'MM/YY'}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Orqa qismi */}
                    <div className={`absolute inset-0 backface-hidden rounded-[20px] bg-gradient-to-tl ${getCardBgGradient(cardBrand)} border border-white/10 flex flex-col justify-center overflow-hidden rotate-y-180 transition-colors duration-500`}>
                      <div className="w-full h-12 bg-black/80 absolute top-6" />
                      <div className="px-5 mt-6 relative z-10">
                        <div className="flex justify-end bg-white rounded flex-1 h-10 items-center px-4">
                          <span className="font-mono text-black font-bold tracking-[0.3em]">{cardData.cvv || '***'}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* FORMA */}
                <div className="space-y-3">
                  <div className="relative">
                    <input type="tel" placeholder="Karta raqami" maxLength={19} value={cardData.number || ''} onChange={(e) => onChange({ ...cardData, number: formatCardNumber(e.target.value) })} onFocus={() => setFocused('number')} onBlur={() => setFocused(null)} className="w-full rounded-xl border border-white/10 bg-[#1A1A1A] px-4 py-3.5 text-sm font-mono text-white outline-none focus:border-primary focus:bg-primary/5 transition-all placeholder:font-sans placeholder:text-sm placeholder:text-white/30" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <input type="tel" placeholder="MM/YY" maxLength={5} value={cardData.expiry || ''} onChange={handleExpiryChange} onFocus={() => setFocused('expiry')} onBlur={() => setFocused(null)} className="w-full rounded-xl border border-white/10 bg-[#1A1A1A] px-4 py-3.5 text-sm font-mono text-white outline-none focus:border-primary focus:bg-primary/5 transition-all placeholder:font-sans placeholder:text-sm placeholder:text-white/30 text-center" />
                    <input type="password" placeholder="CVV" maxLength={3} value={cardData.cvv || ''} onChange={(e) => onChange({ ...cardData, cvv: e.target.value.replace(/\D/g, '') })} onFocus={() => setFocused('cvv')} onBlur={() => setFocused(null)} className="w-full rounded-xl border border-white/10 bg-[#1A1A1A] px-4 py-3.5 text-sm font-mono text-white outline-none focus:border-primary focus:bg-primary/5 transition-all placeholder:font-sans placeholder:text-sm placeholder:text-white/30 text-center" />
                  </div>
                  
                  <input type="text" placeholder="Karta egasi (Lotin harflarida)" value={cardData.holder || ''} onChange={(e) => onChange({ ...cardData, holder: e.target.value.toUpperCase() })} onFocus={() => setFocused('holder')} onBlur={() => setFocused(null)} className="w-full rounded-xl border border-white/10 bg-[#1A1A1A] px-4 py-3.5 text-sm font-bold text-white uppercase outline-none focus:border-primary focus:bg-primary/5 transition-all placeholder:normal-case placeholder:font-normal placeholder:text-white/30" />

                  <label className="flex items-center gap-3 p-3 rounded-xl border border-white/5 bg-[#141414] cursor-pointer hover:bg-white/5 transition group">
                    <div className={`w-5 h-5 rounded-[6px] border flex items-center justify-center transition ${saveCard ? 'bg-primary border-primary' : 'border-white/20 group-hover:border-white/40'}`}>
                      {saveCard && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                    </div>
                    <span className="text-xs text-white/80 font-medium select-none">Ushbu kartani keyingi to'lovlar uchun saqlash</span>
                    <input type="checkbox" className="hidden" checked={saveCard} onChange={(e) => setSaveCard(e.target.checked)} />
                  </label>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* ===================== PAYME QR (PAYME) ===================== */}
        {paymentTab === 'payme' && (
          <motion.div key="payme" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="flex flex-col items-center justify-center py-6 text-center">
            
            {/* Payme Logosi (Panel ichida ham) */}
            <svg className="h-6 mb-4" viewBox="0 0 100 30" fill="none">
               <path d="M10,20 L10,10 L25,10 C30,10 30,20 25,20 Z" fill="#007AFF" />
               <text x="35" y="20" fontFamily="Arial, sans-serif" fontWeight="900" fontSize="18" fill="#007AFF">Payme</text>
            </svg>

            <h3 className="text-xl font-black text-white tracking-widest mb-2">SCAN-BE-PAY</h3>
            <p className="text-xs text-white/50 mb-8 max-w-xs leading-relaxed">Payme ilovasida skan qiling.</p>
            
            <div className="relative w-52 h-52 mx-auto rounded-3xl border-2 border-dashed border-[#007AFF]/40 bg-[#007AFF]/5 flex items-center justify-center p-4">
               {/* Decorative corner markers */}
               <div className="absolute top-[-2px] left-[-2px] w-6 h-6 border-t-2 border-l-2 border-[#007AFF] rounded-tl-2xl" />
               <div className="absolute top-[-2px] right-[-2px] w-6 h-6 border-t-2 border-r-2 border-[#007AFF] rounded-tr-2xl" />
               <div className="absolute bottom-[-2px] left-[-2px] w-6 h-6 border-b-2 border-l-2 border-[#007AFF] rounded-bl-2xl" />
               <div className="absolute bottom-[-2px] right-[-2px] w-6 h-6 border-b-2 border-r-2 border-[#007AFF] rounded-br-2xl" />
               
               {/* QR Placeholder/Spinner */}
               <div className="flex flex-col items-center gap-3">
                 <div className="w-10 h-10 border-4 border-[#007AFF]/30 border-t-[#007AFF] rounded-full animate-spin" />
                 <span className="text-[10px] font-black uppercase text-[#007AFF] tracking-widest animate-pulse">Yuklanmoqda...</span>
               </div>
            </div>

            <div className="mt-8 flex items-center justify-center gap-4">
              <div className="flex flex-col items-center">
                 <span className="text-[10px] uppercase text-white/40 tracking-widest font-bold mb-1">Amal qilish vaqti</span>
                 <span className="font-mono text-2xl font-black text-[#007AFF]">{formatTimer(paymeTimer)}</span>
              </div>
              <div className="w-px h-10 bg-white/10" />
              <button 
                type="button" 
                onClick={() => setPaymeTimer(15 * 60)} 
                className="px-4 py-2 rounded-xl border border-[#007AFF]/30 text-[#007AFF] text-xs font-bold uppercase tracking-widest hover:bg-[#007AFF]/10 transition"
              >
                Yangilash
              </button>
            </div>
          </motion.div>
        )}

        {/* ===================== CLICK (CLICK) ===================== */}
        {paymentTab === 'click' && (
          <motion.div key="click" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="py-6 text-center space-y-6">
            <div className="w-20 h-20 mx-auto rounded-[20px] bg-[#00C853]/10 border border-[#00C853]/20 flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(0,200,83,0.15)]">
              <svg className="h-6 text-[#00C853]" viewBox="0 0 100 30" fill="currentColor">
                 <path d="M15,15 A15,15 0 1,1 15,14.9 Z M15,5 A10,10 0 1,0 15,5.1 Z" />
                 <text x="35" y="22" fontFamily="sans-serif" fontWeight="900" fontSize="24" letterSpacing="-1">CLICK</text>
               </svg>
            </div>
            
            <div>
              <h3 className="text-xl font-black text-white tracking-widest uppercase mb-2">USSD Yuborish</h3>
              <p className="text-xs text-[#00C853] font-bold max-w-xs mx-auto mb-2">Click ilovasiga so'rov yuboriladi</p>
              <p className="text-xs text-white/50 max-w-xs mx-auto leading-relaxed">Click ulangan telefon raqamingizni kiriting.</p>
            </div>

            <div className="max-w-xs mx-auto text-left relative mt-4">
              <label className="text-[10px] uppercase text-[#00C853] font-black tracking-widest absolute -top-2 left-4 bg-[#0A0A0A] px-2 z-10">Telefon raqam</label>
              <div className="relative flex items-center">
                <span className="absolute left-4 text-white font-bold">+998</span>
                <input 
                  type="tel" 
                  value={phoneNumber || ''}
                  onChange={(e) => onPhoneChange(e.target.value)}
                  placeholder="__ ___ __ __" 
                  className="w-full rounded-xl border-2 border-white/10 bg-[#141414] pl-16 pr-4 py-4 text-lg font-bold text-white outline-none focus:border-[#00C853] focus:bg-[#00C853]/5 transition-all placeholder:text-white/20" 
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {error && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center rounded-xl bg-red-500/10 p-3 text-xs font-bold text-red-500">{error}</motion.p>}

      <button
        onClick={onSubmit}
        disabled={isProcessing || !canSubmit}
        className={`relative w-full py-4.5 overflow-hidden rounded-xl text-sm font-black uppercase tracking-widest transition-all duration-300 mt-2 group ${
          isProcessing ? 'bg-white/5 text-white/30 cursor-not-allowed border border-white/5' :
          paymentTab === 'payme' ? 'bg-[#007AFF] text-white shadow-[0_4px_20px_rgba(0,122,255,0.4)] hover:scale-[1.02]' :
          paymentTab === 'click' ? 'bg-[#00C853] text-white shadow-[0_4px_20px_rgba(0,200,83,0.4)] hover:scale-[1.02]' :
          'bg-primary text-white shadow-[0_4px_20px_rgba(255,107,1,0.4)] hover:scale-[1.02]'
        } disabled:scale-100 disabled:shadow-none`}
      >
        {!isProcessing && !error && canSubmit && (
          <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
        )}
        <span className="relative z-10 flex items-center justify-center gap-3">
          {isProcessing ? (
            <>
              <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
              <span>Jarayonda...</span>
            </>
          ) : (
            `To'lovni tasdiqlash`
          )}
        </span>
      </button>

      {/* 6. XAVFSIZLIK BELGILARI */}
      <div className="pt-4 border-t border-white/5 flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
         <div className="flex items-center gap-2 text-white/40">
           <Lock className="w-4 h-4" />
           <div className="text-[9px] uppercase tracking-wider">
             <p className="font-bold text-white/60">256-bit shifrlash</p>
             <p>Ma'lumotlaringiz xavfsiz</p>
           </div>
         </div>
         <div className="flex items-center gap-2 text-white/40">
           <ShieldCheck className="w-4 h-4" />
           <div className="text-[9px] uppercase tracking-wider">
             <p className="font-bold text-white/60">PCI DSS</p>
             <p>Sertifikatlangan</p>
           </div>
         </div>
      </div>
    </div>
  );
};

export default Step3_CardInput;
