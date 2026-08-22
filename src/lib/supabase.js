import { createClient } from '@supabase/supabase-js'

const rawUrl = import.meta.env.VITE_SUPABASE_URL || 'https://tdiztowzchvtvfxakgql.supabase.co'
const supabaseUrl = rawUrl.replace(/\/rest\/v1\/?$/, '')
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || ''

export const supabase = createClient(supabaseUrl, supabasePublishableKey)
