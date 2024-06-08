import type { Storage } from "unstorage";

interface CacheItem<V> {
  cachedAt: number;
  value: V;
}

interface CacheDescriptor<KeyParts extends any[], T> {
  getKey(...params: KeyParts): string;
  isValid(value: unknown): value is T;
  ttl: number;
}

export function defineCache<KeyParts extends any[], T>(
  descriptor: CacheDescriptor<KeyParts, T>
) {
  return descriptor;
}

export async function getFromCache<KeyParts extends any[], T>(
  cache: Storage,
  descriptor: CacheDescriptor<KeyParts, T>,
  parts: NoInfer<KeyParts>
) {
  let item;
  try {
    item = await cache.getItem<CacheItem<T>>(descriptor.getKey(...parts));
  } catch {}

  if (
    item != null &&
    getTimestamp() - item.cachedAt < descriptor.ttl &&
    descriptor.isValid(item.value)
  ) {
    return item.value;
  }

  return undefined;
}

function getTTLOptions(ttl: number) {
  switch (process.env.BSKY_STORAGE_OPTION) {
    case "cloudflare-kv":
      return { expirationTtl: ttl };
    case "vercel-kv":
      return { ex: ttl };
  }
}

export async function setInCache<KeyParts extends any[], T>(
  cache: Storage,
  descriptor: CacheDescriptor<KeyParts, T>,
  value: T,
  keyParts: NoInfer<KeyParts>
) {
  const key = descriptor.getKey(...keyParts);
  const item = {
    cachedAt: getTimestamp(),
    value,
  } satisfies CacheItem<T>;
  return cache.setItem(key, item, getTTLOptions(descriptor.ttl));
}
