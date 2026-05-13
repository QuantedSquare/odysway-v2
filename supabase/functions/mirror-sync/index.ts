// ============================================================================
// Edge Function: mirror-sync
// Deploy on: DASHBOARD Supabase project
// Receives: Supabase Database Webhooks from PROD (one POST per row change).
// Behaviour: upsert/delete into the corresponding mirror table.
// ============================================================================
//
// Env vars (set on dashboard project: Functions > mirror-sync > Secrets):
//   SUPABASE_URL                   - automatic, exposes the dashboard project URL
//   SUPABASE_SERVICE_ROLE_KEY      - automatic, server-side key for writes
//   MIRROR_WEBHOOK_SECRET          - shared secret with the prod webhook config
// ============================================================================

import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

type WebhookEvent = {
  type: 'INSERT' | 'UPDATE' | 'DELETE'
  table: string
  schema: string
  record: Record<string, unknown> | null
  old_record: Record<string, unknown> | null
}

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const MIRROR_WEBHOOK_SECRET = Deno.env.get('MIRROR_WEBHOOK_SECRET')!

// Composite primary keys per table (must match prod / mirror schema)
const PK: Record<string, string[]> = {
  activecampaign_deals: ['id', 'contact'],
  activecampaign_clients: ['id', 'email'],
  travel_dates: ['id'],
  booked_dates: ['id', 'deal_id'],
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
})

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 })
  }

  if (req.headers.get('x-webhook-secret') !== MIRROR_WEBHOOK_SECRET) {
    return new Response('Unauthorized', { status: 401 })
  }

  let payload: WebhookEvent
  try {
    payload = await req.json()
  }
  catch {
    return new Response('Invalid JSON', { status: 400 })
  }

  const { type, table, record, old_record } = payload
  const pk = PK[table]
  if (!pk) {
    return new Response(
      JSON.stringify({ skipped: true, reason: `table ${table} not mirrored` }),
      { status: 200, headers: { 'content-type': 'application/json' } },
    )
  }

  try {
    if (type === 'INSERT' || type === 'UPDATE') {
      if (!record) throw new Error('Missing record on ' + type)
      const { error } = await supabase
        .from(table)
        .upsert(record, { onConflict: pk.join(',') })
      if (error) throw error
    }
    else if (type === 'DELETE') {
      if (!old_record) throw new Error('Missing old_record on DELETE')
      let q = supabase.from(table).delete()
      for (const col of pk) {
        const val = old_record[col]
        if (val === undefined || val === null) {
          throw new Error(`Missing PK column ${col} in old_record`)
        }
        q = q.eq(col, val as never)
      }
      const { error } = await q
      if (error) throw error
    }
    else {
      return new Response(
        JSON.stringify({ skipped: true, reason: `unknown type ${type}` }),
        { status: 200, headers: { 'content-type': 'application/json' } },
      )
    }

    return new Response(
      JSON.stringify({ ok: true, table, type }),
      { status: 200, headers: { 'content-type': 'application/json' } },
    )
  }
  catch (err) {
    console.error('mirror-sync error', { table, type, err: String(err) })
    return new Response(
      JSON.stringify({ error: String(err), table, type }),
      { status: 500, headers: { 'content-type': 'application/json' } },
    )
  }
})
