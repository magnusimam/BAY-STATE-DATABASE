// Cloudflare Workers environment bindings type definitions
interface CloudflareEnv {
  DB: D1Database
  CACHE: KVNamespace
}
