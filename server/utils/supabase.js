import { createClient } from '@supabase/supabase-js'

const supabase = createClient('https://ufyskkwszklmrgcifanb.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVmeXNra3dzemtsbXJnY2lmYW5iIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcwMzg0NjIzMiwiZXhwIjoyMDE5NDIyMjMyfQ.vmgpkt8l3RJ2nsJgRe9inj_JEn-zdL8a2asfhhCxdx4',
  {
    auth: { persistSession: false },
  })

export default supabase
