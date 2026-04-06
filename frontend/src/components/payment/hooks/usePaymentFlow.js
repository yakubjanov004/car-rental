import { useEffect, useMemo, useState } from 'react';
import {
  initiatePayment,
  verifyOtp as verifyOtpApi,
  resendOtp as resendOtpApi,
  fetchPaymentMethods,
} from '../../../services/api/payments';

export const usePaymentFlow = (booking) => {
  const [step, setStep] = useState(1);
  const [cardData, setCardData] = useState({});
  const [otp, setOtp] = useState('');
  const [selectedInsurance, setSelectedInsurance] = useState(null);
  const [transactionId, setTransactionId] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState('idle');
  const [error, setError] = useState(null);
  const [paymentResult, setPaymentResult] = useState(null);
  const [savedMethods, setSavedMethods] = useState([]);
  const [useSavedMethod, setUseSavedMethod] = useState(false);
  const [selectedMethodId, setSelectedMethodId] = useState(null);

  useEffect(() => {
    const loadMethods = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const methods = await fetchPaymentMethods();
        setSavedMethods(methods);
        const defaultMethod = methods.find((method) => method.is_default) || methods[0];
        if (defaultMethod) {
          setSelectedMethodId(defaultMethod.id);
          setUseSavedMethod(true);
        }
      } catch {
        setSavedMethods([]);
      }
    };

    loadMethods();
  }, []);

  const insuranceDailyCost = Number(selectedInsurance?.daily_price || 0);
  const days = booking
    ? Math.max(1, Math.ceil((new Date(booking.end_date) - new Date(booking.start_date)) / 86400000))
    : 0;

  const totalAmount = useMemo(() => {
    return Number(booking?.total_price || 0) + insuranceDailyCost * days;
  }, [booking, insuranceDailyCost, days]);

  const initiate = async () => {
    setError(null);
    setPaymentStatus('processing');

    try {
      const result = await initiatePayment({
        booking_id: booking.id,
        ...(useSavedMethod && selectedMethodId
          ? { payment_method_id: selectedMethodId }
          : {
              card_number: (cardData.number || '').replace(/\s/g, ''),
              expiry: cardData.expiry,
              cvv: cardData.cvv,
              holder: cardData.holder,
            }),
        insurance_plan_id: selectedInsurance?.id,
      });
      setTransactionId(result.transaction_id);
      setPaymentStatus('otp_sent');
      setPaymentResult(null);
      setStep(4);
      return result;
    } catch (err) {
      setPaymentStatus('failed');
      setError(err?.response?.data?.error || 'Xatolik yuz berdi');
      throw err;
    }
  };

  const verify = async (otpValue) => {
    setError(null);
    setPaymentStatus('processing');

    try {
      const verifyResult = await verifyOtpApi({
        transaction_id: transactionId,
        otp_code: otpValue || otp,
      });
      setPaymentResult(verifyResult);
      setPaymentStatus('success');
      setStep(5);
    } catch (err) {
      setPaymentStatus('idle');
      setError(err?.response?.data?.error || 'Noto\'g\'ri OTP kodi');
      throw err;
    }
  };

  const resend = async () => {
    if (!transactionId) {
      return;
    }

    setError(null);
    try {
      await resendOtpApi({ transaction_id: transactionId });
    } catch (err) {
      setError(err?.response?.data?.error || 'Kodni qayta yuborib bo\'lmadi');
      throw err;
    }
  };

  return {
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
    initiatePaymentFlow: initiate,
    verifyOtpFlow: verify,
    resendOtpFlow: resend,
    error,
  };
};
