# Customer Profile Page Implementation Plan

## Information Gathered
- Existing customer authentication system with CustomerAuthContext and CustomerAuth page.
- Customers table in Supabase with fields: id, user_id, email, full_name, phone, created_at, updated_at.
- No existing customer profile page; need to create one.
- User provided sections: Basic Personal Information, Account Details, Address & Location, Security & Account Management.
- Address fields not in current DB schema; may need migration.
- App uses React Router with protected routes for shop owners; need similar for customers.

## Plan
1. Create CustomerProfile.tsx page with tabs for Personal Info, Account Details, Security.
2. Add /customer-profile route in App.tsx, protected for authenticated customers.
3. Implement form for editing full_name, phone, and other fields.
4. Add profile photo upload (optional, using Supabase storage).
5. Include account details like member since, last login.
6. For address, note that DB needs extension; implement placeholder or suggest migration.
7. Add change password functionality.
8. Add logout and delete account options.
9. Use CustomerAuthContext for user data.
10. Fetch and update customer data from Supabase.

## Dependent Files to be Edited
- src/App.tsx: Add new route for customer profile.
- src/pages/CustomerProfile.tsx: New file.
- Possibly src/integrations/supabase/types.ts: Update if DB changes.
- Supabase migration: Add address fields to customers table.

## Followup Steps
- Test the profile page after creation.
- Run Supabase migration for additional fields if needed.
- Verify authentication and data fetching.
- Add any missing features like order history if required later.

## Completed Steps
- [x] Created CustomerProfile.tsx with tabs for Personal Info, Account Details, Security.
- [x] Added protected route /customer-profile in App.tsx.
- [x] Implemented edit functionality for full_name and phone.
- [x] Added profile photo placeholder (change photo button).
- [x] Included account details: account type, member since, last updated.
- [x] Added address section placeholder with note about DB extension.
- [x] Implemented change password functionality.
- [x] Added logout and delete account options.
- [x] Used CustomerAuthContext for authentication.
- [x] Fetched and updated customer data from Supabase.
- [x] Run Supabase migration to add new fields to customers table.
- [x] Update src/types.ts with new customer fields (address, city, pincode, latitude, longitude, profile_picture_url).
- [x] Update CustomerAuthContext.tsx CustomerProfile interface with new fields.
- [x] Implement profile picture upload functionality in CustomerProfile.tsx.
- [x] Implement enable location button and auto-fill address fields in CustomerProfile.tsx.

## Performance Optimization Tasks

## Information Gathered
- Multiple useEffect hooks for auth state changes in App.tsx and CustomerAuthContext.tsx causing redundant re-renders
- CartContext checks auth session on every addToCart call, which is slow
- CustomerProfile.tsx has heavy operations (geolocation, reverse geocoding, image upload) that block UI
- Missing loading states allowing multiple rapid clicks
- Potential stale closures in useEffect dependencies

## Plan
1. Optimize auth state management by removing redundant useEffect in App.tsx and relying solely on CustomerAuthContext
2. Cache auth session in CartContext to avoid repeated checks
3. Add loading states and disable buttons during operations in CustomerProfile.tsx
4. Debounce geolocation calls and add error boundaries
5. Fix useEffect dependencies to prevent infinite loops
6. Memoize expensive components like Navbar

## Dependent Files to be Edited
- src/App.tsx: Remove redundant auth logic
- src/contexts/CartContext.tsx: Cache auth check
- src/pages/CustomerProfile.tsx: Add loading states, optimize operations
- src/contexts/CustomerAuthContext.tsx: Ensure single auth listener

## Followup Steps
- Test site performance after changes
- Use browser to verify click responsiveness
- Monitor for any remaining lags

## Pending Tasks
- [x] Run Supabase migration to add new fields to customers table.
- [x] Update src/types.ts with new customer fields (address, city, pincode, latitude, longitude, profile_picture_url).
- [x] Update CustomerAuthContext.tsx CustomerProfile interface with new fields.
- [x] Implement profile picture upload functionality in CustomerProfile.tsx.
- [x] Implement enable location button and auto-fill address fields in CustomerProfile.tsx.
- [ ] Optimize auth state management in App.tsx
- [ ] Cache auth session in CartContext
- [ ] Add loading states to CustomerProfile operations
- [ ] Fix useEffect dependencies and prevent infinite loops
- [ ] Memoize Navbar component
