import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import type { Role } from '../contexts/AuthContext';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Role[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-brand-surface text-brand-slate">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect unauthorized users to their default dashboard
    if (user.role === 'EMPLOYEE') return <Navigate to="/employee" replace />;
    if (user.role === 'DIRECTOR') return <Navigate to="/director" replace />;
    if (user.role === 'ACCOUNTS') return <Navigate to="/accounts" replace />;
  }

  return <>{children}</>;
};
