import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Spinner } from '@/components/ui/Spinner';

export const PrivateRoute: React.FC<{ children: React.ReactElement; requirePremium?: boolean }> = ({
  children,
  requirePremium = false,
}) => {
  const { isAuthenticated, isPremium, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-noir-parchment">
        <Spinner size="lg" label="AUTHENTICATING DETECTIVE BADGE..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requirePremium && !isPremium) {
    // If route requires premium but user doesn't have it, redirect to cases with prompt
    return <Navigate to="/cases" state={{ showPremiumModal: true }} replace />;
  }

  return children;
};

export const PublicOnlyRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-noir-parchment">
        <Spinner size="lg" label="LOADING DOSSIER DATA..." />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/cases" replace />;
  }

  return children;
};
