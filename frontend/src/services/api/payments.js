import apiClient from './apiClient';

export const initiatePayment = async (payload) => {
  const response = await apiClient.post('/payments/initiate/', payload);
  return response.data;
};

export const verifyOtp = async (payload) => {
  const response = await apiClient.post('/payments/verify-otp/', payload);
  return response.data;
};

export const verifyPayment = async (payload) => {
  const response = await apiClient.post('/payments/verify/', payload);
  return response.data;
};

export const resendOtp = async (payload) => {
  const response = await apiClient.post('/payments/resend-otp/', payload);
  return response.data;
};

export const fetchPaymentMethods = async () => {
  const response = await apiClient.get('/payments/methods/');
  if (Array.isArray(response.data)) return response.data;
  return response.data?.results || [];
};

export const createPaymentMethod = async (payload) => {
  const response = await apiClient.post('/payments/methods/', payload);
  return response.data;
};

export const fetchReceipts = async () => {
  const response = await apiClient.get('/payments/receipts/');
  if (Array.isArray(response.data)) return response.data;
  return response.data?.results || [];
};

export const downloadReceiptFile = async (receiptId) => {
  const response = await apiClient.get(`/payments/receipts/${receiptId}/download/`, {
    responseType: 'blob',
  });
  return response.data;
};
