import { useAuthGuard } from './authGuard';

/**
 * Higher-order component for protecting routes
 */
export const withAuthGuard = <P extends object>(
  Component: React.ComponentType<P>
): React.FC<P> => {
  return (props: P) => {
    const { isAuthenticated, isLoading, protectRoute } = useAuthGuard();

    if (isLoading) {
      // Return null to prevent rendering when not authenticated
      return null;
    }

    if (!isAuthenticated) {
      protectRoute();
      return null;
    }

    return <Component {...props} />;
  };
};