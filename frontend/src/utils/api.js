import apiClient, { BASE_ORIGIN } from '../services/api/apiClient';

export const MEDIA_BASE_URL = BASE_ORIGIN;

export const fetchCars = async (params = {}) => {
  try {
    const response = await apiClient.get('/cars/', { params });
    // Handle paginated responses
    if (response.data && response.data.results) {
      return response.data.results;
    }
    return response.data;
  } catch (error) {
    console.error("Error fetching cars:", error);
    return [];
  }
};

export const fetchCarDetail = async (id) => {
  try {
    const response = await apiClient.get(`/cars/${id}/`);
    return response.data;
  } catch (error) {
    console.error("Error fetching car detail:", error);
    return null;
  }
};

export const fetchDistricts = async () => {
    try {
      const response = await apiClient.get('/districts/');
      return response.data;
    } catch (error) {
      console.error("Error fetching districts:", error);
      return [];
    }
};

export const createBooking = async (data) => {
  try {
    const response = await apiClient.post('/bookings/', data);
    return response.data;
  } catch (error) {
    console.error("Error creating booking:", error);
    throw error;
  }
};

export const fetchMyBookings = async () => {
  try {
    const response = await apiClient.get('/bookings/my/');
    return response.data;
  } catch (error) {
    console.error("Error fetching my bookings:", error);
    return [];
  }
};

export const updateProfile = async (data) => {
  try {
    const response = await apiClient.patch('/users/me/', data);
    return response.data;
  } catch (error) {
    console.error("Error updating profile:", error);
    throw error;
  }
};

export default apiClient;
