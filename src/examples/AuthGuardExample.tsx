import React from 'react';
import { useAuthGuard, RedirectStateStorage } from '@/lib/authGuard';
import { ProtectedAction } from '@/components/ProtectedAction';
import { useProtectedAction } from '@/hooks/useProtectedAction';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Eye, MapPin } from 'lucide-react';

/**
 * Example component demonstrating various auth guard patterns
 */
export const AuthGuardExample: React.FC = () => {
  const { isAuthenticated, protectRoute, handlePostAuthRedirect } = useAuthGuard();
  const { createProtectedAction } = useProtectedAction();

  // Example: Protect a function
  const handleAddToCart = () => {
    console.log('Adding item to cart...');
    // Your cart logic here
  };

  // Example: Create a protected version of the function
  const protectedAddToCart = createProtectedAction(handleAddToCart, '/cart');

  // Example: Protect a route programmatically
  const handleViewShop = (shopId: string) => {
    console.log(`Navigating to shop ${shopId}`);
    // Your navigation logic here
  };

  const protectedViewShop = createProtectedAction(
    () => handleViewShop('shop-123'), 
    '/shop/shop-123'
  );

  // Example: Manual protection in component
  const handleManualProtect = () => {
    const canProceed = protectRoute(() => {
      console.log('Proceeding with action after auth');
    }, '/protected-page');

    if (canProceed) {
      console.log('User is already authenticated');
    }
  };

  // Example: Manual redirect handling
  const handleManualRedirect = () => {
    const redirectState = RedirectStateStorage.getRedirectPath();
    if (redirectState) {
      console.log('Found redirect state:', redirectState);
      handlePostAuthRedirect();
    }
  };

  return (
    <div className="space-y-8 p-6">
      <h2 className="text-2xl font-bold">Auth Guard Examples</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Example 1: ProtectedAction Component */}
        <div className="border rounded-lg p-4">
          <h3 className="font-semibold mb-4">1. ProtectedAction Component</h3>
          <div className="space-y-4">
            <ProtectedAction onAction={handleAddToCart} customRedirectPath="/cart">
              <Button className="w-full">
                <ShoppingCart className="w-4 h-4 mr-2" />
                Add to Cart (Protected)
              </Button>
            </ProtectedAction>

            <ProtectedAction onAction={protectedViewShop}>
              <Button variant="outline" className="w-full">
                <MapPin className="w-4 h-4 mr-2" />
                View Shop (Protected)
              </Button>
            </ProtectedAction>
          </div>
        </div>

        {/* Example 2: Manual Protection */}
        <div className="border rounded-lg p-4">
          <h3 className="font-semibold mb-4">2. Manual Protection</h3>
          <div className="space-y-4">
            <Button onClick={handleManualProtect} className="w-full">
              Manual Protect Action
            </Button>

            <Button onClick={handleManualRedirect} variant="secondary" className="w-full">
              Handle Redirect
            </Button>

            <div className="text-sm text-gray-600">
              Current Auth Status: {isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
            </div>
          </div>
        </div>

        {/* Example 3: Redirect State Management */}
        <div className="border rounded-lg p-4">
          <h3 className="font-semibold mb-4">3. Redirect State</h3>
          <div className="space-y-3">
            <Button 
              onClick={() => {
                RedirectStateStorage.setRedirectPath({
                  path: '/example-page',
                  search: '?ref=auth-example'
                });
                console.log('Redirect state set');
              }}
              variant="outline"
              className="w-full"
            >
              Set Redirect State
            </Button>

            <Button 
              onClick={() => {
                const state = RedirectStateStorage.getRedirectPath();
                console.log('Current redirect state:', state);
              }}
              variant="outline"
              className="w-full"
            >
              Get Redirect State
            </Button>

            <Button 
              onClick={() => {
                RedirectStateStorage.clearRedirectPath();
                console.log('Redirect state cleared');
              }}
              variant="outline"
              className="w-full"
            >
              Clear Redirect State
            </Button>
          </div>
        </div>

        {/* Example 4: HOC Usage */}
        <div className="border rounded-lg p-4">
          <h3 className="font-semibold mb-4">4. HOC Usage</h3>
          <div className="text-sm text-gray-600 space-y-2">
            <p>Use withAuthGuard HOC for route protection:</p>
            <code className="bg-gray-100 p-2 rounded block">
              {`const ProtectedComponent = withAuthGuard(MyComponent);
// or
const ProtectedRoute = withAuthGuard(() => <MyComponent />);`}
            </code>
          </div>
        </div>
      </div>

      {/* Usage Notes */}
      <div className="border rounded-lg p-4">
        <h3 className="font-semibold mb-4">Usage Notes</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
          <div>
            <h4 className="font-medium mb-2">For Components:</h4>
            <ul className="space-y-1">
              <li>• Use ProtectedAction wrapper for clickable elements</li>
              <li>• Use useAuthGuard hook for conditional rendering</li>
              <li>• Use withAuthGuard HOC for route protection</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2">For Functions:</h4>
            <ul className="space-y-1">
              <li>• Use protectRoute() for manual protection</li>
              <li>• Use createProtectedAction() for reusable patterns</li>
              <li>• Always provide customRedirectPath when possible</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthGuardExample;