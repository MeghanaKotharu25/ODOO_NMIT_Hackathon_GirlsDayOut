import { createClient } from '@supabase/supabase-js'

const rawUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseUrl = rawUrl ? rawUrl.replace(/\/rest\/v1\/?$/, '') : 'https://placeholder.supabase.co'
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY || ''

// Flag to check if Supabase is actually configured
export const isSupabaseConfigured = !!(rawUrl && supabaseKey)

// Only create a real client if we have valid credentials
// Otherwise create a dummy client that won't crash the app
export const supabase = createClient(
  supabaseUrl,
  supabaseKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDk2MTIwMDAsImV4cCI6MTk2NTIxOTYwMH0.placeholder'
)
