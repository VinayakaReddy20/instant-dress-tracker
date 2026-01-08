# TODO: Fix TypeScript Errors in CartContext.tsx

## Tasks
- [x] Remove 'checkAuth' from useCustomerAuth destructuring in CartContext.tsx
- [x] Add null checks for 'user' in addToCart function (around line 151)
- [x] Add null checks for 'user' in other locations (around line 184)
- [x] Update CartTypes.ts: Change updateQuantity, removeFromCart, clearCart to return void instead of Promise<void>
- [x] Create src/hooks/useCart.ts and move useCart hook there
- [x] Update CartContext.tsx to import useCart from the new file
- [x] Verify all TypeScript errors are resolved
- [ ] Test cart functionality
