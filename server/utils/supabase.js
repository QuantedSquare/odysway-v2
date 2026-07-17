import { createClient } from '@supabase/supabase-js'

// NB: must be the same project as SUPABASE_API_KEY (ufyskkwszklmrgcifanb).
// Do NOT use NUXT_PUBLIC_SUPABASE_URL here — that points to a different project.
const supabaseUrl = (process.env.SUPABASE_URL || 'https://ufyskkwszklmrgcifanb.supabase.co').replace(/\/$/, '')
const supabaseKey = process.env.SUPABASE_API_KEY

if (!supabaseKey) {
  throw new Error('Missing SUPABASE_API_KEY environment variable (Supabase service_role key)')
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false },
})

export default supabase
