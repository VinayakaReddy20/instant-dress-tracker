# Customer Authentication Issues - TODO

## Issues Identified
- [ ] Email confirmation not working (signup doesn't require confirmation)
- [ ] Login fails after creating new account with "login failed please try again"

## Root Causes
- [ ] Customer profile creation logic in login flow may be failing
- [ ] Race condition between auth signup and profile creation
- [ ] Error handling not properly catching profile creation failures

## Tasks to Complete
- [ ] Analyze current signup/login flow in CustomerAuthModal.tsx
- [ ] Fix customer profile creation logic in login handler
- [ ] Add proper error handling and logging for profile creation
- [ ] Test signup -> login flow
- [ ] Verify Supabase auth settings for email confirmation
- [ ] Update error messages to be more specific

## Files to Modify
- [ ] src/components/CustomerAuthModal.tsx - Fix login logic
- [ ] src/contexts/CustomerAuthContext.tsx - Ensure proper profile fetching
- [ ] Add email confirmation flow if needed
