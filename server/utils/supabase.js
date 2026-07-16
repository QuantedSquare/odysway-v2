import { createClient } from '@supabase/supabase-js'

const supabaseUrl = (process.env.NUXT_PUBLIC_SUPABASE_URL || 'https://ufyskkwszklmrgcifanb.supabase.co').replace(/\/$/, '')
const supabaseKey = process.env.SUPABASE_API_KEY

if (!supabaseKey) {
  throw new Error('Missing SUPABASE_API_KEY environment variable (Supabase service_role key)')
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false },
})

export default supabase
