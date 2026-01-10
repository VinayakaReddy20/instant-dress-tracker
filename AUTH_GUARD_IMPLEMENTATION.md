# Auth Guard Implementation

This document explains the comprehensive auth guard system implemented for the Instant Dress Tracker application.

## Overview

The auth guard system provides seamless authentication protection for protected features while preserving user intent and enabling automatic redirects after successful login.

## Key Features

1. **Stateful Redirect Management**: Stores intended destinations before authentication
2. **Multiple Auth Methods**: Supports both email/password and OAuth (Google) login
3. **Automatic Redirect**: Redirects users to their intended destination after login
4. **Type Safety**: Full TypeScript support with proper interfaces
5. **Reusable Components**: Modular hooks and components for easy integration

## Core Components

### 1. RedirectStateStorage Utility (`src/lib/authGuard.ts`)

**Purpose**: Manages redirect state storage using sessionStorage for persistence across page refreshes.

**Key Methods**:
- `setRedirectPath(state: RedirectState)`: Stores redirect state
- `getRedirectPath()`: Retrieves stored redirect state
- `clearRedirectPath()`: Clears stored redirect state
- `getCurrentLocation()`: Gets current location as redirect state

**Type Definition**:
```typescript
interface RedirectState {
  path: string;
  search?: string;
  state?: Record<string, unknown>;
}
```

### 2. useAuthGuard Hook (`src/lib/authGuard.ts`)

**Purpose**: Main hook for protecting routes and actions with authentication checks.

**Key Methods**:
- `protectRoute(callback?, customRedirectPath?)`: Protects a route or action
- `handlePostAuthRedirect()`: Handles redirect after successful authentication
- `isAuthenticated`: Boolean indicating authentication status
- `isLoading`: Boolean indicating auth loading state

**Usage Example**:
```typescript
const { protectRoute, isAuthenticated } = useAuthGuard();

const handleAddToCart = () => {
  const canProceed = protectRoute(() => {
    // Action to perform after auth
    addToCart(item);
  }, '/cart');

  if (canProceed) {
    // User is already authenticated
    addToCart(item);
  }
};
```

### 3. withAuthGuard HOC (`src/lib/authHOC.tsx`)

**Purpose**: Higher-order component for protecting entire routes/components.

**Usage Example**:
```typescript
import { withAuthGuard } from '@/lib/authHOC';

const ProtectedComponent = withAuthGuard(MyComponent);

// Or for routes
const ProtectedRoute = withAuthGuard(() => <MyComponent />);
```

### 4. ProtectedAction Component (`src/components/ProtectedAction.tsx`)

**Purpose**: Wrapper component for protecting individual actions (buttons, links, etc.).

**Usage Example**:
```typescript
<ProtectedAction onAction={handleAddToCart} customRedirectPath="/cart">
  <Button>Add to Cart</Button>
</ProtectedAction>
```

### 5. useProtectedAction Hook (`src/components/ProtectedAction.tsx`)

**Purpose**: Hook for creating reusable protected action functions.

**Usage Example**:
```typescript
const { createProtectedAction } = useProtectedAction();

const protectedAddToCart = createProtectedAction(handleAddToCart, '/cart');
```

## Integration Points

### 1. CustomerAuthProvider (`src/contexts/CustomerAuthProvider.tsx`)

**Updated**: Now uses `RedirectStateStorage` for OAuth redirect handling instead of localStorage.

**Key Changes**:
- Imports `RedirectStateStorage` dynamically
- Uses `getRedirectPath()` and `clearRedirectPath()` methods
- Handles post-authentication redirects for OAuth flows

### 2. CustomerAuthModal (`src/components/CustomerAuthModal.tsx`)

**Updated**: Uses `RedirectStateStorage` for storing redirect paths during Google OAuth.

**Key Changes**:
- Stores redirect state with path and search parameters
- Uses dynamic import for `RedirectStateStorage`

### 3. AuthModalContext (`src/contexts/AuthModalContext.tsx`)

**Updated**: Uses `RedirectStateStorage` for storing redirect paths in `executeCallbackAndRedirect`.

**Key Changes**:
- Replaces localStorage with `RedirectStateStorage`
- Stores complete redirect state including search parameters

### 4. DressCard Component (`src/components/DressCard.tsx`)

**Updated**: Now uses `useAuthGuard` instead of `useAuthModal` for authentication checks.

**Key Changes**:
- Replaces `useAuthModal` with `useAuthGuard`
- Uses `protectRoute()` for both add to cart and quick view actions
- Provides better type safety and consistency

## Usage Patterns

### Pattern 1: Protecting Individual Actions

```typescript
import { useAuthGuard } from '@/lib/authGuard';

function MyComponent() {
  const { protectRoute } = useAuthGuard();

  const handleAction = () => {
    const canProceed = protectRoute(() => {
      // Action to perform after successful auth
      performAction();
    }, '/protected-page');

    if (canProceed) {
      // User is already authenticated
      performAction();
    }
  };

  return <Button onClick={handleAction}>Protected Action</Button>;
}
```

### Pattern 2: Using ProtectedAction Component

```typescript
import { ProtectedAction } from '@/components/ProtectedAction';

function MyComponent() {
  const handleAddToCart = () => {
    // Add to cart logic
  };

  return (
    <ProtectedAction onAction={handleAddToCart} customRedirectPath="/cart">
      <Button>Add to Cart</Button>
    </ProtectedAction>
  );
}
```

### Pattern 3: Route Protection with HOC

```typescript
import { withAuthGuard } from '@/lib/authHOC';

// Protect entire component
const ProtectedProfile = withAuthGuard(ProfileComponent);

// Or protect route
const ProtectedRoute = withAuthGuard(() => <ProfileComponent />);
```

### Pattern 4: Manual Redirect Handling

```typescript
import { RedirectStateStorage } from '@/lib/authGuard';

function handleManualRedirect() {
  const redirectState = RedirectStateStorage.getRedirectPath();
  if (redirectState) {
    // Handle the redirect manually
    navigate(redirectState.path + (redirectState.search || ''));
    RedirectStateStorage.clearRedirectPath();
  }
}
```

## OAuth Flow Integration

The system handles OAuth flows (like Google Sign-In) seamlessly:

1. **Before OAuth**: Redirect state is stored using `RedirectStateStorage.setRedirectPath()`
2. **During OAuth**: User is redirected to OAuth provider
3. **After OAuth**: `CustomerAuthProvider` checks for stored redirect state and redirects user
4. **State Cleanup**: Redirect state is cleared after successful redirect

## Error Handling

The system includes comprehensive error handling:

- **Storage Errors**: Graceful fallback if sessionStorage is unavailable
- **Parse Errors**: Safe JSON parsing with error recovery
- **Auth Errors**: Proper error messages and fallback behavior
- **Type Safety**: Full TypeScript support prevents runtime type errors

## Benefits

1. **Seamless UX**: Users are automatically redirected to their intended destination
2. **State Preservation**: Route parameters and query strings are preserved
3. **Type Safety**: Full TypeScript support with proper interfaces
4. **Reusability**: Modular components and hooks for easy integration
5. **Flexibility**: Multiple patterns for different use cases
6. **Persistence**: sessionStorage ensures redirects work across page refreshes

## Migration Guide

To migrate existing components to use the new auth guard system:

1. **Replace useAuthModal with useAuthGuard**:
   ```typescript
   // Before
   const { openModal } = useAuthModal();
   
   // After
   const { protectRoute } = useAuthGuard();
   ```

2. **Update authentication checks**:
   ```typescript
   // Before
   supabase.auth.getSession().then(({ data }) => {
     if (!data.session) {
       openModal(() => action(), redirectPath);
     } else {
       action();
     }
   });
   
   // After
   const canProceed = protectRoute(() => action(), redirectPath);
   if (canProceed) {
     action();
   }
   ```

3. **Use ProtectedAction for simple cases**:
   ```typescript
   // Before
   <div onClick={() => openModal(action, path)}>...</div>
   
   // After
   <ProtectedAction onAction={action} customRedirectPath={path}>...</ProtectedAction>
   ```

## Testing

The auth guard system is designed to be easily testable:

- **Pure Functions**: Core logic is in pure functions
- **Mockable Dependencies**: All external dependencies can be mocked
- **Clear Interfaces**: Well-defined interfaces make testing straightforward
- **Error Scenarios**: Comprehensive error handling allows for testing edge cases

## Future Enhancements

Potential future improvements:

1. **Deep Linking**: Support for deep linking within protected routes
2. **Permission-based Access**: Role-based access control integration
3. **Analytics**: Track authentication flow metrics
4. **Caching**: Cache redirect state for better performance
5. **SSR Support**: Server-side rendering compatibility