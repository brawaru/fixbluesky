import type { StorageMounts } from "nitropack";

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      /** Bluesky cache storage option. */
      BSKY_STORAGE_OPTION?: "cloudflare-kv" | "vercel-kv";

      /** Cloudflare KV via binding: name of the binding. */
      CF_KV_BINDING_BSKY?: string;

      /** Vercel KV: token. */
      KV_BSKY_REST_API_TOKEN?: string;

      /** Vercel KV: API URL. */
      KV_BSKY_REST_API_URL?: string;

      /**
       * Vercel KV: base name for cache KV.
       * @default 'bsky'
       */
      KV_BSKY_BASE?: string;
    }
  }
}

/**
 * Checks that all environment variables are defined.
 * @param vars Variables to check.
 * @returns All missing variables.
 */
function getMissingVars(vars: string[]) {
  return vars.filter((varName) => !process.env[varName]);
}

/**
 * Returns Nitro storage mounts or nothing.
 */
function getBskyStorageMount(): StorageMounts[string] | undefined {
  switch (process.env.BSKY_STORAGE_OPTION) {
    case "cloudflare-kv": {
      if (process.env.CF_KV_BINDING_BSKY) {
        return {
          driver: "~/server/storage/cached-cloudflare-kv-binding",
          binding: process.env.CF_KV_BINDING_BSKY,
        };
      }

      console.warn(
        "You wanted to use `cloudflare-kv` cache store option, however you have not provided `CF_KV_BINDING_BSKY` environment variable. The cache will use in-memory storage that is not persistent in workers."
      );

      break;
    }
    case "vercel-kv": {
      const missingVars = getMissingVars([
        "KV_BSKY_REST_API_TOKEN",
        "KV_BSKY_REST_API_URL",
      ]);

      if (!missingVars.length) {
        return {
          driver: "~/server/storage/cached-vercel-kv",
          base: process.env.KV_BSKY_BASE || "bsky",
          url: process.env.KV_BSKY_REST_API_URL,
          token: process.env.KV_BSKY_REST_API_TOKEN,
          env: false,
        };
      }

      console.log(
        `You wanted to use \`vercel-kv\` cache store option, however you have not provided ${missingVars
          .map((varName) => `\`${varName}\``)
          .join(
            ", "
          )} environment variable. The cache will use in-memory storage taht is not persistent in serverless functions.`
      );

      break;
    }
  }

  return undefined;
}

export function getStorageMounts(): StorageMounts | undefined {
  let mounts: StorageMounts | undefined;

  const bskyMount = getBskyStorageMount();
  if (bskyMount != null) (mounts ??= {}).bsky = bskyMount;

  return mounts;
}
