import cloudflareKVStorage, {
  KVOptions,
} from "unstorage/drivers/cloudflare-kv-binding";
import { Driver } from "unstorage";
import cachedDriver from "./cached.ts";

export default function cachedVercelKV(opts: KVOptions): Driver {
  return cachedDriver({ driver: cloudflareKVStorage(opts) });
}
