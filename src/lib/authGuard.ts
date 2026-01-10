import { useLocation, useNavigate } from 'react-router-dom';
import { useCustomerAuth } from '@/hooks/useCustomerAuth';
import { useAuthModal } from '@/contexts/useAuthModal';

// TypeScript interfaces for redirect state
export interface RedirectState {
  path: string;
  search?: string;
  state?: Record<string, unknown>;
}

/**
 * Utility to store redirect path in sessionStorage for safe persistence
 */
export const RedirectStateStorage = {
  /**
   * Store the intended redirect path before authentication
   */
  setRedirectPath: (state: RedirectState) => {
    try {
      sessionStorage.setItem('auth_redirect_state', JSON.stringify(state));
    } catch (error) {
      console.warn('Failed to store redirect state:', error);
    }
  },

  /**
   * Retrieve the stored redirect path after authentication
   */
  getRedirectPath: (): RedirectState | null => {
    try {
      const stored = sessionStorage.getItem('auth_redirect_state');
      if (!stored) return null;
      
      const parsed = JSON.parse(stored);
      return parsed as RedirectState;
    } catch (error) {
      console.warn('Failed to parse redirect state:', error);
      return null;
    }
  },

  /**
   * Clear the stored redirect path
   */
  clearRedirectPath: () => {
    try {
      sessionStorage.removeItem('auth_redirect_state');
    } catch (error) {
      console.warn('Failed to clear redirect state:', error);
    }
  },

  /**
   * Get current location as redirect state
   */
  getCurrentLocation: (): RedirectState => {
    const location = window.location;
    return {
      path: location.pathname,
      search: location.search || undefined,
    };
  }
};

/**
 * Hook to handle protected routes and redirect after auth
 */
export const useAuthGuard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isLoading } = useCustomerAuth();
  const { openModal } = useAuthModal();

  /**
   * Protect a route or action by checking authentication
   * If not authenticated, opens login modal with redirect state
   */
  const protectRoute = (callback?: () => void, customRedirectPath?: string) => {
    if (isLoading) return;

    if (!user) {
      // Store current location or custom redirect path
      const redirectState: RedirectState = customRedirectPath 
        ? { path: customRedirectPath }
        : RedirectStateStorage.getCurrentLocation();

      RedirectStateStorage.setRedirectPath(redirectState);
      
      // Open auth modal with callback
      openModal(callback || (() => {}), customRedirectPath || location.pathname);
      return false;
    }

    return true;
  };

  /**
   * Handle post-authentication redirect
   */
  const handlePostAuthRedirect = () => {
    const redirectState = RedirectStateStorage.getRedirectPath();
    
    if (redirectState) {
      const targetPath = redirectState.search 
        ? `${redirectState.path}${redirectState.search}`
        : redirectState.path;
      
      RedirectStateStorage.clearRedirectPath();
      navigate(targetPath, { replace: true });
    } else {
      // Default redirect to home if no stored state
      navigate('/', { replace: true });
    }
  };

  return {
    isAuthenticated: !!user && !isLoading,
    isLoading,
    protectRoute,
    handlePostAuthRedirect,
    redirectState: RedirectStateStorage.getRedirectPath()
  };
};