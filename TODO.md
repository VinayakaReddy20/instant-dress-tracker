# TODO: Implement Login/Signup Modal for View Actions

## Tasks
- [x] Update Dresses.tsx: Add login check for "View Details" button
- [x] Update ShopDetail.tsx: Add login check for "View Details" button
- [x] Update Shops.tsx: Add login check for "Visit Shop" button
- [x] Update Landing.tsx: Add login check for "Add to Cart" buttons
- [ ] Test the changes: Verify modal pops up for all actions when not logged in
- [ ] Test the changes: Verify normal navigation when logged in

## Files to Edit
- src/pages/Dresses.tsx
- src/pages/ShopDetail.tsx
- src/pages/Shops.tsx

## Notes
- Use the existing AuthModalContext pattern with openModal(callback)
- Follow the same pattern as the existing addToCart functionality
- Import useAuthModal and supabase.auth.getSession where needed
