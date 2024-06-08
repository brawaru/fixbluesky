import vercelStorage, { VercelKVOptions } from "unstorage/drivers/vercel-kv";
import { Driver } from "unstorage";
import cachedDriver from "./cached.ts";

export default function cachedVercelKV(opts: VercelKVOptions): Driver {
  return cachedDriver({ driver: vercelStorage(opts) });
}
