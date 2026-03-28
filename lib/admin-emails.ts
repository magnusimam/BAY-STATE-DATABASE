/**
 * Admin email list — used client-side and server-side.
 *
 * On the client, process.env.NEXT_PUBLIC_* is inlined at build time.
 * On Cloudflare Workers, runtime env vars come from wrangler.toml [vars].
 * The hardcoded fallback ensures it always works regardless of build env.
 */
const raw =
  (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_ADMIN_EMAILS) ||
  (typeof process !== 'undefined' && process.env?.ADMIN_EMAILS) ||
  'imammagnus40@gmail.com'

export const ADMIN_EMAILS: string[] = raw
  .split(',')
  .map(e => e.trim().toLowerCase())
  .filter(Boolean)

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false
  return ADMIN_EMAILS.includes(email.toLowerCase())
}
