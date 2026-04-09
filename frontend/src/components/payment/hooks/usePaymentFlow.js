import { useEffect, useMemo, useState, useRef } from 'react';
import {
  initiatePayment,
  verifyOtp as verifyOtpApi,
  verifyPayment as verifyPaymentApi,
  resendOtp as resendOtpApi,
  fetchPaymentMethods,
} from '../../../services/api/payments';

export const usePaymentFlow = (booking) => {
  const [step, setStep] = useState(1);
  const [paymentTab, setPaymentTab] = useState('card');
  const [phoneNumber, setPhoneNumber] = useState('');
  
  const [cardData, setCardData] = useState({});
  const [otp, setOtp] = useState('');
  const [selectedInsurance, setSelectedInsurance] = useState(null);
  const [transactionId, setTransactionId] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState('idle');
  const [error, setError] = useState(null);
  const [paymentResult, setPaymentResult] = useState(null);
  const [devOtp, setDevOtp] = useState(null);
  const [savedMethods, setSavedMethods] = useState([]);
  const [useSavedMethod, setUseSavedMethod] = useState(false);
  const [selectedMethodId, setSelectedMethodId] = useState(null);
  
  const pollingRef = useRef(null);

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
    
    return () => stopPolling();
  }, []);

  const insuranceDailyCost = Number(selectedInsurance?.daily_price || 0);
  const days = booking
    ? Math.max(1, Math.ceil((new Date(booking.end_date) - new Date(booking.start_date)) / 86400000))
    : 0;

  const totalAmount = useMemo(() => {
    return Number(booking?.total_price || 0) + insuranceDailyCost * days;
  }, [booking, insuranceDailyCost, days]);

  const stopPolling = () => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  };

  const startPolling = (txId) => {
    stopPolling();
    // Har 3 soniyada (setInterval)
    pollingRef.current = setInterval(async () => {
      try {
        const res = await verifyPaymentApi({ transaction_id: txId });
        // status === 'paid' bo'lsa polling to'xta, step 5 ga o't
        if (res.status === 'paid' || res.status === 'success') {
          stopPolling();
          setPaymentResult(res);
          setPaymentStatus('success');
          setStep(5);
        } else if (res.status === 'failed' || res.status === 'error') {
          stopPolling();
          setPaymentStatus('failed');
          setError(res.error || "To'lov amalga oshmadi");
          setStep(5);
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    }, 3000);
  };

  const initiate = async () => {
    setError(null);
    setPaymentStatus('processing');

    try {
      let actualProvider = 'mock';
      let actualMethod = 'card';

      if (paymentTab === 'payme') {
        actualProvider = 'payme';
        actualMethod = 'qr';
      } else if (paymentTab === 'click') {
        actualProvider = 'click';
        actualMethod = 'phone';
      } else if (paymentTab === 'card') {
        actualProvider = 'mock'; // hozircha mock ishlatamiz
        actualMethod = 'card';
      }

      const payload = {
        booking_id: booking?.id,
        provider: actualProvider,
        method: actualMethod,
        insurance_plan_id: selectedInsurance?.id,
      };
      
      if (paymentTab === 'card') {
        if (useSavedMethod && selectedMethodId) {
          payload.payment_method_id = selectedMethodId;
        } else {
          payload.card_number = (cardData.number || '').replace(/\s/g, '');
          payload.expiry = cardData.expiry;
          payload.cvv = cardData.cvv;
          payload.holder = cardData.holder;
        }
      } else if (paymentTab === 'click') {
        payload.phone = phoneNumber.replace(/\s/g, '');
      }

      const result = await initiatePayment(payload);
      setTransactionId(result.transaction_id);
      setPaymentResult(null);

      if (paymentTab === 'payme' && actualMethod === 'qr') {
        setPaymentStatus('polling');
        setStep(4);
        startPolling(result.transaction_id);
        return result;
      }

      if (paymentTab === 'click') {
        setPaymentStatus('polling');
        setStep(4);
        startPolling(result.transaction_id);
        return result;
      }

      // Card flow defaults to OTP simulation
      setDevOtp(result._dev_otp);
      setPaymentStatus('otp_sent');
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
    if (!transactionId) return;
    setError(null);
    try {
      await resendOtpApi({ transaction_id: transactionId });
    } catch (err) {
      setError(err?.response?.data?.error || 'Kodni qayta yuborib bo\'lmadi');
      throw err;
    }
  };

  const retryPayment = () => {
    stopPolling();
    setStep(3);
    setPaymentStatus('idle');
    setError(null);
    setTransactionId(null);
  };

  return {
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
    initiatePaymentFlow: initiate,
    verifyOtpFlow: verify,
    resendOtpFlow: resend,
    devOtp,
    error,
  };
};
