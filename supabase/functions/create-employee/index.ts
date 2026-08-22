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
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({ success: false, error: 'Server configuration error: Supabase environment variables not set.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    // 1. Initialize Supabase Admin Client with SERVICE_ROLE key
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    })

    // Parse request body
    const body = await req.json()
    const isRegistration = body.isRegistration === true || body.action === 'register_admin'

    // 2. Validate Authenticated Caller (unless public self-registration)
    if (!isRegistration) {
      const authHeader = req.headers.get('Authorization')
      if (!authHeader) {
        return new Response(
          JSON.stringify({ success: false, error: 'Unauthorized: Missing authorization header.' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
        )
      }

      const token = authHeader.replace('Bearer ', '').trim()
      const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token)

      if (userError || !userData?.user) {
        return new Response(
          JSON.stringify({ success: false, error: 'Unauthorized: Invalid or expired authentication session.' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
        )
      }

      // Verify caller role in public.profiles table
      const { data: callerProfile, error: profileCheckError } = await supabaseAdmin
        .from('profiles')
        .select('role, status')
        .eq('id', userData.user.id)
        .maybeSingle()

      const callerRole = (callerProfile?.role || '').toLowerCase()
      if (callerRole !== 'admin') {
        return new Response(
          JSON.stringify({ success: false, error: 'Forbidden: Only HR / Admin accounts are authorized to create employees.' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
        )
      }
    }

    const {
      email,
      firstName,
      lastName = '',
      position = isRegistration ? 'HR Manager' : 'Employee',
      department = isRegistration ? 'Human Resources' : 'General',
      companyName = 'Odoo India',
      defaultInTime = '09:00',
      defaultOutTime = '17:30',
      joinDate,
      role = isRegistration ? 'admin' : 'employee'
    } = body

    if (!email || !firstName) {
      return new Response(
        JSON.stringify({ success: false, error: 'Validation Error: Email and First Name are required.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    const normalizedEmail = email.trim().toLowerCase()
    const cleanFirstName = firstName.trim()
    const cleanLastName = lastName.trim()

    // 4. Generate unique Login ID following the required format:
    // Format: OI + first2(first name) + first2(last name) + YYYY + 4-digit yearly serial number
    // Example: John Doe joining in 2022 -> OIJODO20220001
    const companyPrefix = (companyName || 'Odoo India')
      .replace(/[^a-zA-Z]/g, '')
      .substring(0, 2)
      .toUpperCase()
      .padEnd(2, 'O')

    const firstTwoLetters = cleanFirstName
      .replace(/[^a-zA-Z]/g, '')
      .substring(0, 2)
      .toUpperCase()
      .padEnd(2, 'X')

    const lastTwoLetters = cleanLastName
      .replace(/[^a-zA-Z]/g, '')
      .substring(0, 2)
      .toUpperCase()
      .padEnd(2, 'X')

    const currentYear = joinDate ? new Date(joinDate).getFullYear() : new Date().getFullYear()
    const idPrefix = `${companyPrefix}${firstTwoLetters}${lastTwoLetters}${currentYear}`

    // Query profiles in database to compute the next available serial number safely
    const { data: existingCodes, error: codeQueryError } = await supabaseAdmin
      .from('profiles')
      .select('employee_code')
      .ilike('employee_code', `${idPrefix}%`)

    let nextSerial = 1
    if (existingCodes && existingCodes.length > 0) {
      const serialNumbers = existingCodes.map(row => {
        const serialPart = row.employee_code?.replace(idPrefix, '') || ''
        const num = parseInt(serialPart, 10)
        return isNaN(num) ? 0 : num
      })
      nextSerial = Math.max(...serialNumbers, 0) + 1
    }

    const formattedSerial = String(nextSerial).padStart(4, '0')
    const employeeCode = `${idPrefix}${formattedSerial}`

    // 5. Generate secure initial password
    const generatePassword = () => {
      const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%";
      let pwd = "";
      for (let i = 0; i < 10; i++) {
        pwd += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return pwd + "1aA!";
    };
    const generatedPassword = body.password || generatePassword()

    // 6. Create Auth User in Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: normalizedEmail,
      password: generatedPassword,
      email_confirm: true,
      user_metadata: {
        first_name: cleanFirstName,
        last_name: cleanLastName,
        full_name: `${cleanFirstName} ${cleanLastName}`.trim(),
        employee_code: employeeCode,
        role: role
      }
    })

    if (authError) {
      return new Response(
        JSON.stringify({ success: false, error: `Auth Creation Error: ${authError.message}` }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    const newUserId = authData.user.id
    const inTimeFormatted = defaultInTime.length === 5 ? `${defaultInTime}:00` : defaultInTime
    const outTimeFormatted = defaultOutTime.length === 5 ? `${defaultOutTime}:00` : defaultOutTime

    // 7. Upsert/Update profile record
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: newUserId,
        employee_code: employeeCode,
        first_name: cleanFirstName,
        last_name: cleanLastName,
        email: normalizedEmail,
        position,
        department,
        role: role,
        status: 'active',
        join_date: joinDate || new Date().toISOString().split('T')[0],
        default_in_time: inTimeFormatted,
        default_out_time: outTimeFormatted,
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' })

    if (profileError) {
      console.error('Profile update error:', profileError)
      return new Response(
        JSON.stringify({
          success: false,
          error: `Database Profile Error: ${profileError.message}`
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Employee successfully created.',
        employeeCode,
        generatedPassword,
        user: {
          id: newUserId,
          email: normalizedEmail,
          employeeCode,
          firstName: cleanFirstName,
          lastName: cleanLastName,
          position,
          department
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )

  } catch (error) {
    console.error('Unhandled Edge Function exception:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message || 'Internal Server Error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
