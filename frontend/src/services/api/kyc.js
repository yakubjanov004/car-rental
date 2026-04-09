import apiClient from './apiClient';

export const fetchMyKyc = async () => {
  const response = await apiClient.get('/users/kyc/');
  if (response.data && Array.isArray(response.data.results)) {
    return response.data.results[0];
  }
  if (Array.isArray(response.data)) return response.data[0];
  return response.data;
};

export const updateKycDocuments = async (formData) => {
  const response = await apiClient.post('/users/kyc/upload-documents/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

export const submitKyc = async () => {
  const response = await apiClient.post('/users/kyc/submit/');
  return response.data;
};

export const fetchPendingKyc = async () => {
  const response = await apiClient.get('/users/admin/kyc/');
  return Array.isArray(response.data) ? response.data : response.data.results || [];
};

export const reviewKyc = async (kycId, payload) => {
  const response = await apiClient.post(`/users/admin/kyc/${kycId}/review/`, payload);
  return response.data;
};
