import { useState, useEffect } from 'react';

export const useDebounce = (qiymat, kechikish = 500) => {
  const [debouncedQiymat, setDebouncedQiymat] = useState(qiymat);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQiymat(qiymat), kechikish);
    return () => clearTimeout(timer);
  }, [qiymat, kechikish]);

  return debouncedQiymat;
};
