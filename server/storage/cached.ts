import { Driver } from "unstorage";
import memoryDriver from "unstorage/drivers/memory";

export interface CachedOptions {
  driver: Driver;
}

// TODO: TTL support, somehow?
export default function cached(options: CachedOptions): Driver {
  const { driver } = options;
  const memory = memoryDriver() as Driver;
  return {
    ...driver,
    name: driver.name ? `cached:${driver.name}` : `cached`,
    options,
    async hasItem(key) {
      return (await memory.hasItem(key, {})) || (await driver.hasItem(key, {}));
    },
    async getItem(key) {
      const memoryLookup = await memory.getItem(key);
      if (memoryLookup !== null) return memoryLookup;

      const lookup = await driver.getItem(key);
      memory.setItem!(key, lookup as any, {});
      return lookup;
    },
    async setItem(key, value, topts) {
      memory.setItem!(key, value, {});
      await driver.setItem?.(key, value, topts);
    },
  };
}
