import { useAuthGuard } from '@/lib/authGuard';

/**
 * Hook for protecting individual functions/actions
 */
export const useProtectedAction = () => {
  const { protectRoute } = useAuthGuard();

  const createProtectedAction = (action: () => void, customRedirectPath?: string) => {
    return () => {
      protectRoute(action, customRedirectPath);
    };
  };

  return { createProtectedAction };
};
