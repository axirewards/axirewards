import { supabase } from './supabaseClient'

/**
 * Tikrina ar yra užblokuotas vartotojas pagal duotą user objektą.
 * @param {object} user Supabase user row iš 'users' lentelės
 * @returns {boolean}
 */
export function isBanned(user) {
  return !!(user && user.is_banned === true);
}

/**
 * Tikrina ar vartotojas yra adminas
 * @param {object} user Supabase user row iš 'users' lentelės
 * @returns {boolean}
 */
export function isAdmin(user) {
  if (!user || !user.email) return false;
  const envEmail =
    (process.env.NEXT_PUBLIC_ADMIN_EMAIL ||
      process.env.ADMIN_EMAIL ||
      '').toLowerCase();
  return (
    user.is_admin === true ||
    user.email.toLowerCase() === envEmail
  );
}

/**
 * Užblokuoja vartotoją (ban)
 * @param {number} userId - DB user id
 * @param {string} reason - Užblokavimo priežastis
 * @returns {Promise<object>} - Naujas user objektas
 */
export async function banUser(userId, reason = 'No reason provided') {
  const bannedAt = new Date().toISOString();
  const { data, error } = await supabase
    .from('users')
    .update({
      is_banned: true,
      banned_reason: reason,
      banned_at: bannedAt,
    })
    .eq('id', userId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

/**
 * Atblokuoja vartotoją (unban)
 * @param {number} userId - DB user id
 * @returns {Promise<object>} - Naujas user objektas
 */
export async function unbanUser(userId) {
  const { data, error } = await supabase
    .from('users')
    .update({
      is_banned: false,
      banned_reason: null,
      banned_at: null,
    })
    .eq('id', userId)
    .select()
    .single();
  if (error) throw error;
  return data;
}
