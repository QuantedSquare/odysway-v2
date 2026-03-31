export async function logDateActivity(travelDateId, bookingUser, action, changes = null) {
  const { error } = await supabase.from('date_activity_log').insert([{
    travel_date_id: travelDateId,
    editor_email: bookingUser?.email || 'unknown',
    editor_name: bookingUser?.name || null,
    editor_picture: bookingUser?.picture || null,
    action,
    changes,
  }])
  if (error) console.error('Activity log insert failed:', error)
}
