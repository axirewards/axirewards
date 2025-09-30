import { supabase } from './supabaseClient'

/**
 * Tikrina ar yra užblokuotas vartotojas pagal duotą user objektą.
 * @param {object} user Supabase user row iš 'users' lentelės
 * @returns {boolean}
 */
export function isBanned(user) {
  return !!(user && user.is_banned === true)
}

/**
 * Tikrina ar vartotojas yra adminas
 * @param {object} user Supabase user row iš 'users' lentelės
 * @returns {boolean}
 */
export function isAdmin(user) {
  if (!user || !user.email) return false
  const envEmail =
    (process.env.NEXT_PUBLIC_ADMIN_EMAIL ||
      process.env.ADMIN_EMAIL ||
      '').toLowerCase()
  return (
    user.is_admin === true ||
    user.email.toLowerCase() === envEmail
  )
}

/**
 * Užblokuoja vartotoją (ban) pagal email
 * @param {string} email - user email
 * @param {string} reason - Užblokavimo priežastis
 * @param {string} adminEmail - kuris adminas banino
 * @returns {Promise<object>} - Naujas user objektas
 */
export async function banUserByEmail(email, reason = 'No reason provided', adminEmail = '') {
  const bannedAt = new Date().toISOString()
  const { data, error } = await supabase
    .from('users')
    .update({
      is_banned: true,
      banned_reason: reason,
      banned_at: bannedAt,
    })
    .eq('email', email)
    .select()
    .single()
  if (error) throw error

  // Log admin action
  await supabase.from('admin_logs').insert({
    admin_user: adminEmail,
    action: 'ban',
    details: { banned_email: email, reason },
    created_at: bannedAt,
  })
  return data
}

/**
 * Atblokuoja vartotoją (unban) pagal email
 * @param {string} email - user email
 * @param {string} adminEmail - kuris adminas atblokavo
 * @returns {Promise<object>} - Naujas user objektas
 */
export async function unbanUserByEmail(email, adminEmail = '') {
  const { data, error } = await supabase
    .from('users')
    .update({
      is_banned: false,
      banned_reason: null,
      banned_at: null,
    })
    .eq('email', email)
    .select()
    .single()
  if (error) throw error

  await supabase.from('admin_logs').insert({
    admin_user: adminEmail,
    action: 'unban',
    details: { unbanned_email: email },
    created_at: new Date().toISOString(),
  })
  return data
}

/**
 * Gauna user objektą pagal email (naudinga admin panelėje ir patikrinimams)
 * @param {string} email - user email
 * @returns {Promise<object>} - user row
 */
export async function getUserByEmail(email) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single()
  if (error) throw error
  return data
}
