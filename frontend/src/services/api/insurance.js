import apiClient from './apiClient';

export const fetchInsurancePlans = async () => {
  const response = await apiClient.get('/insurance/plans/');
  if (Array.isArray(response.data)) return response.data;
  return response.data?.results || [];
};

export const createBookingInsurance = async ({ bookingId, planId, expiresAt }) => {
  const response = await apiClient.post('/insurance/booking-insurance/', {
    booking: bookingId,
    plan: planId,
    expires_at: expiresAt,
  });
  return response.data;
};

export default {
  fetchInsurancePlans,
  createBookingInsurance,
};
