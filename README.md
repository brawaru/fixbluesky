# FixBluesky

Reliable social embeds for Bluesky links.

## How to use?

If you want to use this project, then you'll have to fork and deploy this yourself. When deployed, you can simply replace `bsky.app` domain with your deployment's domain name for profile and post links.

## How to deploy?

Fork and then connect Vercel or Cloudflare Workers to the repository. Use Nitro preset when configuring your build process.

Don't forget to set spending limits to avoid malicious actors from abusing your service and letting your hosting provider surprise you with a huge bill (that's how serverless providers earn money).

**Environment variables**

This service requires a Bluesky account in order to fetch data. For safety, it is recommended that you create a new account and use an app password.

- `BSKY_AGENT_SERVICE` (optional, default: `https://bsky.social`) — Bluesky AT service where the agent will connect
- `BSKY_AUTH_USERNAME` — agent's account username
- `BSKY_AUTH_PASSWORD` — agent's account app password

To significantly reduce a number of requests made, the following options can be provided:

- `BSKY_STORAGE_OPTION` (either of `cloudflare-kv` or `vercel-kv`) — which storage option to use

For `vercel-kv` (Durable Redis) storage option:

- `KV_BSKY_REST_API_URL` — URL endpoint for KV.
- `KV_BSKY_REST_API_TOKEN` — token required to make requests to KV.
- `KV_BSKY_BASE` (optional, default: `bsky`) — base name to avoid collisions.

For `cloudflare-kv` (Cloudflare KV) storage option:

- `CF_KV_BINDING_BSKY` — name of the binding (must be bound to the worker).
