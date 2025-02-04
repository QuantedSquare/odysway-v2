import { createClient } from '@supabase/supabase-js'

const supabase = createClient('https://ufyskkwszklmrgcifanb.supabase.co', process.env.SUPABASE_API_KEY,
  {
    auth: { persistSession: false },
  })

export default supabase
