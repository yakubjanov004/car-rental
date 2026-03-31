import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return null;

  if (!user) {
    return <Navigate to="/kirish" state={{ from: location }} replace />;
  }

  if (adminOnly && !user.is_staff) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
