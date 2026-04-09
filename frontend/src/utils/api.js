import apiClient, { BASE_ORIGIN } from '../services/api/apiClient';

export const MEDIA_BASE_URL = BASE_ORIGIN;

export const fetchCars = async (params = {}) => {
  try {
    const response = await apiClient.get('/cars/', { 
      params: { page_size: 100, ...params } 
    });
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

export const fetchCarModels = async (params = {}) => {
  try {
    const response = await apiClient.get('/cars/car-models/', { 
      params: { page_size: 100, ...params } 
    });
    if (response.data && response.data.results) {
      return response.data.results;
    }
    return response.data;
  } catch (error) {
    console.error("Error fetching car models:", error);
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

export const fetchCarAvailability = async (id) => {
  try {
    const response = await apiClient.get(`/cars/${id}/availability/`);
    return response.data;
  } catch (error) {
    console.error("Error fetching car availability:", error);
    return { booked_dates: [], booked_ranges: [] };
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

export const fetchAdminUsers = async () => {
    try {
      const response = await apiClient.get('/users/admin/users/');
      return response.data.results || response.data;
    } catch (error) {
      console.error("Error fetching admin users:", error);
      return [];
    }
};

export const verifyUser = async (userId, status) => {
    try {
      const response = await apiClient.post(`/users/admin/users/${userId}/verify/`, { status });
      return response.data;
    } catch (error) {
      console.error("Error verifying user:", error);
      throw error;
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

export const fetchNotifications = async () => {
    try {
      const response = await apiClient.get('/users/notifications/');
      return response.data.results || response.data;
    } catch (error) {
      console.error("Error fetching notifications:", error);
      return [];
    }
};

export const markNotificationAsRead = async (id) => {
    try {
        const response = await apiClient.post(`/users/notifications/${id}/read/`);
        return response.data;
    } catch (error) {
        console.error("Error marking notification as read:", error);
        throw error;
    }
};

export const markAllNotificationsAsRead = async () => {
    try {
        const response = await apiClient.post('/users/notifications/read-all/');
        return response.data;
    } catch (error) {
        console.error("Error marking all notifications as read:", error);
        throw error;
    }
};

export const validatePromoCode = async (code) => {
    try {
      const response = await apiClient.post('/payments/promos/validate/', { code });
      return response.data;
    } catch (error) {
      console.error("Error validating promo code:", error);
      throw error;
    }
};

export default apiClient;
