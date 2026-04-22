import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchMyFavorites, toggleFavorite as apiToggleFavorite } from '../utils/api';
import { useAuth } from './AuthContext';

const FavoritesContext = createContext();

export const FavoritesProvider = ({ children }) => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    if (user) {
      fetchMyFavorites().then(items => {
        setFavorites(Array.isArray(items) ? items.map(f => f.car) : []);
      }).catch(() => setFavorites([]));
    } else {
      setFavorites([]);
    }
  }, [user]);

  const toggleFavorite = async (carId) => {
    if (!user) {
      alert("Iltimos, avval tizimga kiring!");
      return;
    }
    try {
      const result = await apiToggleFavorite(carId);
      if (result.removed) {
        setFavorites(prev => prev.filter(id => id !== carId));
      } else {
        setFavorites(prev => [...prev, carId]);
      }
    } catch (e) {
      console.error(e);
      alert("Xatolik yuz berdi!");
    }
  };

  const isFavorite = (carId) => favorites.includes(carId);

  return (
    <FavoritesContext.Provider value={{ favorites, toggleFavorite, isFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => useContext(FavoritesContext);
