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

// PostgREST caps responses at 1000 rows by default — loop with .range() until a
// short page comes back. Pass a thunk so each page builds a fresh query object.
//
//   const rows = await fetchAllPaginated(() => supabase.from('travel_dates').select('id'))
export const fetchAllPaginated = async (buildQuery, pageSize = 1000) => {
  const out = []
  for (let page = 0; ; page++) {
    const from = page * pageSize
    const to = from + pageSize - 1
    const { data, error } = await buildQuery().range(from, to)
    if (error) throw error
    if (!data?.length) break
    out.push(...data)
    if (data.length < pageSize) break
  }
  return out
}

export default supabase
