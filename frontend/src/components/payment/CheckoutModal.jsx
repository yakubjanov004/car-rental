import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { usePaymentFlow } from './hooks/usePaymentFlow';
import Step1_Summary from './steps/Step1_Summary';
import Step2_Insurance from './steps/Step2_Insurance';
import Step3_CardInput from './steps/Step3_CardInput';
import Step4_OTP from './steps/Step4_OTP';
import Step5_Success from './steps/Step5_Success';

const STEPS = ['Xulosa', 'Sug\'urta', 'To\'lov', 'Tasdiqlash', 'Natija'];

const CheckoutModal = ({ isOpen, onClose, booking }) => {
  const {
    step,
    setStep,
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
      />
    ),
    4: (
      <Step4_OTP
        otp={otp}
        onChange={setOtp}
        onVerify={verifyOtpFlow}
        onResend={resendOtpFlow}
        isProcessing={paymentStatus === 'processing'}
        transactionId={transactionId}
        cardLast4={cardLast4}
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
      />
    ),
  };

  return (
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
            <div className="w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-[#0f0f0f] shadow-2xl">
              <div className="relative border-b border-white/10 px-6 pb-4 pt-6">
                <div className="mb-4 flex items-center gap-2">
                  {STEPS.map((label, idx) => (
                    <div key={label} className="flex items-center gap-2">
                      <div
                        className={`h-2.5 w-2.5 rounded-full ${idx + 1 <= step ? 'bg-primary' : 'bg-white/20'}`}
                      />
                      {idx < STEPS.length - 1 ? <div className="h-px w-5 bg-white/20" /> : null}
                    </div>
                  ))}
                </div>

                <h2 className="text-lg font-bold text-white">{STEPS[step - 1]}</h2>

                {step < 5 ? (
                  <button
                    onClick={onClose}
                    className="absolute right-4 top-4 rounded-full border border-white/10 p-2 text-white/70 hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>
                ) : null}
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-6"
                >
                  {stepComponents[step]}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CheckoutModal;
