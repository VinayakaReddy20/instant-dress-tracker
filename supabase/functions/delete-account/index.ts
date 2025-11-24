// Setup type definitions for built-in Supabase Runtime APIs
import "@supabase/functions-js"
import { createClient } from "@supabase/supabase-js"

// Declare Deno for TypeScript
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const Deno: any

console.log("Delete Account Function")

Deno.serve(async (req: Request) => {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { "Content-Type": "application/json" } }
    )
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization header required' }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      )
    }

    // Create Supabase client with service role key
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Get the user from the JWT token
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      )
    }

    const userId = user.id

    // Delete shop_owner record if exists (this will cascade delete shops and dresses)
    const { error: shopOwnerError } = await supabase
      .from('shop_owners')
      .delete()
      .eq('user_id', userId)

    if (shopOwnerError) {
      console.error('Error deleting shop owner:', shopOwnerError)
      // Continue with customer deletion even if shop owner deletion fails
    }

    // Delete customer record
    const { error: customerError } = await supabase
      .from('customers')
      .delete()
      .eq('user_id', userId)

    if (customerError) {
      console.error('Error deleting customer:', customerError)
      return new Response(
        JSON.stringify({ error: 'Failed to delete customer record' }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      )
    }

    // Delete the user from auth.users (this will cascade delete all related data)
    const { error: deleteUserError } = await supabase.auth.admin.deleteUser(userId)

    if (deleteUserError) {
      console.error('Error deleting user:', deleteUserError)
      return new Response(
        JSON.stringify({ error: 'Failed to delete user account' }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      )
    }

    return new Response(
      JSON.stringify({ message: 'Account deleted successfully' }),
      { headers: { "Content-Type": "application/json" } }
    )

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }
})

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/delete-account' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{}'

*/
