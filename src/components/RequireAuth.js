import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

export default function RequireAuth({ children }) {
  const key = localStorage.getItem('apiKey');
  const location = useLocation();

  if (!key) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
}