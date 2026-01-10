import React from 'react';
import { useAuthGuard } from '@/lib/authGuard';

interface ProtectedActionProps {
  children: React.ReactNode;
  onAction?: () => void;
  customRedirectPath?: string;
  fallback?: React.ReactNode;
}

/**
 * Component wrapper that protects actions requiring authentication
 * Automatically opens login modal if user is not authenticated
 */
export const ProtectedAction: React.FC<ProtectedActionProps> = ({
  children,
  onAction,
  customRedirectPath,
  fallback
}) => {
  const { protectRoute } = useAuthGuard();

  const handleAction = (e: React.MouseEvent | React.KeyboardEvent) => {
    // Prevent default behavior if it's a link or button
    e.preventDefault();
    
    const canProceed = protectRoute(onAction, customRedirectPath);
    
    if (canProceed && onAction) {
      onAction();
    }
  };

  // If we have a fallback and user is not authenticated, show fallback
  if (fallback) {
    return (
      <div onClick={handleAction} onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleAction(e);
        }
      }} role="button" tabIndex={0}>
        {children}
      </div>
    );
  }

  return (
    <div onClick={handleAction} onKeyDown={(e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        handleAction(e);
      }
    }} role="button" tabIndex={0}>
      {children}
    </div>
  );
};


