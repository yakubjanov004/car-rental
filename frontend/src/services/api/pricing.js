import apiClient from './apiClient';

export const calculateDynamicPrice = async ({ carId, startDate, endDate }) => {
  const response = await apiClient.get('/pricing/rules/calculate/', {
    params: {
      car_id: carId,
      start_date: startDate,
      end_date: endDate,
    },
  });
  return response.data;
};

export default {
  calculateDynamicPrice,
};
