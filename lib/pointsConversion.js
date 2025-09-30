/**
 * Converts points to USD and EUR.
 * 1 point = $0.01 (1 USD cent).
 * For EUR, uses a fixed rate (can be updated from API).
 *
 * @param {number} points
 * @param {number} eurRate - USD to EUR conversion rate (default 0.95)
 * @returns {{usd: number, eur: number}}
 */
export function pointsToCurrency(points, eurRate = 0.95) {
  const usd = Math.round(points) * 0.01
  const eur = usd * eurRate
  return {
    usd: Number(usd.toFixed(2)),
    eur: Number(eur.toFixed(2)),
  }
}
