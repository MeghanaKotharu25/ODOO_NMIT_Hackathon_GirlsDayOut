// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.42.0"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 1. Initialize Supabase Client with SERVICE_ROLE key to bypass RLS
    // This allows us to create users without logging the current admin out!
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    // 2. Parse request body
    const { email, firstName, lastName, position, department, companyName, serialNumber, defaultInTime, defaultOutTime } = await req.json()

    if (!email || !firstName) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Auto-generate secure password
    const generatePassword = () => {
      const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
      let password = "";
      for (let i = 0; i < 12; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return password + "1aA!"; // Ensure complexity requirements are met
    };
    
    const generatedPassword = generatePassword();

    // 3. Generate ID (Logic mirrored from frontend idGenerator.js)
    // Extract Initials
    const compInitials = (companyName || 'Odoo India').split(' ').map((w: string) => w[0]).join('').substring(0, 2).toUpperCase()
    const nameInitials = (firstName.substring(0, 2) + (lastName || 'X').substring(0, 2)).toUpperCase().padEnd(4, 'X')
    const year = new Date().getFullYear()
    const serial = String(serialNumber || 1).padStart(4, '0')
    
    const employeeCode = `${compInitials}${nameInitials}${year}${serial}`

    // 4. Create the user in Auth system
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: generatedPassword,
      email_confirm: true, // Auto confirm for admin-created accounts
      user_metadata: {
        first_name: firstName,
        last_name: lastName,
      }
    })

    if (authError) throw authError

    // 5. Explicitly update the profile table to set the correct employee_code
    // (Our Postgres trigger creates the profile, but we need to update the auto-generated code to our custom one)
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .update({
        employee_code: employeeCode,
        position,
        department,
        default_in_time: defaultInTime ? `${defaultInTime}:00` : '09:00:00',
        default_out_time: defaultOutTime ? `${defaultOutTime}:00` : '17:30:00',
      })
      .eq('id', authData.user.id)

    if (profileError) throw profileError

    return new Response(
      JSON.stringify({ 
        message: 'Employee successfully created.',
        employeeCode,
        generatedPassword,
        user: authData.user 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
