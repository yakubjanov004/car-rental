import apiClient from './apiClient';

export const fetchMyKyc = async () => {
  const response = await apiClient.get('/users/kyc/');
  // The ViewSet returns a list for list() or an object for single object logic.
  // Our implementation returns the object directly in get_object.
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
