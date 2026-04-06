export const detectCardType = (number = '') => {
  const clean = number.replace(/\s/g, '');
  if (/^8600/.test(clean)) return 'uzcard';
  if (/^9860/.test(clean)) return 'humo';
  if (/^4/.test(clean)) return 'visa';
  if (/^5[1-5]/.test(clean)) return 'mastercard';
  return 'unknown';
};

export const formatCardNumber = (value = '') => {
  const clean = value.replace(/\D/g, '').slice(0, 16);
  return clean.replace(/(.{4})/g, '$1 ').trim();
};
