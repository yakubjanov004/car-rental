import apiClient from './apiClient';

export const fetchLoyaltyTiers = async () => {
  const response = await apiClient.get('/loyalty/tiers/');
  if (Array.isArray(response.data)) return response.data;
  return response.data?.results || [];
};

export const fetchMyLoyaltyAccount = async () => {
  const response = await apiClient.get('/loyalty/accounts/me/');
  return response.data;
};

export const redeemLoyaltyPoints = async (points, reason = 'Reward redemption') => {
  const response = await apiClient.post('/loyalty/accounts/redeem/', { points, reason });
  return response.data;
};

export default {
  fetchLoyaltyTiers,
  fetchMyLoyaltyAccount,
  redeemLoyaltyPoints,
};
