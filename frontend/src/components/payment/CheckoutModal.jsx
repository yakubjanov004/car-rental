import { AnimatePresence, motion } from 'framer-motion';
import { X, Check } from 'lucide-react';
import { usePaymentFlow } from './hooks/usePaymentFlow';
import Step1_Summary from './steps/Step1_Summary';
import Step2_Insurance from './steps/Step2_Insurance';
import Step3_CardInput from './steps/Step3_CardInput';
import Step4_OTP from './steps/Step4_OTP';
import Step5_Success from './steps/Step5_Success';

const STEPS = [
  { id: 1, label: 'Xulosa' },
  { id: 2, label: "Sug'urta" },
  { id: 3, label: "To'lov" },
  { id: 4, label: 'OTP' },
  { id: 5, label: 'Tayyor' }
];

const STEP_TITLES = {
  1: 'Buyurtma xulosasi',
  2: "Sug'urta tanlash",
  3: "To'lov usuli",
  4: 'SMS tasdiqlash',
  5: ''
};

const CheckoutModal = ({ isOpen, onClose, booking }) => {
  const {
    step,
    setStep,
    paymentTab,
    setPaymentTab,
    phoneNumber,
    setPhoneNumber,
    retryPayment,
    cardData,
    setCardData,
    otp,
    setOtp,
    selectedInsurance,
    setSelectedInsurance,
    transactionId,
    paymentStatus,
    paymentResult,
    savedMethods,
    useSavedMethod,
    setUseSavedMethod,
    selectedMethodId,
    setSelectedMethodId,
    totalAmount,
    initiatePaymentFlow,
    verifyOtpFlow,
    resendOtpFlow,
    error,
    devOtp,
    setDevOtp,
  } = usePaymentFlow(booking);

  const selectedMethod = savedMethods.find((method) => method.id === selectedMethodId);
  const cardLast4 = useSavedMethod
    ? (selectedMethod?.masked_pan || '').replace(/\D/g, '').slice(-4)
    : cardData.number?.replace(/\s/g, '').slice(-4);

  if (!isOpen) return null;

  const stepComponents = {
    1: <Step1_Summary booking={booking} totalAmount={totalAmount} onNext={() => setStep(2)} />,
    2: (
      <Step2_Insurance selected={selectedInsurance} onSelect={setSelectedInsurance} onNext={() => setStep(3)} />
    ),
    3: (
      <Step3_CardInput
        cardData={cardData}
        onChange={setCardData}
        savedMethods={savedMethods}
        useSavedMethod={useSavedMethod}
        onToggleSavedMethod={setUseSavedMethod}
        selectedMethodId={selectedMethodId}
        onSelectMethodId={setSelectedMethodId}
        onSubmit={initiatePaymentFlow}
        isProcessing={paymentStatus === 'processing'}
        error={error}
        paymentTab={paymentTab}
        onTabChange={setPaymentTab}
        phoneNumber={phoneNumber}
        onPhoneChange={setPhoneNumber}
      />
    ),
    4: (
      <Step4_OTP
        otp={otp}
        onChange={setOtp}
        onVerify={verifyOtpFlow}
        onResend={resendOtpFlow}
        isProcessing={paymentStatus === 'processing'}
        isPolling={paymentStatus === 'polling'}
        paymentMethod={paymentTab === 'card' ? 'BANK KARTASI' : paymentTab === 'payme' ? 'PAYME QR' : 'CLICK PAY'}
        phoneNumber={phoneNumber || "901234567"}
        transactionId={transactionId}
        cardLast4={cardLast4}
        devOtp={devOtp}
        error={error}
      />
    ),
    5: (
      <Step5_Success
        status={paymentStatus}
        booking={booking}
        totalAmount={totalAmount}
        paymentResult={paymentResult}
        onClose={onClose}
        onRetry={retryPayment}
      />
    ),
  };

  return (
    <>
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', duration: 0.4 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-[#0A0A0A] shadow-2xl shadow-primary/10 flex flex-col max-h-[90vh]">
              <div className="relative border-b border-white/10 px-6 pb-4 pt-6 shrink-0">
                {step < 5 && (
                 <div className="mb-6 flex items-center justify-between gap-1 overflow-x-auto pb-2 scrollbar-none">
                  {STEPS.map((s) => {
                    const isCompleted = step > s.id;
                    const isCurrent = step === s.id;
                    return (
                      <div key={s.id} className="flex flex-col items-center gap-1.5 min-w-[50px]">
                        <div className={`relative flex h-5 w-5 items-center justify-center rounded-full transition-all duration-300 ${isCompleted ? 'bg-primary' : isCurrent ? 'bg-primary shadow-[0_0_10px_rgba(255,107,1,0.5)]' : 'bg-white/10'}`}>
                           {isCompleted && <Check className="w-3 h-3 text-white" />}
                           {isCurrent && <span className="absolute w-full h-full rounded-full border-2 border-primary animate-pulse opacity-75 object-none scale-150" />}
                           {!isCompleted && !isCurrent && <span className="w-1.5 h-1.5 rounded-full bg-white/30" />}
                        </div>
                        <span className={`text-[9px] font-black uppercase tracking-widest ${isCurrent || isCompleted ? 'text-primary' : 'text-white/30'}`}>
                          {s.label}
                        </span>
                      </div>
                    );
                  })}
                 </div>
                )}

                {step < 5 && STEP_TITLES[step] && (
                  <h2 className="text-xl font-black uppercase tracking-widest text-white">{STEP_TITLES[step]}</h2>
                )}

                {step < 5 ? (
                  <button
                    onClick={onClose}
                    className="absolute right-4 top-4 rounded-full border border-white/10 p-2 text-white/70 hover:text-white transition-colors bg-[#0A0A0A]"
                  >
                    <X className="h-4 w-4" />
                  </button>
                ) : null}
              </div>

              <div className="overflow-y-auto overflow-x-hidden flex-1 scrollbar-none">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={step}
                    initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, y: -10, filter: 'blur(4px)' }}
                    transition={{ duration: 0.3 }}
                    className="p-6"
                  >
                    {stepComponents[step]}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
    
    <AnimatePresence>
        {isOpen && devOtp && step === 4 && (
          <motion.div
            initial={{ opacity: 0, x: 100, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.9 }}
            className="fixed bottom-8 right-8 z-[100] w-72 glass border border-primary/30 p-4 rounded-2xl shadow-[0_20px_50px_rgba(255,107,0,0.2)] overflow-hidden bg-[#0A0A0A]"
          >
            <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  <Check className="w-5 h-5 text-primary" />
                </motion.div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">MOCK SMS PROLOGUE</p>
                <p className="text-white font-bold text-sm leading-tight mb-2">Tasdiqlash kodi</p>
                <div className="bg-white/5 rounded-lg p-2 font-mono text-center relative border border-white/5">
                   <p className="text-primary text-xl font-black tracking-[0.3em]">{devOtp}</p>
                   <div className="absolute -top-1 -right-1 flex gap-1">
                      <span className="w-1 h-1 rounded-full bg-primary animate-ping" />
                   </div>
                </div>
                <p className="text-[9px] text-white/30 italic mt-2 leading-tight">Bu kod faqat demo uchun ko'rsatilmoqda.</p>
              </div>
              <button 
                onClick={() => setDevOtp(null)}
                className="text-white/20 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <motion.div 
               initial={{ width: "100%" }}
               animate={{ width: "0%" }}
               transition={{ duration: 30, ease: "linear" }}
               onAnimationComplete={() => { if (typeof setDevOtp === 'function') setDevOtp(null); }}
               className="absolute bottom-0 left-0 h-0.5 bg-primary/30"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default CheckoutModal;
